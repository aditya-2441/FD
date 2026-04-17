import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { message, language } = await req.json();

    if (!message || !language) {
      return NextResponse.json({ error: 'Message and language are required' }, { status: 400 });
    }

    // 1. Fetch the live financial data from your Blostem Mock API
    // (Using req.nextUrl.origin ensures it works dynamically on localhost and in production)
    const baseUrl = req.nextUrl.origin;
    const ratesResponse = await fetch(`${baseUrl}/api/mock-blostem`);
    const ratesData = await ratesResponse.json();
    
    // Convert the rates into a readable string for the AI
    const liveRatesContext = JSON.stringify(ratesData.data);
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

    // 3. Inject the data into the System Prompt
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: message,
      config: {
        systemInstruction: `You are a friendly, patient financial advisor for rural Indian users. 
                   The user is asking about Fixed Deposits (FDs). 
                   
                   CURRENT LIVE FD RATES (Use these if asked):
                   ${liveRatesContext}

                   Your goals: 
                   1) Translate your response into ${language}. 
                   2) Simplify ALL financial jargon (e.g., explain '12M tenor' as 'kept safely for 1 year'). 
                   3) Keep answers conversational and concise (2-3 sentences max). 
                   4) If they show intent to invest, guide them to confirm their bank choice and amount.
                   5) If the user explicitly confirms they want to book or invest in an FD, you must ONLY return a raw JSON object with no markdown, exactly like this: { "booking_intent": true, "bankName": "Suryoday", "amount": 10000, "tenor": "1 year" }. Otherwise, respond conversationally as a helpful advisor.`,
        temperature: 0.2, 
      }
    });

    const aiText = response.text ?? '';
    const cleanJsonString = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleanJsonString) as {
        booking_intent?: boolean;
        bankName?: string;
        amount?: number;
        tenor?: string;
      };

      if (parsed.booking_intent === true) {
        const bookingResponse = await fetch(`${baseUrl}/api/mock-blostem/booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bankName: parsed.bankName,
            amount: parsed.amount,
            tenor: parsed.tenor,
          }),
        });

        const bookingResult = await bookingResponse.json();

        if (!bookingResponse.ok || !bookingResult?.success) {
          throw new Error('Booking API request failed');
        }

        const bookingData = bookingResult.data;
        const receipt = `🎉 **Booking Successful!**\n\n**Bank:** ${bookingData.bankName}\n**Amount:** ₹${bookingData.amountBooked}\n**Tenor:** ${bookingData.tenor}\n**Transaction ID:** ${bookingData.transactionId}\n\nYour FD has been securely saved to our database. Is there anything else I can help you with?`;

        return NextResponse.json({ reply: receipt }, { status: 200 });
      }
    } catch {
      // If parsing fails, treat it as regular conversational text.
    }

    return NextResponse.json({ reply: aiText }, { status: 200 });

  } catch (error) {
    console.error('Gen AI Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}