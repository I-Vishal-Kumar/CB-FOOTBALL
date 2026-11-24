import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { MATCH } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
import { cookies } from "next/headers";
import ErrorReport from "@/app/helpers/ErrorReport";
import { getUpcomingMatches } from "@/app/helpers/fetchMatches";

const MATCH_ID = process.env.NEXT_PUBLIC_MATCH_ID;
const ALL_MATCHES_LIMIT = 50;

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
    const cacheKey = `all_${currentHourKey}`;
    try {
        const cached = await MATCH.findOne({ _id: MATCH_ID });
        if (cached?.data) {
            try {
                const parsed = JSON.parse(cached.data);
                if (parsed?.allHourKey === currentHourKey && Array.isArray(parsed?.allMatches) && parsed.allMatches.length > 0) {
                    return parsed.allMatches;
                }
            } catch (_) {}
        }

        const freshMatches = await getUpcomingMatches(ALL_MATCHES_LIMIT);

        // Merge into the existing MATCH document alongside the home-page cache
        const existing = await MATCH.findOne({ _id: MATCH_ID });
        let base = {};
        try { base = existing?.data ? JSON.parse(existing.data) : {}; } catch (_) {}

        await MATCH.findOneAndUpdate(
            { _id: MATCH_ID },
            { $set: { data: JSON.stringify({ ...base, allHourKey: currentHourKey, allMatches: freshMatches }) } },
            { upsert: true, new: true }
        );

        return freshMatches;
    } catch (error) {
        ErrorReport(error);
        return getUpcomingMatches(ALL_MATCHES_LIMIT);
    }
}
