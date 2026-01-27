/*
 * Script to generate hardcoded match data for each day of the week
 * Run this once to generate the matches data, then use the generated data
 */

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

/**
 * Generate matches for a specific day
 * @param {number} dayOfWeek - 0 (Sunday) to 6 (Saturday)
 * @param {number} numberOfMatches - Number of matches to generate (default: 50)
 * @returns {Array} Array of match objects
 */
export function generateMatchesForDay(dayOfWeek, numberOfMatches = 50) {
    const matches = [];
    const today = new Date();
    
    // Calculate the date for the target day of week
    const currentDay = today.getDay();
    const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    // Reset to start of day
    targetDate.setHours(0, 0, 0, 0);
    
    // Priority hours: 8pm (20), 9pm (21), 10pm (22), 11pm (23)
    const priorityHours = [20, 21, 22, 23];
    const startHour = 6;
    const endHour = 23;
    
    let matchIndex = 0;
    
    // Helper function to create a match
    const createMatch = (hour, minute) => {
        const matchDate = new Date(targetDate);
        matchDate.setHours(hour, minute, 0, 0);
        
        // Ensure match is in the future
        if (matchDate <= today) {
            matchDate.setDate(matchDate.getDate() + 7); // Move to next week
        }
        
        // Select random teams (ensure they're different)
        let teamAIndex = Math.floor(Math.random() * teamNames.length);
        let teamBIndex = Math.floor(Math.random() * teamNames.length);
        while (teamBIndex === teamAIndex) {
            teamBIndex = Math.floor(Math.random() * teamNames.length);
        }
        
        const teamA = teamNames[teamAIndex];
        const teamB = teamNames[teamBIndex];
        const SCORE = scores[Math.floor(Math.random() * scores.length)];
        const league = leagues[Math.floor(Math.random() * leagues.length)];
        
        const match = {
            StakeId: `match_${dayOfWeek}_${matchIndex + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            Team_a: teamA.name,
            Team_b: teamB.name,
            Team_a_logo: teamA.logo,
            Team_b_logo: teamB.logo,
            LeagueName: league,
            StartsAt: matchDate.toISOString(),
            Score_a: parseInt(SCORE.split("-")[0]) || 0,
            Score_b: parseInt(SCORE.split("-")[1]) || 0,
            Percents: [],
            FixedPercent: (Math.random() * 6 + 1.5).toFixed(2),
        };
        
        // Generate Percents array (17 values)
        for (let j = 0; j < 17; j++) {
            match.Percents.push(
                (Math.random() * (2.5 - 3) + 3).toFixed(2)
            );
        }
        
        return match;
    };
    
    // First, ensure matches at priority hours (8pm, 9pm, 10pm, 11pm)
    for (const hour of priorityHours) {
        if (matchIndex >= numberOfMatches) break;
        
        // Create at least 2-3 matches per priority hour
        const matchesThisHour = Math.min(3, numberOfMatches - matchIndex);
        for (let i = 0; i < matchesThisHour && matchIndex < numberOfMatches; i++) {
            const minute = (i % 4) * 15; // 0, 15, 30, 45
            matches.push(createMatch(hour, minute));
            matchIndex++;
        }
    }
    
    // Then distribute remaining matches across all hours (6 AM to 11 PM)
    const totalHours = endHour - startHour + 1;
    const remainingMatches = numberOfMatches - matchIndex;
    const matchesPerHour = Math.ceil(remainingMatches / totalHours);
    
    for (let hour = startHour; hour <= endHour && matchIndex < numberOfMatches; hour++) {
        const matchesThisHour = Math.min(matchesPerHour, numberOfMatches - matchIndex);
        
        for (let i = 0; i < matchesThisHour && matchIndex < numberOfMatches; i++) {
            // Distribute minutes within the hour (0, 15, 30, 45)
            const minute = (i % 4) * 15;
            matches.push(createMatch(hour, minute));
            matchIndex++;
        }
    }
    
    // Sort by start time
    matches.sort((a, b) => new Date(a.StartsAt) - new Date(b.StartsAt));
    
    return matches;
}

/**
 * Generate all matches for the week (Monday to Sunday)
 * @returns {Object} Object with keys for each day (0-6) containing match arrays
 */
export function generateWeeklyMatches() {
    const weeklyMatches = {};
    
    for (let day = 0; day < 7; day++) {
        weeklyMatches[day] = generateMatchesForDay(day, 50);
    }
    
    return weeklyMatches;
}

/**
 * Get matches for current day (singleton - same for all users)
 * @param {number} limit - Maximum number of matches to return
 * @returns {Array} Array of matches for current day
 */
export function getHardcodedMatches(limit = 20) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Generate matches for current day
    const matches = generateMatchesForDay(dayOfWeek, 50);
    
    // Filter only future matches
    const now = new Date();
    const futureMatches = matches.filter(match => {
        const matchDate = new Date(match.StartsAt);
        return matchDate > now;
    });
    
    // Return limited number
    return futureMatches.slice(0, limit);
}
