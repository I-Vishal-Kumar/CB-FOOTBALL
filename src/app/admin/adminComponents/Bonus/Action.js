"use server";
import ErrorReport from "@/app/helpers/ErrorReport";
import { connect } from "@/app/modals/dbConfig";
import { REWARD, USER } from "@/app/modals/modal";
import { mongoose } from "mongoose";

export async function giveReward(prevState, formData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await connect();

    const UserName = formData?.get("UserName") || "";
    let Amount = formData?.get("Amount") * 100 || 0;
    let Remark = formData?.get("Remark") || "";
    if (!UserName || !Amount || !Remark)
      throw new Error("each field is required");

    let isUserFound = await USER.findOneAndUpdate(
      { UserName },
      {
        $inc: {
          Balance: Amount,
        },
      },
      { session }
    );
    let isRewardCreated = await REWARD.create(
      [
        {
          UserName: UserName,
          Type: "Manual reward",
          Remark: Remark,
          Amount: Amount,
          Status: 1,
        },
      ],
      { session }
    );
    if (!isUserFound || !isRewardCreated) throw new Error("invalid user id");
    await session.commitTransaction();
    return {
      message: `reward given to -> ${UserName}`,
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
    await session.abortTransaction();
    return {
      message: error?.message || "something went wrong",
    };
  }
}
