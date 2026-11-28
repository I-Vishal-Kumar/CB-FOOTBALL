import ErrorReport from "@/app/helpers/ErrorReport";
import { astropayConfig, astropayVerify, readAstropayCallback } from "@/app/helpers/astropay";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/**
 * AstroPay payin callback (callbackUrl).
 * status 10 = success, 9 = failed, 1 = pending.
 * Must respond HTTP 2xx — NextResponse.json is used for all replies.
 */

const ok = () => NextResponse.json({ status: "ok" });
const err = (msg, code) => NextResponse.json({ status: msg }, { status: code });

export async function POST(request) {
    let p = {};
    try {
        p = await readAstropayCallback(request);
    } catch {
        return err("bad request", 400);
    }

    const { secretKey } = astropayConfig();
    if (!astropayVerify(p, secretKey)) {
        ErrorReport(new Error(`AstroPay payin callback rejected (bad sign): ${p?.orderId}`));
        return err("bad sign", 400);
    }

    await connect();
    const TransactionId = String(p.orderId || "");

    const order = await TRANSACTION.findOne({ TransactionId, Method: "AstroPay" });
    if (!order) return err("not found", 404);
    if (order.Status !== 0) return ok(); // duplicate callback

    const status = Number(p.status);

    if (status === 9) {
        await TRANSACTION.updateOne(
            { TransactionId, Status: 0 },
            { Status: 2, Remark: "failed" }
        );
        return ok();
    }
    if (status !== 10) return ok(); // still pending

    const paidAmount = Math.round(Number(p.amount) * 100);
    if (paidAmount !== order.Amount) {
        ErrorReport(
            new Error(
                `AstroPay amount mismatch for ${TransactionId}: paid ${p.amount}, order ${order.Amount / 100}`
            )
        );
        return err("amount mismatch", 400);
    }

    const Session = await mongoose.startSession();
    try {
        Session.startTransaction();

        const claimed = await TRANSACTION.findOneAndUpdate(
            { TransactionId, Status: 0 },
            {
                Status: 1,
                Type:   "deposit",
                Remark: p.utr ? `success · UTR ${p.utr}` : "success",
            },
            { session: Session }
        );
        if (!claimed) {
            await Session.abortTransaction();
            return ok();
        }

        const user = await USER.findOne({ UserName: claimed.UserName }).session(Session);
        if (!user) throw new Error(`AstroPay deposit ${TransactionId}: user not found`);

        const amount = claimed.Amount;

        if (user.FirstDeposit) {
            if (user.Parent !== "") {
                const parent = await USER.findOneAndUpdate(
                    { UserName: user.Parent },
                    { $inc: { Profit: amount * 0.08, Balance: amount * 0.08, Members: 1 } },
                    { session: Session }
                );
                if (!parent) throw new Error("AstroPay: failed to update parent on first deposit");

                const today = new Date();
                await TRANSACTION.create(
                    [
                        {
                            UserName:      parent.UserName,
                            TransactionId: randomBytes(15).toString("hex").slice(0, 15),
                            Amount:        amount * 0.08,
                            Type:          "invitation reward",
                            Remark:        "success",
                            Status:        1,
                            Date:          `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
                            Parent:        parent.Parent,
                            From:          user.UserName,
                            Method:        "reward",
                        },
                    ],
                    { session: Session }
                );
            }

            await USER.updateOne(
                { UserName: user.UserName },
                {
                    $inc: {
                        Balance:      amount + amount * 0.06,
                        Profit:       amount * 0.06,
                        Deposited:    amount,
                        ValidDeposit: amount,
                    },
                    $set: { FirstDeposit: false },
                },
                { session: Session }
            );
        } else {
            await USER.updateOne(
                { UserName: user.UserName },
                { $inc: { Balance: amount, Deposited: amount } },
                { session: Session }
            );
        }

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
