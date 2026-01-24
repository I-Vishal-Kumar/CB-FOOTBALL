"use server";

import ErrorReport from "@/app/helpers/ErrorReport";
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

export async function editBank(prevState, formData) {
  try {
    await connect();
    let BankName = formData?.get("BankName") || "";
    let AccNumber = formData?.get("AccNumber") || "";
    let AccHolderName = formData?.get("AccHolderName") || "";
    let Ifsc = formData?.get("Ifsc") || "";
    if (!BankName || !AccNumber || !AccHolderName || !Ifsc)
      throw new Error("every field is required");

    let doc = await ensureAdminDoc();
    let isUpdated = await ADMIN.findByIdAndUpdate(doc._id, {
      $set: {
        "BankDetails.BankName": BankName,
        "BankDetails.AccNumber": AccNumber,
        "BankDetails.AccHolderName": AccHolderName,
        "BankDetails.Ifsc": Ifsc,
      },
    });
    if (!isUpdated) throw new Error("something went wrong with the data");
    revalidatePath("/admin/betsettlement");
    return {
      message: "updated details",
    };
  } catch (error) {
    if (
      error?.code === 500 ||
      error?.status === 500 ||
      !error?.code ||
      !error?.status
    ) {
      ErrorReport(error);
    }
    return {
      message: error?.message || JSON.stringify(error),
    };
  }
}
