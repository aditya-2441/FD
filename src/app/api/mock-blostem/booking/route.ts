import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Booking from '../../../../models/Booking';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { bankName, amount, tenor } = body;

    // Validate the incoming request
    if (!bankName || !amount || !tenor) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (bankName, amount, tenor)" },
        { status: 400 }
      );
    }

    // SIMULATION: Wait 2 seconds to make the loading state feel like a real banking transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a fake but realistic-looking banking reference number
    const transactionId = `BLOS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const booking = new Booking({
      userId: 'GUEST_USER',
      bankName,
      amount,
      tenor,
      transactionId,
    });

    const savedBooking = await booking.save();

    // Return the successful mock response
    return NextResponse.json({
      success: true,
      data: {
        transactionId: savedBooking.transactionId,
        status: savedBooking.status,
        bankName: savedBooking.bankName,
        amountBooked: savedBooking.amount,
        tenor: savedBooking.tenor,
        userId: savedBooking.userId,
        createdAt: savedBooking.createdAt,
        maturityDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        message: `Successfully booked ₹${savedBooking.amount} FD with ${savedBooking.bankName}.`
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