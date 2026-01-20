import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { getFormattedDate } from "@/app/helpers/formattedDate";
import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION, USER } from "@/app/modals/modal";
import { mongoose } from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 *
 *   This file will handle the deposits from various channels be it usdt or local;
 *
 */

export async function GET(request){
  console.log("called");
  return NextResponse.json({
    status: 302,
    message: "Session Expired login again",
  });
}

export async function POST(request) {
  
  await connect();
  
  let Session = await mongoose.startSession();
  Session.startTransaction();
  
  let { session, token } = await getCookieData();
  
  try {
    
    const UserName = await isValidUser(token, session);
    if(!UserName){
      console.log('reciving in deposit api' , new Date().toDateString());
  }
    if (!UserName)
      return NextResponse.json({
        status: 302,
        message: "Session Expired login again",
      });

    let body = await request.json();
    
    let { Amount, Channel, TransactionId } = body;
    
    if (!Amount || !Channel || !TransactionId)
      throw new CustomError(705, "Missing fields", {});

    // Check minimum deposit amount
    if (Number(Amount) < 500) {
      throw new CustomError(705, "Minimum deposit amount is 500", {});
    }

    Amount = Number(Amount) * 100;
    TransactionId = TransactionId.trim();

    let channelType;
    if (Channel === 1) {
      channelType = "Payment channel 1";
    } else if (Channel === 2)  {
      channelType = "Payment channel 2";
    } else if (Channel === 3)  {
      channelType = "Payment channel 3";
    } else {
      channelType = "Usdt channel";
    }

    let { Parent } = await USER.findOne({ UserName });

    let isTransactionExists = await TRANSACTION.findOne({
      UserName,
      TransactionId,
      Type: "deposit",
    });

    if (isTransactionExists)
      throw new CustomError(604, "This transaction already exists", {});

    let isTransCreated = await TRANSACTION.create(
      [
        {
          UserName: UserName,
          Amount: Amount,
          TransactionId: TransactionId,
          Method: channelType,
          Date: getFormattedDate(),
          Parent: Parent,
          Remark: "pending",
          Type: "deposit",
        },
      ],
      { session: Session }
    );

    if (!isTransCreated)
      throw new CustomError(500, "something went wrong while withdrawal", {});

    await Session.commitTransaction();
    
    return NextResponse.json({
      status: 200,
      message:
        "Your deposit is in processing and will be reflected soon in you account .",
      data: {},
    });

  } catch (error) {

    if (error?.code === 500 || error?.status === 500 || !error?.status) {
      ErrorReport(error);
    }
    
    await Session.abortTransaction();

    return NextResponse.json({
      status: error?.code || error?.status || 500,
      message: error?.message || "something went wrong",
      data: {},
    });
    
  }
}

async function getCookieData() {
  let token = cookies().get("token")?.value || "";
  let session = cookies().get("session")?.value || "";
  const cookieData = { token, session };
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(cookieData);
    }, 1000)
  );
}
