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
            return NextResponse.json({ status: 302, message: "Session Expired login again" });

        // Build the parent-name list for each level's transaction query:
        //   parentGroups[0] = [UserName]           → level 1 transactions (made by direct members)
        //   parentGroups[1] = level-1 user names   → level 2 transactions
        //   …up to parentGroups[6]                 → level 7 transactions
        const parentGroups = [[UserName]];
        for (let level = 1; level <= 6 && parentGroups[parentGroups.length - 1].length > 0; level++) {
            const users = await USER.find(
                { Parent: { $in: parentGroups[parentGroups.length - 1] } },
                { _id: 0, UserName: 1 }
            );
            const names = users.map(u => u.UserName);
            if (!names.length) break;
            parentGroups.push(names);
        }

        // All level transaction queries can run in parallel once we have parentGroups
        const levelTransactions = await Promise.all(
            parentGroups.map(parents =>
                TRANSACTION.find({
                    Parent: { $in: parents },
                    Status: 1,
                    Type: { $in: ["deposit", "withdrawal"] },
                })
            )
        );

        const today = new Date();
        const startOfToday = new Date(today); startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today); endOfToday.setHours(23, 59, 59, 999);

        let total_deposit = 0, today_deposit = 0, total_withdrawal = 0;
        for (const transactions of levelTransactions) {
            for (const curr of transactions) {
                if (curr.Type === "deposit") {
                    const createdAt = new Date(curr.createdAt);
                    if (createdAt >= startOfToday && createdAt <= endOfToday)
                        today_deposit += parseFloat(curr.Amount) / 100;
                    total_deposit += parseFloat(curr.Amount) / 100;
                } else if (curr.Type === "withdrawal") {
                    total_withdrawal += parseFloat(curr.Amount) / 100;
                }
            }
        }

        return NextResponse.json({
            status: 200,
            message: "data fetched",
            data: {
                levels: levelTransactions,
                total_deposit: Number(total_deposit),
                today_deposit: Number(today_deposit),
                total_withdrawal: Number(total_withdrawal),
            },
        }, { headers: { 'Cache-Control': 'public, max-age=30' } });
    } catch (error) {
        console.log(error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) ErrorReport(error);
        return NextResponse.json({ status: error?.code || error?.status || 500, message: "something went wrong" });
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
