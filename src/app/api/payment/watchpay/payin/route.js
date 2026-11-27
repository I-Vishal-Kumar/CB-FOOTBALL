import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { getFormattedDate } from "@/app/helpers/formattedDate";
import {
    WATCHPAY_MAX_AMOUNT,
    WATCHPAY_MIN_AMOUNT,
    createWatchpayPayin,
    watchpayConfig,
} from "@/app/helpers/watchpay";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Creates a WatchPay pay-in order and returns the cashier link (pay_url).
 * The deposit is credited only by the signed callback in ./notify/route.js.
 */

export async function POST(request) {
    await connect();
    const token   = cookies().get("token")?.value   || "";
    const session = cookies().get("session")?.value || "";

    try {
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({ status: 302, message: "Session Expired login again" });

        if (!watchpayConfig().payinEnabled)
            throw new CustomError(
                705,
                "This payment channel is currently unavailable, please use another channel.",
                {}
            );

        let { Amount } = await request.json();
        Amount = Number(Amount);

        if (!Number.isFinite(Amount) || Amount <= 0)
            throw new CustomError(705, "Enter a valid amount", {});
        if (Amount < WATCHPAY_MIN_AMOUNT)
            throw new CustomError(705, `Minimum deposit amount is ₹${WATCHPAY_MIN_AMOUNT}`, {});
        if (Amount > WATCHPAY_MAX_AMOUNT)
            throw new CustomError(705, `Maximum deposit amount for this channel is ₹${WATCHPAY_MAX_AMOUNT}`, {});
        Amount = Math.round(Amount * 100) / 100;

        const user = await USER.findOne({ UserName });
        if (!user) throw new CustomError(404, "User not found", {});

        const TransactionId = `WP${Date.now()}${randomBytes(3).toString("hex")}`;

        // Record order first so the callback always finds it.
        // Type "gateway" keeps unpaid orders out of the admin's manual deposit list;
        // the callback switches it to "deposit" once paid.
        await TRANSACTION.create({
            UserName,
            Amount:        Math.round(Amount * 100),
            TransactionId,
            Method:        "WatchPay",
            Date:          getFormattedDate(),
            Parent:        user?.Parent || "",
            Remark:        "pending",
            Type:          "gateway",
        });

        const res = await createWatchpayPayin({
            orderNo:       TransactionId,
            amount:        Amount,
            customerName:  UserName,
            customerPhone: user?.PhoneNumber,
        });

        if (res?.code !== 0 || !res?.data?.pay_url) {
            await TRANSACTION.updateOne(
                { TransactionId, Status: 0 },
                { Status: 2, Remark: `gateway error ${res?.code}: ${res?.msg}` }
            );
            ErrorReport(new Error(`WatchPay payin create failed: ${JSON.stringify(res)}`));
            throw new CustomError(
                705,
                "Payment gateway is unavailable right now, please try another channel.",
                {}
            );
        }

        return NextResponse.json({
            status:  200,
            message: "redirecting to payment page",
            data:    { pay_url: res.data.pay_url, order_no: TransactionId },
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) ErrorReport(error);
        return NextResponse.json({
            status:  error?.status || 500,
            message: error?.status ? error.message : "something went wrong",
            data:    {},
        });
    }
}
