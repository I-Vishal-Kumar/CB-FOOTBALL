/*
 * Helper function to fetch matches from API-Football using /fixtures/rounds endpoint
 * Fetches rounds for specified leagues, then gets fixtures for those rounds with status=NS (Not Started)
 */

import ErrorReport from "@/app/helpers/ErrorReport";

const scores = [
    "0-0",
    "0-1",
    "0-2",
    "0-3",
    "1-0",
    "1-1",
    "1-2",
    "1-3",
    "2-0",
    "2-1",
    "2-2",
    "2-3",
    "3-0",
    "3-1",
    "3-2",
    "3-3",
    "4-4",
];

/**
 * Fetches matches from API-Football using fixtures/rounds endpoint
 * @param {Object} options - Configuration options
 * @param {string} options.season - Season year (e.g., "2024")
 * @param {string[]} options.leagueIds - Array of league IDs to fetch
 * @returns {Promise<Array>} Array of matches in application schema format
 */
export async function fetchMatchesFromAPI({ season, leagueIds }) {
    const API_KEY = process.env.NEXT_PUBLIC_LIVE_MATCH_KEY;
    const API_BASE = "https://v3.football.api-sports.io";

    if (!API_KEY) {
        console.error("API key not configured");
        return [];
    }

    if (!season || !leagueIds || leagueIds.length === 0) {
        console.error("Season and league IDs are required");
        return [];
    }

    let allMatches = [];

    try {
        // Fetch rounds and fixtures for each league
        for (const leagueId of leagueIds) {
            try {
                // Step 1: Get rounds for this league
                const roundsParams = new URLSearchParams({
                    league: leagueId.toString(),
                    season: season.toString(),
                });

                const roundsResponse = await fetch(
                    `${API_BASE}/fixtures/rounds?${roundsParams}`,
                    {
                        method: "GET",
                        headers: {
                            "x-rapidapi-host": "v3.football.api-sports.io",
                            "x-apisports-key": API_KEY,
                        },
                    }
                );

                if (!roundsResponse.ok) {
                    console.error(
                        `Failed to fetch rounds for league ${leagueId}: ${roundsResponse.status}`
                    );
                    continue;
                }

                const roundsData = await roundsResponse.json();

                if (!roundsData?.response || roundsData.response.length === 0) {
                    console.log(`No rounds found for league ${leagueId}`);
                    continue;
                }

                // Step 2: For each round, fetch fixtures with status=NS
                for (const round of roundsData.response) {
                    // Skip if round is null or undefined
                    if (!round) continue;

                    const fixturesParams = new URLSearchParams({
                        league: leagueId.toString(),
                        season: season.toString(),
                        round: round,
                        status: "NS", // Only not started matches
                    });

                    const fixturesResponse = await fetch(
                        `${API_BASE}/fixtures?${fixturesParams}`,
                        {
                            method: "GET",
                            headers: {
                                "x-rapidapi-host": "v3.football.api-sports.io",
                                "x-apisports-key": API_KEY,
                            },
                        }
                    );

                    if (!fixturesResponse.ok) {
                        console.error(
                            `Failed to fetch fixtures for league ${leagueId}, round ${round}: ${fixturesResponse.status}`
                        );
                        continue;
                    }

                    const fixturesData = await fixturesResponse.json();
                    console.dir(fixturesData, {depth: null});
                    if (fixturesData?.response && fixturesData.response.length > 0) {
                        // Map API response to application schema
                        fixturesData.response.forEach((element) => {
                            // Only process if fixture status is NS (Not Started)
                            if (element?.fixture?.status?.short === "NS") {
                                let SCORE =
                                    scores[
                                        Math.floor(Math.random() * scores.length)
                                    ];
                                // For score 3-3, always use 1.5%, otherwise random
                                const isScore33 = SCORE === "3-3";
                                const fixedPercent = isScore33 
                                    ? "1.50" 
                                    : (Math.random() * 6 + 1.5).toFixed(2);
                                let match = {
                                    Team_a: element?.teams?.home?.name || "",
                                    Team_b: element?.teams?.away?.name || "",
                                    StakeId: element?.fixture?.id?.toString() || "",
                                    LeagueName: element?.league?.name || "",
                                    Team_a_logo: element?.teams?.home?.logo || "",
                                    Team_b_logo: element?.teams?.away?.logo || "",
                                    StartsAt: element?.fixture?.date || "",
                                    Percents: [],
                                    Score_a: parseInt(SCORE.split("-")[0]) || 0,
                                    Score_b: parseInt(SCORE.split("-")[1]) || 0,
                                    FixedPercent: fixedPercent,
                                };

                                // Generate Percents array (17 values)
                                // Index 15 corresponds to score "3-3" which should always be 1.5%
                                for (let i = 0; i < 17; i++) {
                                    if (i === 15) {
                                        // Index 15 is for score "3-3" - always use 1.5%
                                        match["Percents"].push("1.50");
                                    } else {
                                        match["Percents"].push(
                                            (
                                                Math.random() * (2.5 - 3) + 3
                                            ).toFixed(2)
                                        );
                                    }
                                }

                                allMatches.push(match);
                            }
                        });
                    }

                    // Add a small delay to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(
                    `Error processing league ${leagueId}:`,
                    error.message
                );
                if (error?.code === 500 || error?.status === 500 || !error?.status) {
                    ErrorReport(error);
                }
                continue;
            }
        }

        return allMatches;
    } catch (error) {
        console.error("Error in fetchMatchesFromAPI:", error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return [];
    }
}

/**
 * Fetches upcoming matches directly from /fixtures endpoint (all leagues, no specific league IDs needed)
 * @param {number} limit - Maximum number of matches to fetch (default: 20)
 * @returns {Promise<Array>} Array of matches in application schema format
 */
export async function fetchUpcomingMatches(limit = 20) {
    const API_KEY = process.env.NEXT_PUBLIC_LIVE_MATCH_KEY;
    const API_BASE = "https://v3.football.api-sports.io";

    if (!API_KEY) {
        console.error("API key not configured");
        return [];
    }

    try {
        // Fetch next fixtures with status=NS (Not Started) - no league filter, gets all leagues
        const fixturesParams = new URLSearchParams({
            status: "NS", // Only not started matches
        });

        const fixturesResponse = await fetch(
            `${API_BASE}/fixtures?${fixturesParams}`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "v3.football.api-sports.io",
                    "x-apisports-key": API_KEY,
                },
            }
        );

        if (!fixturesResponse.ok) {
            console.error(
                `Failed to fetch fixtures: ${fixturesResponse.status}`
            );
            return [];
        }

        const fixturesData = await fixturesResponse.json();
        console.dir(fixturesData, {depth: null});
        if (!fixturesData?.response || fixturesData.response.length === 0) {
            console.log("No upcoming matches found");
            return [];
        }

        // Map API response to application schema
        const matches = [];
        fixturesData.response.forEach((element) => {
            // Only process if fixture status is NS (Not Started)
            if (element?.fixture?.status?.short === "NS") {
                let SCORE = scores[Math.floor(Math.random() * scores.length)];
                // For score 3-3, always use 1.5%, otherwise random
                const isScore33 = SCORE === "3-3";
                const fixedPercent = isScore33 
                    ? "1.50" 
                    : (Math.random() * 6 + 1.5).toFixed(2);
                let match = {
                    Team_a: element?.teams?.home?.name || "",
                    Team_b: element?.teams?.away?.name || "",
                    StakeId: element?.fixture?.id?.toString() || "",
                    LeagueName: element?.league?.name || "",
                    Team_a_logo: element?.teams?.home?.logo || "",
                    Team_b_logo: element?.teams?.away?.logo || "",
                    StartsAt: element?.fixture?.date || "",
                    Percents: [],
                    Score_a: parseInt(SCORE.split("-")[0]) || 0,
                    Score_b: parseInt(SCORE.split("-")[1]) || 0,
                    FixedPercent: fixedPercent,
                };

                // Generate Percents array (17 values)
                // Index 15 corresponds to score "3-3" which should always be 1.5%
                for (let i = 0; i < 17; i++) {
                    if (i === 15) {
                        // Index 15 is for score "3-3" - always use 1.5%
                        match["Percents"].push("1.50");
                    } else {
                        match["Percents"].push(
                            (Math.random() * (2.5 - 3) + 3).toFixed(2)
                        );
                    }
                }

                matches.push(match);
            }
        });

        // Limit to requested number (in case API returns more)
        return matches.slice(0, limit);
    } catch (error) {
        console.error("Error in fetchUpcomingMatches:", error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return [];
    }
}

// Big leagues are picked first when there are more fixtures than the limit
// (Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UCL, UEL, Conference League,
// Eredivisie, Primeira Liga, Scottish Premiership, MLS, Saudi Pro League, ISL)
const PRIORITY_LEAGUE_IDS = [39, 140, 135, 78, 61, 2, 3, 848, 88, 94, 179, 253, 307, 323];

/**
 * Fetches upcoming (not started) matches from API-Football (api-sports.io), all leagues
 * Free plan: 100 requests/day and no "next" parameter, so fixtures are fetched by date
 * (today + tomorrow) and each response is cached for a day (~2 requests/day).
 * @param {number} limit - Maximum number of matches to fetch (default: 20)
 * @returns {Promise<Array>} Array of matches in application schema format
 */
export async function fetchUpcomingMatchesFromApiFootball(limit = 20) {
    const API_KEY = process.env.API_FOOTBALL_KEY;
    const API_BASE = "https://v3.football.api-sports.io";

    if (!API_KEY) {
        console.error("API-Football key not configured (API_FOOTBALL_KEY)");
        return [];
    }

    try {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const dates = [today, tomorrow].map((d) => d.toISOString().slice(0, 10));

        const fixtures = [];
        for (const date of dates) {
            const params = new URLSearchParams({ date, status: "NS" });
            const response = await fetch(`${API_BASE}/fixtures?${params}`, {
                method: "GET",
                headers: { "x-apisports-key": API_KEY },
                // fixtures for a date are fetched once a day; started matches are dropped
                // by the kick-off filter in mapApiFootballResponse on every request
                next: { revalidate: 86400 },
            });

            if (!response.ok) {
                console.error(`Failed to fetch fixtures from API-Football for ${date}: ${response.status}`);
                continue;
            }

            const data = await response.json();
            // API-Football reports plan/key/rate-limit problems in "errors" with HTTP 200
            const errors = data?.errors;
            if (errors && (Array.isArray(errors) ? errors.length : Object.keys(errors).length)) {
                console.error("API-Football errors:", errors);
                continue;
            }
            fixtures.push(...(data?.response || []));
        }

        return mapApiFootballResponse(fixtures, limit);
    } catch (error) {
        console.error("Error in fetchUpcomingMatchesFromApiFootball:", error);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return [];
    }
}

// kept for existing imports — SportMonks has been replaced by API-Football
export const fetchUpcomingMatchesFromSportMonks = fetchUpcomingMatchesFromApiFootball;

/**
 * Maps API-Football fixtures to application schema
 * @param {Array} fixtures - API-Football "response" items
 * @param {number} limit - Maximum number of matches to return
 * @returns {Array} Array of matches in application schema format, sorted by start time
 */
function mapApiFootballResponse(fixtures, limit) {
    const now = new Date();

    const upcoming = fixtures.filter(
        (f) =>
            f?.fixture?.status?.short === "NS" &&
            f?.fixture?.date &&
            new Date(f.fixture.date) > now &&
            f?.teams?.home?.name &&
            f?.teams?.away?.name
    );

    const isPriority = (f) => PRIORITY_LEAGUE_IDS.includes(f?.league?.id);
    const byStart = (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date);

    // big leagues first, then fill with the earliest remaining fixtures; show in kick-off order
    const selected = [
        ...upcoming.filter(isPriority).sort(byStart),
        ...upcoming.filter((f) => !isPriority(f)).sort(byStart),
    ]
        .slice(0, limit)
        .sort(byStart);

    return selected.map((element) => {
        // seeded by fixture id so a match keeps the same score/percents on every request and for every user
        const random = seededRandom(Number(element?.fixture?.id) || 1);
        let SCORE = scores[Math.floor(random() * scores.length)];

        // For score 3-3, always use 1.5%, otherwise random
        const isScore33 = SCORE === "3-3";
        const fixedPercent = isScore33
            ? "1.50"
            : (random() * 6 + 1.5).toFixed(2);

        let match = {
            Team_a: element?.teams?.home?.name || "",
            Team_b: element?.teams?.away?.name || "",
            StakeId: element?.fixture?.id?.toString() || "",
            LeagueName: element?.league?.name || "",
            Team_a_logo: element?.teams?.home?.logo || "",
            Team_b_logo: element?.teams?.away?.logo || "",
            StartsAt: new Date(element.fixture.date).toISOString(),
            Percents: [],
            Score_a: parseInt(SCORE.split("-")[0]) || 0,
            Score_b: parseInt(SCORE.split("-")[1]) || 0,
            FixedPercent: fixedPercent,
        };

        // Generate Percents array (17 values)
        // Index 15 corresponds to score "3-3" which should always be 1.5%
        for (let i = 0; i < 17; i++) {
            if (i === 15) {
                // Index 15 is for score "3-3" - always use 1.5%
                match["Percents"].push("1.50");
            } else {
                match["Percents"].push(
                    (random() * (2.5 - 3) + 3).toFixed(2)
                );
            }
        }

        return match;
    });
}

/**
 * Upcoming matches from API-Football, falling back to the generated matches when the API
 * returns nothing (key missing, daily request limit reached, API down)
 * @param {number} limit - Maximum number of matches to return
 * @returns {Promise<Array>} Array of matches in application schema format
 */
export async function getUpcomingMatches(limit = 20) {
    const apiMatches = await fetchUpcomingMatchesFromApiFootball(limit);
    if (apiMatches.length > 0) return apiMatches;
    console.log("API-Football returned no matches, using hardcoded matches");
    return getHardcodedMatches(limit);
}

/**
 * Simple seeded random number generator for deterministic results
 * @param {number} seed - Seed value
 * @returns {Function} Seeded random function
 */
function seededRandom(seed) {
    let value = seed;
    return function() {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}

/**
 * Get hardcoded matches for current day (singleton - same for all users)
 * Uses seeded random based on day of week to ensure all users get same matches
 * @param {number} limit - Maximum number of matches to return
 * @returns {Array} Array of matches for current day
 */
export function getHardcodedMatches(limit = 20) {
    const scores = [
        "0-0", "0-1", "0-2", "0-3", "1-0", "1-1", "1-2", "1-3",
        "2-0", "2-1", "2-2", "2-3", "3-0", "3-1", "3-2", "3-3", "4-4",
    ];

    const teamNames = [
        { name: "Manchester United", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg" },
        { name: "Liverpool", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg" },
        { name: "Barcelona", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg" },
        { name: "Real Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg" },
        { name: "Bayern Munich", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg" },
        { name: "Borussia Dortmund", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg" },
        { name: "Paris Saint-Germain", logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg" },
        { name: "Marseille", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg" },
        { name: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Juventus_FC_-_pictogram_black_%28Italy%2C_2017%29.svg" },
        { name: "AC Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg" },
        { name: "Chelsea", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg" },
        { name: "Arsenal", logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg" },
        { name: "Atletico Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg" },
        { name: "Sevilla", logo: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg" },
        { name: "Inter Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg" },
        { name: "Napoli", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg" },
        { name: "Manchester City", logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg" },
        { name: "Tottenham", logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg" },
        { name: "RB Leipzig", logo: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg" },
        { name: "Bayer Leverkusen", logo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg" },
        { name: "AS Roma", logo: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282020%29.svg" },
        { name: "Lazio", logo: "https://upload.wikimedia.org/wikipedia/en/5/5c/S.S._Lazio_logo.svg" },
        { name: "Valencia", logo: "https://upload.wikimedia.org/wikipedia/en/c/ce/Valencia_CF_logo.svg" },
        { name: "Villarreal", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/Villarreal_CF_logo.svg" },
        { name: "Lyon", logo: "https://upload.wikimedia.org/wikipedia/en/5/5a/Olympique_Lyonnais_logo.svg" },
        { name: "Monaco", logo: "https://upload.wikimedia.org/wikipedia/en/4/4c/AS_Monaco_FC_logo.svg" },
        { name: "Ajax", logo: "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg" },
        { name: "PSV Eindhoven", logo: "https://upload.wikimedia.org/wikipedia/en/0/02/PSV_Eindhoven.svg" },
        { name: "Porto", logo: "https://upload.wikimedia.org/wikipedia/en/9/96/FC_Porto.svg" },
        { name: "Benfica", logo: "https://upload.wikimedia.org/wikipedia/en/4/4a/SL_Benfica_logo.svg" },
        { name: "Celtic", logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Celtic_FC_logo.svg" },
        { name: "Rangers", logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Rangers_FC_logo.svg" },
    ];

    const leagues = [
        "Premier League",
        "La Liga",
        "Serie A",
        "Bundesliga",
        "Ligue 1",
        "Champions League",
        "Europa League",
        "Eredivisie",
        "Primeira Liga",
        "Scottish Premiership",
    ];

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Use actual date (year, month, day) as seed to ensure same matches for all users on same day
    // This makes matches change daily instead of weekly
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-12
    const day = today.getDate(); // 1-31
    const seed = year * 10000 + month * 100 + day;
    const random = seededRandom(seed);
    
    // Calculate the date for today
    const targetDate = new Date(today);
    targetDate.setHours(0, 0, 0, 0);
    
    const matches = [];
    const numberOfMatches = 50;
    
    // Prioritize matches in the 5 PM to 11 PM range (17:00 to 23:00)
    const priorityStartHour = 17; // 5 PM
    const priorityEndHour = 23; // 11 PM
    const priorityHours = priorityEndHour - priorityStartHour + 1; // 7 hours (17-23)
    const priorityMatches = 35; // Allocate 35 matches to 5 PM - 11 PM range
    
    // Remaining matches for earlier hours (6 AM to 4 PM)
    const earlyStartHour = 6;
    const earlyEndHour = 16; // 4 PM
    const earlyMatches = numberOfMatches - priorityMatches; // 15 matches for 6 AM - 4 PM
    const earlyHours = earlyEndHour - earlyStartHour + 1; // 11 hours (6-16)
    
    let matchIndex = 0;
    
    // First, generate matches for priority hours (5 PM to 11 PM)
    const priorityMatchesPerHour = Math.ceil(priorityMatches / priorityHours);
    for (let hour = priorityStartHour; hour <= priorityEndHour && matchIndex < priorityMatches; hour++) {
        const matchesThisHour = Math.min(priorityMatchesPerHour, priorityMatches - matchIndex);
        
        for (let i = 0; i < matchesThisHour && matchIndex < priorityMatches; i++) {
            // Distribute minutes within the hour (0, 15, 30, 45)
            const minute = (i % 4) * 15;
            
            const matchDate = new Date(targetDate);
            matchDate.setHours(hour, minute, 0, 0);
            
            // Ensure match is in the future
            if (matchDate <= today) {
                matchDate.setDate(matchDate.getDate() + 1); // Move to tomorrow
            }
            
            // Use seeded random to select teams (deterministic)
            let teamAIndex = Math.floor(random() * teamNames.length);
            let teamBIndex = Math.floor(random() * teamNames.length);
            while (teamBIndex === teamAIndex) {
                teamBIndex = Math.floor(random() * teamNames.length);
            }
            
            const teamA = teamNames[teamAIndex];
            const teamB = teamNames[teamBIndex];
            const SCORE = scores[Math.floor(random() * scores.length)];
            const league = leagues[Math.floor(random() * leagues.length)];
            
            // For score 3-3, always use 1.5%, otherwise random
            const isScore33 = SCORE === "3-3";
            const fixedPercent = isScore33 
                ? "1.50" 
                : (random() * 6 + 1.5).toFixed(2);
            
            // Generate numeric StakeId: YYYYMMDD + matchIndex (ensures uniqueness and determinism)
            const numericStakeId = parseInt(`${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${(matchIndex + 1).toString().padStart(3, '0')}`);
            
            const match = {
                StakeId: numericStakeId,
                Team_a: teamA.name,
                Team_b: teamB.name,
                Team_a_logo: teamA.logo,
                Team_b_logo: teamB.logo,
                LeagueName: league,
                StartsAt: matchDate.toISOString(),
                Score_a: parseInt(SCORE.split("-")[0]) || 0,
                Score_b: parseInt(SCORE.split("-")[1]) || 0,
                Percents: [],
                FixedPercent: fixedPercent,
            };
            
            // Generate Percents array (17 values) using seeded random
            // Index 15 corresponds to score "3-3" which should always be 1.5%
            for (let j = 0; j < 17; j++) {
                if (j === 15) {
                    // Index 15 is for score "3-3" - always use 1.5%
                    match.Percents.push("1.50");
                } else {
                    match.Percents.push(
                        (random() * (3 - 2.5) + 2.5).toFixed(2)
                    );
                }
            }
            
            matches.push(match);
            matchIndex++;
        }
    }
    
    // Then, generate matches for earlier hours (6 AM to 4 PM)
    const earlyMatchesPerHour = Math.ceil(earlyMatches / earlyHours);
    for (let hour = earlyStartHour; hour <= earlyEndHour && matchIndex < numberOfMatches; hour++) {
        const matchesThisHour = Math.min(earlyMatchesPerHour, numberOfMatches - matchIndex);
        
        for (let i = 0; i < matchesThisHour && matchIndex < numberOfMatches; i++) {
            // Distribute minutes within the hour (0, 15, 30, 45)
            const minute = (i % 4) * 15;
            
            const matchDate = new Date(targetDate);
            matchDate.setHours(hour, minute, 0, 0);
            
            // Ensure match is in the future
            if (matchDate <= today) {
                matchDate.setDate(matchDate.getDate() + 1); // Move to tomorrow
            }
            
            // Use seeded random to select teams (deterministic)
            let teamAIndex = Math.floor(random() * teamNames.length);
            let teamBIndex = Math.floor(random() * teamNames.length);
            while (teamBIndex === teamAIndex) {
                teamBIndex = Math.floor(random() * teamNames.length);
            }
            
            const teamA = teamNames[teamAIndex];
            const teamB = teamNames[teamBIndex];
            const SCORE = scores[Math.floor(random() * scores.length)];
            const league = leagues[Math.floor(random() * leagues.length)];
            
            // For score 3-3, always use 1.5%, otherwise random
            const isScore33 = SCORE === "3-3";
            const fixedPercent = isScore33 
                ? "1.50" 
                : (random() * 6 + 1.5).toFixed(2);
            
            // Generate numeric StakeId: YYYYMMDD + matchIndex (ensures uniqueness and determinism)
            const numericStakeId = parseInt(`${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${(matchIndex + 1).toString().padStart(3, '0')}`);
            
            const match = {
                StakeId: numericStakeId,
                Team_a: teamA.name,
                Team_b: teamB.name,
                Team_a_logo: teamA.logo,
                Team_b_logo: teamB.logo,
                LeagueName: league,
                StartsAt: matchDate.toISOString(),
                Score_a: parseInt(SCORE.split("-")[0]) || 0,
                Score_b: parseInt(SCORE.split("-")[1]) || 0,
                Percents: [],
                FixedPercent: fixedPercent,
            };
            
            // Generate Percents array (17 values) using seeded random
            // Index 15 corresponds to score "3-3" which should always be 1.5%
            for (let j = 0; j < 17; j++) {
                if (j === 15) {
                    // Index 15 is for score "3-3" - always use 1.5%
                    match.Percents.push("1.50");
                } else {
                    match.Percents.push(
                        (random() * (3 - 2.5) + 2.5).toFixed(2)
                    );
                }
            }
            
            matches.push(match);
            matchIndex++;
        }
    }
    
    // Sort by start time and filter future matches only
    const now = new Date();
    const futureMatches = matches
        .filter(match => new Date(match.StartsAt) > now)
        .sort((a, b) => new Date(a.StartsAt) - new Date(b.StartsAt));
    
    // Return limited number
    return futureMatches.slice(0, limit);
}


/**
 * Helper to parse league IDs from environment variable
 * @param {string} leagueIdsString - Comma-separated league IDs (e.g., "39,140,135")
 * @returns {string[]} Array of league ID strings
 */
export function parseLeagueIds(leagueIdsString) {
    if (!leagueIdsString) return [];
    return leagueIdsString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
}
