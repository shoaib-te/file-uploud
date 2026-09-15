import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import sendMail  from "@/lib/nodemailer";


export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    // Generate a new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
   // send email
   await sendMail(email,otp)
    
    // Update the user's OTP and expiry in the database
    existingUser.otpSecret = otp;
    existingUser.otpExpiry = otpExpiry;
    await existingUser.save();

    const userPayload = {
      id: existingUser._id.toString(),
      email: existingUser.email,
    };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET as string, {
      expiresIn: "7h",
    });

    const response = NextResponse.json(
      { message: "OTP sent successfully", token },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 60 * 60, // 7 hours in seconds
    });

    return response;
  } catch (error) {
    console.error("Error in sign-in route:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
