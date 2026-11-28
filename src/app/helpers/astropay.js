import crypto from "crypto";

const BASE_URL = "https://api.gpay.one";

export const ASTROPAY_MIN_AMOUNT = 100;
export const ASTROPAY_MAX_AMOUNT = 50000;

export function astropayConfig() {
    return {
        merchantKey:  process.env.ASTROPAY_MERCHANT_KEY || "",
        secretKey:    process.env.ASTROPAY_SECRET_KEY   || "",
        appUrl:       (process.env.APP_URL || "https://chelseafootball.online").replace(/\/$/, ""),
        payinEnabled: process.env.ASTROPAY_PAYIN_ENABLED === "true",
    };
}

// sign covers only these 5 fields sorted alphabetically, skipping null/empty, + &secret=<key>
const SIGN_FIELDS = ["orderId", "amount", "commission", "status", "utr"];

export function astropaySign(payload, secretKey) {
    const str =
        [...SIGN_FIELDS]
            .filter((k) => payload[k] != null && payload[k] !== "")
            .sort()
            .map((k) => `${k}=${payload[k]}`)
            .join("&") +
        `&secret=${secretKey}`;
    return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
}

export function astropayVerify(payload, secretKey) {
    if (!secretKey || !payload?.sign) return false;
    const expected = Buffer.from(astropaySign(payload, secretKey));
    const provided  = Buffer.from(String(payload.sign).toUpperCase());
    return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

async function astropayPost(path, params) {
    const { merchantKey, secretKey } = astropayConfig();
    if (!merchantKey || !secretKey)
        throw new Error("AstroPay is not configured (merchant key / secret key missing)");

    const res = await fetch(`${BASE_URL}${path}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...params, merchantKey, secretKey }),
        cache:   "no-store",
        signal:  AbortSignal.timeout(20000),
    });
    return res.json();
}

export function createAstropayPayin({ orderId, amount, name, phone, email }) {
    const { appUrl } = astropayConfig();
    return astropayPost("/v1/payins/create", {
        orderId,
        amount:      Number(amount).toFixed(2),
        callbackUrl: `${appUrl}/api/payment/astropay/payin/notify`,
        name:        name  || "",
        phone:       phone || "",
        email:       email || "",
    });
}

export function queryAstropayPayin(orderId) {
    return astropayPost("/v1/payins/query", { orderId });
}

export function createAstropayPayout({ orderId, amount, accountName, accountNo, ifsc, phone }) {
    const { appUrl } = astropayConfig();
    return astropayPost("/v1/payouts/create", {
        orderId,
        amount:       Number(Math.floor(amount)).toFixed(2),
        callbackUrl:  `${appUrl}/api/payment/astropay/payout/notify`,
        account:      String(accountNo),
        bank_code:    String(ifsc || "").toUpperCase(),
        accountPhone: phone || "",
        personName:   accountName || "",
        accountType:  "BANK",
    });
}

export function queryAstropayPayout(orderId) {
    return astropayPost("/v1/payouts/query", { orderId });
}

export async function readAstropayCallback(request) {
    const raw = await request.text();
    try { return JSON.parse(raw); } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}
