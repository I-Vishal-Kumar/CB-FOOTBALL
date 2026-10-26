import crypto from "crypto";

/**
 *
 *   JazPays gateway client (server only) — pay-in (deposits) and payout (withdrawals).
 *   Reference: JAZPAYS_API.md in the project root.
 *
 */

const BASE_URL =
    process.env.JAZPAYS_BASE_URL || "https://jazpayss.org/api/public/v1";

export const JAZPAYS_MIN_AMOUNT = 100;
export const JAZPAYS_MAX_AMOUNT = 50000;

export function jazpaysConfig() {
    return {
        merchantId: process.env.JAZPAYS_MERCHANT_ID || "",
        payinKey: process.env.JAZPAYS_PAYIN_KEY || "",
        payoutKey: process.env.JAZPAYS_PAYOUT_KEY || "",
        appUrl: (process.env.APP_URL || "https://cb-football.vercel.app").replace(/\/$/, ""),
        payinEnabled: process.env.JAZPAYS_PAYIN_ENABLED === "true",
        autoPayout: process.env.JAZPAYS_AUTO_PAYOUT === "true",
    };
}

// MD5 over non-empty params (except sign) sorted by key, joined with "&", plus "&key=<secret>", uppercased
export function jazpaysSign(params, secretKey) {
    const str =
        Object.keys(params)
            .filter((k) => k !== "sign" && params[k] !== "" && params[k] != null)
            .sort()
            .map((k) => `${k}=${params[k]}`)
            .join("&") +
        "&key=" +
        secretKey;
    return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
}

export function jazpaysVerify(params, secretKey) {
    if (!secretKey || !params?.sign) return false;
    const expected = Buffer.from(jazpaysSign(params, secretKey));
    const provided = Buffer.from(String(params.sign).toUpperCase());
    return (
        expected.length === provided.length &&
        crypto.timingSafeEqual(expected, provided)
    );
}

async function jazpaysPost(path, params, secretKey) {
    const { merchantId } = jazpaysConfig();
    if (!merchantId || !secretKey)
        throw new Error("JazPays is not configured (merchant id / api key missing)");

    const body = {
        ...params,
        merchant_id: merchantId,
        timestamp: String(Math.floor(Date.now() / 1000)),
    };
    body.sign = jazpaysSign(body, secretKey);

    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
    });
    // HTTP status is always 200 — the "code" field carries the result (0 = success)
    return res.json();
}

// amount in rupees (number) -> "500.00"
export const toJazpaysAmount = (rupees) => Number(rupees).toFixed(2);

export function createPayin({ orderNo, amount, customerName, customerPhone }) {
    const { payinKey, appUrl } = jazpaysConfig();
    return jazpaysPost(
        "/payin/create",
        {
            order_no: orderNo,
            amount: toJazpaysAmount(amount),
            notify_url: `${appUrl}/api/payment/jazpays/payin/notify`,
            return_url: `${appUrl}/profile`,
            customer_name: customerName || "",
            customer_phone: customerPhone || "",
        },
        payinKey
    );
}

export function queryPayin(orderNo) {
    return jazpaysPost("/payin/query", { order_no: orderNo }, jazpaysConfig().payinKey);
}

export function createPayout({ orderNo, amount, accountName, accountNo, ifsc, bankName }) {
    const { payoutKey, appUrl } = jazpaysConfig();
    return jazpaysPost(
        "/payout/create",
        {
            order_no: orderNo,
            amount: toJazpaysAmount(Math.floor(amount)), // payouts are whole rupees
            method: "bank",
            account_name: accountName,
            account_no: accountNo,
            ifsc: String(ifsc || "").toUpperCase(),
            bank_name: bankName || "",
            notify_url: `${appUrl}/api/payment/jazpays/payout/notify`,
        },
        payoutKey
    );
}

export function queryPayout(orderNo) {
    return jazpaysPost("/payout/query", { order_no: orderNo }, jazpaysConfig().payoutKey);
}

// callbacks are JSON, but accept form-urlencoded too
export async function readCallbackBody(request) {
    const raw = await request.text();
    try {
        return JSON.parse(raw);
    } catch {
        return Object.fromEntries(new URLSearchParams(raw));
    }
}
