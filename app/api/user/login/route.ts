import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }
    const tokenData=  {
        id: user._id,
        email:user.email,
        password:user.password
    }

    const token= await jwt.sign({tokenData},process.env.JWT_SECRET_KEY!,{
                  expiresIn:'1d'  //options
    })

    const response= NextResponse.json({ success: true, message: "Login successful" },
      { status: 200 })


      response.cookies.set('token',token,{httpOnly:false});

      return response;
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
