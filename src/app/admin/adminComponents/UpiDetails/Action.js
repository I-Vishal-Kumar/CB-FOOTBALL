"use server";

import { connect } from "@/app/modals/dbConfig";
import { ADMIN } from "@/app/modals/modal";
import { revalidatePath } from "next/cache";

export async function updateUpi(prevState, formData) {
  try {
    await connect();
    let data = formData?.getAll("upiId") || [];
    if (data?.length < 1) throw new Error("Add some upi ids");

    let isUpdated = await ADMIN.findOneAndUpdate(
      { _id: "673822ba4b425f2f3f2cef22" },
      {
        UpiIds: data,
      }
    );

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
