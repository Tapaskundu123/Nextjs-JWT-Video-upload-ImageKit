import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token" },
        { status: 401 }
      );
    }

    // Correctly type the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as jwt.JwtPayload;  // ✅ FIX

    if (!decoded.id) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 400 }
      );
    }

    const userData = await User.findById(decoded.id).select("-password");

    console.log(userData);
    
    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User found successfully",
      user: userData,
    });
  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
