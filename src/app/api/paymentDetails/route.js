import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import { ADMIN, USER } from "@/app/modals/modal";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connect();
  const { token, session } = await getCookieData();
  try {
    let UserName = await isValidUser(token, session);
    if (!UserName) throw new CustomError(302, "Login session time out", {});
    let res = await USER.findOne(
      { UserName },
      {
        _id: 0,
      }
    );
    if (!res) throw new CustomError(703, "somthing went wrong", {});
    let paymentDetails = await ADMIN.findOne({
      _id: "673822ba4b425f2f3f2cef22",
    });
    if (!paymentDetails) throw new CustomError(302, "something went wrong");
    return NextResponse.json({
      status: 200,
      message: "data fetched",
      data: paymentDetails,
    });
  } catch (error) {
    if (error?.code === 500 || error?.status === 500 || !error?.status) {
      ErrorReport(error);
    }
    return NextResponse.json({
      status: error?.status || error?.code || 500,
      message: error,
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
