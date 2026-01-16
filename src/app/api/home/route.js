import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { USER, MATCH } from "@/app/modals/modal";
import { connect } from "@/app/modals/dbConfig";
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
        let matches = await getLiveBets();
        console.log(matches);
        if (!userData || !matches)
            throw new CustomError(703, "Login again", {});

        let ExtractedMatches = await getExtractedMatches(matches);
        await settleFixDeposit(UserName);

        return NextResponse.json(
            {
                status: 200,
                message: "",
                data: { userData, matches: ExtractedMatches },
            },
            {
                headers: {
                    "Cache-Control": "public, max-age=120",
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
    // Hardcoded match data - Early Return Strategy
    const now = new Date();
    const hardcodedMatches = [
        {
            StakeId: "match_001",
            Team_a: "Manchester United",
            Team_b: "Liverpool",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
            LeagueName: "Premier League",
            StartsAt: new Date(
                now.getTime() + 2 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 50,
        },
        {
            StakeId: "match_002",
            Team_a: "Barcelona",
            Team_b: "Real Madrid",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
            LeagueName: "La Liga",
            StartsAt: new Date(
                now.getTime() + 3 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 48,
        },
        {
            StakeId: "match_003",
            Team_a: "Bayern Munich",
            Team_b: "Borussia Dortmund",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
            LeagueName: "Bundesliga",
            StartsAt: new Date(
                now.getTime() + 4 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 55,
        },
        {
            StakeId: "match_004",
            Team_a: "Paris Saint-Germain",
            Team_b: "Marseille",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg",
            LeagueName: "Ligue 1",
            StartsAt: new Date(
                now.getTime() + 5 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 60,
        },
        {
            StakeId: "match_005",
            Team_a: "Juventus",
            Team_b: "AC Milan",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
            LeagueName: "Serie A",
            StartsAt: new Date(
                now.getTime() + 6 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 52,
        },
        {
            StakeId: "match_006",
            Team_a: "Chelsea",
            Team_b: "Arsenal",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
            LeagueName: "Premier League",
            StartsAt: new Date(
                now.getTime() + 7 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 45,
        },
        {
            StakeId: "match_007",
            Team_a: "Atletico Madrid",
            Team_b: "Sevilla",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
            LeagueName: "La Liga",
            StartsAt: new Date(
                now.getTime() + 8 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 58,
        },
        {
            StakeId: "match_008",
            Team_a: "Inter Milan",
            Team_b: "Napoli",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg",
            LeagueName: "Serie A",
            StartsAt: new Date(
                now.getTime() + 9 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 47,
        },
        {
            StakeId: "match_009",
            Team_a: "Manchester City",
            Team_b: "Tottenham",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
            LeagueName: "Premier League",
            StartsAt: new Date(
                now.getTime() + 10 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 62,
        },
        {
            StakeId: "match_010",
            Team_a: "RB Leipzig",
            Team_b: "Bayer Leverkusen",
            Team_a_logo:
                "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg",
            Team_b_logo:
                "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
            LeagueName: "Bundesliga",
            StartsAt: new Date(
                now.getTime() + 11 * 60 * 60 * 1000
            ).toISOString(),
            Score_a: 0,
            Score_b: 0,
            Percentage: 53,
        },
    ];

    return hardcodedMatches;

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
                { _id: 0, version: 1 }
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
        console.log(error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return new CustomError(703, "Something went wrong", {});
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
