/**
 * Quick AstroPay API connectivity + credential test.
 * Run from project root after filling in ASTROPAY_MERCHANT_KEY and ASTROPAY_SECRET_KEY in .env
 *
 *   node scripts/test-astropay.js
 *
 * What it checks:
 *   1. Credentials are set in .env
 *   2. POST /v1/payins/create reachable with a small test order (₹200)
 *   3. POST /v1/payins/query returns the same order
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const crypto = require("crypto");

const BASE_URL       = "https://api.gpay.one";
const MERCHANT_KEY   = process.env.ASTROPAY_MERCHANT_KEY || "";
const SECRET_KEY     = process.env.ASTROPAY_SECRET_KEY   || "";
const APP_URL        = (process.env.APP_URL || "https://chelseafootball.online").replace(/\/$/, "");

if (!MERCHANT_KEY || !SECRET_KEY) {
    console.error("❌  ASTROPAY_MERCHANT_KEY / ASTROPAY_SECRET_KEY not set in .env");
    process.exit(1);
}

async function post(path, params) {
    const url = `${BASE_URL}${path}`;
    console.log(`\n→ POST ${url}`);
    const body = JSON.stringify({ ...params, merchantKey: MERCHANT_KEY, secretKey: SECRET_KEY });
    const res = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal:  AbortSignal.timeout(20000),
    });
    const text = await res.text();
    console.log(`  HTTP ${res.status}`);
    try { return JSON.parse(text); } catch { return text; }
}

async function run() {
    const orderId = `AP_TEST_${Date.now()}`;
    const amount  = "200.00";

    // 1. Create payin order
    console.log("\n=== 1. Create payin order ===");
    const createRes = await post("/v1/payins/create", {
        orderId,
        amount,
        callbackUrl: `${APP_URL}/api/payment/astropay/payin/notify`,
        name:  "Test User",
        phone: "9000000000",
        email: "test@test.com",
    });
    console.log(JSON.stringify(createRes, null, 2));

    if (createRes?.code === 1000) {
        console.log("\n✅  Payin created OK");
        console.log("    pay_url:", createRes?.data?.pay_url);
    } else {
        console.error("\n❌  Payin create failed — check credentials or IP whitelist");
    }

    // 2. Query it back
    console.log("\n=== 2. Query payin order ===");
    const queryRes = await post("/v1/payins/query", { orderId });
    console.log(JSON.stringify(queryRes, null, 2));

    if (queryRes?.code === 1000) {
        console.log("\n✅  Query OK — status:", queryRes?.data?.status);
    } else {
        console.error("\n❌  Query failed");
    }
}

run().catch((err) => {
    console.error("\n❌  Unexpected error:", err.message);
    process.exit(1);
});
