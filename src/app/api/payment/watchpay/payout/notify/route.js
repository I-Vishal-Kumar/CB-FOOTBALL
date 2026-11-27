import ErrorReport from "@/app/helpers/ErrorReport";
import { readWatchpayCallback, watchpayConfig, watchpayVerify } from "@/app/helpers/watchpay";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/**
 * WatchPay payout callback (notify_url).
 * "success" settles the withdrawal; "failed" cancels it and refunds the
 * user's balance (same as JazPays payout notify / admin cancelWithdraw).
 * WatchPay refunds amount + fee to our merchant wallet automatically on failure.
 */

const reply = (text, status = 200) => new NextResponse(text, { status });

export async function POST(request) {
    let p = {};
    try {
        p = await readWatchpayCallback(request);
    } catch {
        return reply("bad request", 400);
    }

    const { merchantId, payoutKey } = watchpayConfig();
    if (!watchpayVerify(p, payoutKey) || String(p.merchant_id) !== String(merchantId)) {
        ErrorReport(new Error(`WatchPay payout callback rejected (bad sign): ${p?.order_no}`));
        return reply("bad sign", 400);
    }

    await connect();
    const TransactionId = String(p.order_no || "");

    const withdrawal = await TRANSACTION.findOne({ TransactionId, Type: "withdrawal" });
    if (!withdrawal) return reply("not found", 404);
    if (withdrawal.Status !== 0) return reply("success"); // duplicate callback

    if (p.status === "success") {
        await TRANSACTION.updateOne(
            { TransactionId, Type: "withdrawal", Status: 0 },
            {
                Status: 1,
                Remark: p.utr ? `withdrawal processed · UTR ${p.utr}` : "withdrawal processed",
            }
        );
        return reply("success");
    }
    if (p.status !== "failed") return reply("success"); // pending / processing — nothing to do yet

    const Session = await mongoose.startSession();
    try {
        Session.startTransaction();

        const claimed = await TRANSACTION.findOneAndUpdate(
            { TransactionId, Type: "withdrawal", Status: 0 },
            { Status: 2, Remark: "payout failed, amount refunded" },
            { session: Session }
        );
        if (!claimed) {
            await Session.abortTransaction();
            return reply("success");
        }

        const refunded = await USER.updateOne(
            { UserName: claimed.UserName },
            { $inc: { Balance: claimed.Amount, Withdrawal: -claimed.Amount } },
            { session: Session }
        );
        if (!refunded?.modifiedCount)
            throw new Error(`WatchPay payout ${TransactionId}: refund failed, user not found`);

        await Session.commitTransaction();
        return reply("success");
    } catch (error) {
        ErrorReport(error);
        try {
            await Session.abortTransaction();
        } catch (abortErr) {
            ErrorReport(abortErr);
        }
        return reply("error", 500);
    } finally {
        await Session.endSession().catch(() => {});
    }
}
