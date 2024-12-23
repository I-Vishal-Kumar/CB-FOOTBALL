export const maxDuration = 50;

/**
 *
 * this file will handle the transactions done by the subordinates till level3 and will also only get the
 * data for 7 days;
 *
 */
import { TRANSACTION, USER } from "@/app/modals/modal";
import CustomError from "@/app/helpers/Error";
import { NextResponse } from "next/server";
import { isAuthenticated, isValidUser } from "@/app/helpers/auth";
import { cookies } from "next/headers";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";

export async function GET(request) {
    let { session, token } = await getCookieData();
    try {
        await connect();
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });
        let level1_transactions = await TRANSACTION.find({
            Parent: UserName,
            Status: 1,
            Type: { $in: ["withdrawal", "deposit"] },
        });
        if (!level1_transactions)
            throw new CustomError(705, "something went wrong", {});

        const level1_users = await USER.find(
            { Parent: UserName },
            { UserName: 1 }
        );
        const level2_users = await USER.find(
            { Parent: { $in: level1_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1 }
        );
        const level2_transactions = await TRANSACTION.find({
            Parent: { $in: level1_users.map((user) => user.UserName) },
            Status: 1,
            Type: { $in: ["deposit", "withdrawal"] },
        });
        const level3_transactions = await TRANSACTION.find({
            Parent: { $in: level2_users.map((user) => user.UserName) },
            Status: 1,
            Type: { $in: ["deposit", "withdrawal"] },
        });

        const calculateTotal = (transactions) => {
            let today = new Date();
            let date = `${today?.getDate()}/${
                today?.getMonth() + 1
            }/${today?.getFullYear()}`;

            return transactions.reduce(
                (acc, curr) => {
                    if (curr.Type === "deposit") {
                        if(curr.Date === date){
                            acc.today_deposit = (acc.today_deposit || 0) +
                            parseFloat(curr.Amount) / 100;
                        }
                        acc.total_deposit =
                        (acc.total_deposit || 0) +
                        parseFloat(curr.Amount) / 100;
                    } else if (curr.Type === "withdrawal") {
                        acc.total_withdrawal =
                            (acc.total_withdrawal || 0) +
                            parseFloat(curr.Amount) / 100;
                    }
                    return acc;
                },
                { total_deposit: 0, today_deposit: 0, total_withdrawal: 0 }
            );
        };

        const {
            total_deposit: total_deposit_level1,
            today_deposit: today_deposit1,
            total_withdrawal: total_withdrawal_level1,
        } = calculateTotal(level1_transactions);
        const {
            total_deposit: total_deposit_level2,
            today_deposit: today_deposit2,
            total_withdrawal: total_withdrawal_level2,
        } = calculateTotal(level2_transactions);
        const {
            total_deposit: total_deposit_level3,
            today_deposit: today_deposit3,
            total_withdrawal: total_withdrawal_level3,
        } = calculateTotal(level3_transactions);

        return NextResponse.json({
            status: 200,
            message: "data fetched",
            data: {
                level1_transactions,
                level2_transactions,
                level3_transactions,
                total_deposit: Number(
                    total_deposit_level1 +
                        total_deposit_level2 +
                        total_deposit_level3
                ),
                today_deposit : Number(
                    today_deposit1 + today_deposit2 + today_deposit3
                ),
                total_withdrawal: Number(
                    total_withdrawal_level1 +
                        total_withdrawal_level2 +
                        total_withdrawal_level3
                ),
            },
        });
    } catch (error) {
        console.log(error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.code || error?.status || 500,
            message: "something went wrong",
        });
    }
}

async function getCookieData() {
    let token = cookies().get("token")?.value || "";
    let session = cookies().get("session")?.value || "";
    const cookieData = { token, session };
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve(cookieData);
        }, 1000)
    );
}
