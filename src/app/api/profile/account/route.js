import CustomError from "@/app/helpers/Error";
import { NextResponse } from "next/server";
import { USER, TRANSACTION } from "@/app/modals/modal";
import { cookies } from "next/headers";
import { isValidUser } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";
/*
  
🏦🏧

   This function will handle the creation and updation of accounts
   for local banks and usdt banks

   ## POST request will handle creation of banks ;
   ## UPDATE  request will handle the updation of banks detail ;
*/

export async function POST(request) {
    let { token, session } = await getCookieData();
    try {
        await connect();
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });

        let body = await request.json();
        if (body?.isLocalBank) {
            let { AccHolderName, BankName, AccNumber, Ifsc, BranchName, WithdrawCode } = body;
            if (!AccHolderName || !BankName || !AccNumber || !Ifsc || !BankName || !WithdrawCode)
                throw new CustomError(705, "Missing Fields", {});

            let detailsExists = await USER.findOne({'LocalBank.AccNumber': AccNumber});
            if (detailsExists)
                throw new CustomError(
                    705,
                    "bank details already registered with another user",
                    {}
                );
            let isLocalBankAdded = await USER.findOneAndUpdate(
                { UserName, LocalBankAdded: false },
                {
                    LocalBankAdded: true,
                    LocalBank: {
                        AccHolderName,
                        BankName,
                        AccNumber,
                        Ifsc,
                        BranchName,
                        WithdrawCode
                    },
                }
            );
            if (!isLocalBankAdded)
                throw new CustomError(
                    705,
                    "Bank already added or error field",
                    {}
                );

            return NextResponse.json({
                status: 200,
                message: "Account added successfully",
            });
        } else {
            let { UsdtAddress, AppName } = body;
            if (!UsdtAddress || !AppName)
                throw new CustomError(705, "Field missing", {});
            let isUsdtExists = await USER.findOne({
                UsdtBank: {
                    UsdtAddress,
                    AppName,
                },
            });
            if (isUsdtExists)
                throw new CustomError(
                    705,
                    "bank details already registered with another user",
                    {}
                );
            let isUsdtBankAdded = await USER.findOneAndUpdate(
                { UserName, UsdtBankAdded: false },
                {
                    UsdtBankAdded: true,
                    UsdtBank: {
                        UsdtAddress,
                        AppName,
                    },
                }
            );
            if (!isUsdtBankAdded)
                throw new CustomError(
                    705,
                    "Error while creating bank account",
                    {}
                );
            return NextResponse.json({
                status: 200,
                message: "Account added successfully",
                data: {},
            });
        }
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        return NextResponse.json({
            status: error?.code || error?.status || 500,
            message: error?.message || "something went wrong",
            data: {},
        });
    }
}

export async function PATCH(request) {
    let { session, token } = await getCookieData();
    try {
        await connect();
        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });

        let body = await request.json();
        if (body?.isLocalBank) {
            let { AccHolderName, BankName, AccNumber, Ifsc, BranchName } = body;
            if (!AccHolderName || !BankName || !AccNumber || !Ifsc || !BankName)
                throw new CustomError(705, "Missing Fields", {});

            let isLocalBankAdded = await USER.findOneAndUpdate(
                { UserName, LocalBankAdded: true },
                {
                    LocalBank: {
                        AccHolderName,
                        BankName,
                        AccNumber,
                        Ifsc,
                        BranchName,
                    },
                }
            );
            if (!isLocalBankAdded)
                throw new CustomError(
                    705,
                    "Bank already added or error field",
                    {}
                );

            return NextResponse.json({
                status: 200,
                message: "Account added successfully",
            });
        } else {
            let { UsdtAddress, AppName } = body;
            if (!UsdtAddress || !AppName)
                throw new CustomError(705, "Field missing", {});

            isUsdtBankAdded = await USER.findOneAndUpdate(
                { UserName, UsdtBankAdded: true },
                {
                    UsdtBank: {
                        UsdtAddress,
                        AppName,
                    },
                }
            );
            if (!isUsdtBankAdded)
                throw new CustomError(
                    705,
                    "Error while creating bank account",
                    {}
                );
            return NextResponse.json({
                status: 200,
                message: "Account added successfully",
                data: {},
            });
        }
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
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
