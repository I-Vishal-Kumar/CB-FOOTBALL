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

// In-process lock: all concurrent cache-miss requests share one fetch promise
// so only 1 sportapi.ai call fires per hour regardless of concurrent users.
let _homeHourKey = -1;
let _homeFetchPromise = null;

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

function filterStarted(matches) {
    const now = Date.now();
    return matches.filter((m) => m?.StartsAt && new Date(m.StartsAt).getTime() > now);
}

async function getLiveBets() {
    await connect();
    // Daily cache key — sportapi.ai has a 2000 req/day limit, so we only refresh once per day.
    // filterStarted() at response time handles showing only future matches without re-fetching.
    const currentDayKey = Math.floor(Date.now() / 86400000);

    // Check MongoDB cache first (fast path — no lock needed for a hit)
    try {
        const cached = await MATCH.findOne({ _id: MATCH_ID });
        if (cached?.data) {
            const parsed = JSON.parse(cached.data);
            if (parsed?.homeDayKey === currentDayKey && Array.isArray(parsed?.matches) && parsed.matches.length > 0) {
                return filterStarted(parsed.matches);
            }
        }
    } catch (_) {}

    // Cache miss — only one fetch allowed at a time per process.
    // All other concurrent requests wait on the same promise.
    if (_homeHourKey !== currentDayKey || !_homeFetchPromise) {
        _homeHourKey = currentDayKey;
        _homeFetchPromise = (async () => {
            try {
                const freshMatches = await getUpcomingMatches(20);
                const existing = await MATCH.findOne({ _id: MATCH_ID });
                let base = {};
                try { base = existing?.data ? JSON.parse(existing.data) : {}; } catch (_) {}
                await MATCH.findOneAndUpdate(
                    { _id: MATCH_ID },
                    { $set: { data: JSON.stringify({ ...base, homeDayKey: currentDayKey, matches: freshMatches }) } },
                    { upsert: true, new: true }
                );
                return filterStarted(freshMatches);
            } catch (error) {
                ErrorReport(error);
                return filterStarted(await getUpcomingMatches(20));
            } finally {
                if (_homeHourKey === currentDayKey) _homeFetchPromise = null;
            }
        })();
    }

    return _homeFetchPromise;
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