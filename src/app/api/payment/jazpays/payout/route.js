import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { createPayout, jazpaysConfig } from "@/app/helpers/jazpays";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION } from "@/app/modals/modal";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Admin-triggered JazPays payout.
 * Looks up the pending withdrawal, fires createPayout(), and marks the
 * transaction Method as "JazPays payout" so duplicate calls are rejected.
 * The withdrawal is settled (Status 1) or refunded (Status 2) by the
 * signed callback at ./notify/route.js — not here.
 */

// 10 % platform fee — must match the "final amount" display in WithdrawalCard.jsx
const FEE_RATE = 0.1;

export async function POST(request) {
    await connect();
    const token = cookies().get("token")?.value || "";
    const session = cookies().get("session")?.value || "";

    try {
        const caller = await isValidUser(token, session);
        if (!caller)
            return NextResponse.json({ status: 302, message: "Session expired, login again" });

        if (!jazpaysConfig().payoutKey)
            throw new CustomError(705, "JazPays payout is not configured.", {});

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

        if (withdrawal.Method === "JazPays payout")
            throw new CustomError(705, "Payout already submitted to JazPays", {});

        const bank = withdrawal.Bank || {};
        const amountRupees = withdrawal.Amount / 100;
        const payoutAmount = Math.floor(amountRupees * (1 - FEE_RATE));

        // Mark before calling the gateway so a duplicate click/tab can't submit twice
        await TRANSACTION.updateOne(
            { TransactionId: transactionId, Type: "withdrawal", Status: 0 },
            { Method: "JazPays payout" }
        );

        const res = await createPayout({
            orderNo: transactionId,
            amount: payoutAmount,
            accountName: bank.AccHolderName || "",
            accountNo: bank.AccNumber || "",
            ifsc: bank.Ifsc || "",
            bankName: bank.BankName || "",
        });

        if (res?.code !== 0) {
            // Unmark so the admin can retry with another channel
            await TRANSACTION.updateOne(
                { TransactionId: transactionId, Type: "withdrawal" },
                { Method: "bank" }
            );
            ErrorReport(new Error(`JazPays payout create failed: ${JSON.stringify(res)}`));
            throw new CustomError(705, res?.msg || "JazPays payout gateway error", {});
        }

        return NextResponse.json({
            status: 200,
            message: "Payout submitted to JazPays. Balance will update once the callback arrives.",
            data: { order_no: transactionId },
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.status || 500,
            message: error?.status ? error.message : "Something went wrong",
        });
    }
}
