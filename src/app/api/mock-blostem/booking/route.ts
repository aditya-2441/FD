import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bankName, amount, tenor, userId = "USR_8829" } = body;

    // Validate the incoming request
    if (!bankName || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (bankName, amount)" }, 
        { status: 400 }
      );
    }

    // SIMULATION: Wait 2 seconds to make the loading state feel like a real banking transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a fake but realistic-looking banking reference number
    const transactionId = `BLOS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Return the successful mock response
    return NextResponse.json({
      success: true,
      data: {
        transactionId,
        status: "COMPLETED",
        bankName,
        amountBooked: amount,
        tenor,
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        message: `Successfully booked ₹${amount} FD with ${bankName}.`
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Mock Booking Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Bank Server Error" }, 
      { status: 500 }
    );
  }
}