import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { MATCH } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import { cookies } from "next/headers";
import ErrorReport from "@/app/helpers/ErrorReport";
import { getUpcomingMatches } from "@/app/helpers/fetchMatches";

const MATCH_ID = process.env.NEXT_PUBLIC_MATCH_ID;
const ALL_MATCHES_LIMIT = 9999; // no practical limit — return all fixtures from the API

let _allHourKey = -1;
let _allFetchPromise = null;

function filterStarted(matches) {
    const now = Date.now();
    return matches.filter((m) => m?.StartsAt && new Date(m.StartsAt).getTime() > now);
}

export async function GET() {
    const token = cookies().get("token")?.value || "";
    const session = cookies().get("session")?.value || "";
    try {
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({ status: 302, message: "Session Expired login again" });

        await connect();
        const matches = await getAllMatches();

        return NextResponse.json(
            { status: 200, data: { matches } },
            { headers: { "Cache-Control": "public, max-age=3600" } }
        );
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) ErrorReport(error);
        return NextResponse.json({ status: error?.status || 500, message: error?.message || "something went wrong" });
    }
}

async function getAllMatches() {
    const currentHourKey = Math.floor(Date.now() / 3600000);

    // Fast path — check cache without lock
    try {
        const cached = await MATCH.findOne({ _id: MATCH_ID });
        if (cached?.data) {
            const parsed = JSON.parse(cached.data);
            if (parsed?.allHourKey === currentHourKey && Array.isArray(parsed?.allMatches) && parsed.allMatches.length > 0) {
                return filterStarted(parsed.allMatches);
            }
        }
    } catch (_) {}

    // Cache miss — single fetch, all concurrent requests share the promise
    if (_allHourKey !== currentHourKey || !_allFetchPromise) {
        _allHourKey = currentHourKey;
        _allFetchPromise = (async () => {
            try {
                const freshMatches = await getUpcomingMatches(ALL_MATCHES_LIMIT);
                const existing = await MATCH.findOne({ _id: MATCH_ID });
                let base = {};
                try { base = existing?.data ? JSON.parse(existing.data) : {}; } catch (_) {}
                await MATCH.findOneAndUpdate(
                    { _id: MATCH_ID },
                    { $set: { data: JSON.stringify({ ...base, allHourKey: currentHourKey, allMatches: freshMatches }) } },
                    { upsert: true, new: true }
                );
                return filterStarted(freshMatches);
            } catch (error) {
                ErrorReport(error);
                return filterStarted(await getUpcomingMatches(ALL_MATCHES_LIMIT));
            } finally {
                if (_allHourKey === currentHourKey) _allFetchPromise = null;
            }
        })();
    }

    return _allFetchPromise;
}
