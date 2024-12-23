"use server";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

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
        } else if (formData.get("stat_1")) {
            // confirm the deposit
            let res = await settleWithdraw(data);
            if (res === "ok") {
                revalidatePath("/admin/withdraw");
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
            let res = await cancelWithdraw(data);
            if (res === "ok") {
                revalidatePath("/withdraw");
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
        console.log(error);
    }
}

async function settleWithdraw(data) {
    await connect();
    let Session = await mongoose.startSession();
    Session.startTransaction();
    try {
        let isWithdrawUpdated = await TRANSACTION.findOneAndUpdate(
            {
                UserName: data?.UserName,
                Type: "withdrawal",
                TransactionId: data?.prevTransactionId,
            },
            {
                Amount: data?.Amount,
                Status: 1,
                Remark: data?.Remark,
                TransactionId: data?.TransactionId,
            },
            { session: Session }
        );
        if (isWithdrawUpdated) {
            await Session.commitTransaction();
            return "done";
        } else {
            throw Error("error while seettling withdrawal");
        }
    } catch (error) {
        await Session.abortTransaction();
        console.log(error);
        return error?.message || "somethign went wrong";
    }
}

async function cancelWithdraw(data) {
    await connect();
    let Session = await mongoose.startSession();
    Session.startTransaction();
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
            },
            { session: Session }
        );
        let isUserUpdated = await USER.findOneAndUpdate(
            { UserName: data?.UserName },
            {
                $inc: {
                    Balance: data?.Amount,
                    Withdrawal: -data?.Amount,
                },
            },
            { session: Session }
        );
        if (isUpdatedTransaction && isUserUpdated) {
            await Session.commitTransaction();
            return "done";
        } else {
            throw Error("error while canceling the transaction");
        }
    } catch (error) {
        await Session.abortTransaction();
        console.log(error);
        return error?.message || "something went wrong";
    }
}
