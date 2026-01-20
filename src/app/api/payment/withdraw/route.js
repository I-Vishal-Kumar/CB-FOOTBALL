import CustomError from "@/app/helpers/Error";
import { USER, TRANSACTION } from "@/app/modals/modal";
import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { getFormattedDate } from "@/app/helpers/formattedDate";
import { cookies } from "next/headers";
import { connect } from "@/app/modals/dbConfig";
import ErrorReport from "@/app/helpers/ErrorReport";
import { randomBytes } from "crypto";
const { mongoose } = require("mongoose");

/**
 *
 *   As the name suggest this will handle the withdrawals made by users;
 *
 */
let parent = "";

export async function GET(request){
    console.log('reciving in withdrwal api' , new Date().toDateString());
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
            console.log('reciving in withdrwal api' , new Date().toDateString());
        }
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });

        let body = await request.json();
        let { Amount, WithdrawCode } = body;
        if (!(await validateTime()))
            throw new CustomError(
                705,
                "you can withdraw from 10:00 AM to 16:00 PM UTC on working days i.e Monday to Friday. Withdrawals are not available on Saturday and Sunday."
            );

        if (!Amount) throw new CustomError(705, "Enter a valid amount", {});
        Amount = Number(Amount);

        // Check minimum withdrawal amount
        if (Amount < 600) {
            throw new CustomError(
                705,
                "minimum withdrawal amount is 600"
            );
        }

        // if (!(await vipVerified(UserName, body?.Amount)))
        //     throw new CustomError(705, "Your vip level is low", {});
        
            if (!Amount) throw new CustomError(705, "Missing Fields", {});
        Amount = Amount * 100;

        // check if the transaction already exists for today
        let today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Calcutta",
            })
        );
        let isTodayWithdrawal = await TRANSACTION.findOne({
            UserName,
            Date: `${today.getDate()}/${
                today.getMonth() + 1
            }/${today.getFullYear()}`,
            Type: "withdrawal",
        });
        if (isTodayWithdrawal)
            throw new CustomError(
                705,
                "you have reached withdrawal limit for today",
                {}
            );

        // Check monthly withdrawal limit (4 successful withdrawals per month)
        const currentMonth = today.getMonth() + 1; // 1-12 (no leading zero)
        const currentYear = today.getFullYear();
        
        // Count successful withdrawals (Status = 1) in current month
        // Date format is "DD/MM/YYYY" (e.g., "15/1/2024" or "5/12/2024")
        // Match pattern: "/MM/YYYY" or "/M/YYYY" at end of string
        const monthlyWithdrawals = await TRANSACTION.countDocuments({
            UserName,
            Type: "withdrawal",
            Status: 1, // Only count successful withdrawals
            Date: {
                $regex: `/${currentMonth}/${currentYear}$` // Match current month/year at end of date string
            }
        });

        if (monthlyWithdrawals >= 4) {
            throw new CustomError(
                705,
                "You have reached the monthly withdrawal limit of 4 successful withdrawals. Please try again next month.",
                {}
            );
        }
        
        if (body?.isLocalBank) {
            let updatedUser = await updateUser(
                UserName,
                Amount,
                Session,
                "LocalBankAdded",
                WithdrawCode
            );

            if (!updatedUser)
                throw new CustomError(705, "Bank not added or error field", {});
        } else {
            let updatedUser = await updateUser(
                UserName,
                Amount,
                Session,
                "UsdtBankAdded",
                WithdrawCode
            );

            if (!updatedUser)
                throw new CustomError(
                    705,
                    "Bank already added or error field",
                    {}
                );
        }
        let TransactionId = await genTransactionID();

        let UserBank = await USER.findOne({ UserName });
        let Bank =
            body?.isLocalBank === true
                ? UserBank?.LocalBank
                : UserBank?.UsdtBank;

        let isTransCreated = await TRANSACTION.create(
            [
                {
                    UserName: UserName,
                    Amount: Amount,
                    TransactionId: TransactionId,
                    Method: body?.isLocalBank
                        ? "Local bank transfer"
                        : "usdt transfer",
                    Date: getFormattedDate(),
                    Parent: parent,
                    Remark: "pending",

                    Type: "withdrawal",
                    Bank: Bank,
                },
            ],
            { session: Session }
        );
        if (!isTransCreated)
            throw new CustomError(
                500,
                "something went wrong while withdrawal",
                {}
            );
        await Session.commitTransaction();
        return NextResponse.json({
            status: 200,
            message: "Withdrawall is in processing",
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

async function updateUser(UserName, Amount, Session, Bank, WithdrawCode) {
    await connect();
    try {
        let user = await USER.findOneAndUpdate(
            { UserName, [Bank]: true, Balance: { $gte: Number(Amount) }, 'LocalBank.WithdrawCode': WithdrawCode },
            {
                $inc: {
                    Balance: -Amount,
                    Withdrawal: Amount,
                },
            },
            { session: Session }
        );
        if (!user) throw Error("Low balance or wrong withdrawal code");
        parent = user?.Parent;
        return true;
    } catch (error) {
        console.log(error, Amount, Bank, WithdrawCode, UserName);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        parent = "";
        throw new CustomError(705, "Low balance or wrong withdrawal code");
    }
}

async function vipVerified(UserName, Ammount) {
    await connect();
    let vipMax = [25000, 50000, 75000, 200000, 500000];
    try {
        // here the amount is not multiplied by 100 for  convenience reasons;
        Ammount = Number(Ammount);
        let { VipLevel } = await USER.findOne({ UserName }, { VipLevel: 1 });
        if (Ammount >= 500 && Ammount <= vipMax[VipLevel]) {
            return true;
        }
        throw new Error(
            "Your vip level is " +
                VipLevel +
                " you can withdraw from 500 - " +
                vipMax[VipLevel]
        );
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        throw new Error(error?.message);
    }
}

async function genTransactionID() {
    return randomBytes(15).toString("hex").slice(0, 15);
    // const PART_A = Math.floor(Math.random() * 90000 + 10000).toString();
    // const PART_B = Math.floor(Math.random() * 90000 + 10000).toString();
    // return PART_A + PART_B;
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

async function validateTime() {
    const currentDate = new Date(
        new Date().toLocaleString("en-US", {
            timeZone: "Asia/Calcutta",
        })
    );
    const currentDay = Number(currentDate.getDay()); // Sunday is 0, Monday is 1, ..., Saturday is 6
    const currentHour = Number(currentDate.getHours());

    // Check if it's Saturday (6) or Sunday (0) - withdrawals are off on weekends
    if (currentDay === 0 || currentDay === 6) {
        return false;
    }

    // Check if outside the working hours (10 am to 4 pm)
    if (currentHour < 10 || currentHour >= 16) {
        return false;
    }

    return true;
}
