/*
 This api route will handle the match page which consists of all the 
 matches that are ongoing and not started .
 This will also handle the function to place bet's on the matches provided
*/

import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { USER, MATCH, BET } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import mongoose from "mongoose";
import { scheduleMatches } from "@/app/api/matchScheduler/route";
import CustomError from "@/app/helpers/Error";
import { cookies } from "next/headers";
import ErrorReport from "@/app/helpers/ErrorReport";
import { settleFixDeposit } from "@/app/helpers/SettleFixDeposit";
// 200 -> Everything went fine
// 700 -> something went wrong with data sent by the client;
// 703 -> database issue;
// 705 -> server got crashed;

// this function will deal with the user's balance and the 10 match home data which will be fetched from the MATCH modal

const MATCH_ID = process.env.NEXT_PUBLIC_MATCH_ID;

export async function GET(request) {
    let { session, token } = await getCookieData();
    try {
        let UserName = await isValidUser(token, session);
        if (!UserName)
            throw new CustomError(302, "Session time out login again", {});

        await connect();
        let userData = await USER.findOne({ UserName }, { _id: 0, Balance: 1 });
        let matches = await getLiveBets();
        if (!userData || !matches)
            throw new CustomError(703, "Login again", {});

        //extracted match will return the live matches that are going to start 6 minutes from now;
        let ExtractedMatches = await getExtractedMatches(matches);
        // await settleFixDeposit(UserName);

        return NextResponse.json({
            status: 200,
            message: "",
            data: { userData, matches: ExtractedMatches },
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

async function getLiveBets() {
    await connect();
    try {
        let current_version = await MATCH.findOne(
            { _id: MATCH_ID },
            { _id: 0, version: 1 }
        );
        let matches = await MATCH.findOne({
            _id: MATCH_ID,
            version: current_version?.version || 1,
        });

        if (!matches || matches?.data?.length < 30) {
            current_version = await MATCH.findOne(
                { _id: MATCH_ID },
                { _id: 0, version: current_version?.version }
            );
            matches = await MATCH.findOne({
                _id: MATCH_ID,
                version: current_version?.version || 1,
            });
        }
        if (!matches || matches?.data?.length < 30) {
            await scheduleMatches();
            matches = await MATCH.findOne({
                _id: MATCH_ID,
                version: current_version?.version || 1,
            });
        }
        if (matches?.data) {
            return await JSON.parse(matches?.data || `{}`);
        } else {
            return false;
        }
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return new CustomError(703, "Something went wrong", {});
    }
}

async function getExtractedMatches(matches) {
    let ExtractedMatches = [];
    // match_date.getTime() - today.getTime() < 5 * 60 * 1000
    for (let match of matches) {
        let today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Calcutta",
            })
        );
        let match_date = new Date(
            new Date(match?.StartsAt).toLocaleString("en-US", {
                timeZone: "Asia/Calcutta",
            })
        );
        if (match_date.getTime() - today.getTime() < 6 * 60 * 1000) continue;
        
        // Extract hours from the match start time
        let matchHour = match_date.getHours();

        // Check if the match starts between 9 PM and 12 AM
        if (matchHour >= 21 && matchHour < 24) {
            ExtractedMatches.push(match);
        }

    }
    return ExtractedMatches;
}

// this function will handle functionality of bet placement;
export async function POST(request) {
    let { token, session } = await getCookieData();
    await connect();
    const Session = await mongoose.startSession();
    Session.startTransaction();
    try {
        let UserName = await isValidUser(token, session);
        if (!UserName)
            throw new CustomError(302, "Session time out login again ", {});

        let {
            Team_a,
            Team_b,
            StakeId,
            LeagueName,
            Team_a_logo,
            Team_b_logo,
            StartsAt,
            Score_a,
            Score_b,
            Percentage,
            BetAmount,
        } = await request.json();

        if (
            !Team_a ||
            !Team_b ||
            !StakeId ||
            !LeagueName ||
            !Team_a_logo ||
            !Team_b_logo ||
            !StartsAt ||
            (!Score_a && Score_a !== 0) ||
            (!Score_b && Score_b !== 0) ||
            !Percentage ||
            !BetAmount
        )
            throw new CustomError(700, "please fill all the details", {});

        // check for existing bet on this match
        const isBetExists = await BET.findOne({
            UserName,
            StakeId,
        });
        if (isBetExists)
            throw new CustomError(
                409,
                "You have already placed a bet on this match checkout your stakes .",
                {}
            );

        if (BetAmount < 200) {
            throw new CustomError(
                705,
                "minimum bet amount is 200 , kindly recharge or increase the bet amount."
            );
        }
        BetAmount = Math.floor(BetAmount) * 100;

        let user_updated = await USER.findOneAndUpdate(
            {
                UserName,
                Balance: { $gte: parseFloat(BetAmount) },
            },
            {
                $inc: {
                    Balance: -parseFloat(BetAmount),
                },
            },
            { new: true, session: Session }
        );
        if (!user_updated)
            throw new CustomError(
                703,
                " You don't have enough balance please recharge"
            );

        const newBet = await BET.create(
            [
                {
                    StakeId,
                    Team_a,
                    Team_b,
                    BetAmount: BetAmount,
                    LeagueName,
                    StartsAt,
                    Team_a_logo,
                    Team_b_logo,
                    Score_a,
                    Score_b,
                    Percentage,
                    Parent: user_updated?.Parent,
                    UserName,
                    InvitationCode: user_updated?.InvitationCode,
                    Remark: "Pending",
                },
            ],
            { session: Session }
        );
        if (!newBet) throw new CustomError(500, "Failed to create bets");
        await Session.commitTransaction();
        return NextResponse.json({ status: 200, message: "bet placed" });
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
