# JazPays Merchant API — Pay-in & Payout Reference

> Compiled from the JazPays merchant portal API documentation (v1):
> [Pay-in API](https://jazpayss.org/merchant/docs/payin) · [Payout API](https://jazpayss.org/merchant/docs/payout) — captured 2026-10-26.
> The docs sit behind the merchant login; this file mirrors their content. Keep your real Merchant ID and API keys out of this file and out of Git.

## Quick Reference

| Item | Value |
| --- | --- |
| Base URL | `https://jazpayss.org/api/public/v1` |
| Method / format | `POST`, `Content-Type: application/json` (form-urlencoded also accepted) |
| Currency | INR, amounts as strings with 2 decimals (e.g. `"500.00"`) |
| Credentials | Merchant ID (9 digits) + **two separate keys**: Pay-in API Key and Payout API Key |
| Signature | Drop `sign` and empty values → sort keys ASCII → `k=v&k=v` → append `&key=<API key>` → `UPPER(md5(...))` |
| Success | `code: 0` (HTTP status is always 200 — always check `code`) |
| Callback reply | Plain text `success` with HTTP 200 |
| Amount limits | Min `100.00`, max `50000.00` (pay-in and payout) |

### Endpoints

| Endpoint | Signed with | Purpose |
| --- | --- | --- |
| `POST /payin/create` | Pay-in key | Create pay-in order → returns `pay_url` (hosted UPI / Paytm cashier) |
| `POST /payin/query` | Pay-in key | Query pay-in order by `order_no` or `platform_order_no` |
| `POST /payout/create` | Payout key | Create INR bank payout (`method: "bank"` only) |
| `POST /payout/query` | Payout key | Query payout by `order_no` or `platform_order_no` |
| `POST /balance` | Pay-in key | Wallet balance (`balance`, `unsettled`, `currency`) |

### Pay-in vs Payout differences to watch

| | Pay-in | Payout |
| --- | --- | --- |
| API key | Pay-in API Key | Payout API Key (separate) |
| `timestamp` window | within **10 minutes** | within **5 minutes** |
| IP whitelist | Optional (enforced only if configured) | **Mandatory** — payout API is locked without one (code `1003`) |
| Replay protection | Code `1011` listed | Each signed request usable **once** (`1011` on resend) |
| `notify_url` | Publicly reachable URL | Must be **https://** |
| Statuses | `pending` → `success` / `failed` | `pending` → `processing` → `success` / `failed` |
| Amount | 2 decimals | Whole rupees (e.g. `"1000.00"`) |
| Wallet effect | Credited **amount − fee** on success | **amount + fee** held at creation; refunded automatically if it fails |

## Contents

- [Pay-in API](#pay-in-api)
- [Payout API](#payout-api)

---

## Pay-in API

<sub>Source: <https://jazpayss.org/merchant/docs/payin></sub>

### 1. Overview

All requests use **HTTPS POST** with a `application/json` body (form-urlencoded is also accepted). Responses are JSON. Your **Merchant ID** and **Pay-in API Key** are shown on the Homepage under Merchant Details. Never expose your key in browser or mobile app code — call the API from your server only. If a Whitelist IP is configured on your account, requests from other IPs are rejected.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Base URL | — | — | `https://jazpayss.org/api/public/v1` |
| Merchant ID | string | Yes | Your 9-digit merchant code, e.g. 100777003 |
| Pay-in API Key | string | Yes | Secret used to sign requests and verify callbacks |
| Amounts | string | Yes | INR with 2 decimals, e.g. "500.00" |

### 2. Signature

Every request and every callback carries a `sign` field. Compute it like this and compare in constant time.

```javascript
// 1. Take all non-empty request parameters except "sign"
// 2. Sort them by parameter name (ASCII ascending)
// 3. Join as key=value pairs with "&"
// 4. Append "&key=YOUR_SECRET_KEY"
// 5. MD5 the string and convert to UPPERCASE

const crypto = require("crypto");

function sign(params, secretKey) {
  const str = Object.keys(params)
    .filter((k) => k !== "sign" && params[k] !== "" && params[k] != null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&") + "&key=" + secretKey;
  return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
}
```

```php
<?php
function jp_sign(array $params, string $secretKey): string {
  unset($params['sign']);
  $params = array_filter($params, fn($v) => $v !== '' && $v !== null);
  ksort($params);
  $str = urldecode(http_build_query($params)) . '&key=' . $secretKey;
  return strtoupper(md5($str));
}
```

Example string before hashing:

```text
amount=500.00&merchant_id=100777003&notify_url=https://shop.com/notify&order_no=ORD1001&timestamp=1759700000&key=YOUR_SECRET_KEY
```

### 3. Payment flow

```text
Customer        Your server                 JazPays                    Customer's UPI app
   |  Pay ₹500  ->   |                            |                              |
   |                 |-- POST /payin/create ----->|                              |
   |                 |<-- { pay_url } ------------|                              |
   |<-- redirect to pay_url ----------------------|                              |
   |----------------------- pays on cashier page --------------------------------->|
   |                 |<-- POST notify_url (signed result) ---|                   |
   |                 |--- reply "success" ------->|                              |
   |<-- browser returns to return_url ------------|                              |
```

1. Your server calls **Create Order** with the amount and your own unique `order_no`.
2. JazPays returns a `pay_url`. Redirect the customer to it (or open it in a new tab / WebView).
3. The customer pays with UPI / Paytm on the cashier page and may submit their UTR there.
4. JazPays sends a signed **callback** to your `notify_url` and the customer is sent back to `return_url`.
5. Credit the customer only after a **verified callback** with `status = success`, or after **Query Order** confirms it. Never trust the browser return alone.

> Your wallet is credited with **amount − fee** the moment an order succeeds. Every credit is listed under **Cash Flow**, and every order under **Payment Inquiry**.

### 4. Create pay-in order

`POST https://jazpayss.org/api/public/v1/payin/create`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| merchant_id | string | Yes | Your Merchant ID |
| order_no | string | Yes | Your unique order number, 1–64 chars: letters, digits, _ or -. Must never repeat. |
| amount | string | Yes | INR, max 2 decimals. Min 100.00, max 50000.00 |
| notify_url | string | Yes | Your server URL that receives the payment result (must be publicly reachable) |
| return_url | string | No | Page the customer is sent back to after paying |
| customer_name | string | No | Customer name (shown in your order records) |
| customer_phone | string | No | Customer mobile number |
| customer_email | string | No | Customer email |
| timestamp | string | Yes | Current Unix time in seconds (must be within 10 minutes) |
| sign | string | Yes | Signature (see section 2) |

```bash
curl -X POST https://jazpayss.org/api/public/v1/payin/create \
  -H "Content-Type: application/json" \
  -d '{"merchant_id":"100777003","order_no":"ORD1001","amount":"500.00","notify_url":"https://shop.com/jazpays/notify","return_url":"https://shop.com/order/ORD1001","timestamp":"1759700000","sign":"9F3C1A..."}'
```

**Response — success**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_no": "ORD1001",
    "platform_order_no": "PI20261006103000482915",
    "amount": "500.00",
    "fee": "37.50",
    "status": "pending",
    "pay_url": "https://...cashier link...",
    "created_at": "2026-10-06T10:30:00+05:30"
  }
}
```

**Response — error**

```json
{ "code": 1004, "msg": "Duplicate order_no" }
```

Complete examples:

```javascript
const crypto = require("crypto");
const MERCHANT_ID = "100777003";
const API_KEY = process.env.JAZPAYS_PAYIN_KEY; // keep on server only

function sign(p) {
  const s = Object.keys(p).filter((k) => k !== "sign" && p[k] !== "" && p[k] != null)
    .sort().map((k) => k + "=" + p[k]).join("&") + "&key=" + API_KEY;
  return crypto.createHash("md5").update(s, "utf8").digest("hex").toUpperCase();
}

async function createPayin(orderNo, amount) {
  const body = {
    merchant_id: MERCHANT_ID,
    order_no: orderNo,
    amount: amount.toFixed(2),
    notify_url: "https://shop.com/jazpays/notify",
    return_url: "https://shop.com/order/" + orderNo,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  body.sign = sign(body);
  const res = await fetch("https://jazpayss.org/api/public/v1/payin/create", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.code + " " + json.msg);
  return json.data.pay_url; // redirect the customer here
}
```

```php
<?php
$key = getenv('JAZPAYS_PAYIN_KEY');
$params = [
  'merchant_id' => '100777003',
  'order_no'    => 'ORD1001',
  'amount'      => '500.00',
  'notify_url'  => 'https://shop.com/jazpays/notify',
  'return_url'  => 'https://shop.com/order/ORD1001',
  'timestamp'   => (string) time(),
];
$params['sign'] = jp_sign($params, $key); // see section 2

$ch = curl_init('https://jazpayss.org/api/public/v1/payin/create');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => json_encode($params),
]);
$res = json_decode(curl_exec($ch), true);
if ($res['code'] === 0) {
  header('Location: ' . $res['data']['pay_url']);
  exit;
}
echo 'Error ' . $res['code'] . ': ' . $res['msg'];
```

### 5. Query pay-in order

`POST https://jazpayss.org/api/public/v1/payin/query`

Use this if a callback did not arrive, or before shipping goods. Send either your `order_no` or our `platform_order_no`.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| merchant_id | string | Yes | Your Merchant ID |
| order_no | string | One of | Your order number |
| platform_order_no | string | One of | JazPays order number returned by Create |
| timestamp | string | Yes | Unix time in seconds |
| sign | string | Yes | Signature |

**Response**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_no": "ORD1001",
    "platform_order_no": "PI20261006103000482915",
    "amount": "500.00",
    "fee": "37.50",
    "status": "success",
    "utr": "428715903412",
    "created_at": "2026-10-06T10:30:00+05:30",
    "paid_at": "2026-10-06T10:33:22+05:30"
  }
}
```

| Status | Meaning |
| --- | --- |
| `pending` | Created, customer has not paid yet (or payment is being confirmed) |
| `success` | Paid. Final — safe to deliver |
| `failed` | Failed or cancelled. Final — do not deliver |

### 6. Payment callback (notify_url)

When an order becomes **success** or **failed**, JazPays sends an HTTPS POST with a JSON body to your `notify_url`. Verify the `sign` with your Pay-in API Key (same method as section 2), update your order, then reply with the plain text **success** (HTTP 200). Any other reply is recorded as a failed delivery. Requests time out after 10 seconds.

**Callback body**

```json
{
  "merchant_id": "100777003",
  "order_no": "ORD1001",
  "platform_order_no": "PI20261006103000482915",
  "amount": "500.00",
  "fee": "37.50",
  "status": "success",
  "utr": "428715903412",
  "timestamp": "1759700602",
  "sign": "A71D0E..."
}
```

- Fields with empty values (e.g. no `utr`) are left out of the signature string.
- The same callback can arrive more than once — make your handler idempotent.
- Always compare `amount` with your own order before crediting.
- If your server was down, use **Query Order** or ask support to resend the callback.

```javascript
// Express example
app.post("/jazpays/notify", express.json(), async (req, res) => {
  const p = req.body;
  if (sign(p) !== String(p.sign).toUpperCase()) return res.status(400).send("bad sign");
  const order = await db.orders.find(p.order_no);
  if (!order) return res.status(404).send("not found");
  if (order.paid) return res.send("success");                  // duplicate callback
  if (Number(p.amount) !== Number(order.amount)) return res.status(400).send("amount mismatch");
  if (p.status === "success") await db.orders.markPaid(p.order_no, p.utr);
  if (p.status === "failed")  await db.orders.markFailed(p.order_no);
  res.send("success");                                         // plain text, exactly "success"
});
```

```php
<?php
$p = json_decode(file_get_contents('php://input'), true);
if (!$p || jp_sign($p, getenv('JAZPAYS_PAYIN_KEY')) !== strtoupper($p['sign'] ?? '')) {
  http_response_code(400); exit('bad sign');
}
// look up your order by $p['order_no'], ignore if already paid, compare $p['amount']
if ($p['status'] === 'success') { /* mark order paid, store $p['utr'] */ }
echo 'success';
```

### 7. Query balance

`POST https://jazpayss.org/api/public/v1/balance`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| merchant_id | string | Yes | Your Merchant ID |
| timestamp | string | Yes | Unix time in seconds |
| sign | string | Yes | Signature |

**Response**

```json
{ "code": 0, "msg": "success", "data": { "merchant_id": "100777003", "balance": "1950.00", "unsettled": "0.00", "currency": "INR" } }
```

### 8. Response codes

HTTP status is always 200; check the `code` field.

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1001` | Invalid signature |
| `1002` | Merchant not found or disabled |
| `1003` | IP not whitelisted |
| `1004` | Duplicate order_no |
| `1005` | Invalid amount |
| `1006` | Insufficient balance |
| `1007` | Order not found |
| `1008` | Missing or invalid parameter |
| `1009` | Payment channel temporarily unavailable |
| `1010` | timestamp expired — sync your server clock |
| `1011` | Duplicate request (replay) — sign each request with a fresh timestamp |
| `9999` | System error — retry later |

### 9. Go-live checklist

1. Copy your Merchant ID and Pay-in API Key from the Homepage and store the key in server environment variables.
2. Make sure your server clock is correct (timestamp must be within 10 minutes).
3. Create a ₹100 test order, pay it, and confirm your `notify_url` receives the callback and replies `success`.
4. Check the order in **Payment Inquiry** and the credit in **Cash Flow**.
5. Optional: send us your server IPs to enable an IP whitelist.

---

## Payout API

<sub>Source: <https://jazpayss.org/merchant/docs/payout></sub>

### 1. Overview

All requests use **HTTPS POST** with a `application/json` body (form-urlencoded is also accepted). Responses are JSON. Your **Merchant ID** and **Payout API Key** are shown on the Homepage under Merchant Details. Never expose your key in browser or mobile app code — call the API from your server only. If a Whitelist IP is configured on your account, requests from other IPs are rejected.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Base URL | — | — | `https://jazpayss.org/api/public/v1` |
| Merchant ID | string | Yes | Your 9-digit merchant code, e.g. 100777003 |
| Payout API Key | string | Yes | Secret used to sign requests and verify callbacks |
| Amounts | string | Yes | INR with 2 decimals, e.g. "500.00" |

### 2. Signature

Every request and every callback carries a `sign` field. Compute it like this and compare in constant time.

```javascript
// 1. Take all non-empty request parameters except "sign"
// 2. Sort them by parameter name (ASCII ascending)
// 3. Join as key=value pairs with "&"
// 4. Append "&key=YOUR_SECRET_KEY"
// 5. MD5 the string and convert to UPPERCASE

const crypto = require("crypto");

function sign(params, secretKey) {
  const str = Object.keys(params)
    .filter((k) => k !== "sign" && params[k] !== "" && params[k] != null)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&") + "&key=" + secretKey;
  return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
}
```

```php
<?php
function jp_sign(array $params, string $secretKey): string {
  unset($params['sign']);
  $params = array_filter($params, fn($v) => $v !== '' && $v !== null);
  ksort($params);
  $str = urldecode(http_build_query($params)) . '&key=' . $secretKey;
  return strtoupper(md5($str));
}
```

Example string before hashing:

```text
amount=500.00&merchant_id=100777003&notify_url=https://shop.com/notify&order_no=ORD1001&timestamp=1759700000&key=YOUR_SECRET_KEY
```

### 3. Security requirements

> The payout API moves money out of your wallet, so it is locked down. A leaked key alone is **not enough** to withdraw funds.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| IP whitelist | mandatory | Yes | Payout calls are accepted ONLY from your whitelisted server IPs. Without a whitelisted IP the payout API is fully locked (code 1003). Send your server's public IP(s) to support to enable it. |
| Payout API Key | secret | Yes | Separate from the Pay-in key. A leaked Pay-in key cannot create payouts. |
| timestamp | 5 min | Yes | Requests older or newer than 5 minutes are rejected (code 1010). Keep your server clock synced (NTP). |
| One-time sign | anti-replay | Yes | Each signed payout request can be used only once. Re-sending the exact same request returns 1011. Generate a fresh timestamp for every call. |
| Unique order_no | idempotency | Yes | The same order_no can never be paid twice (code 1004) — safe to retry on network errors. |
| HTTPS notify_url | — | Yes | Payout callbacks are only sent to https:// URLs and are signed with your Payout API Key. |

- Call the API from your backend only. Never put the Payout API Key in a website, mobile app or Git repository.
- Every rejected attempt (wrong IP, bad signature, replay) is logged with the caller's IP for our security team.
- If you think your key has leaked, contact support immediately to rotate it.

### 4. Payout flow

1. Your whitelisted server calls **Create Payout** for an Indian bank account (INR). USDT payouts are available from the merchant dashboard only, not via API.
2. **amount + fee** is held from your wallet immediately. If the balance is short, the request is rejected with 1006 and nothing is deducted.
3. Status moves `pending → processing → success` (or `failed`).
4. On a final status JazPays sends a signed **callback** to your `notify_url`.
5. If the payout fails, amount + fee is refunded to your wallet automatically. Every movement appears in **Cash Flow**.

> Fee = amount × your payout fee % + fixed extra fee (both shown on your Homepage).

### 5. Create payout

`POST https://jazpayss.org/api/public/v1/payout/create`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| merchant_id | string | Yes | Your Merchant ID |
| order_no | string | Yes | Your unique payout number, 1–64 chars: letters, digits, _ or - |
| amount | string | Yes | Whole rupees, e.g. "1000.00". Min 100.00, max 50000.00 |
| method | string | Yes | Must be "bank" — API payouts are INR bank transfer only |
| account_name | string | Yes | Beneficiary name as on bank account |
| account_no | string | Yes | Bank account number, 6–20 digits |
| ifsc | string | Yes | IFSC code, e.g. HDFC0001234 |
| bank_name | string | No | Bank name |
| notify_url | string | Yes | https URL that receives the payout result |
| timestamp | string | Yes | Current Unix time in seconds (within 5 minutes) |
| sign | string | Yes | Signature with your Payout API Key (see section 2) |

**Request — bank**

```json
{
  "merchant_id": "100777003",
  "order_no": "PO5001",
  "amount": "1000.00",
  "method": "bank",
  "account_name": "Rahul Sharma",
  "account_no": "50100012345678",
  "ifsc": "HDFC0001234",
  "bank_name": "HDFC Bank",
  "notify_url": "https://shop.com/jazpays/payout-notify",
  "timestamp": "1759700000",
  "sign": "4B8E2F..."
}
```

**Response — success**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_no": "PO5001",
    "platform_order_no": "WD202610060002",
    "amount": "1000.00",
    "fee": "50.00",
    "method": "bank",
    "status": "pending",
    "created_at": "2026-10-06T10:30:00+05:30"
  }
}
```

**Response — blocked**

```json
{ "code": 1003, "msg": "IP not whitelisted: 45.12.9.80" }
```

> Treat **code 0** as "accepted", not "paid". If you get a timeout or 9999, do **not** create a new order_no — call Query Payout with the same order_no first.

```javascript
const crypto = require("crypto");
const MERCHANT_ID = "100777003";
const PAYOUT_KEY = process.env.JAZPAYS_PAYOUT_KEY; // server only — never in browser/app code

function sign(p) {
  const s = Object.keys(p).filter((k) => k !== "sign" && p[k] !== "" && p[k] != null)
    .sort().map((k) => k + "=" + p[k]).join("&") + "&key=" + PAYOUT_KEY;
  return crypto.createHash("md5").update(s, "utf8").digest("hex").toUpperCase();
}

async function createPayout(orderNo, amount, bank) {
  const body = {
    merchant_id: MERCHANT_ID,
    order_no: orderNo,
    amount: amount.toFixed(2),          // whole rupees only
    method: "bank",
    account_name: bank.name,
    account_no: bank.account,
    ifsc: bank.ifsc,
    notify_url: "https://shop.com/jazpays/payout-notify",
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  body.sign = sign(body);
  const res = await fetch("https://jazpayss.org/api/public/v1/payout/create", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  return res.json(); // { code: 0, data: { platform_order_no, status, ... } }
}
```

```php
<?php
$params = [
  'merchant_id'  => '100777003',
  'order_no'     => 'PO5001',
  'amount'       => '1000.00',
  'method'       => 'bank',
  'account_name' => 'Rahul Sharma',
  'account_no'   => '50100012345678',
  'ifsc'         => 'HDFC0001234',
  'notify_url'   => 'https://shop.com/jazpays/payout-notify',
  'timestamp'    => (string) time(),
];
$params['sign'] = jp_sign($params, getenv('JAZPAYS_PAYOUT_KEY'));
$ch = curl_init('https://jazpayss.org/api/public/v1/payout/create');
curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => json_encode($params)]);
$res = json_decode(curl_exec($ch), true);
```

### 6. Query payout

`POST https://jazpayss.org/api/public/v1/payout/query`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| merchant_id | string | Yes | Your Merchant ID |
| order_no | string | One of | Your payout number |
| platform_order_no | string | One of | JazPays payout number |
| timestamp | string | Yes | Unix time in seconds |
| sign | string | Yes | Signature with your Payout API Key |

**Response**

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_no": "PO5001",
    "platform_order_no": "WD202610060002",
    "amount": "1000.00",
    "fee": "50.00",
    "method": "bank",
    "status": "success",
    "utr": "628711092341",
    "created_at": "2026-10-06T10:30:00+05:30"
  }
}
```

| Status | Meaning |
| --- | --- |
| `pending` | Accepted, waiting to be sent to the bank |
| `processing` | Sent to the bank, waiting for confirmation |
| `success` | Paid. Final |
| `failed` | Failed. Final — amount + fee refunded to your wallet |

### 7. Payout callback

When a payout reaches **success** or **failed**, JazPays POSTs JSON to your `notify_url`. Verify `sign` with your **Payout API Key**, update your record, then reply with plain text **success**. Handle duplicate callbacks safely.

**Callback body**

```json
{
  "merchant_id": "100777003",
  "order_no": "PO5001",
  "platform_order_no": "WD202610060002",
  "amount": "1000.00",
  "fee": "50.00",
  "method": "bank",
  "status": "success",
  "utr": "628711092341",
  "timestamp": "1759701200",
  "sign": "E9B6C1..."
}
```

### 8. Query balance

`POST https://jazpayss.org/api/public/v1/balance`

Signed with your **Pay-in API Key**. Check before sending large payouts.

**Response**

```json
{ "code": 0, "msg": "success", "data": { "merchant_id": "100777003", "balance": "1950.00", "unsettled": "0.00", "currency": "INR" } }
```

### 9. Response codes

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1001` | Invalid signature |
| `1002` | Merchant not found or disabled |
| `1003` | IP not whitelisted |
| `1004` | Duplicate order_no |
| `1005` | Invalid amount |
| `1006` | Insufficient balance |
| `1007` | Order not found |
| `1008` | Missing or invalid parameter |
| `1009` | Payment channel temporarily unavailable |
| `1010` | timestamp expired — sync your server clock |
| `1011` | Duplicate request (replay) — sign each request with a fresh timestamp |
| `9999` | System error — retry later |
