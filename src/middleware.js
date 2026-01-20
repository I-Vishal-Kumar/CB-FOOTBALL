import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET;

export async function middleware(NextRequest) {

    const { pathname } = NextRequest.nextUrl;

    const isPublic =
        pathname.startsWith("/access") ||
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api");
    if (isPublic) return NextResponse.next();

    const token = NextRequest?.cookies?.get("token")?.value || "";
    if (!token || token === "")
        return NextResponse.redirect(
            new URL("/access/signup", NextRequest.nextUrl)
        );
    const isValidToken = await verifyToken(token);
    if (!isPublic && !isValidToken?.success) {
        return NextResponse.redirect(
            new URL("/access/login", NextRequest.nextUrl)
        );
    }

    // const response = NextResponse.next();
    // return response;
}

export const config = {
    matcher: [
        "/",
        "/profile/:path*",
        "/stake/:path*",
        "/recharge/:path*",
        "/matches/:path*",
    ],
};

async function verifyToken(token) {
    try {
        const decoded = await jwtVerify(
            token,
            new TextEncoder().encode(secretKey)
        );
        // const decoded = await jwtVerify(token, `${secretKey}`);
        return { success: true, decoded: decoded?.payload || "" };
    } catch (error) {
        console.log(error);
        return { success: false, error: "Invalid token" };
    }
}
