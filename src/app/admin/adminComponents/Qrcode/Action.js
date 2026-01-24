"use server";

import { connect } from "@/app/modals/dbConfig";
import { ADMIN } from "@/app/modals/modal";
import { revalidatePath } from "next/cache";

async function ensureAdminDoc() {
  let doc = await ADMIN.findOne({});
  if (!doc) {
    doc = await ADMIN.create({});
  }
  return doc;
}

export async function updateQr(prevState, formData) {
  try {
    await connect();

    let qrFile = formData.get("qrCode") || "";
    let channel = formData.get("channel") || 1;
    let updateChannelFor = `QrChannel${channel}`;
    let doc = await ensureAdminDoc();
    let isUpdated = await ADMIN.findByIdAndUpdate(doc._id, {
      [updateChannelFor]: qrFile,
    });
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
