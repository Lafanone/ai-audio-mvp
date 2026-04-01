import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import prisma from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FREE_LIMIT = 5;

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: clerkId },
      });
    }

    if (!user.isPro && user.usageCount >= FREE_LIMIT) {
      return NextResponse.json({ 
        error: `Free limit of ${FREE_LIMIT} uses reached. Please upgrade to Pro.` 
      }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Processing audio for user:", user.id);

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    });

    const transcriptText = transcription.text;
    console.log("Audio transcribed!");

    console.log("Analyzing text...");
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { 
          role: "system", 
          content: "You are a smart AI assistant. Analyze the provided text. Write a short summary (1-2 sentences) and highlight 2-3 main points using bullet points. Respond in the same language as the text." 
        },
        { 
          role: "user", 
          content: transcriptText 
        }
      ],
    });

    const analysisText = analysisResponse.choices[0].message.content;
    console.log("Analysis complete!");

    await prisma.$transaction([
      prisma.recording.create({
        data: {
          userId: user.id,
          transcription: transcriptText,
          analysis: analysisText,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ 
      text: transcriptText, 
      analysis: analysisText 
    });

  } catch (error: unknown) {
    console.error("DEBUG ERROR:", error);
    return NextResponse.json({ 
      error: (error as Error).message || "Internal Server Error"
    }, { status: 500 });
  }
}