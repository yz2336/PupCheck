import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import ChatSession from "@/models/ChatSession";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dogId = searchParams.get("dogId");
  if (!dogId) {
    return NextResponse.json({ error: "dogId is required." }, { status: 400 });
  }

  await connectDB();

  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sessions = await ChatSession.find({ dogId })
    .sort({ updatedAt: -1 })
    .limit(20);

  return NextResponse.json(
    sessions.map((s) => ({
      id: s._id.toString(),
      dogId: s.dogId.toString(),
      messageCount: s.messages.length,
      lastMessage: s.messages[s.messages.length - 1]?.content ?? "",
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dogId } = await req.json();
    if (!dogId) {
      return NextResponse.json({ error: "dogId is required." }, { status: 400 });
    }

    await connectDB();
    const dog = await Dog.findById(dogId);
    if (!dog || dog.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const chat = await ChatSession.create({ dogId, messages: [] });
    return NextResponse.json({
      id: chat._id.toString(),
      dogId: chat.dogId.toString(),
      messages: [],
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("create session error", err);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}
