import ErrorReport from "@/app/helpers/ErrorReport";
import { jazpaysConfig, jazpaysVerify, readCallbackBody } from "@/app/helpers/jazpays";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

/**
 *
 *   JazPays pay-in callback (notify_url). Credits the deposit once the signed
 *   result says "success". JazPays expects the plain text "success" back;
 *   anything else is logged on their side as a failed delivery.
 *
 *   Crediting mirrors the admin deposit approval (adminComponents/Deposit/Action.js):
 *   first deposit -> 6% invitation reward to the parent + 5% bonus to the user's profit.
 *
 */

const reply = (text, status = 200) => new NextResponse(text, { status });

export async function POST(request) {
    let p = {};
    try {
        p = await readCallbackBody(request);
    } catch {
        return reply("bad request", 400);
    }

    const { merchantId, payinKey } = jazpaysConfig();
    if (!jazpaysVerify(p, payinKey) || String(p.merchant_id) !== String(merchantId)) {
        ErrorReport(new Error(`JazPays payin callback rejected (bad sign): ${p?.order_no}`));
        return reply("bad sign", 400);
    }

    await connect();
    const TransactionId = String(p.order_no || "");

    const order = await TRANSACTION.findOne({ TransactionId, Method: "JazPays" });
    if (!order) return reply("not found", 404);
    if (order.Status !== 0) return reply("success"); // already handled (duplicate callback)

    if (p.status === "failed") {
        await TRANSACTION.updateOne(
            { TransactionId, Status: 0 },
            { Status: 2, Remark: "failed" }
        );
        return reply("success");
    }
    if (p.status !== "success") return reply("success"); // pending: nothing to do yet

    const paidAmount = Math.round(Number(p.amount) * 100);
    if (paidAmount !== order.Amount) {
        ErrorReport(
            new Error(
                `JazPays amount mismatch for ${TransactionId}: paid ${p.amount}, order ${order.Amount / 100}`
            )
        );
        return reply("amount mismatch", 400);
    }

    const Session = await mongoose.startSession();
    try {
        Session.startTransaction();

        // claim the order atomically so a repeated callback can never credit twice
        const claimed = await TRANSACTION.findOneAndUpdate(
            { TransactionId, Status: 0 },
            {
                Status: 1,
                Type: "deposit",
                Remark: p.utr ? `success · UTR ${p.utr}` : "success",
            },
            { session: Session }
        );
        if (!claimed) {
            await Session.abortTransaction();
            return reply("success");
        }

        const user = await USER.findOne({ UserName: claimed.UserName }).session(Session);
        if (!user) throw new Error(`JazPays deposit ${TransactionId}: user not found`);

        const amount = claimed.Amount;

        if (user.FirstDeposit) {
            if (user.Parent !== "") {
                const parent = await USER.findOneAndUpdate(
                    { UserName: user.Parent },
                    { $inc: { Profit: amount * 0.06, Members: 1 } },
                    { session: Session }
                );
                if (!parent) throw new Error("something went wrong while updating the parent");

                const today = new Date();
                await TRANSACTION.create(
                    [
                        {
                            UserName: parent.UserName,
                            TransactionId: randomBytes(15).toString("hex").slice(0, 15),
                            Amount: amount * 0.06,
                            Type: "invitation reward",
                            Remark: "success",
                            Status: 1,
                            Date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
                            Parent: parent.Parent,
                            From: user.UserName,
                            Method: "reward",
                        },
                    ],
                    { session: Session }
                );
            }

            await USER.updateOne(
                { UserName: user.UserName },
                {
                    $inc: {
                        Balance: amount,
                        Profit: amount * 0.05,
                        Deposited: amount,
                        ValidDeposit: amount,
                    },
                    FirstDeposit: false,
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
        return reply("success");
    } catch (error) {
        ErrorReport(error);
        try {
            await Session.abortTransaction();
        } catch (abortErr) {
            ErrorReport(abortErr);
        }
        // non-"success" reply: JazPays records a failed delivery and the order stays pending
        return reply("error", 500);
    } finally {
        await Session.endSession().catch(() => {});
    }
}
