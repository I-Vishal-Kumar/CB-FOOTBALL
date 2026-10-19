/**
 * Refund bets that were incorrectly marked as "lose" for a given StakeId.
 *
 * What it does:
 *   1. Finds all bets with the given StakeId, Score_a=3, Score_b=3, Remark="lose"
 *   2. For each bet, credits the user: Balance += BetAmount
 *   3. Updates the bet Remark from "lose" to "win"
 *   4. All operations run inside a MongoDB transaction (all-or-nothing)
 *
 * DRY RUN by default. Pass --execute to actually apply changes.
 *
 * Usage:
 *   node scripts/refund-stake.js                  # dry run
 *   node scripts/refund-stake.js --execute        # apply changes
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// ── Config ──────────────────────────────────────────────────────────────────
const STAKE_ID = 20260301001;
const WINNING_SCORE_A = 3;
const WINNING_SCORE_B = 3;
const EXECUTE = process.argv.includes("--execute");
// ─────────────────────────────────────────────────────────────────────────────

// Load .env
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  content.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const eq = line.indexOf("=");
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    process.env[key] = value;
  });
}
loadEnv(path.join(__dirname, "..", ".env"));
loadEnv(path.join(process.cwd(), ".env"));

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGO_URI;
if (!MONGODB_URI) {
  console.error("NEXT_PUBLIC_MONGO_URI is not set (check .env)");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected to MongoDB");

  const betsCol = mongoose.connection.db.collection("bets");
  const usersCol = mongoose.connection.db.collection("users");

  // Find incorrectly lost bets
  const lostBets = await betsCol
    .find({
      StakeId: STAKE_ID,
      Score_a: WINNING_SCORE_A,
      Score_b: WINNING_SCORE_B,
      Remark: "lose",
      Status: 1,
    })
    .toArray();

  if (lostBets.length === 0) {
    console.log("No incorrectly lost bets found for StakeId", STAKE_ID);
    await mongoose.disconnect();
    return;
  }

  console.log(`\nFound ${lostBets.length} bet(s) to refund:\n`);

  const userUpdates = []; // { filter, update }
  const betUpdates = [];  // { filter, update }

  for (const bet of lostBets) {
    const balanceCredit = Math.round(bet.BetAmount);

    console.log(
      `  User: ${bet.UserName} | BetAmount: ${bet.BetAmount} | Balance +${balanceCredit}`
    );

    userUpdates.push({
      updateOne: {
        filter: { UserName: bet.UserName },
        update: {
          $inc: {
            Balance: balanceCredit,
          },
        },
      },
    });

    betUpdates.push({
      updateOne: {
        filter: { StakeId: bet.StakeId, UserName: bet.UserName },
        update: { $set: { Remark: "win" } },
      },
    });
  }

  if (!EXECUTE) {
    console.log("\n=== DRY RUN — no changes applied ===");
    console.log("Run with --execute to apply these changes.");
    await mongoose.disconnect();
    return;
  }

  // Execute inside a transaction
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    const userResult = await usersCol.bulkWrite(userUpdates, { session });
    const betResult = await betsCol.bulkWrite(betUpdates, { session });

    console.log(
      `\nUsers updated: ${userResult.modifiedCount}/${userResult.matchedCount}`
    );
    console.log(
      `Bets updated:  ${betResult.modifiedCount}/${betResult.matchedCount}`
    );

    await session.commitTransaction();
    console.log("\nTransaction committed successfully.");
  } catch (err) {
    await session.abortTransaction();
    console.error("\nTransaction aborted:", err.message);
  } finally {
    await session.endSession();
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
