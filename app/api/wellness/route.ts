import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import WellnessEntry from "@/models/WellnessEntry";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dogId = searchParams.get("dogId");
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);
  if (!dogId) {
    return NextResponse.json({ error: "dogId required" }, { status: 400 });
  }

  await connectDB();
  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await WellnessEntry.find({ dogId })
    .sort({ date: -1 })
    .limit(limit);

  return NextResponse.json(
    entries.map((e) => ({
      id: e._id.toString(),
      dogId: e.dogId.toString(),
      date: e.date.toISOString(),
      mood: e.mood,
      appetite: e.appetite,
      weight: e.weight,
      notes: e.notes,
      createdAt: e.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { dogId, date, mood, appetite, weight, notes } = body;
  if (!dogId) {
    return NextResponse.json({ error: "dogId required" }, { status: 400 });
  }

  await connectDB();
  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entry = await WellnessEntry.create({
    dogId,
    date: date ? new Date(date) : new Date(),
    mood: mood || undefined,
    appetite: appetite || undefined,
    weight: weight != null && weight !== "" ? Number(weight) : undefined,
    notes: notes || undefined,
  });

  return NextResponse.json({
    id: entry._id.toString(),
    dogId: entry.dogId.toString(),
    date: entry.date.toISOString(),
    mood: entry.mood,
    appetite: entry.appetite,
    weight: entry.weight,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
  });
}
