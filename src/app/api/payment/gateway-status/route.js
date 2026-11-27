import { connect } from "@/app/modals/dbConfig";
import { ADMIN } from "@/app/modals/modal";
import { NextResponse } from "next/server";

/**
 * Returns which payment gateways are currently enabled.
 * Reads DB (admin toggles) cross-checked against env vars (require a key to be set).
 * No auth needed — the frontend reads this on the recharge page to show/hide options.
 */
export async function GET() {
    try {
        await connect();
        const admin = await ADMIN.findOne({});

        const dbSettings = admin?.GatewaySettings || {};

        const jazpaysPayin  = !!(process.env.JAZPAYS_PAYIN_KEY) &&
                              (dbSettings?.JazpaysPayin !== false);
        const watchpayPayin = !!(process.env.WATCHPAY_PAYIN_KEY) &&
                              (dbSettings?.WatchpayPayin !== false);

        return NextResponse.json({ status: 200, data: { jazpaysPayin, watchpayPayin } });
    } catch {
        return NextResponse.json({ status: 200, data: { jazpaysPayin: true, watchpayPayin: true } });
    }
}

export const dynamic = "force-dynamic";
