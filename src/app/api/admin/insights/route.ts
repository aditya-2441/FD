import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import connectToDatabase from "@/lib/mongodb";
import Booking from "@/models/Booking";

// Add this helper to ensure the JSON is valid before passing it to the SDK
const getGcpCredentials = () => {
  try {
    const rawJson = process.env.GCP_CREDENTIALS_JSON;
    if (!rawJson) throw new Error("GCP_CREDENTIALS_JSON is missing");
    return JSON.parse(rawJson);
  } catch (error) {
    console.error("Failed to parse GCP Credentials:", error);
    return null;
  }
};

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find().lean();

    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION;

    if (!projectId || !location) {
      return NextResponse.json(
        { success: false, error: "Server config missing Project ID or Location" },
        { status: 500 }
      );
    }

    const credentials = getGcpCredentials();
    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location,
      ...(credentials
        ? {
            googleAuthOptions: {
              credentials,
            },
          }
        : {}),
    });

    const prompt = `You are a Chief Financial Officer analyzing Blostem's recent FD bookings. Here is the JSON data: ${JSON.stringify(
      bookings
    )}. Provide a 3-bullet-point strategic insight report highlighting trends, popular banks, or user behavior. Keep it professional, concise, and actionable. Output the 3 bullet points using strict HTML <ul> and <li> tags. Add <strong> tags for emphasis. Do not use markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.2 },
    });

    return NextResponse.json(
      { success: true, insight: response.text ?? "" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin insights error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

