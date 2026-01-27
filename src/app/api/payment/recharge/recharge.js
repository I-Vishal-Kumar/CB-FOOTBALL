import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
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

import crypto from 'crypto';

export const validateSignByKey = (signSource, key, providedSign) => {
    if (key) {
      signSource += `&key=${key}`;
    }
    const generatedSign = crypto.createHash('md5').update(signSource).digest('hex');
    return generatedSign === providedSign;
  };
  

export async function POST(request) {
  
  await connect();
  
  let Session = await mongoose.startSession();
  await Session.startTransaction();
  
  let { session, token } = await getCookieData();
  
  try {
    
    const UserName = await isValidUser(token, session);
    
    if (!UserName)
      return NextResponse.json({
        status: 302,
        message: "Session Expired login again",
      });

    let body = await request.json();
    
    const {
        amount, mchId, mchOrderNo, merRetMsg, orderDate, orderNo, oriAmount, tradeResult, signType, sign
      } = body;
  
      const merchant_key = process.env.MERCHANT_KEY;
  
      // Construct the sign string
      let signStr = `amount=${amount}&mchId=${mchId}&mchOrderNo=${mchOrderNo}&merRetMsg=${merRetMsg}&orderDate=${orderDate}&orderNo=${orderNo}&oriAmount=${oriAmount}&tradeResult=${tradeResult}`;
  
      const isValid = validateSignByKey(signStr, merchant_key, sign);
  
      if (!isValid) {
        throw new CustomError(400, "Signature validation failed", {});
      }

    // await Session.commitTransaction();
    
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
