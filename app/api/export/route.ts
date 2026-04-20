import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Dog from "@/models/Dog";
import Scan from "@/models/Scan";
import ChatSession from "@/models/ChatSession";
import WellnessEntry from "@/models/WellnessEntry";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = session.user.id;
  const user = await User.findById(userId).lean();
  const dogs = await Dog.find({ ownerId: userId }).lean();
  const dogIds = dogs.map((d) => d._id);
  const scans = await Scan.find({ dogId: { $in: dogIds } }).lean();
  const chatSessions = await ChatSession.find({ dogId: { $in: dogIds } }).lean();
  const wellness = await WellnessEntry.find({ dogId: { $in: dogIds } }).lean();

  const payload = {
    exportedAt: new Date().toISOString(),
    user: user
      ? { name: user.name, email: user.email, createdAt: user.createdAt }
      : null,
    dogs: dogs.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      breed: d.breed,
      age: d.age,
      weight: d.weight,
      photoUrl: d.photoUrl,
      createdAt: d.createdAt,
    })),
    scans: scans.map((s) => ({
      id: s._id.toString(),
      dogId: s.dogId.toString(),
      scanType: s.scanType,
      imageUrl: s.imageUrl,
      aiResult: s.aiResult,
      createdAt: s.createdAt,
    })),
    chatSessions: chatSessions.map((c) => ({
      id: c._id.toString(),
      dogId: c.dogId.toString(),
      messages: c.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    wellness: wellness.map((w) => ({
      id: w._id.toString(),
      dogId: w.dogId.toString(),
      date: w.date,
      mood: w.mood,
      appetite: w.appetite,
      weight: w.weight,
      notes: w.notes,
      createdAt: w.createdAt,
    })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pupcheck-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}
