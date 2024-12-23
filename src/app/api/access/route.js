const oneDay = 24 * 60 * 60 * 1000;
const oneMinute = 60 * 1000;
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { USER, BET } from "@/app/modals/modal";
import { redirect } from "next/navigation";
import { generateToken, verifyToken } from "@/app/helpers/auth";
import { connect } from "@/app/modals/dbConfig";
import CustomError from "@/app/helpers/Error";
import crypto from "crypto";
import ErrorReport from "@/app/helpers/ErrorReport";

// 200 -> Everything went fine
// 700 -> something went wrong with data sent by the client;
// 703 -> database issue;
// 705 -> server got crashed;

// post request will handle the login functionality
export async function POST(NextRequest) {
    await connect();
    try {
        let { UserName, Password } = await NextRequest.json();
        if (!UserName || !Password)
            throw new CustomError(700, "Username or password is missing", {});
        UserName = UserName.trim();
        let res = await USER.findOne({ UserName });
        if (!res) throw new CustomError(700, "User not found.", {});
        if (res?.Blocked)
            throw new CustomError(705, "You have been blocked", {});
        else if (Password !== res.Password)
            throw new CustomError(700, "Invalid Password!", {});

        const sessionToken = await generateSessionToken();
        const token = await generateToken({
            UserName,
            InvitationCode: res.InvitationCode,
        });
        let isUpdated = await USER.findOneAndUpdate(
            { UserName },
            { Session: sessionToken },
            { new: true }
        );
        const response = NextResponse.json({
            status: 200,
            message: "logged in",
        });

        cookies().set("token", `${token}`, {
            httpOnly: true,
            expires: Date.now() + oneDay,
            secure: true,
        });
        cookies().set("session", `${sessionToken}`, {
            httpOnly: true,
            expires: Date.now() + oneDay,
            secure: true,
        });
        return response;
    } catch (error) {
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "something went wrong",
        });
    }
}

// CREATE request will handle the signup functionality;
export async function PUT(NextRequest) {
    try {
        await connect();
        // get data from client side
        let {
            UserName,
            Phone,
            Email,
            ConfPassword,
            isInternational,
            Password,
            Invitation,
        } = await NextRequest.json();

        Phone = Phone.slice(2);
        UserName = UserName.trim();
        Password = Password.trim();
        // if the user has a invitation code check for its parent ;
        let parentExists;
        if (Invitation) {
            parentExists = await USER.findOne({ InvitationCode: Invitation });
            if (!parentExists)
                throw new CustomError(700, "Invalid Invitation code", {});
        }

        let userName = await USER.findOne({ UserName });
        let phone = await USER.findOne({ PhoneNumber: Phone });

        if (userName) throw new CustomError(700, "user name already exists");
        if (phone) throw new CustomError(700, "phone number already exists");

        if (Email) {
            let emailExists = await USER.findOne({ EmailId: Email });
            if (emailExists)
                throw new CustomError(700, "Email id already exists", {});
        }
        const sessionToken = await generateSessionToken();
        const token = generateToken({ UserName, session: sessionToken });
        let today = new Date(
            new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" })
        );
        let newUser = {
            Session: sessionToken,
            UserName,
            PhoneNumber: Phone,
            EmailId: Email,
            Password,
            International: isInternational ? true : false,
            Avatar: Math.floor(Math.random() * 10 + 1),
            JoinedOn: `${today.getDate()}/${
                today?.getMonth() + 1
            }/${today.getFullYear()}`,
            ParentInv: Invitation === "" ? 0 : Invitation,
            InvitationCode: await generateInvitationCode(),
            Parent: parentExists?.UserName || "",
        };

        let isCreated = await USER.create(newUser);
        if (!isCreated)
            throw new CustomError(
                703,
                "something went wrong while creating the user please try again after some time",
                {}
            );
        const response = NextResponse.json({
            status: 200,
            message: "user created",
        });
        cookies().set("token", `${token}`, {
            httpOnly: true,
            expires: Date.now() + oneDay,
            secure: true,
        });
        cookies().set("session", `${sessionToken}`, {
            httpOnly: true,
            expires: Date.now() + oneDay,
            secure: true,
        });

        return response;
    } catch (error) {
        return NextResponse.json({
            status: error?.status || error?.code || 500,
            message: error?.message || "something went wrong",
        });
    }
}

async function updateParent(inviteId) {
    try {
        let isUpdated = await USER.findOneAndUpdate(
            { InvitationCode: inviteId },
            {
                $inc: {
                    Members: 1,
                },
            }
        );
        if (!isUpdated)
            throw new CustomError(703, "Error while updating the parent", {});
    } catch (error) {
        throw new CustomError(703, "Something went wrong", {});
    }
}

async function generateSessionToken() {
    return crypto.randomBytes(64).toString("hex");
}

async function generateInvitationCode() {
    const min = 99999; // Maximum 5-digit number
    const max = 999999; // Maximum 6-digit number
    const randomBuffer = crypto.randomBytes(4); // Generate 4 random bytes
    const randomNumber = Math.floor(
        min + (randomBuffer.readUInt32BE() % (max - min + 1))
    ); // Convert the random bytes to a number between min and max
    return randomNumber;
}

// export async function GET() {
//   try {
//     let inv = [2348998, 13123];

//     let today = new Date();
//     await connect();
//     let id = [
//       {
//         user: "dragon6",
//         parent: 13123,
//         inv: 34074,
//       },
//       {
//         user: "dragon5",
//         parent: 92296,
//         inv: 59968,
//       },
//       {
//         user: "dragon4",
//         parent: 92296,
//         inv: 17646,
//       },
//       {
//         user: "dragon3",
//         parent: 2348998,
//         inv: 17646,
//       },
//       {
//         user: "dragon2",
//         parent: 45784,
//         inv: 13123,
//       },
//       {
//         user: "dragon1",
//         parent: 2348998,
//         inv: 13123,
//       },
//     ];
//     // for (let i = 0; i < 6; i++) {
//     //   let invitation = await generateInvitationCode();
//     //   let newUser = {
//     //     Session: "dl",
//     //     UserName: `dragon${i + 1}`,
//     //     PhoneNumber: Math.random() * 1000000000,
//     //     Password: "123",
//     //     International: false,
//     //     Avatar: Math.floor(Math.random() * 11 + 1),
//     //     JoinedOn: `${today.getDate()}/${
//     //       today?.getMonth() + 1
//     //     }/${today.getFullYear()}`,
//     //     ParentInv: inv[Math.floor(Math.random() * inv.length)],
//     //     InvitationCode: invitation,
//     //     Parent: `${Math.random() * 10}`,
//     //   };

//     //   let isCreated = await USER.create(newUser);
//     //   if (isCreated) {
//     //     console.log(true);
//     //     inv.push(invitation);
//     //   }
//     // }
//     for (let i = 0; i < 6; i++) {
//       const newBet = await BET.create({
//         StakeId: 1164326,
//         Team_a: "viking",
//         Team_b: "sarpsborg 08 FF",
//         BetAmount: 100000,
//         LeagueName: "Eliteserien",
//         StartsAt: "2024-04-01T17:15:00+00:00",
//         Team_a_logo: "https://media.api-sports.io/football/teams/759.png",
//         Team_b_logo: "https://media.api-sports.io/football/teams/333.png",
//         Score_a: 4,
//         Score_b: 4,
//         Percentage: 3.95,
//         Parent: id[i]?.parent,
//         UserName: id[i]?.user,
//         InvitationCode: id[i]?.inv,
//         Remark: "Pending",
//       });
//       if (newBet) {
//         console.log(true);
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

//    dragon1             dragon3
//     |    \             |
// dragon6  dragon2    dragon 4
//                       |
//                       dragon5
