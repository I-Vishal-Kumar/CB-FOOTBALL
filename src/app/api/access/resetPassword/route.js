import ErrorReport from "@/app/helpers/ErrorReport";
import { USER } from "@/app/modals/modal";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    let { UserName, Password } = await request.json();
    Password = Password?.trim();
    UserName = UserName.trim();
    let res = await USER.findOneAndUpdate({ UserName }, { Password });
    if (!res) throw new Error("something went wrong");
    return NextResponse.json({
      status: 200,
      message: "Password reset successfull",
    });
  } catch (error) {
    if (
      error?.code === 500 ||
      error?.status === 500 ||
      !error?.code ||
      !error?.status
    ) {
      ErrorReport(error);
    }
    return NextResponse.json({
      status: error?.status || error?.code || 500,
      message: error?.message || "somethign went wrong",
    });
  }
}
