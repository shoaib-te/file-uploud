import { NextResponse } from "next/server";

export function createTokenResponse() {
    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
}