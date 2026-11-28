import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { getFormattedDate } from "@/app/helpers/formattedDate";
import {
    ASTROPAY_MAX_AMOUNT,
    ASTROPAY_MIN_AMOUNT,
    astropayConfig,
    createAstropayPayin,
} from "@/app/helpers/astropay";
import { connect } from "@/app/modals/dbConfig";
import { ADMIN, TRANSACTION, USER } from "@/app/modals/modal";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    await connect();
    const token   = cookies().get("token")?.value   || "";
    const session = cookies().get("session")?.value || "";

    try {
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({ status: 302, message: "Session Expired login again" });

        const adminDoc = await ADMIN.findOne({});
        const dbEnabled = adminDoc?.GatewaySettings?.AstropayPayin !== false;
        if (!astropayConfig().payinEnabled || !dbEnabled)
            throw new CustomError(
                705,
                "This payment channel is currently unavailable, please use another channel.",
                {}
            );

        let { Amount } = await request.json();
        Amount = Number(Amount);

        if (!Number.isFinite(Amount) || Amount <= 0)
            throw new CustomError(705, "Enter a valid amount", {});
        if (Amount < ASTROPAY_MIN_AMOUNT)
            throw new CustomError(705, `Minimum deposit amount is ₹${ASTROPAY_MIN_AMOUNT}`, {});
        if (Amount > ASTROPAY_MAX_AMOUNT)
            throw new CustomError(705, `Maximum deposit amount for this channel is ₹${ASTROPAY_MAX_AMOUNT}`, {});
        Amount = Math.round(Amount * 100) / 100;

        const user = await USER.findOne({ UserName });
        if (!user) throw new CustomError(404, "User not found", {});

        const orderId = `AP${Date.now()}${randomBytes(3).toString("hex")}`;

        await TRANSACTION.create({
            UserName,
            Amount:        Math.round(Amount * 100),
            TransactionId: orderId,
            Method:        "AstroPay",
            Date:          getFormattedDate(),
            Parent:        user?.Parent || "",
            Remark:        "pending",
            Type:          "gateway",
        });

        const res = await createAstropayPayin({
            orderId,
            amount:  Amount,
            name:    UserName,
            phone:   user?.PhoneNumber,
            email:   "",
        });

        if (res?.code !== 1000 || !res?.data?.pay_url) {
            await TRANSACTION.updateOne(
                { TransactionId: orderId, Status: 0 },
                { Status: 2, Remark: `gateway error ${res?.code}: ${res?.msg}` }
            );
            ErrorReport(new Error(`AstroPay payin create failed: ${JSON.stringify(res)}`));
            throw new CustomError(
                705,
                "Payment gateway is unavailable right now, please try another channel.",
                {}
            );
        }

        return NextResponse.json({
            status:  200,
            message: "redirecting to payment page",
            data:    { pay_url: res.data.pay_url, order_no: orderId },
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
