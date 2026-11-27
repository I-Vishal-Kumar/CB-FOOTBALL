"use server";

import { connect } from "@/app/modals/dbConfig";
import { ADMIN } from "@/app/modals/modal";
import { revalidatePath } from "next/cache";

export async function updateGatewaySettings(prevState, formData) {
    try {
        await connect();
        let doc = await ADMIN.findOne({});
        if (!doc) doc = await ADMIN.create({});

        const jazpaysPayin  = formData.get("JazpaysPayin")  === "true";
        const watchpayPayin = formData.get("WatchpayPayin") === "true";

        await ADMIN.findByIdAndUpdate(doc._id, {
            GatewaySettings: {
                JazpaysPayin:  jazpaysPayin,
                WatchpayPayin: watchpayPayin,
            },
        });

        revalidatePath("/admin/betsettlement");
        return { message: "Gateway settings saved." };
    } catch (error) {
        return { message: error?.message || "Something went wrong" };
    }
}
