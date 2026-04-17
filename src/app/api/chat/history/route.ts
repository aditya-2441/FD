import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const chat = await Chat.findOne({ userId }).lean();
    return NextResponse.json({ success: true, messages: chat?.messages ?? [] }, { status: 200 });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch chat history" }, { status: 500 });
  }
}
