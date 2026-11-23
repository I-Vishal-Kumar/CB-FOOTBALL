import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { USER, MATCH } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import CustomError from "@/app/helpers/Error";
import { cookies } from "next/headers";
import ErrorReport from "@/app/helpers/ErrorReport";
import { settleFixDeposit } from "@/app/helpers/SettleFixDeposit";
import { getUpcomingMatches } from "@/app/helpers/fetchMatches";
// 200 -> Everything went fine
// 700 -> something went wrong with data sent by the client;
// 703 -> database issue;
// 705 -> server got crashed;

// this function will deal with the user's balance and the 10 match home data which will be fetched from the MATCH modal

const MATCH_ID = process.env.NEXT_PUBLIC_MATCH_ID;

export async function GET(request) {
    const { session, token } = await getCookieData();
    try {
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });

        await connect();
        let userData = await USER.findOne({ UserName }, { _id: 0, Balance: 1 });
        if (!userData) throw new CustomError(703, "Login again", {});

        const [matches] = await Promise.all([
            getLiveBets(),
            settleFixDeposit(UserName),
        ]);

        return NextResponse.json(
            {
                status: 200,
                message: "",
                data: { userData, matches },
            },
            {
                headers: {
                    "Cache-Control": "public, max-age=3600",
                },
            }
        );
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
    const currentHourKey = Math.floor(Date.now() / 3600000);
    try {
        // Check MongoDB hourly cache
        const cached = await MATCH.findOne({ _id: MATCH_ID });
        if (cached?.data) {
            try {
                const parsed = JSON.parse(cached.data);
                if (parsed?.hourKey === currentHourKey && Array.isArray(parsed?.matches) && parsed.matches.length > 0) {
                    return parsed.matches;
                }
            } catch (_) {}
        }

        // Cache miss or stale — generate fresh matches
        const freshMatches = await getUpcomingMatches(20);

        // Write back to MongoDB so every subsequent user this hour gets it from DB
        await MATCH.findOneAndUpdate(
            { _id: MATCH_ID },
            { $set: { data: JSON.stringify({ hourKey: currentHourKey, matches: freshMatches }) } },
            { upsert: true, new: true }
        );

        return freshMatches;
    } catch (error) {
        ErrorReport(error);
        return getUpcomingMatches(20);
    }
}

async function getExtractedMatches(matches) {
    let count = 0;
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
        if (match_date?.getTime() - today?.getTime() < 30 * 60 * 1000) continue;
        count++;
        ExtractedMatches.push(match);
        if (count == 10) break;
    }
    return ExtractedMatches;
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