/**
 *
 *   This file will provide the data needed in the profile section like:-
 *
 *      for records
 *          deposit data
 *          withdrawal data
 *          overall data
 *
 */

import { NextResponse } from "next/server";
import { REWARD, TRANSACTION } from "@/app/modals/modal";
import { cookies } from "next/headers";
import { isValidUser } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";
import CustomError from "@/app/helpers/Error";
import { settleFixDeposit } from "@/app/helpers/SettleFixDeposit";

export async function GET() {
    let { session, token } = await getCookieData();
    try {
        await connect();
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });
        let res = await TRANSACTION.find({ UserName });
        let reward = await REWARD.find({ UserName });
        res = [...res, ...reward]; // merge both arrays
        if (!res) throw new CustomError("somethign went wrong");

        await settleFixDeposit(UserName);

        return NextResponse.json({
            status: 200,
            message: "data fetched",
            data: res,
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: 302,
            message: "somethign went wrong",
            data: {},
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
