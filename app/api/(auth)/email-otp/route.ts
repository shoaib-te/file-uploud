import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Define a type for your decoded JWT payload
interface JwtPayload {
    id: string;
    email: string;
}

export async function POST(req: Request) {
    try {
        // 1. Establish database connection
        await dbConnect();

        // 2. Read and verify the incoming "auth_token" cookie
        const cookieStore = await cookies();
        const incomingCookie = cookieStore.get("token")?.value;

        if (!incomingCookie) {
            return NextResponse.json({ error: "Unauthorized: Missing authentication token" }, { status: 401 });
        }

        // Verify the JWT (Corrected argument order: token first, then secret)
        const decoded = jwt.verify(incomingCookie, process.env.JWT_SECRET as string) as JwtPayload;

        if (!decoded || !decoded.email) {
            return NextResponse.json({ error: "Unauthorized: Invalid token payload" }, { status: 401 });
        }

        // 3. Parse request body for the OTP
        const { otp } = await req.json();

        if (!otp) {
            return NextResponse.json({ error: "OTP is required" }, { status: 400 });
        }

        // 4. Find the user using the email extracted from the secure cookie
        // (Corrected Mongoose syntax to pass an object)
        const user = await User.findOne({ email: decoded.email });

        if (!user || user.otpSecret !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            return NextResponse.json(
                { error: "Authentication processing failed: Invalid or expired OTP." }, 
                { status: 401 }
            );
        }

        // 5. Clear OTP fields now that authentication succeeded
        user.otpSecret = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // 6. Generate the new session JWT token (Renamed variable to avoid conflict)
        const sessionToken = jwt.sign(
            { id: user._id.toString(), email: user.email }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: "7d" }
        );

        // 7. Build the Next.js Response object
        const response = NextResponse.json(
            { success: true, message: "Authentication successful", user }, 
            { status: 200 }
        );

        // 8. Issue the new HTTP-Only cookie 
        response.cookies.set("app_session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });

        return response;

    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        
        // Handle explicit JWT expiration/malformed errors gracefully
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return NextResponse.json({ error: "Unauthorized: Token is invalid or expired" }, { status: 401 });
        }

        return NextResponse.json(
            { error: error.message || "Internal Server Error" }, 
            { status: 500 }
        );
    }
}
