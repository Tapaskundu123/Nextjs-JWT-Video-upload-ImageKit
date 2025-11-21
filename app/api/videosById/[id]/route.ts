import { connectDB } from "@/lib/mongodb";
import Video from "@/models/video.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Note the Promise
) {
  try {
    await connectDB();

    const { id } = await params; // ← MUST await here in Next.js 15+

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Video ID is required" },
        { status: 400 }
      );
    }

    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Video found", data: video },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}