# 🔬 ExamLens AI — The Future of Exam Intelligence

<div align="center">

![ExamLens AI Banner](https://img.shields.io/badge/ExamLens%20AI-Production%20Ready-6366f1?style=for-the-badge&logo=sparkles&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini%201.5%20Flash-AI%20Engine-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**The only AI platform that decodes exam patterns, ranks high-yield topics, and generates a personalized study plan — all from your past papers.**

</div>

---

## 👨‍💻 Founded & Developed by Abhijeet Kangane

> *"Every student deserves to know what truly matters in their exam — not from luck, but from data."*
>
> — **Abhijeet Kangane**, Founder & Developer

ExamLens AI is a **solo-founded, production-grade SaaS product** conceived and built by **Abhijeet Kangane**. It was created out of a frustration with ineffective, broad-spectrum studying, and a belief that AI could finally give every student the same strategic edge that elite coaching centres charge thousands for.

---

## 📌 Project Overview

**ExamLens AI** is a B2C/B2B SaaS platform that uses Google's Gemini 1.5 Flash AI to perform deep analysis on historical exam papers (PDFs). It identifies recurring topic patterns, maps their frequency across years, ranks them by priority, and generates an actionable, data-driven study planner.

### The Core Problem It Solves
Students waste hours studying low-probability topics while high-yield topics — the ones that repeatedly appear on exams — go unnoticed. ExamLens AI solves this by turning historical exam data into a clear, ranked study strategy.

---

## ✨ Key Features

### 🤖 AI-Powered Paper Analysis
- Upload any past exam paper as a **PDF**
- **Gemini 1.5 Flash** extracts and processes all educational topics
- Calculates **topic frequency** (how many times each topic was tested)
- Assigns a **weightage percentage** based on historical occurrence
- Results saved securely to your profile for future reference

### 📊 Interactive Data Visualization
- **Topic Frequency Bar Chart** — visualize which topics dominate past papers
- **Topic Weightage Donut Chart** — see proportional distribution at a glance
- Built with **Recharts** for a smooth, responsive charting experience

### 📅 Smart Prioritized Study Planner
- Topics automatically ranked from **Critical Focus → High Priority → Standard**
- See exactly how many times each topic appeared and its % weight
- Color-coded priority system for instant visual clarity

### 💬 Chat with ExamLens AI (AI Tutor)
- Powered by **Gemini 1.5 Flash** with streaming responses
- Ask anything about your exam topics, study strategy, or priorities
- AI maintains full context of your uploaded papers and analysis
- Real-time streaming via **Vercel AI SDK**

### 🔐 Secure Authentication
- **Google OAuth** one-click sign-in
- **Email/Password** registration with confirmation flow
- Protected routes via **Next.js Middleware**
- **Row-Level Security (RLS)** — each user can only access their own data

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) | Full-stack React framework |
| **Language** | TypeScript | Type-safe codebase |
| **Styling** | Tailwind CSS | Utility-first dark theme |
| **Icons** | Lucide React | Clean icon library |
| **Charts** | Recharts | Data visualization |
| **Database** | Supabase (PostgreSQL) | Data persistence + RLS |
| **Auth** | Supabase Auth | OAuth + Email auth |
| **Storage** | Supabase Storage | PDF file hosting |
| **AI Engine** | Google Gemini 1.5 Flash | Exam analysis + tutoring |
| **AI Streaming** | Vercel AI SDK | Streaming chat responses |
| **PDF Parsing** | pdf-parse | Text extraction from PDFs |
| **Deployment** | Vercel | Edge-optimized hosting |

---

## 📦 Installation

### Prerequisites
- Node.js **18.x** or later
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini 1.5 Flash)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/examlens-ai.git
cd examlens-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase — get from https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini — get from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never commit `.env.local` to version control.** It is already in `.gitignore`.

### 4. Set Up the Database

Run the SQL schema against your Supabase project. Go to your Supabase dashboard → **SQL Editor** and execute the contents of `supabase_schema.sql`:

```bash
# The schema creates:
# - public.users table with RLS
# - public.papers table with RLS
# - Storage bucket 'papers'
# - Auth trigger to auto-create user profiles
```

### 5. Create Supabase Storage Bucket

In your Supabase Dashboard → **Storage**, create a bucket named `papers` and set it to **Public**.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ API Configuration

### Gemini AI (Google)
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create a new API key
3. Add it to `.env.local` as `GEMINI_API_KEY`

The platform uses `gemini-1.5-flash` for both analysis and chat due to its speed and accuracy for structured JSON extraction.

### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Navigate to **Settings → API**
3. Copy your **Project URL** and **anon/public** key
4. Add both to `.env.local`

### Google OAuth (Optional)
1. Go to Supabase Dashboard → **Authentication → Providers → Google**
2. Follow the setup guide to configure your Google Cloud OAuth credentials
3. Add the redirect URL to your Google Cloud Console

---

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy — Vercel will automatically build and deploy

### Anti-Pause Cron Job
The `vercel.json` includes a **cron job** that pings `/api/keep-alive` every 48 hours to prevent the Supabase free tier from pausing due to inactivity:

```json
{
  "crons": [
    {
      "path": "/api/keep-alive",
      "schedule": "0 0 */2 * *"
    }
  ]
}
```

---

## 📁 Project Structure

```
examlens-ai/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts     # PDF ingestion & Gemini analysis
│   │   ├── chat/route.ts        # AI tutor streaming endpoint
│   │   └── keep-alive/route.ts  # Supabase anti-pause ping
│   ├── dashboard/page.tsx       # Main dashboard UI
│   ├── login/page.tsx           # Auth page (login + signup)
│   ├── layout.tsx               # Root layout with Navbar/Footer
│   └── page.tsx                 # Landing page
├── components/
│   ├── Navbar.tsx               # Sticky navigation header
│   └── Footer.tsx               # Footer with founder info
├── utils/
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client (SSR)
├── middleware.ts                # Auth route protection
├── supabase_schema.sql          # Database schema + RLS policies
├── vercel.json                  # Vercel cron + config
└── .env.local                   # Environment variables (not committed)
```

---

## 🔒 Security

- **Row-Level Security (RLS)**: Enforced at the database level. Users can only read/write their own data via `auth.uid() = user_id` policies.
- **Server-side Auth**: All sensitive operations (PDF analysis, DB writes) happen in Next.js API routes, never in the browser.
- **Environment Variables**: All API keys are server-side only. Only `NEXT_PUBLIC_*` prefixed variables are exposed to the client — and these are safe public keys.
- **Input Validation**: All API routes validate inputs before processing.

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**ExamLens AI** · Founded & Built by [Abhijeet Kangane](https://github.com/yourusername)

*Turning exam history into your competitive advantage.*

</div>
