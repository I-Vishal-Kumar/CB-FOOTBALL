export const maxDuration = 50;

/**
 *
 *  This file will extract the registered user's data withing 3 levels of the current user;
 *
 */
import { USER } from "@/app/modals/modal";
import CustomError from "@/app/helpers/Error";
import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { cookies } from "next/headers";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";

export async function POST(request) {
    let today = new Date();
    let { session, token } = await getCookieData();
    try {
        await connect();
        const UserName = await isValidUser(token, session);

        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });
        let level1_users = await USER.find(
            { Parent: UserName },
            {
                UserName: 1,
                JoinedOn: 1,
                Parent: 1,
                Deposited: 1,
                Withdrawal: 1,
                Balance: 1,
                createdAt: 1,
            }
        );
        let level2_users = [];
        let level3_users = [];
        let joinedToday = 0;

        for (let user of level1_users) {
            let level2Users = await USER.find(
                { Parent: user?.UserName },
                {
                    UserName: 1,
                    JoinedOn: 1,
                    Parent: 1,
                    Deposited: 1,
                    Withdrawal: 1,
                    Balance: 1,
                    createdAt: 1,
                }
            );
            if (
                user?.JoinedOn ===
                `${today.getDate()}/${
                    today?.getMonth() + 1
                }/${today.getFullYear()}`
            ) {
                joinedToday++;
            }
            level2_users.push(...level2Users);
        }
        for (let user_lev2 of level2_users) {
            let users = await USER.find(
                { Parent: user_lev2?.UserName },
                {
                    UserName: 1,
                    JoinedOn: 1,
                    Parent: 1,
                    Deposited: 1,
                    Withdrawal: 1,
                    Balance: 1,
                    createdAt: 1,
                }
            );
            level3_users.push(...users);
        }
        for (let user of level2_users) {
            if (
                user?.JoinedOn ===
                `${today.getDate()}/${
                    today?.getMonth() + 1
                }/${today.getFullYear()}`
            ) {
                joinedToday++;
            }
        }
        for (let user of level3_users) {
            if (
                user?.JoinedOn ===
                `${today.getDate()}/${
                    today?.getMonth() + 1
                }/${today.getFullYear()}`
            ) {
                joinedToday++;
            }
        }
        return NextResponse.json({
            status: 200,
            message: "data fetched",
            data: { level1_users, level2_users, level3_users, joinedToday },
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.code || error?.status || 500,
            message: "something went wrong",
        });
    }
}

export async function GET(request) {
    try {
        await connect();
        let today = new Date(
            new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })
        );
        const { session, token } = await getCookieData();
        const UserName = await isValidUser(token, session);

        if (!UserName) {
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });
        }

        const level1_users = await USER.find(
            { Parent: UserName },
            {
                _id: 0,
                UserName: 1,
                JoinedOn: 1,
                Parent: 1,
                PhoneNumber: 1,
                Deposited: 1,
                Withdrawal: 1,
                Balance: 1,
                createdAt: 1,
            }
        );

        const level2_users = await USER.find(
            { Parent: { $in: level1_users.map((user) => user.UserName) } },
            {
                _id: 0,
                UserName: 1,
                JoinedOn: 1,
                Parent: 1,
                Deposited: 1,
                Withdrawal: 1,
                PhoneNumber: 1,
                Balance: 1,
                createdAt: 1,
            }
        );

        const level3_users = await USER.find(
            { Parent: { $in: level2_users.map((user) => user.UserName) } },
            {
                _id: 0,
                UserName: 1,
                JoinedOn: 1,
                Parent: 1,
                Deposited: 1,
                PhoneNumber: 1,
                Withdrawal: 1,
                Balance: 1,
                createdAt: 1,
            }
        );

        let active_users = 0;

        const joinedToday = [
            ...level1_users,
            ...level2_users,
            ...level3_users,
        ].filter((user) => {
            const userJoinedDate =
                typeof user?.JoinedOn === "string"
                    ? user?.JoinedOn?.split("/")
                    : ["", "", ""];
            if (user?.Deposited > 0) {
                active_users++;
            }
            return (
                Number(userJoinedDate[0]) === Number(today.getDate()) &&
                Number(userJoinedDate[1]) === Number(today.getMonth() + 1) &&
                Number(userJoinedDate[2]) === Number(today.getFullYear())
            );
        }).length;

        return NextResponse.json({
            status: 200,
            message: "data fetched",
            data: {
                level1_users,
                level2_users,
                level3_users,
                joinedToday,
                active_users,
            },
        });
    } catch (error) {
        if (error.code === 500 || !error.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error.code || error.status || 500,
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
