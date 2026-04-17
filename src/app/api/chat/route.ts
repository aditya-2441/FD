import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function POST(req: NextRequest) {
  try {
    const { message, language, userId, history = [] } = await req.json();

    if (!message || !language || !userId) {
      return NextResponse.json({ error: 'Message, language, and userId are required' }, { status: 400 });
    }

    const baseUrl = req.nextUrl.origin;
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;

    console.log("--- DEBUG ENV VARS ---");
    console.log("Project ID:", projectId);
    console.log("Location:", location);
    console.log("Credentials Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log("----------------------");

    if (!projectId || !location) {
      return NextResponse.json({ error: 'Server config missing Project ID or Location' }, { status: 500 });
    }

    // 2. Initialize the AI
const ai = new GoogleGenAI({
      vertexai: true,
      project: process.env.GCP_PROJECT_ID as string,
      location: process.env.GCP_LOCATION as string,
    });

    // Clean up the history array
    const sanitizedHistory = Array.isArray(history)
      ? history
          .filter(
            (entry): entry is { role: 'user' | 'assistant'; content: string } =>
              (entry?.role === 'user' || entry?.role === 'assistant') &&
              typeof entry?.content === 'string'
          )
          .map((entry) => ({ role: entry.role, content: entry.content }))
      : [];

    // Convert history into the exact format Gemini expects
    const geminiContents = sanitizedHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: geminiContents,
      config: {
        systemInstruction: `You are a Blostem Financial Advisor. Current FD Rates: Suryoday (8.5%), Axis Bank (7.1%), HDFC (7.0%). When a user asks about an FD, calculate the estimated maturity amount (using standard annual compound interest) and explain it conversationally in ${language}. If the user confirms they want to book, you must return ONLY a raw JSON object matching this schema using the ACTUAL details from the conversation: { "booking_intent": true, "bankName": "<Bank they chose>", "amount": <number requested>, "tenor": "<tenor requested>", "interestRate": <rate for that bank>, "maturityAmount": <calculated number> }. Do NOT include any conversational text, pleasantries, or markdown formatting before or after the JSON.`,
        temperature: 0.2, 
      }
    });

const aiText = response.text ?? '';
    let finalReply = aiText;

    // 1. Define the exact shape of the data safely
    interface BookingIntent {
      booking_intent?: boolean;
      bankName?: string;
      amount?: number;
      tenor?: string;
      interestRate?: number;
      maturityAmount?: number;
    }

    // 2. Apply it to the variable
    let parsedData: BookingIntent | null = null;

    try {
      const startIndex = aiText.indexOf('{');
      const endIndex = aiText.lastIndexOf('}');

      if (startIndex !== -1 && endIndex !== -1) {
        const extractedJson = aiText.substring(startIndex, endIndex + 1);
        // 3. Cast the parsed JSON directly to the interface
        parsedData = JSON.parse(extractedJson) as BookingIntent;
      }
    } catch (error) {
      console.error('Failed to parse AI JSON:', error);
    }

    try {
      if (parsedData && parsedData.booking_intent === true) {
        const bookingResponse = await fetch(`${baseUrl}/api/mock-blostem/booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bankName: parsedData.bankName,
            amount: parsedData.amount,
            tenor: parsedData.tenor,
            interestRate: parsedData.interestRate,
            maturityAmount: parsedData.maturityAmount,
            userId,
          }),
        });

        const bookingResult = await bookingResponse.json();

        if (!bookingResponse.ok || !bookingResult?.success) {
          throw new Error('Booking API request failed');
        }

        const bookingData = bookingResult.data;
        finalReply = `🎉 **Booking Successful!**\n\n**Bank:** ${bookingData.bankName}\n**Amount:** ₹${bookingData.amountBooked}\n**Tenor:** ${bookingData.tenor}\n**Interest Rate:** ${bookingData.interestRate}%\n**Maturity Amount:** ₹${bookingData.maturityAmount}\n**Transaction ID:** ${bookingData.transactionId}\n\nYour FD has been securely saved to our database. Is there anything else I can help you with?`;
      }
    } catch {
      // If booking flow fails, treat it as regular conversational text.
    }

    const updatedMessagesArray = [
      ...sanitizedHistory,
      { role: 'assistant' as const, content: finalReply },
    ];

    await connectToDatabase();
    await Chat.findOneAndUpdate(
      { userId },
      { $set: { messages: updatedMessagesArray, updatedAt: Date.now() } },
      { upsert: true }
    );

    return NextResponse.json({ reply: finalReply }, { status: 200 });

  } catch (error) {
    console.error('Gen AI Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}