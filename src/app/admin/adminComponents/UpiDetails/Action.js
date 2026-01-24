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

export async function updateUpi(prevState, formData) {
  try {
    await connect();
    let data = formData?.getAll("upiId") || [];
    if (data?.length < 1) throw new Error("Add some upi ids");

    let doc = await ensureAdminDoc();
    let isUpdated = await ADMIN.findByIdAndUpdate(doc._id, { UpiIds: data });

    if (isUpdated) {
      revalidatePath("/admin/betsettlement");
      return {
        message: `Updated ${data}`,
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
