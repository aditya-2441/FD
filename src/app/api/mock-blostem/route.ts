import { NextResponse } from "next/server";
import type { ApiErrorResponse, CreateFDRequest, CreateFDResponse, FDRatesResponse } from "@/types/api";

const MOCK_RATES: FDRatesResponse["data"] = [
  { bankName: "Suryoday Small Finance Bank", rate: 8.5, tenor: "12M" },
  { bankName: "Utkarsh Small Finance Bank", rate: 8.25, tenor: "12M" },
  { bankName: "State Bank of India", rate: 6.8, tenor: "12M" },
];

export async function GET() {
  const response: FDRatesResponse = {
    success: true,
    data: MOCK_RATES,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(response, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateFDRequest>;

    if (!body.amount || !body.bankName || !body.tenor) {
      const error: ApiErrorResponse = {
        success: false,
        error: "Please provide amount, bankName, and tenor.",
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: CreateFDResponse = {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message: "FD booking created successfully.",
      createdAt: new Date().toISOString(),
      data: {
        amount: body.amount,
        bankName: body.bankName,
        tenor: body.tenor,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    const error: ApiErrorResponse = {
      success: false,
      error: "Invalid request body.",
    };
    return NextResponse.json(error, { status: 400 });
  }
}
