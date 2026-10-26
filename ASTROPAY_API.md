# AstroPay Merchant API — Payment Gateway Reference

> Compiled from the official AstroPay ShowDoc documentation (English section): <https://www.showdoc.cc/AstroPay/11559060627554587>  
> Captured: 2026-10-22. Each section links back to its source page. A condensed plain-text version is published at <https://mch.gpay.one/llm.txt>.

## Quick Reference

| Item | Value |
| --- | --- |
| Base URL | `https://api.gpay.one` |
| Method / format | `POST`, `Content-Type: application/json` on every endpoint |
| Auth | `merchantKey` + `secretKey` in the JSON body (no `Authorization` header) |
| IP whitelist | Required — non-whitelisted IPs get `403` (strictly enforced on payouts) |
| Currency | Fixed per account (INR / PKR / BDT / USDT); never sent as a parameter |
| Success | `code: 1000` |
| Order status | `1` pending · `9` failed · `10` success |
| Webhook signature | `UPPER(md5(sorted "k=v&" of orderId, amount, commission, status, utr + "secret=<secretKey>"))` |
| Webhook retries | **None** — poll the query endpoints for orders stuck at `status: 1` |

### Endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /v1/payins/create` | Create deposit (collection) order → returns hosted `pay_url` |
| `POST /v1/payins/query` | Query deposit status |
| `POST /v1/payouts/create` | Create withdrawal (payout) order |
| `POST /v1/payouts/query` | Query withdrawal status |
| `POST /v1/account/balance` | Balance + today/yesterday activity summary |
| `POST /v1/utr/query` | Look up a UPI UTR (INR only) |
| `POST /v1/utr/supplement` | Attach a UTR to an order manually (INR only) |

## Contents

- **Getting Started**
  - [Overview & Authentication](#overview--authentication)
- **Collection (Deposits)**
  - [Create Deposit Order](#create-deposit-order)
  - [Query Deposit Status](#query-deposit-status)
- **Payment (Withdrawals)**
  - [Create Withdrawal Order](#create-withdrawal-order)
  - [Query Withdrawal Status](#query-withdrawal-status)
- **Account**
  - [Balance & Dashboard Summary](#balance--dashboard-summary)
- **UPI Tools**
  - [UTR Query & Supplement](#utr-query--supplement)
- **Webhooks**
  - [Callback Notifications & Signature Verification](#callback-notifications--signature-verification)
- **Reference**
  - [Signature Algorithm](#signature-algorithm)
  - [Status & Error Codes](#status--error-codes)
  - [Payment Method Codes](#payment-method-codes)
  - [llm.txt (LLM Integration Reference)](#llmtxt-llm-integration-reference)

---

## Getting Started

### Overview & Authentication

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554587></sub>

This is the server-to-server integration API for merchants — used to create collection (deposit) and payment (withdrawal) orders, check their status, check your balance, and receive real-time settlement webhooks. Everything in this documentation uses simple API-key authentication in the request body.

#### Base URL

```text
https://api.gpay.one
```

All endpoints in this documentation are relative to this base, e.g. `POST https://api.gpay.one/v1/payins/create`.

#### Authentication

Every request is a `POST` with a JSON body (`Content-Type: application/json`) that includes your credentials directly in the body — there is no `Authorization` header and no per-request request-signing:

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key"
}
```

- **merchantKey / secretKey** — issued when your account is provisioned. Treat `secretKey` like a password: it is also used to verify webhook signatures (see the Webhooks section).
- **IP whitelisting is required.** Requests from an IP not on your account’s whitelist are rejected with `403`. Send us the IP(s) your integration calls from during onboarding.
- Your account has **one fixed settlement currency** (e.g. INR, PKR, BDT, or USDT) set when it was provisioned. You never pass a currency parameter — every amount you send or receive is in your account’s currency.

#### Response envelope

Every endpoint returns the same JSON shape:

```json
{
  "code": 1000,
  "data": { "...": "..." },
  "msg": "success"
}
```

- `code: 1000` always means success.
- Any other `code` is a business/validation error. The HTTP status code mirrors it when it falls in the 400–599 range, otherwise the response is sent as HTTP 500.
- `data` is `null` on error.
- `msg` is a human-readable message — it may occasionally be in Chinese for lower-level internal errors, so match on `code` in your integration, not on the text of `msg`.

See **Reference → Status & Error Codes** for the full list.

#### Order status values

Both deposit and withdrawal orders move through the same three states:

| status | meaning |
| --- | --- |
| `1` | Pending / in flight |
| `9` | Failed |
| `10` | Success (settled) |

#### Idempotency

`orderId` is **your own** order reference (a string you generate) and must be unique per order on your side. Creating an order with an `orderId` you’ve already used will be treated as a fresh order by these endpoints — always generate a new, unique `orderId` per attempt.

#### Webhooks aren’t retried automatically

When an order settles, we POST a webhook to the `callbackUrl` you supplied at creation time (see **Webhooks**). If your endpoint is briefly down and misses it, there is currently no automatic retry loop — a human has to manually resend it from our side. **Don’t rely on the webhook alone**: poll `/v1/payins/query` / `/v1/payouts/query` periodically for any order still `status: 1` after a reasonable window, and treat the webhook as the fast path rather than the only path.

---

## Collection (Deposits)

### Create Deposit Order

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554588></sub>

`POST /v1/payins/create`

Creates a collection order and returns a hosted checkout URL — redirect your customer there to complete payment (scan a QR, pick a UPI app, etc., depending on the payment method).

#### Request

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "500.00",
  "callbackUrl": "https://your-server.com/webhooks/astropay/deposit",
  "name": "Customer Name",
  "phone": "9876543210",
  "email": "customer@example.com",
  "channel": null
}
```

| field | required | notes |
| --- | --- | --- |
| `merchantKey`, `secretKey` | yes | your credentials |
| `orderId` | yes | your own unique order reference |
| `amount` | yes | numeric string/number, in your account’s currency. Below-minimum amounts are rejected with `400` — confirm your account’s minimum with support, it can be set per-merchant |
| `callbackUrl` | yes | where we POST the settlement webhook once the order reaches a final state (see Webhooks) |
| `name`, `phone`, `email` | yes | customer details, required by some payment channels |
| `channel` | no | pins a specific payment method when your account has more than one; omit to let us pick automatically. See **Reference → Payment Method Codes** for valid values per currency |

#### Response (success)

```json
{
  "code": 1000,
  "data": {
    "pay_url": "https://<hosted-checkout-domain>/<token>",
    "order_id": "YOUR-UNIQUE-ORDER-ID"
  },
  "msg": "success"
}
```

Redirect the customer’s browser to `pay_url`. It’s a hosted checkout page (QR code + payment-app deep links for UPI-style methods, or a redirect page for others) that we render and manage — you don’t need to build any payment UI yourself. Treat this URL as opaque and short-lived: don’t hardcode or persist its domain, always use the value returned in this response.

#### Response (error)

```json
{
  "code": 400,
  "data": null,
  "msg": "Deposit amount must not be lower than: 100"
}
```

Common codes: `400` invalid input / amount below minimum, `401` invalid credentials or account disabled, `404` merchant not found, `500` upstream gateway error.

### Query Deposit Status

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554589></sub>

`POST /v1/payins/query`

Looks up the current state of a deposit order you created. Use this to poll orders that haven’t sent a webhook yet, or to double-check before crediting a customer.

#### Request

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID"
}
```

#### Response (success)

```json
{
  "code": 1000,
  "data": {
    "orderId": "YOUR-UNIQUE-ORDER-ID",
    "amount": "500.0000",
    "commission": "35.0000",
    "status": 10,
    "createTime": "2026-09-06 14:02:11",
    "updateTime": "2026-09-06 14:04:37",
    "is_test": 0
  },
  "msg": "success"
}
```

| field | meaning |
| --- | --- |
| `amount` | the amount you requested (before commission) |
| `commission` | the fee we deducted, in your account’s currency |
| `status` | `1` pending, `9` failed, `10` success — see Getting Started |
| `createTime` / `updateTime` | shown in your account’s regional time zone |
| `is_test` | `1` if this was a test-mode order, `0` for real orders |

`404` is returned if `orderId` doesn’t match any order on your account.

---

## Payment (Withdrawals)

### Create Withdrawal Order

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554590></sub>

`POST /v1/payouts/create`

Creates a payment order that sends money out of your AstroPay balance to a bank account, mobile wallet, or USDT address, depending on `accountType`.

**This endpoint enforces the IP whitelist strictly** — make sure the server IP you call from is on file with support before going live.

#### Request (INR / bank or UPI example)

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "200.00",
  "callbackUrl": "https://your-server.com/webhooks/astropay/withdraw",
  "accountType": "UPI",
  "account": "1234567890",
  "bank_code": "HDFC0000123",
  "accountPhone": "9876543210",
  "personName": "Beneficiary Name"
}
```

| field | required | notes |
| --- | --- | --- |
| `merchantKey`, `secretKey` | yes | your credentials |
| `orderId` | yes | your own unique order reference |
| `amount` | yes | the amount the beneficiary receives (before our commission — we add our fee on top of this and deduct the total from your balance) |
| `callbackUrl` | yes | where we POST the settlement webhook |
| `account` | yes | meaning depends on method — see **Reference → Payment Method Codes** |
| `bank_code` | yes for INR bank transfers, otherwise send `""` | see **Reference → Payment Method Codes** |
| `accountPhone` | yes | phone number tied to the account — see **Reference → Payment Method Codes** |
| `personName` | yes | beneficiary name |
| `accountType` | no | see **Reference → Payment Method Codes** — **omit this field entirely for USDT** |

**This example is INR-specific.** Before integrating EASYPAISA, JAZZCASH, BKASH, NAGAD, or USDT, see **Reference → Payment Method Codes** for what belongs in each field per method.

##### Example — PKR / JAZZCASH payout

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "5000.00",
  "callbackUrl": "https://your-server.com/webhooks/astropay/withdraw",
  "accountType": "JAZZCASH",
  "account": "03001234567",
  "bank_code": "",
  "accountPhone": "03001234567",
  "personName": "Beneficiary Name"
}
```

The same shape applies to `EASYPAISA` (PKR) and `BKASH` / `NAGAD` (BDT) — just swap `accountType` and use the wallet’s own mobile number for `account`/`accountPhone`.

##### Example — USDT payout

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "200.00",
  "callbackUrl": "https://your-server.com/webhooks/astropay/withdraw",
  "account": "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

Note `accountType` is not present at all in the body — `bank_code`, `accountPhone`, and `personName` can also be safely omitted for USDT.

The request fails with `400` (“insufficient balance”) if `amount` + our commission exceeds your current available balance — check **Account → Balance & Dashboard Summary** first if you’re unsure.

#### Response (success)

```json
{
  "code": 1000,
  "data": {
    "orderId": "YOUR-UNIQUE-ORDER-ID",
    "amount": "200.00",
    "commission": 14,
    "netAmount": 214,
    "utr": "",
    "status": 1
  },
  "msg": "success"
}
```

`status` is always `1` (pending) at creation — the order settles asynchronously and you’ll be notified via the webhook (or poll **Query Withdrawal Status**). `utr` is usually empty at creation and gets filled in once the payment actually clears the bank/network.

### Query Withdrawal Status

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554591></sub>

`POST /v1/payouts/query`

#### Request

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID"
}
```

#### Response (success)

```json
{
  "code": 1000,
  "data": {
    "orderId": "YOUR-UNIQUE-ORDER-ID",
    "amount": "200.0000",
    "status": 10,
    "utr": "437558231943",
    "createTime": "2026-09-06 09:18:15",
    "updateTime": "2026-09-06 09:39:24"
  },
  "msg": "success"
}
```

`status`: `1` pending, `9` failed (funds are returned to your available balance automatically — no action needed on your side), `10` success. `utr` is the bank/network reference for the completed transfer, useful for reconciliation.

---

## Account

### Balance & Dashboard Summary

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554592></sub>

`POST /v1/account/balance`

Returns your current balance plus a same-day/previous-day activity summary — handy for a lightweight status dashboard or a pre-flight balance check before issuing a payment.

#### Request

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key"
}
```

#### Response (success)

```json
{
  "code": 1000,
  "data": {
    "MID": "MID001",
    "Currency": 1,
    "Balance": "997479.0000",
    "FreezeBalance": "11060.0000",
    "WhitelistIPs": "203.0.113.10|203.0.113.11",
    "LastLogin": "2026-09-06 21:10:03",
    "LastIP": "203.0.113.10",
    "CreatedAt": "2026-06-01 10:00:00",
    "UpdatedAt": "2026-09-06 21:10:03",
    "TodayCollectionAmount": "1500.00",
    "TodayCollectionCount": 3,
    "YesterdayCollectionAmount": "2200.00",
    "YesterdayCollectionCount": 5,
    "TodayPaymentAmount": "600.00",
    "TodayPaymentCount": 2,
    "YesterdayPaymentAmount": "400.00",
    "YesterdayPaymentCount": 1
  },
  "msg": "success"
}
```

| field | meaning |
| --- | --- |
| `Balance` | available balance you can spend/pay out |
| `FreezeBalance` | held against pending payment orders — not spendable until they settle or fail |
| `WhitelistIPs` | your currently-whitelisted IPs, pipe-separated |
| `TodayCollectionAmount/Count`, `YesterdayCollectionAmount/Count` | successful deposits only |
| `TodayPaymentAmount/Count`, `YesterdayPaymentAmount/Count` | successful withdrawals only |

---

## UPI Tools

### UTR Query & Supplement

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554593></sub>

A UPI-specific reconciliation tool (INR accounts only). Some UPI flows settle by the customer paying and reporting the bank’s UTR (transaction reference) rather than the platform detecting it automatically — these two endpoints let you either look one up, or attach one to an order manually.

#### Query a UTR

`POST /v1/utr/query`

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "utr": "437558231943"
}
```

Looks up whatever the underlying UPI channel knows about that UTR.

#### Supplement a UTR

`POST /v1/utr/supplement`

```json
{
  "merchantKey": "your_merchant_key",
  "secretKey": "your_secret_key",
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "utr": "437558231943"
}
```

Attaches this UTR to your order, for cases where the automatic UTR capture missed it.

#### Response (both)

```json
{
  "code": 1000,
  "data": { "...": "channel-specific fields" },
  "msg": "success"
}
```

The exact shape of `data` depends on which UPI gateway your account is routed through.

---

## Webhooks

### Callback Notifications & Signature Verification

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554594></sub>

When a deposit or withdrawal order you created reaches a final state (`9` failed or `10` success), we send a `POST` webhook to the `callbackUrl` you supplied when creating that order.

**Your endpoint must respond with an HTTP 2xx status.** Any other response (including a timeout) is logged as a failed delivery — see “No automatic retries” in Getting Started.

#### Deposit callback payload

```json
{
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "500.0000",
  "commission": "35.0000",
  "status": "10",
  "utr": "437558231943",
  "sign": "3F2A9C1E7B8D4560A1C2E3F4A5B6C7D8"
}
```

#### Withdrawal callback payload

```json
{
  "orderId": "YOUR-UNIQUE-ORDER-ID",
  "amount": "200.0000",
  "commission": "14.0000",
  "status": "10",
  "utr": "437558231943",
  "remark": "",
  "sign": "3F2A9C1E7B8D4560A1C2E3F4A5B6C7D8"
}
```

`remark` carries a failure reason string when `status` is `"9"`, and is empty on success.

#### Verifying the signature

`sign` is computed over the fields **`orderId`, `amount`, `commission`, `status`, `utr`** only (never `remark` or `sign` itself), using **your** `secretKey`. Recompute it on your side and reject the callback if it doesn’t match — this is what proves the webhook actually came from AstroPay and wasn’t forged.

Algorithm — see **Reference → Signature Algorithm** for the exact steps and worked example. In short:

```text
1. Take {orderId, amount, commission, status, utr} from the payload
2. Sort the keys alphabetically
3. Build "key1=value1&key2=value2&...&" (skip any null/empty values)
4. Append "secret=<your secretKey>"
5. sign = strtoupper(md5(that string))
6. Compare to the "sign" field — reject the callback if they don't match
```

#### Recommended handling

1. Verify the signature (reject with a 4xx if it fails — don’t process the order).
2. Look up the order by `orderId` in your own system.
3. If you’ve already processed this `orderId` in this `status`, just return 2xx and stop (webhooks can arrive more than once — treat delivery as at-least-once, not exactly-once).
4. Otherwise, apply the status update, then return 2xx.
5. As a safety net, periodically poll **Query Deposit/Withdrawal Status** for any order that’s stayed `status: 1` longer than expected, since webhook delivery isn’t automatically retried on our side.

---

## Reference

### Signature Algorithm

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554595></sub>

Used for verifying webhook callbacks (see Webhooks). You do **not** need to sign your own outbound requests to `/v1/payins/create` / `/v1/payouts/create` / etc. — those use plain `merchantKey`/`secretKey` in the body.

#### Steps

1. Take the relevant fields as a flat key→value map (for callbacks: `orderId`, `amount`, `commission`, `status`, `utr`).
2. Sort the keys alphabetically (`ksort`).
3. Concatenate `key=value&` for every key whose value is **not** null and **not** an empty string. Skip any key with a null/empty value entirely (don’t emit `key=&`).
4. Append `secret=<secretKey>` (no trailing `&` before this).
5. `signature = strtoupper(md5(signString))`

#### Worked example

Given this callback body and a `secretKey` of `Sk_test_9f8e7d6c`:

```json
{ "orderId": "ORD-1001", "amount": "500.0000", "commission": "35.0000", "status": "10", "utr": "437558231943" }
```

Sorted keys: `amount, commission, orderId, status, utr`

String to hash:

```text
amount=500.0000&commission=35.0000&orderId=ORD-1001&status=10&utr=437558231943&secret=Sk_test_9f8e7d6c
```

`sign = strtoupper(md5("..."))`

#### Reference implementations

**PHP**:

```php
function generateSignature(array $params, string $secret): string {
    ksort($params);
    $signString = '';
    foreach ($params as $key => $value) {
        if ($value !== null && $value !== '') {
            $signString .= "{$key}={$value}&";
        }
    }
    $signString .= "secret={$secret}";
    return strtoupper(md5($signString));
}
```

**Node.js**:

```javascript
const crypto = require('crypto');

function generateSignature(params, secret) {
  const keys = Object.keys(params).sort();
  let signString = '';
  for (const key of keys) {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      signString += `${key}=${value}&`;
    }
  }
  signString += `secret=${secret}`;
  return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
}
```

**Python**:

```python
import hashlib

def generate_signature(params: dict, secret: str) -> str:
    sign_string = ''
    for key in sorted(params.keys()):
        value = params[key]
        if value is not None and value != '':
            sign_string += f"{key}={value}&"
    sign_string += f"secret={secret}"
    return hashlib.md5(sign_string.encode()).hexdigest().upper()
```

### Status & Error Codes

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554596></sub>

#### Order status (the status field on orders/callbacks)

| value | meaning |
| --- | --- |
| `1` | Pending / in flight |
| `9` | Failed |
| `10` | Success (settled) |

#### Response code field

| code | meaning |
| --- | --- |
| `1000` | Success |
| `400` | Bad request — missing/invalid field, amount below minimum, insufficient balance |
| `401` | Authentication failed — invalid `merchantKey`/`secretKey`, or the account is disabled |
| `403` | IP not on your account’s whitelist |
| `404` | Merchant or order not found |
| `500` | Internal or upstream gateway error — safe to retry after a short delay |
| `503` | Service temporarily unavailable |

Match on the numeric `code`, not the text of `msg` — some lower-level error messages are only available in Chinese.

### Payment Method Codes

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554609></sub>

These values are used as `channel` when creating a deposit order (**Collection → Create Deposit Order**) and as `accountType` when creating a withdrawal order (**Payment → Create Withdrawal Order**).

#### Valid values by currency

| currency | value(s) |
| --- | --- |
| INR | `UPI` |
| PKR | `EASYPAISA`, `JAZZCASH` |
| BDT | `BKASH`, `NAGAD` |
| USDT | not applicable — omit `channel` on deposits, and omit `accountType` entirely on payouts |

#### What to put in each payout field, per method

The withdrawal endpoint always has `account`, `bank_code`, and `accountPhone` as request keys, but what belongs in them — and whether they’re used at all — depends on the method:

| currency | `accountType` | `account` | `bank_code` | `accountPhone` |
| --- | --- | --- | --- | --- |
| INR | `UPI` | your UPI ID (`name@bank`), **or** a bank account number | IFSC code — only if `account` is a bank account number; otherwise send `""` | phone number on file |
| PKR | `EASYPAISA` or `JAZZCASH` | the wallet’s registered mobile number | not used — send `""` | the same mobile number as `account` |
| BDT | `BKASH` or `NAGAD` | the wallet’s registered mobile number | not used — send `""` | the same mobile number as `account` |
| USDT | **omit this field entirely** | the USDT wallet address (TRC20) | not used — send `""` | not used — send `""` |

`personName` is always the beneficiary’s name, for every method, on every currency.

See **Payment → Create Withdrawal Order** for full request/response examples per method.

### llm.txt (LLM Integration Reference)

<sub>Source: <https://www.showdoc.cc/AstroPay/11559060627554597></sub>

A single self-contained reference file designed to be pasted into any LLM (ChatGPT, Claude, etc.) to generate a working integration, client library, or webhook handler in one shot, without needing to fetch the other pages in this project.

**Download / view:** [https://mch.gpay.one/llm.txt](https://mch.gpay.one/llm.txt)

This contains the same reference material as the Getting Started, Collection, Payment, Account, UPI Tools, Webhooks and Reference sections of this project, condensed into one plain-text file.
