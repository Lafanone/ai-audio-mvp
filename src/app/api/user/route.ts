import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ usageCount: 0, isPro: false });
    }

    return NextResponse.json({ usageCount: user.usageCount, isPro: user.isPro });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}