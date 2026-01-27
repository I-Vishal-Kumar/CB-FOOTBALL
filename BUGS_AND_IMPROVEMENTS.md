# Bugs and Improvements Report

## 🔴 CRITICAL BUGS

### 1. Missing `await` on `startTransaction()` - Multiple Files
**Impact:** Transactions may not start properly, leading to data inconsistency and race conditions.

**Files Affected:**
- `src/app/api/payment/withdraw/route.js` (line 30)
- `src/app/api/payment/deposit/route.js` (line 30)
- `src/app/api/match/route.js` (line 154)
- `src/app/api/payment/gateway/route.js` (line 35)
- `src/app/helpers/SettleFixDeposit.js` (line 12)
- `src/app/api/spinner/route.js` (lines 15, 334, 407)
- `src/app/api/profile/commission/route.js` (lines 213, 286)
- `src/app/api/stake/route.js` (line 46)
- `src/app/api/payment/recharge/recharge.js` (line 30)
- `src/app/api/payment/initiateGateway/route.js` (line 16)
- `src/app/api/fixedDeposit/route.js` (line 12)
- `src/app/api/callback/route.js` (line 26)

**Fix:** Add `await` before `Session.startTransaction()` or `session.startTransaction()`

**Example:**
```javascript
// ❌ WRONG
Session.startTransaction();

// ✅ CORRECT
await Session.startTransaction();
```

---

### 2. Missing `await` on `endSession()` - SettleFixDeposit.js
**File:** `src/app/helpers/SettleFixDeposit.js` (line 82)
**Impact:** Session may not close properly, causing connection leaks.

**Fix:**
```javascript
// ❌ WRONG
Session.endSession();

// ✅ CORRECT
await Session.endSession();
```

---

### 3. Hardcoded WithdrawCode Check in Withdrawal Route
**File:** `src/app/api/payment/withdraw/route.js` (line 200)
**Impact:** Withdrawal code validation only works for LocalBank, not UsdtBank.

**Current Code:**
```javascript
let user = await USER.findOneAndUpdate(
    { 
        UserName, 
        [Bank]: true, 
        Profit: { $gte: Number(Amount) }, 
        'LocalBank.WithdrawCode': WithdrawCode  // ❌ Hardcoded to LocalBank
    },
    // ...
);
```

**Fix:** Make it dynamic based on Bank parameter:
```javascript
const withdrawCodePath = Bank === 'LocalBankAdded' 
    ? 'LocalBank.WithdrawCode' 
    : 'UsdtBank.WithdrawCode';
    
let user = await USER.findOneAndUpdate(
    { 
        UserName, 
        [Bank]: true, 
        Profit: { $gte: Number(Amount) }, 
        [withdrawCodePath]: WithdrawCode
    },
    // ...
);
```

---

### 4. Commission Calculation Precision Issue
**File:** `src/app/admin/adminComponents/Bets/Action.js` (line 396)
**Impact:** Using `.toFixed(2)` before multiplying by 100 can cause precision loss.

**Current Code:**
```javascript
let rebade = win
    ? (Profit * REBADE_PERCENT[LEVEL - 1] / 100).toFixed(2)  // ❌ Returns string
    : Number(BetAmount - BetAmount * 2);
```

**Fix:** Calculate as number, then round:
```javascript
let rebade = win
    ? Math.round((Profit * REBADE_PERCENT[LEVEL - 1] / 100) * 100) / 100  // Keep as number
    : Number(BetAmount - BetAmount * 2);
```

Or better:
```javascript
let rebade = win
    ? Math.round(Profit * REBADE_PERCENT[LEVEL - 1])  // Already in cents after * 100
    : Number(BetAmount - BetAmount * 2);
```

---

### 5. VIP Level Calculation Logic Error
**File:** `src/app/admin/adminComponents/Deposit/Action.js` (line 264)
**Impact:** VIP level 0 is only assigned when amount is exactly 1000, not for amounts between 1000-54999.

**Current Code:**
```javascript
if (amount === 1000 && amount < 55_000) {  // ❌ Wrong condition
    vip_level = 0;
}
```

**Fix:**
```javascript
if (amount >= 1000 && amount < 55_000) {  // ✅ Correct
    vip_level = 0;
}
```

---

### 6. Missing Session Cleanup in Error Cases
**Files:** Multiple API routes
**Impact:** Sessions may not be closed on errors, causing connection pool exhaustion.

**Files Missing `finally` blocks:**
- `src/app/api/stake/route.js` - No finally block to close session
- `src/app/api/payment/gateway/route.js` - No finally block
- `src/app/api/payment/deposit/route.js` - No finally block
- `src/app/api/match/route.js` - No finally block
- `src/app/api/payment/withdraw/route.js` - No finally block

**Fix:** Add finally blocks:
```javascript
try {
    // ... transaction code
} catch (error) {
    if (transactionStarted && Session) {
        try {
            await Session.abortTransaction();
        } catch (abortErr) {
            ErrorReport(abortErr);
        }
    }
    // ... error handling
} finally {
    if (Session) {
        try {
            await Session.endSession();
        } catch (endErr) {
            ErrorReport(endErr);
        }
    }
}
```

---

## 🟡 MEDIUM PRIORITY BUGS

### 7. Wrong Error Message in Deposit Route
**File:** `src/app/api/payment/deposit/route.js` (line 100)
**Impact:** Confusing error message for users.

**Current Code:**
```javascript
throw new CustomError(500, "something went wrong while withdrawal", {});
```

**Fix:**
```javascript
throw new CustomError(500, "something went wrong while deposit", {});
```

---

### 8. Missing Transaction Status Check in Cancel Deposit
**File:** `src/app/admin/adminComponents/Deposit/Action.js` (line 236)
**Impact:** Can cancel already settled deposits.

**Current Code:**
```javascript
let isUpdatedTransaction = await TRANSACTION.findOneAndUpdate(
    {
        UserName: data?.UserName,
        TransactionId: data?.prevTransactionId,
        // ❌ Missing Status check
    },
    // ...
);
```

**Fix:** Add status check:
```javascript
let isUpdatedTransaction = await TRANSACTION.findOneAndUpdate(
    {
        UserName: data?.UserName,
        TransactionId: data?.prevTransactionId,
        Status: 0,  // ✅ Only cancel pending transactions
    },
    // ...
);
```

---

### 9. Potential Race Condition in Bet Settlement
**File:** `src/app/admin/adminComponents/Bets/Action.js` (line 84)
**Impact:** If multiple admins try to settle the same match simultaneously, bets might be processed twice.

**Current Code:**
```javascript
let unsettledBets = await BET.find({ StakeId, Status: 0 });
```

**Fix:** Use atomic update with status check:
```javascript
// Consider adding a lock or using findOneAndUpdate with Status check
// Or use a separate "Settling" status to prevent concurrent settlements
```

---

## 🟢 IMPROVEMENTS

### 10. Excessive Console.log Statements
**Impact:** Performance and security (may leak sensitive data in production)

**Files with console.log:**
- Multiple files have `console.log` statements that should be removed or replaced with proper logging

**Fix:** Remove or replace with proper error logging service

---

### 11. Inconsistent Error Handling
**Impact:** Some errors are swallowed, making debugging difficult

**Files:** Various API routes handle errors inconsistently

**Fix:** Standardize error handling across all routes

---

### 12. Magic Numbers
**Impact:** Hard to maintain and understand

**Examples:**
- `CHUNK_SIZE = 100` - Should be a named constant with explanation
- `0.05`, `0.06`, `0.2` - Should be named constants (e.g., `PLATFORM_FEE = 0.05`)

---

### 13. Type Coercion Issues
**Impact:** Potential bugs with type mismatches

**Example in `src/app/api/match/route.js` (line 218):**
```javascript
Balance: { $gte: parseFloat(BetAmount) },  // BetAmount is already a number
```

**Fix:** Use consistent type handling

---

### 14. Missing Input Validation
**Impact:** Potential security and data integrity issues

**Examples:**
- No validation on `StakeId` format in some places
- No validation on `Amount` ranges in some routes
- No sanitization of user inputs

---

### 15. Inefficient Database Queries
**Impact:** Performance issues

**Example:** In `src/app/api/match/route.js`, `getLiveBets()` makes multiple sequential queries that could be optimized.

---

## 📋 SUMMARY

**Critical Bugs:** 6
**Medium Priority:** 3
**Improvements:** 6

**Total Issues Found:** 15

**Priority Order:**
1. Fix all missing `await` on `startTransaction()` (Critical)
2. Fix missing `await` on `endSession()` (Critical)
3. Fix hardcoded WithdrawCode check (Critical)
4. Add session cleanup in all routes (Critical)
5. Fix VIP level calculation (Critical)
6. Fix commission precision issue (Critical)
7. Fix error messages and add status checks (Medium)
8. Address improvements (Low)
