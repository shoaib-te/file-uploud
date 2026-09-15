import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // 1. Access the cookie store
    const cookieStore = await cookies();

    for (const name of ["token", "app_session"]) {
      cookieStore.set({
        name,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
      });
    }

    // 3. Return a success response
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}