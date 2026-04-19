<div align="center">

# Blostem | AI-Native Vernacular Financial Advisor

**Full-stack, AI-driven fintech for rural banking** — voice-first guidance and vernacular conversation that close the financial literacy gap around fixed deposits, without asking users to decode jargon or navigate dense product pages.

[**Live MVP**](https://fd-4b1i.vercel.app)

</div>

---

> **CRITICAL — Browser requirement**  
> To experience **high-quality, native regional Text-to-Speech** (Hindi, Marathi, Bengali), this application **must** be tested on **Google Chrome**. Other browsers may fall back to **robotic default system voices**.

---

## At a glance

| | |
| --- | --- |
| **What it is** | An AI-native advisor that chats in the user’s language, speaks answers aloud, and grounds recommendations in **live bank / FD data** from your database. |
| **Who it’s for** | Rural and semi-urban banking contexts where **trust, clarity, and voice** matter as much as the numbers. |
| **Live demo** | [fd-4b1i.vercel.app](https://fd-4b1i.vercel.app) — use **Chrome** for regional TTS. |

---

## Testing the Admin Dashboard

The demo admin persona is **Palak Singh**. Use the credentials below only in **test / staging** environments.

| Field | Value |
| --- | --- |
| **Admin phone number** | `1234567890` |
| **Mock OTP** | `123456` |

After sign-in, open the secure **`/admin`** route to access the executive console (see [Admin flow](#admin-flow)).

---

## How it works

### User flow

1. **Language** — From the header, choose **English, Hindi, Marathi, or Bengali** so the AI replies in the right register and vocabulary.
2. **Chat & recommendations** — Ask about amounts, tenure, or banks; the assistant suggests suitable **fixed deposits** and walks the user toward a clear decision.
3. **Listen** — Use the **volume** control on AI messages to hear the response with **native TTS** (Chrome + Web Speech API).
4. **Book** — Confirm a booking in the chat flow when you are ready to proceed.
5. **Portfolio & receipts** — Open the **Profile** icon to see the investment portfolio and **download branded PDF receipts** for booked deposits.

### Admin flow

1. **Sign in** — Use [Testing the Admin Dashboard](#testing-the-admin-dashboard) credentials, then navigate to **`/admin`**.
2. **Executive dashboard** — Monitor **live KPIs**, drill into activity, and use **CSV exports** for reporting.
3. **AI Strategy Insights** — Run the **Gemini-powered** insight generator for narrative, data-aware summaries and strategic angles.
4. **Bank Settings** — Edit **FD rates and bank configuration** in one place; updates **instantly ground** the AI’s math and eligibility logic so numbers stay aligned with policy.

---

## Key features

- **Vernacular AI engine** — **Gemini 2.5 Pro** (via Google GenAI on **Vertex AI**) for multilingual, concise, jargon-light answers.
- **Native text-to-speech** — **Web Speech API** for on-device playback; optimized experience in **Chrome** for regional voices.
- **Secure authentication** — **Firebase** phone auth with **invisible reCAPTCHA** and user records in **MongoDB**.
- **Dynamic database grounding** — FD rates and bank rules live in **MongoDB**; admin edits propagate to the model context so the AI does not “invent” rates.

---

## Tech stack

| Area | Technology |
| --- | --- |
| **App & UI** | **Next.js** (App Router), **React**, **Tailwind CSS** |
| **APIs** | **Next.js** route handlers, **Node.js** |
| **Data** | **MongoDB** with **Mongoose** |
| **AI** | **Google Cloud Vertex AI** / **Google GenAI** (`@google/genai`), **Gemini 2.5 Pro** |
| **Auth** | **Firebase Authentication** |
| **Documents** | **jsPDF** + **jspdf-autotable** (branded receipts) |

---

## Local setup

### Prerequisites

- **Node.js** (LTS recommended) and **npm**
- **MongoDB** connection string
- **Firebase** project with Phone Authentication enabled
- **Google Cloud** project with **Vertex AI** enabled and a **service account** that can call the Generative Language API on Vertex

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Google Chrome** when testing speech.

### Environment variables

Create **`.env.local`** in the project root. This codebase authenticates to Gemini through **Vertex AI** (project + credentials). A standalone **`GEMINI_API_KEY` is not used** in the current implementation.

```bash
# Database
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority"

# Firebase (client) — from Firebase console
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Vertex AI / Gemini (server)
GCP_PROJECT_ID="your-gcp-project-id"
GCP_LOCATION="us-central1"

# Preferred on Vercel / CI: paste the full service account JSON as a single line
GCP_CREDENTIALS_JSON='{"type":"service_account",...}'

# Alternative for local dev: path to the service account file (if your runtime loads ADC this way)
# GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"

# Optional — defaults to gemini-2.5-pro
# GEMINI_MODEL="gemini-2.5-pro"
```

**Notes**

- **`GCP_CREDENTIALS_JSON`** is parsed in server code (`src/lib/gemini.ts`, API routes). Ensure the JSON is valid and the account has **Vertex AI User** (or equivalent) access.
- **`GOOGLE_APPLICATION_CREDENTIALS`** may still be referenced in some paths for local debugging; align with how you deploy (file path vs. inline JSON).

---

<div align="center">

**Blostem** — clearer money conversations, in the languages people already speak.

</div>
