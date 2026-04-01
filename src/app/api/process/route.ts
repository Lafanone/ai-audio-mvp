import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Not authorized" }, { status: 401 });

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.upsert({
        where: { clerkId: userId },
        update: {},
        create: { clerkId: userId, email: "" },
      });
    }

    if (user.usageCount >= 1 && !user.isPro) {
      return NextResponse.json(
        { error: "Free trial expired. Please upgrade to a paid plan for more usage." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 400 });

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

    return NextResponse.json({ text: transcription.text });

  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}