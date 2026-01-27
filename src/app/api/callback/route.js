import { connect } from "@/app/modals/dbConfig";
import { TRANSACTION } from "@/app/modals/modal";
import axios from "axios";
import md5 from "md5";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request, res) {
    let body = await request.json();

    try {
        let exists = await TRANSACTION.findOne({UserName: body.UserName,  Type: "withdrawal", TransactionId: body?.ReferanceNo, Status: 0 });
        if (!exists) {
            return NextResponse.json({ status: 0, message: "Transaction already exists" });
        }
    } catch (error) {
        return NextResponse.json({ msg : "Transaction already updated." });
    }

    let response = await axios.post("https://airdexpay.com/API/Payout", body.payout);
    let responseJson = response.data;
    if(responseJson.statuscode === 1 && responseJson.opening > responseJson.closing){
    
        await connect();
        let Session = await mongoose.startSession();
        await Session.startTransaction();
        try {
            let isWithdrawUpdated = await TRANSACTION.findOneAndUpdate(
                {
                    UserName: body.UserName,
                    Type: "withdrawal",
                    TransactionId: body?.ReferanceNo,
                },
                {
                    Status: 1,
                    Remark: "withdrawal processed",
                },
                { session: Session }
            );
            if (isWithdrawUpdated) {
                await Session.commitTransaction();
                return NextResponse.json({msg: "settled"})
            } else {
                throw Error("error while seettling withdrawal");
            }
        } catch (error) {
            try {
                await Session.abortTransaction();
            } catch (abortErr) {
                console.log(abortErr);
            }
            console.log(error);
        } finally {
            if (Session) {
                try {
                    await Session.endSession();
                } catch (endErr) {
                    console.log(endErr);
                }
            }
        }

    }

    return NextResponse.json({ msg : responseJson });
    
}
