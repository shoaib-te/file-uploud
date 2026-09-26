import { NextResponse } from "next/server";

const AUTH_COOKIE_NAMES = ["token", "app_session", "auth_token"];

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 },
  );

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, "", {
      expires: new Date(0),
      httpOnly: true,
      maxAge: 0,
      path: "/",
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}