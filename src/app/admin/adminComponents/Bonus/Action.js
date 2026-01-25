"use server";
import ErrorReport from "@/app/helpers/ErrorReport";
import { connect } from "@/app/modals/dbConfig";
import { REWARD, USER } from "@/app/modals/modal";
import { mongoose } from "mongoose";

export async function giveReward(prevState, formData) {
  let session = null;
  let transactionStarted = false;
  try {
    await connect();

    const UserName = String(formData?.get("UserName") || "").trim();
    const rawAmount = formData?.get("Amount");
    const Amount = Math.round(Number(rawAmount) * 100) || 0;
    const Remark = String(formData?.get("Remark") || "").trim();
    if (!UserName || !Amount || !Remark) {
      return { message: "Each field is required (UserName, Amount, Remark)." };
    }

    session = await mongoose.startSession();
    await session.startTransaction();
    transactionStarted = true;

    const isUserFound = await USER.findOneAndUpdate(
      { UserName },
      { $inc: { Profit: Amount } },
      { session }
    );
    if (!isUserFound) {
      throw new Error("User not found. Check the username.");
    }

    await REWARD.create(
      [
        {
          UserName,
          Type: "Manual reward",
          Remark,
          Amount,
          Status: 1,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    transactionStarted = false;
    return { message: `Reward given to ${UserName}` };
  } catch (error) {
    if (
      error?.code === 500 ||
      error?.status === 500 ||
      !error?.code ||
      !error?.status
    ) {
      ErrorReport(error);
    }
    if (transactionStarted && session?.isInTransaction()) {
      await session.abortTransaction();
    }
    return {
      message: error?.message && typeof error.message === "string"
        ? error.message
        : "Something went wrong. Check username and try again.",
    };
  }
}
