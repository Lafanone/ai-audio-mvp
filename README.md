# 🎙️ AI Audio Studio MVP

A modern, high-performance SaaS application that transcribes audio recordings and provides AI-powered summaries and insights. Built as a showcase of a full-stack AI-integrated architecture.

## 🚀 Features

- **Auth & Security:** Secure user authentication via **Clerk**.
- **AI Transcription:** High-accuracy audio-to-text conversion using **OpenAI Whisper**.
- **AI Analysis:** Automatic summaries and key insights extraction via **GPT-3.5/4o-mini**.
- **Database & Persistence:** Reliable data storage with **Supabase (PostgreSQL)** and **Prisma 6**.
- **Business Logic:** Usage limits (5 free credits) and credit tracking.
- **Smart History:** Expandable UI to manage and review past recordings and AI insights.
- **Modern UI:** Responsive design built with **Tailwind CSS**, **Shadcn UI**, and **Impeccable** styling principles (gradients & animations).

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **UI Components:** Shadcn UI + Sonner (Toasts)
- **Database ORM:** Prisma 6
- **Database Provider:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **AI Engine:** OpenAI API (Whisper-1 & GPT Models)

## 📦 Deployment & Setup

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Setup environment variables:** Create a `.env` file with your Clerk, Supabase, and OpenAI keys.
4. **Database Migration:** `npx prisma db push`
5. **Run the project:** `npm run dev`

---

_Developed as part of a technical MVP sprint._
