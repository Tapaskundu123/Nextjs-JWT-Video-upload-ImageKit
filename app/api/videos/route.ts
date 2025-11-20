// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Video } from "@/models/video.model";
import jwt from "jsonwebtoken";
import { z } from "zod";

// ======================
// Zod Validation Schema
// ======================
const videoCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  videoUrl: z.string().url("Invalid video URL"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  transformation: z.object({
    height: z.number().int().positive(),
    width: z.number().int().positive(),
    quality: z.number().int().min(1).max(100).optional(),
  }),
});

// ======================
// Helper: Get & Verify JWT using JWT_SECRET_KEY
// ======================
function getVerifiedUserId(token: string | undefined) {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { id: string };
    return decoded.id;
  } catch (error) {
    console.log("JWT Verification Failed:", error);
    return null;
  }
}

// ======================
// GET: Fetch All Videos
// ======================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const userId = getVerifiedUserId(token);

    const query = userId ? { userId } : {}; // Show only user's videos if logged in

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v");

    return NextResponse.json(
      {
        success: true,
        count: videos.length,
        data: videos,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/videos error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

// ======================
// POST: Create New Video (Protected)
// ======================
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized – No token provided" },
        { status: 401 }
      );
    }

    const userId = getVerifiedUserId(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    const parsed = videoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data",
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { title, description, videoUrl, thumbnailUrl, transformation } = parsed.data;

    // Prevent duplicates
    const existing = await Video.findOne({ videoUrl });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "This video has already been uploaded" },
        { status: 409 }
      );
    }

    // Save video with userId
    const newVideo = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      transformation,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video uploaded and saved successfully!",
        data: newVideo,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/videos error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate video detected" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}