"use server";
import ErrorReport from "@/app/helpers/ErrorReport";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

export async function updateTransaction(prevState, formData) {
    try {
        let data = {
            prevTransactionId: formData.get("prevTransactionId"),
            TransactionId: formData.get("RefrenceNo"),
            UserName: formData.get("UserName"),
            Amount: Number(formData.get("Amount")) * 100,
            Remark: formData.get("Remark"),
        };

        if (formData.get("stat_0")) {
            //its in pending state;
            return {
                message:
                    "submitting a form in pending state is considered an error.",
            };
        } else if (formData.get("stat_1")) {
            // confirm the deposit
            let res = await settleDeposit(data);
            if (res === "ok") {
                revalidatePath("/deposit");
                return {
                    message: "done",
                };
            } else {
                return {
                    message: res,
                };
            }
        } else if (formData.get("stat_2")) {
            // cancel the deposit
            let res = await cancelDeposit(data);
            if (res === "ok") {
                revalidatePath("/admin/deposit");
                return {
                    message: "done",
                };
            } else {
                return {
                    message: res,
                };
            }
        }
    } catch (error) {
        return {
            message: error?.message || "something went wrong",
        };
    }
}

async function settleDeposit(data) {
    let Session = await mongoose.startSession();
    Session.startTransaction();
    try {
        await connect();
        let amm_updated = data?.Amount;
        // const vip_level = getVipLevel(Number(amm_updated) / 100);
        const vip_level = 0;
        //  if first deposit give 2% reward to the parent;
        let isFirstDeposit = await USER.findOne({ UserName: data?.UserName });
        if (!isFirstDeposit) {
            return "error while finding the user";
        }

        if (isFirstDeposit.FirstDeposit) { // if first deposit is true;
            if (isFirstDeposit?.Parent !== "") {
                let isParentUpdated = await USER.findOneAndUpdate(
                    { UserName: isFirstDeposit?.Parent },
                    {
                        $inc: {
                            Profit: amm_updated * 0.06,
                            Members: isFirstDeposit?.FirstDeposit ? 1 : 0,
                        },
                    },
                    { session: Session }
                );
                if (!isParentUpdated)
                    throw new Error(
                        "somoething went wrong while updating the parent"
                    );
                let today = new Date();
                let transactionDetailsArray =  [
                    {
                        UserName: isParentUpdated?.UserName,
                        TransactionId: await genTransactionID(),
                        Amount: amm_updated * 0.06,
                        Type: "invitation reward",
                        Remark: "success",
                        Status: 1,
                        Date: `${today.getDate()}/${
                            today.getMonth() + 1
                        }/${today.getFullYear()}`,
                        Parent: isParentUpdated?.Parent,
                        From: data?.UserName,
                        Method: "reward",
                    },
                ];

                // if(isFirstDeposit.FirstDeposit && Number(isParentUpdated.Members)%5 === 0){
                //     transactionDetailsArray.push( {
                //         UserName: isParentUpdated?.UserName,
                //         TransactionId: await genTransactionID(),
                //         Amount: 100 * 100,
                //         Type: "5 invitation reward",
                //         Remark: "success",
                //         Status: 1,
                //         Date: `${today.getDate()}/${
                //             today.getMonth() + 1
                //         }/${today.getFullYear()}`,
                //         Parent: isParentUpdated?.Parent,
                //         From: data?.UserName,
                //         Method: "reward",
                //     })
                // }

                let createBonusReward = await TRANSACTION.create(
                   transactionDetailsArray,
                    { session: Session }
                );

                if (!createBonusReward) throw Error("Failed To Update Parent");
            }

            // Calculate bonus: 5% for first deposit, 4% for subsequent deposits
            const bonusPercentage = isFirstDeposit.FirstDeposit ? 0.05 : 0  ;
            
            let userUpdated = await USER.findOneAndUpdate(
                { UserName: data?.UserName },
                {
                    $inc: {
                        Balance: amm_updated + amm_updated * bonusPercentage,
                        Deposited: amm_updated,
                        ValidDeposit: amm_updated,
                    },
                    FirstDeposit: false,
                    VipLevel: vip_level,
                },
                { session: Session }
            );
            if (!userUpdated) throw Error("error updating user");
            let isTransactionUpdated = await TRANSACTION.findOneAndUpdate(
                {
                    UserName: data?.UserName,
                    TransactionId: data?.prevTransactionId,
                    Status: 0,
                },
                {
                    Remark: data?.Remark,
                    Status: 1,
                    Amount: amm_updated,
                    TransactionId: data?.TransactionId,
                },
                {
                    session: Session,
                }
            );
            if (!isTransactionUpdated)
                throw Error(
                    "error while updating transaction or transaction was already updated check the database."
                );
            await Session.commitTransaction();
            return "ok";
        } else {
            let userUpdated = await USER.findOneAndUpdate(
                { UserName: data?.UserName },
                {
                    $inc: {
                        Balance: amm_updated,
                        Deposited: amm_updated,
                        // ValidDeposit: amm_updated,
                    },
                    VipLevel: vip_level,
                },
                { session: Session }
            );
            if (!userUpdated) throw Error("error updating user");
            let isTransactionUpdated = await TRANSACTION.findOneAndUpdate(
                {
                    UserName: data?.UserName,
                    TransactionId: data?.prevTransactionId,
                    Status: 0,
                },
                {
                    Remark: data?.Remark,
                    Status: 1,
                    TransactionId: data?.TransactionId,
                },
                {
                    session: Session,
                }
            );
            if (!isTransactionUpdated)
                throw Error(
                    "error while updating transaction or transaction was already updated."
                );
            await Session.commitTransaction();
            return "ok";
        }
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        await Session.abortTransaction();
        return error?.message || "somethign went wrong";
    }
}

async function cancelDeposit(data) {
    await connect();
    try {
        let isUpdatedTransaction = await TRANSACTION.findOneAndUpdate(
            {
                UserName: data?.UserName,
                TransactionId: data?.prevTransactionId,
            },
            {
                Status: 2,
                Remark: data?.Remark,
                TransactionId: data?.TransactionId,
            }
        );
        if (isUpdatedTransaction) {
            return "done";
        } else {
            return "error while canceling the transaction";
        }
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return error?.message || "something went wrong";
    }
}

function getVipLevel(amount) {
    let vip_level = 0;
    amount = Number(amount);

    if (amount === 1000 && amount < 55_000) {
        vip_level = 0;
    } else if (amount >= 55_000 && amount < 105_000) {
        vip_level = 1;
    } else if (amount >= 105_000 && amount < 300_000) {
        vip_level = 2;
    } else if (amount >= 300_000 && amount < 700_000) {
        vip_level = 3;
    } else if (amount >= 700_000) {
        vip_level = 4;
    } else {
        vip_level = 0;
    }
    return vip_level;
}

async function genTransactionID() {
    return randomBytes(15).toString("hex").slice(0, 15);
    // const PART_A = Math.floor(Math.random() * 90000 + 10000).toString();
    // const PART_B = Math.floor(Math.random() * 90000 + 10000).toString();
    // return PART_A + PART_B;
}
