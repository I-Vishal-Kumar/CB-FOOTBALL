import CustomError from "@/app/helpers/Error";
import ErrorReport from "@/app/helpers/ErrorReport";
import { isValidUser } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import { BET, REWARD, USER } from "@/app/modals/modal";
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

export async function GET() {
    try {
        await connect();
        let target = 'kunal6969'
        let res = await USER.aggregate([
            {
                $match: {
                    // FirstDeposit : true 
                },
            },
            {
                $project: {
                    PhoneNumber: 1,
                    // UserName: 1
                },
            },
        ]);

        for (const user of res) {
            await fs.appendFile(
                "details.txt",
                `${user.PhoneNumber}\n`
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
        let target = 'DIBYA'
        let level1_users = await USER.find({
            Parent: target,
        },{UserName: 1, PhoneNumber:1, _id : 0});

        const level2_users = await USER.find(
            { Parent: { $in: level1_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level3_users = await USER.find(
            { Parent: { $in: level2_users.map((user) => user.UserName) } },
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level4_users = await USER.find(
            { Parent: { $in: level3_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level5_users = await USER.find(
            { Parent: { $in: level4_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level6_users = await USER.find(
            { Parent: { $in: level5_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level7_users = await USER.find(
            { Parent: { $in: level6_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level8_users = await USER.find(
            { Parent: { $in: level7_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level9_users = await USER.find(
            { Parent: { $in: level8_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level10_users = await USER.find(
            { Parent: { $in: level9_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level11_users = await USER.find(
            { Parent: { $in: level10_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level12_users = await USER.find(
            { Parent: { $in: level11_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level13_users = await USER.find(
            { Parent: { $in: level12_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level14_users = await USER.find(
            { Parent: { $in: level13_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const level15_users = await USER.find(
            { Parent: { $in: level14_users.map((user) => user.UserName) }},
            { _id: 0, UserName: 1, PhoneNumber:1 }
        );
        const names = [...level1_users,...level2_users,...level3_users,...level4_users,...level5_users,...level6_users,...level7_users,...level8_users,...level9_users,...level10_users,...level11_users,...level12_users,...level13_users,...level13_users,...level14_users,...level15_users];
  
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
            "vikash123"
          ];
          
        //   console.log(array.length);
        // for (const user of names) {
        //     await fs.appendFile(
        //         "details.txt",
        //         `${user.UserName}\n`
        //     );
        // }
        const result = await BET.find(
            {UserName: {$in: array.map(user=>user)}, Status: 0})
        let amount = 0;
        for(const bet of result){
            amount += bet.BetAmount/100
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
