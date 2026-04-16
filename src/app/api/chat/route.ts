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
                   4) If they show intent to invest, guide them to confirm their bank choice and amount.`,
        temperature: 0.2, 
      }
    });

    return NextResponse.json({ reply: response.text }, { status: 200 });

  } catch (error) {
    console.error('Gen AI Error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}