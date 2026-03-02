/**
 * Export all user phone numbers to stdout, one per line.
 * Run: node scripts/export-user-numbers.js > number.txt
 *
 * Requires .env in project root with NEXT_PUBLIC_MONGO_URI set.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Load .env from project root (strip BOM for Windows)
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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
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
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  try {
    const users = mongoose.connection.db.collection("users");
    const cursor = users.find(
      { PhoneNumber: { $exists: true, $ne: "" } },
      { projection: { PhoneNumber: 1 } }
    );

    for await (const doc of cursor) {
      const num = doc.PhoneNumber;
      if (num != null && String(num).trim() !== "") {
        process.stdout.write(String(num).trim() + "\n");
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
