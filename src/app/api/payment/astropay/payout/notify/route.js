import ErrorReport from "@/app/helpers/ErrorReport";
import { astropayConfig, astropayVerify, readAstropayCallback } from "@/app/helpers/astropay";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const ok = () => NextResponse.json({ status: "ok" });

export async function POST(request) {
    let p = {};
    try {
        p = await readAstropayCallback(request);
    } catch {
        return NextResponse.json({ status: "bad request" }, { status: 400 });
    }

    const { secretKey } = astropayConfig();
    if (!astropayVerify(p, secretKey)) {
        ErrorReport(new Error(`AstroPay payout callback rejected (bad sign): ${p?.orderId}`));
        return NextResponse.json({ status: "bad sign" }, { status: 400 });
    }

    await connect();
    const TransactionId = String(p.orderId || "");

    const withdrawal = await TRANSACTION.findOne({ TransactionId, Type: "withdrawal" });
    if (!withdrawal) return NextResponse.json({ status: "not found" }, { status: 404 });
    if (withdrawal.Status !== 0) return ok();

    const status = Number(p.status);

    if (status === 10) {
        await TRANSACTION.updateOne(
            { TransactionId, Type: "withdrawal", Status: 0 },
            {
                Status: 1,
                Remark: p.utr ? `withdrawal processed · UTR ${p.utr}` : "withdrawal processed",
            }
        );
        return ok();
    }
    if (status !== 9) return ok(); // pending — nothing to do yet

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
            return ok();
        }

        const refunded = await USER.updateOne(
            { UserName: claimed.UserName },
            { $inc: { Balance: claimed.Amount, Withdrawal: -claimed.Amount } },
            { session: Session }
        );
        if (!refunded?.modifiedCount)
            throw new Error(`AstroPay payout ${TransactionId}: refund failed, user not found`);

        await Session.commitTransaction();
        return ok();
    } catch (error) {
        ErrorReport(error);
        try { await Session.abortTransaction(); } catch (e) { ErrorReport(e); }
        return NextResponse.json({ status: "error" }, { status: 500 });
    } finally {
        await Session.endSession().catch(() => {});
    }
}
