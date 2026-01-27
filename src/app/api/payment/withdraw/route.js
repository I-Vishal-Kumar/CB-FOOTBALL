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
    await Session.startTransaction();
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
                "Withdrawals are not available on Saturday and Sunday. Please try again on Monday to Friday."
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
        
        Amount = Amount * 100;

        // check if the transaction already exists for today
        let today = new Date(
            new Date().toLocaleString("en-US", {
                timeZone: "Asia/Calcutta",
            })
        );
        // Set to start of day for comparison
        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        
        let isTodayWithdrawal = await TRANSACTION.findOne({
            UserName,
            Type: "withdrawal",
            createdAt: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        });
        if (isTodayWithdrawal)
            throw new CustomError(
                705,
                "you have reached withdrawal limit for today",
                {}
            );

        // Check monthly withdrawal limit (4 successful withdrawals per month)
        // Use createdAt for accurate month calculation
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
        const monthlyWithdrawals = await TRANSACTION.countDocuments({
            UserName,
            Type: "withdrawal",
            Status: 1, // Only count successful withdrawals
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth
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
        try {
            await Session.abortTransaction();
        } catch (abortErr) {
            ErrorReport(abortErr);
        }
        return NextResponse.json({
            status: error?.code || error?.status || 500,
            message: error?.message || "something went wrong",
            data: {},
        });
    } finally {
        if (Session) {
            try {
                await Session.endSession();
            } catch (endErr) {
                ErrorReport(endErr);
            }
        }
    }
}

async function updateUser(UserName, Amount, Session, Bank, WithdrawCode) {
    await connect();
    try {
        // Withdraw from Profit only - check Profit has enough funds
        // Dynamic withdraw code path based on bank type
        const withdrawCodePath = Bank === 'LocalBankAdded' 
            ? 'LocalBank.WithdrawCode' 
            : 'UsdtBank.WithdrawCode';
        
        let user = await USER.findOneAndUpdate(
            { 
                UserName, 
                [Bank]: true, 
                Profit: { $gte: Number(Amount) }, 
                [withdrawCodePath]: WithdrawCode 
            },
            {
                $inc: {
                    Profit: -Amount,
                    Withdrawal: Amount,
                },
            },
            { session: Session }
        );
        if (!user) throw Error("Insufficient profit or wrong withdrawal code");
        parent = user?.Parent;
        return true;
    } catch (error) {
        console.log(error, Amount, Bank, WithdrawCode, UserName);
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        parent = "";
        throw new CustomError(705, error?.message || "Insufficient profit or wrong withdrawal code");
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

    // Check if it's Saturday (6) or Sunday (0) - withdrawals are off on weekends
    if (currentDay === 0 || currentDay === 6) {
        return false;
    }

    // No time restrictions - withdrawals available 24/7 on weekdays
    return true;
}
