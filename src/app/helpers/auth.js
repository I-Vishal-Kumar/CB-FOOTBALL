import { v4 as uuid } from "uuid";
import { jwtVerify, SignJWT } from "jose";
import { USER } from "@/app/modals/modal";
import { connect } from "../modals/dbConfig";

const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET; // Replace with your secret key

export const generateToken = async (payload) => {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setJti(uuid())
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(new TextEncoder().encode(secretKey));
    return token;
};

export const isAuthenticated = async (token, sessionToken) => {
    await connect();
    try {
        const decoded = await jwtVerify(
            token,
            new TextEncoder().encode(secretKey)
        );
        if (!decoded) {
            return false;
        } else {
            let user = await USER.findOne({
                Session: sessionToken,
                UserName: decoded?.payload?.UserName || "",
            });
            if (!user || user?.Blocked) {
                return false;
            }
            return decoded?.payload?.UserName;
        }
    } catch (error) {
        // console.log(error);
        return false;
    }
};

export const verifyToken = async (token) => {
    try {
        const decoded = await jwtVerify(
            token,
            new TextEncoder().encode(secretKey)
        );
        return { success: true, decoded: decoded?.payload || "" };
    } catch (error) {
        console.log(error);
        return { success: false, error: "Invalid token" };
    }
};

export async function isValidUser(token, session) {
    const UserName = await isAuthenticated(token, session);
    if (!UserName) return false;
    return UserName;
}

// module.exports = { generateToken, verifyToken, isAuthenticated, isValidUser };

export const config = {
    runtime: "edge", // for Edge API Routes only
    unstable_allowDynamic: [
        // allows a single file
        "/src/app/modals/modal.js",
        "/src/app/helpers/auth.js",
        "/node_modules/function-bind/**",
        "/node_modules/jose/dist/**",
        // use a glob to allow anything in the function-bind 3rd party module
        "/node_modules/mongoose/dist/browser.umd.js",
    ],
};
