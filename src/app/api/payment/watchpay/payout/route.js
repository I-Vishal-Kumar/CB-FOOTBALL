import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { createWatchpayPayout, watchpayConfig } from "@/app/helpers/watchpay";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION } from "@/app/modals/modal";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Admin-triggered WatchPay payout.
 * Looks up the pending withdrawal, fires createWatchpayPayout(), and marks the
 * transaction Method as "WatchPay payout" so duplicate calls are rejected.
 * The withdrawal is settled (Status 1) or refunded (Status 2) by the
 * signed callback at ./notify/route.js — not here.
 */

const FEE_RATE = 0.1;

export async function POST(request) {
    await connect();
    const token   = cookies().get("token")?.value   || "";
    const session = cookies().get("session")?.value || "";

    try {
        const caller = await isValidUser(token, session);
        if (!caller)
            return NextResponse.json({ status: 302, message: "Session expired, login again" });

        if (!watchpayConfig().payoutKey)
            throw new CustomError(705, "WatchPay payout is not configured.", {});

        const { transactionId } = await request.json();
        if (!transactionId)
            throw new CustomError(705, "transactionId is required", {});

        const withdrawal = await TRANSACTION.findOne({
            TransactionId: transactionId,
            Type: "withdrawal",
            Status: 0,
        });

        if (!withdrawal)
            throw new CustomError(705, "Withdrawal not found or already processed", {});

        if (withdrawal.Method === "WatchPay payout")
            throw new CustomError(705, "Payout already submitted to WatchPay", {});

        const bank          = withdrawal.Bank || {};
        const amountRupees  = withdrawal.Amount / 100;
        const payoutAmount  = Math.floor(amountRupees * (1 - FEE_RATE));

        // Mark before calling gateway so a duplicate click can't double-submit
        await TRANSACTION.updateOne(
            { TransactionId: transactionId, Type: "withdrawal", Status: 0 },
            { Method: "WatchPay payout" }
        );

        const res = await createWatchpayPayout({
            orderNo:     transactionId,
            amount:      payoutAmount,
            accountName: bank.AccHolderName || "",
            accountNo:   bank.AccNumber || "",
            ifsc:        bank.Ifsc || "",
            bankName:    bank.BankName || "",
        });

        if (res?.code !== 0) {
            await TRANSACTION.updateOne(
                { TransactionId: transactionId, Type: "withdrawal" },
                { Method: "bank" }
            );
            ErrorReport(new Error(`WatchPay payout create failed: ${JSON.stringify(res)}`));
            throw new CustomError(705, res?.msg || "WatchPay payout gateway error", {});
        }

        return NextResponse.json({
            status:  200,
            message: "Payout submitted to WatchPay. Balance will update once the callback arrives.",
            data:    { order_no: transactionId },
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) ErrorReport(error);
        return NextResponse.json({
            status:  error?.status || 500,
            message: error?.status ? error.message : "Something went wrong",
        });
    }
}
