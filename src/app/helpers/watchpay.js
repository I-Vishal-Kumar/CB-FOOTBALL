import crypto from "crypto";

/**
 * WatchPay gateway client (server only) — pay-in (deposits).
 * Signature algorithm is identical to JazPays: MD5 over sorted non-empty
 * params (excluding "sign"), suffixed with "&key=<secret>", uppercased.
 */

const BASE_URL = "https://watchpayss.com/api/public/v1";

export const WATCHPAY_MIN_AMOUNT = 100;
export const WATCHPAY_MAX_AMOUNT = 50000;

export function watchpayConfig() {
    return {
        merchantId: process.env.WATCHPAY_MERCHANT_ID || "",
        payinKey:   process.env.WATCHPAY_PAYIN_KEY || "",
        appUrl:     (process.env.APP_URL || "https://chelseafootball.online").replace(/\/$/, ""),
        payinEnabled: process.env.WATCHPAY_PAYIN_ENABLED === "true",
    };
}

export function watchpaySign(params, secretKey) {
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

export function watchpayVerify(params, secretKey) {
    if (!secretKey || !params?.sign) return false;
    const expected = Buffer.from(watchpaySign(params, secretKey));
    const provided  = Buffer.from(String(params.sign).toUpperCase());
    return expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
}

async function watchpayPost(path, params, secretKey) {
    const { merchantId } = watchpayConfig();
    if (!merchantId || !secretKey)
        throw new Error("WatchPay is not configured (merchant id / api key missing)");

    const body = {
        ...params,
        merchant_id: merchantId,
        timestamp:   String(Math.floor(Date.now() / 1000)),
    };
    body.sign = watchpaySign(body, secretKey);

    const res = await fetch(`${BASE_URL}${path}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
        cache:   "no-store",
        signal:  AbortSignal.timeout(20000),
    });
    return res.json();
}

export function createWatchpayPayin({ orderNo, amount, customerName, customerPhone }) {
    const { payinKey, appUrl } = watchpayConfig();
    return watchpayPost(
        "/payin/create",
        {
            order_no:       orderNo,
            amount:         Number(amount).toFixed(2),
            notify_url:     `${appUrl}/api/payment/watchpay/payin/notify`,
            return_url:     `${appUrl}/profile`,
            customer_name:  customerName  || "",
            customer_phone: customerPhone || "",
        },
        payinKey
    );
}

export function queryWatchpayPayin(orderNo) {
    return watchpayPost("/payin/query", { order_no: orderNo }, watchpayConfig().payinKey);
}

// callbacks are JSON (spec), but accept form-urlencoded as a fallback
export async function readWatchpayCallback(request) {
    const raw = await request.text();
    try {
        return JSON.parse(raw);
    } catch {
        return Object.fromEntries(new URLSearchParams(raw));
    }
}
