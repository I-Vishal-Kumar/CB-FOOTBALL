const oneMinute = 60 * 1000;
import { sendPhoneOtp } from "@/app/helpers/otp";
import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { USER } from "@/app/modals/modal";
import CustomError from "@/app/helpers/Error";
import { cookies } from "next/headers";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";

export async function GET(request) {
    let { token, session } = await getCookieData();
    try {
        await connect();
        let UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "session time out login again",
            });
        let user = await USER.findOne({ UserName }, { PhoneNumber: 1 });

        if (!user || !user?.PhoneNumber || user?.PhoneNumber === "")
            throw new CustomError(705, "invalid phone number", {});
        let phoneNumber = user?.PhoneNumber || "";
        // phoneNumber = phoneNumber.slice(3);
        let otp = Math.ceil(Math.random() * 9000 + 999);
        let res = await sendPhoneOtp(phoneNumber, otp);

        if (res === true) {
            let response = NextResponse.json({
                status: 200,
                message: "otp sent and valid for 5 minutes",
            });
            cookies().set("otp", `${otp}`, {
                maxAge: "5m",
                expires: Date.now() + 5 * oneMinute,
            });
            return response;
        }
        console.log(res);
        return NextResponse.json({
            status: 705,
            message:
                "Invalid phone number or you have reached otp request limit try after some time.",
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "somethign went wrong",
        });
    }
}

export async function POST(request) {
    try {
        await connect();
        let { Phone } = await request.json();
        let phoneNumber = Phone || "";
        phoneNumber = phoneNumber.slice(2);
        let otp = Math.ceil(Math.random() * 9000 + 999);
        let res = await sendPhoneOtp(phoneNumber, otp);
        if (res === true) {
            let response = NextResponse.json({
                status: 200,
                message: "otp sent and valid for 5 minutes",
            });
            cookies().set("otp", `${otp}`, {
                expires: Date.now() + 5 * oneMinute,
            });

            return response;
        }
        return NextResponse.json({
            status: 705,
            message:
                "Invalid phone number or you have reached otp request limit try after some time.",
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "somethign went wrong",
        });
    }
}

export async function PUT(request) {
    try {
        await connect();
        let { UserName } = await request.json();
        UserName = UserName?.trim();

        let userExists = await USER.findOne({ UserName }, { PhoneNumber: 1 });
        if (!userExists)
            throw new CustomError(705, "no user found with this user name", {});
        if (!userExists?.PhoneNumber)
            throw new CustomError(
                705,
                "User has not registered his/her mobile number",
                {}
            );

        let otp = Math.ceil(Math.random() * 9000 + 999);
        let res = await sendPhoneOtp(userExists?.PhoneNumber, otp);

        // dev only;
        // let res = true;
        // console.log(otp);
        // dev only;

        if (res === true) {
            let response = NextResponse.json({
                status: 200,
                message: "otp sent and valid for 5 minutes",
            });
            cookies().set("otp", `${otp}`, {
                expires: Date.now() + 5 * oneMinute,
            });
            return response;
        }
        return NextResponse.json({
            status: 705,
            message:
                "Invalid phone number or you have reached otp request limit try after some time.",
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "somethign went wrong",
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
