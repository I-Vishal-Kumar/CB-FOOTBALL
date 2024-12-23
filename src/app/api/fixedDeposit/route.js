"use server";

import { connect } from "@/app/modals/dbConfig";
import { FIXEDDEPOST, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { isValidUser } from "@/app/helpers/auth";
import { cookies } from "next/headers";

export async function POST(request, response) {
    let Session = await mongoose.startSession();
    Session.startTransaction();
    try {
        await connect();

        let { session, token } = await getCookieData();

        const UserName = await isValidUser(token, session);
        if (!UserName)
            return NextResponse.json({
                status: 302,
                message: "Session Expired login again",
            });

        let body = await request.json();

        const { percent, amount, duration } = body;
        let Amount = Number(amount) * 100;

        let user = await USER.findOneAndUpdate(
            { UserName, Balance: { $gte: Number(Amount) } },
            {
                $inc: {
                    Balance: -Amount,
                },
            },
            { session: Session }
        );
        if (!user) throw Error("Low balance");

        const isCreated = await FIXEDDEPOST.create(
            [
                {
                    UserName,
                    Amount,
                    Percent: Number(percent),
                    Duration: Number(duration),
                },
            ],
            { session: Session }
        );

        if (!isCreated)
            throw new error(
                "something went wrong while creating fixed deposit"
            );
        await Session.commitTransaction();
        return NextResponse.json({
            status: 200,
            message: "fixed deposit created successfully",
            data: {},
        });
    } catch (error) {
        console.log(error);
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
