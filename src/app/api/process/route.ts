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
        data: {
          clerkId: clerkId,
        },
      });
      console.log("New user created in DB:", user.id);
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

    await prisma.$transaction([
      prisma.recording.create({
        data: {
          userId: user.id, 
          transcription: transcription.text,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);

    console.log("Successfully saved and counted!");

    return NextResponse.json({ text: transcription.text });

  } catch (error: unknown) {
    console.error("DEBUG ERROR:", error);
    return NextResponse.json({ 
      error: (error as Error).message || "Internal Server Error"
    }, { status: 500 });
  }
}