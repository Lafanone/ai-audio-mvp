import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import prisma from "@/lib/db"; // ВОЗВРАЩАЕМ ИМПОРТ ПРИЗМЫ

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- ТЕСТ БАЗЫ ДАННЫХ ---
    console.log("Testing Prisma connection...");
    const user = await prisma.user.findFirst(); 
    console.log("Database connection test:", user ? "Success" : "No user found");
    // ------------------------

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received, sending to OpenAI...");

    // ОТПРАВЛЯЕМ НАПРЯМУЮ В OPENAI
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    console.log("OpenAI Response:", transcription.text);

    // Возвращаем текст
    return NextResponse.json({ text: transcription.text });

  } catch (error: unknown) {
    console.error("DEBUG ERROR:", error);
    return NextResponse.json({ 
      error: (error as Error).message || "Internal Server Error",
      details: (error as Error).stack 
    }, { status: 500 });
  }
}