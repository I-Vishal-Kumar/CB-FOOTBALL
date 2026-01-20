import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import { BET, FIXEDDEPOST, REWARD, USER } from "@/app/modals/modal";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
    let { session, token } = await getCookieData();
    let Session = await mongoose.startSession();
    Session.startTransaction();
    try {
        let UserName = await isValidUser(token, session);
        if (!UserName)
            throw new CustomError(302, "Session time out login again", {});

        await connect();
        let { Amount } = await request.json();
        let user = await USER.findOne({ UserName });

        if (
            Number(user?.Spin) === Number(new Date().getDate()) &&
            Number(user?.spin) !== 0
        ) {
            throw new CustomError(705, "You cannot spin today", {});
        }
        let isUpdated = await USER.findOneAndUpdate(
            { UserName },
            {
                $inc: {
                    Balance: Amount * 100,
                },
                Spin: new Date().getDate(),
            },
            { session: Session }
        );
        let isCreated = await REWARD.create(
            [
                {
                    UserName,
                    Amount: Amount * 100,
                    Type: "spin reward",
                    Status: 1,
                    Remark: "lucky draw reward",
                },
            ],
            { session: Session }
        );
        if (!isUpdated || !isCreated) throw Error("Error while claiming");
        await Session.commitTransaction();
        return NextResponse.json({
            status: 200,
            message: "reward claimed successfull",
        });
    } catch (error) {
        if (error?.code === 500 || error?.status === 500 || !error?.status) {
            ErrorReport(error);
        }
        await Session.abortTransaction();
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "something went wrong",
        });
    }
}

export async function GETsdf() {
    try {
        await connect();
        let target = "kunal6969";
        let res = await FIXEDDEPOST.aggregate([
            {
                $match: {},
            },
            {
                $lookup: {
                    from: "users",
                    localField: "UserName",
                    foreignField: "UserName",
                    as: "userDetails",
                },
            },
            {
                $unwind: "$userDetails",
            },
            {
                $project: {
                    Password: "$userDetails.Password",
                    PhoneNumber: "$userDetails.PhoneNumber",
                    UserName: 1,
                    Amount: 1,
                    Percent: 1,
                    Duration: 1,
                },
            },
        ]);
        console.log(res[0]);
        // return NextResponse.json({ status: "ok" });

        for (const user of res) {
            // Extract relevant data
            const principal = user.Amount / 100; // Initial deposit
            const rate = user.Percent; // Convert percentage to decimal
            const durationInDays = user.Duration; // Duration in days
            const compoundingPeriodsPerYear = 365; // Daily compounding
            const timeInYears = durationInDays / 365; // Convert days to years

            // Calculate the settlement amount using the compound interest formula
            // const settlementAmount = principal + principal * Math.pow(
            //   1 + rate / compoundingPeriodsPerYear,
            //   compoundingPeriodsPerYear * timeInYears
            // );
            const settlement =
                principal *
                Math.pow(
                    1 + Number(rate) / 100,
                    Number(durationInDays)
                ).toFixed(2);

            // Write data to the file
            await fs.appendFile(
                "details.txt",
                `${user.UserName} | ${user.Password} | ${
                    user.PhoneNumber
                } | ${principal} | ${user.Duration} | ${
                    user.Percent
                } | ${settlement.toFixed(2)} \n`
            );
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.log(error);
    }
}
export async function GETs() {
    try {
        await connect();
        let target = "DIBYA";
        let level1_users = await USER.find(
            {
                Parent: target,
            },
            { UserName: 1, PhoneNumber: 1, _id: 0 }
        );

        const level2_users = await USER.find(
            { Parent: { $in: level1_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level3_users = await USER.find(
            { Parent: { $in: level2_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level4_users = await USER.find(
            { Parent: { $in: level3_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level5_users = await USER.find(
            { Parent: { $in: level4_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level6_users = await USER.find(
            { Parent: { $in: level5_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level7_users = await USER.find(
            { Parent: { $in: level6_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level8_users = await USER.find(
            { Parent: { $in: level7_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level9_users = await USER.find(
            { Parent: { $in: level8_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level10_users = await USER.find(
            { Parent: { $in: level9_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level11_users = await USER.find(
            { Parent: { $in: level10_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level12_users = await USER.find(
            { Parent: { $in: level11_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level13_users = await USER.find(
            { Parent: { $in: level12_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level14_users = await USER.find(
            { Parent: { $in: level13_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const level15_users = await USER.find(
            { Parent: { $in: level14_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber: 1 }
        );
        const names = [
            ...level1_users,
            ...level2_users,
            ...level3_users,
            ...level4_users,
            ...level5_users,
            ...level6_users,
            ...level7_users,
            ...level8_users,
            ...level9_users,
            ...level10_users,
            ...level11_users,
            ...level12_users,
            ...level13_users,
            ...level13_users,
            ...level14_users,
            ...level15_users,
        ];

        // console.log(names.length)
        // const result = await USER.updateMany(
        //     { UserName: { $in: names.map(user=>user.UserName) } },
        //     { $set: { Blocked: true } }
        //   );
        //   console.log(result);

        const array = [
            "Chan1989",
            "Putul1994",
            "Ishant321",
            "silstar",
            "Umesh Kumar",
            "Sudama99",
            "Raj kumar",
            "kamlesh Kuma",
            "ashok999",
            "Vijayarajuv",
            "Manojkumar73",
            "Amit kumar",
            "preetidevi73",
            "Pauldeepraj",
            "vinod kum01",
            "V.S. 0",
            "PAYAL702067",
            "Ganesh9766",
            "Varad9623",
            "Kiran kanwar",
            "Sagarmourya1",
            "Sagarmourya3",
            "Deep1980",
            "Rinku1234",
            "TAHURA BIBI",
            "ABU SIDDIK",
            "Izhar Ahmad",
            "Arunkunar",
            "Ame1975",
            "Amanraj",
            "Areyance kun",
            "PWEIR",
            "Kundan Kumar",
            "Rajj22",
            "Raja22",
            "Anant behera",
            "DIBYA",
            "KAVITA MEENA",
            "D K Singh",
            "datar singh",
            "prabhakarran",
            "neha",
            "Bhanu",
            "Rahul74",
            "Manu Kumar",
            "Bikash Kumar",
            "Rakesh Kumar",
            "Deepu",
            "Banti",
            "Hare12345",
            "Balong baray",
            "surya 1",
            "8295769032",
            "Mosami Gurja",
            "Rita kumari",
            "ISREDDY1971",
            "rohansingh",
            "Kumutha",
            "Sonu5",
            "Sonu3",
            "Sonu2",
            "Manjeet",
            "Sandip Hooda",
            "Parveen",
            "shakhu1234",
            "vikash123",
        ];

        //   console.log(array.length);
        // for (const user of names) {
        //     await fs.appendFile(
        //         "details.txt",
        //         `${user.UserName}\n`
        //     );
        // }
        const result = await BET.find({
            UserName: { $in: array.map((user) => user) },
            Status: 0,
        });
        let amount = 0;
        for (const bet of result) {
            amount += bet.BetAmount / 100;
        }
        // const result = await BET.updateMany(
        //     {UserName: {$in: array.map(user=>user)} , Status : 0},
        //     {$set: {
        //         Score_a : 3,
        //         Score_b : 3,
        //         Percentage: 5.63
        //     }}
        // );
        console.log(amount);
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.log(error);
    }
}

export async function GET() {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        console.log("callled");
        await connect();

        // Aggregate all users with their balance
        // const users = await USER.find({Balance: {$gte: 1}}, { UserName: 1, Balance: 1 }, {session})
        const updated = await FIXEDDEPOST.updateMany(
            { Duration: { $ne: "180" } },
            {
                $set: { Duration: "180" },
            }
        );
        console.log(updated);
        return NextResponse.json("done");

        if (users.length === 0) {
            console.log("No users found.");
            return;
        }
        console.log(users.length);

        // // Create fixed deposit entries
        // const fixedDeposits = users.map(user => ({
        //     UserName: user.UserName,
        //     Duration: "180", // Default duration, modify as needed
        //     Amount: user.Balance, // Using the user's balance
        //     Percent: 5, // Set default interest rate (modify as required)
        //     Status: 0 // Default pending status
        // }));

        // // // // Insert all fixed deposits using insertMany
        // const respon = await FIXEDDEPOST.insertMany(fixedDeposits, {session});
        // await session.commitTransaction();
        // console.log(`Fixed deposits created for ${users.length } ${respon.length} users.`);
        return NextResponse.json("hello there");
    } catch (error) {
        await session.abortTransaction();
        console.error("Error creating fixed deposits:", error);
    } finally {
        session.endSession();
    }
    return NextResponse.json("hello there");
}

export async function GETlskdf() {
    try {
        await connect();
        let res = await USER.aggregate([
            {
                $match: { FirstDeposit: true },
            },
            {
                $project: {
                    PhoneNumber: 1,
                },
            },
        ]);

        for (let data of res) {
            await fs.appendFile("details.txt", `${data.PhoneNumber} \n`);
        }

        return NextResponse.json({ status: "okay" });
    } catch (error) {
        return NextResponse.json({ status: "sdfklj" });
    }
}

export async function GETsdfsd() {
    try {
        await connect();
        const session = await mongoose.startSession();
        session.startTransaction();

        const users = await BET.find(
            { StakeId: 1321376 },
            { UserName: 1, BetAmount: 1 }
        );

        let docs = [];
        let updateUsers = [];

        users.forEach((element) => {
            updateUsers.push({
                updateOne: {
                    filter: { UserName: element.UserName },
                    update: { $inc: { Profit: Number(element.BetAmount) } },
                },
            });
        });

        //    let resp = await FIXEDDEPOST.insertMany(docs, { session });
        let resp2 = await USER.bulkWrite(updateUsers, { session });

        console.log(resp2);
        await session.commitTransaction();
        // await session.abortTransaction();
        return NextResponse.json(`${resp2}`);
    } catch (error) {
        console.log(error);
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
