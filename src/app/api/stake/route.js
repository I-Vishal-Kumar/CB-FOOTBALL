import { NextResponse } from "next/server";
import moment from "moment-timezone";
import { connect } from "@/app/modals/dbConfig";
import { BET, FIXEDDEPOST, USER } from "@/app/modals/modal";
import { isAuthenticated, isValidUser } from "@/app/helpers/auth";
import CustomError from "@/app/helpers/Error";
import mongoose, { get } from "mongoose";
import { cookies } from "next/headers";
import ErrorReport from "@/app/helpers/ErrorReport";
import { settleFixDeposit } from "@/app/helpers/SettleFixDeposit";

export async function GET(request) {
    let { session, token } = await getCookieData();
    try {
        let UserName = await isValidUser(token, session);
        if (!UserName)
            throw new CustomError(302, "Session time out login again", {});

        await connect();
        let pendingMatches = await BET.find({ UserName, Status: 0 });
        let settledMatches = await BET.find({ UserName, Status: { $ne: 0 } });
        let fixedDeposits = await FIXEDDEPOST.find({ UserName });

        await settleFixDeposit(UserName);

        return NextResponse.json({
            status: 200,
            message: "",
            data: { pendingMatches, settledMatches, fixedDeposits },
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "something went wrong",
        });
    }
}

export async function POST(request) {
    let { session, token } = await getCookieData();
    await connect();
    let Session = await mongoose.startSession();
    Session.startTransaction();

    try {
        let UserName = await isValidUser(token, session);
        if (!UserName)
            throw new CustomError(302, "Session time out login again", {});

        let { StakeId, StartsAt } = await request.json();

        if (!StakeId || !StartsAt)
            throw new CustomError(703, "Error in the data provided", {});
        else if (!(await isDeletable(StartsAt)))
            throw new CustomError(703, "Match cannot be deleted now", {});

        let isDeleted = await BET.findOneAndDelete(
            { UserName, StakeId },
            {
                session: Session,
            }
        );
        if (!isDeleted)
            throw new CustomError(705, "no bets were found with this id.");

        let isUpdatedUser = await USER.findOneAndUpdate(
            { UserName },
            {
                $inc: {
                    Balance: isDeleted?.BetAmount,
                },
            },
            { session: Session }
        );

        if (!isUpdatedUser)
            throw new CustomError(
                703,
                "Something went wrong while canceling the stake",
                {}
            );

        await Session.commitTransaction();
        return NextResponse.json({
            status: 200,
            message: "Stake deleted successfully",
            data: {},
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        await Session.abortTransaction();
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "something went wrong",
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
async function isDeletable(StartsAt) {
    let today = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
        })
    );
    let match_date = new Date(
        new Date(StartsAt).toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
        })
    );
    if (match_date.getTime() - today.getTime() < 5 * 60 * 1000) return false;
    return true;
}
