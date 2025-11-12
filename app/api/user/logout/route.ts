import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = NextResponse.json({ message: "Logout successful" });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: false, //true in production
      sameSite: "strict",
      path: "/",           // Important! clears for all routes
      expires: new Date(0) // Immediately expire
    });

    return response;
  } catch (error) {
    console.log("Logout error:", error.message);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
