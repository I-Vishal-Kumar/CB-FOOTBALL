"use server";

import { connect } from "@/app/modals/dbConfig";
import { ADMIN } from "@/app/modals/modal";
import { revalidatePath } from "next/cache";

export async function updateQr(prevState, formData) {
  try {
    await connect();

    let qrFile = formData.get("qrCode") || "";
    let channel = formData.get("channel") || 1;
    let updateChannelFor = `QrChannel${channel}`;
    let isUpdated = await ADMIN.findOneAndUpdate(
      { _id: "673822ba4b425f2f3f2cef22" },
      {
        [updateChannelFor]: qrFile,
      }
    );
    if (isUpdated) {
      revalidatePath("/admin/betsettlement");
      return {
        message: `Updated ${channel}`,
      };
    }
    return {
      message: "Something went wrong",
    };
  } catch (error) {
    return {
      message: error?.message || JSON.stringify(error),
    };
  }
}
