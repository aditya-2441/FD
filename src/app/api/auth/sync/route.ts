import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { uid, name, email, phone } = await req.json();

    if (!uid || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "uid, name, email, and phone are required" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { uid },
      { uid, name, email, phone },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync user" }, { status: 500 });
  }
}
