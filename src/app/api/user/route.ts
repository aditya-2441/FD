import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const uid = req.nextUrl.searchParams.get("uid");
    if (!uid) {
      return NextResponse.json({ success: false, error: "uid is required" }, { status: 400 });
    }

    const user = await User.findOne({ uid }).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("User profile fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch user profile" }, { status: 500 });
  }
}
