import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Bank from "@/models/Bank";

export async function GET() {
  try {
    await connectToDatabase();
    const banks = await Bank.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, banks }, { status: 200 });
  } catch (error) {
    console.error("Banks fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = (await req.json()) as { name?: string; interestRate?: number };

    const name = body.name?.trim();
    const interestRate = body.interestRate;

    if (!name) {
      return NextResponse.json({ success: false, error: "name is required" }, { status: 400 });
    }
    if (typeof interestRate !== "number" || Number.isNaN(interestRate)) {
      return NextResponse.json({ success: false, error: "interestRate must be a number" }, { status: 400 });
    }

    const bank = await Bank.create({ name, interestRate });
    return NextResponse.json({ success: true, bank }, { status: 201 });
  } catch (error) {
    console.error("Bank create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create bank" }, { status: 500 });
  }
}

