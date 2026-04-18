# Blostem | AI-Native Vernacular Financial Advisor

Blostem is a **full-stack, AI-driven fintech platform** built for a hackathon to make fixed-deposit discovery and booking **simple, trustworthy, and vernacular-first**. It combines a production-style admin console, dynamic AI grounding from MongoDB, and a chat UX with native speech playback—designed to reduce hallucinations and increase user confidence in financial decisions.

## Key Features

- 🧠 **Vernacular AI Engine**: Powered by **Gemini 2.5 Pro**, capable of conversing naturally in **English, Hindi, Marathi, and Bengali**, while extracting **structured JSON booking intents**.
- 🔊 **Native Text-to-Speech**: Integrated **Web Speech API** for native regional voice playback of AI responses.
- 🔐 **Secure Authentication**: **Firebase Phone Auth** with invisible reCAPTCHA and **MongoDB user persistence**.
- 🧩 **Dynamic AI Grounding**: An **Admin Bank Settings** database dynamically updates the AI’s system instructions in real-time, **preventing hallucinations** and enforcing supported-bank constraints.
- 📈 **Executive Admin Dashboard**: Live KPIs, **batch CSV exports**, CRM drill-downs, and a **Gemini-powered “AI Strategy Insights”** report generator.
- 🧾 **User Portfolios**: Dedicated user profile pages with automated, branded **PDF receipt generation** for booked Fixed Deposits.

## Tech Stack

| Layer | Tech |
|------|------|
| **Frontend** | Next.js (App Router), Tailwind CSS, Lucide Icons |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | MongoDB (Mongoose) |
| **AI & LLM** | Google Cloud Vertex AI (Gemini 2.5 Pro) |
| **Auth** | Firebase Authentication |
| **PDF Generation** | jsPDF (+ `jspdf-autotable`) |

## Getting Started

### Installation

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file in the project root with the following keys:

```bash
# Database
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Vertex AI / Gemini
GCP_PROJECT_ID="your-gcp-project-id"
GCP_LOCATION="us-central1"
GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
```

Notes:
- **`GOOGLE_APPLICATION_CREDENTIALS`** should point to a valid Google Cloud service account JSON file with permission to access Vertex AI.
- The Admin AI endpoints rely on **Vertex AI** credentials being available at runtime.

## Project Architecture (The “Flex” Section)

Blostem’s core reliability pattern is **Dynamic Database Grounding**: supported bank names and FD rates live in MongoDB and are fetched at request time by the chat API. This means that updating bank rates in the Admin Settings UI **immediately updates the AI’s allowed bank list and the rates used for maturity calculations**—without redeploying code. The result is a tighter “AI + data” feedback loop that reduces hallucinations, enforces policy constraints, and keeps outputs aligned with real system configuration.

## Developed By

**Aditya Singh**
