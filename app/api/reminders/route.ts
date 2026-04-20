import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Reminder from "@/models/Reminder";

function serialize(r: {
  _id: { toString: () => string };
  dogId: { toString: () => string };
  kind: string;
  title: string;
  dueDate: Date;
  recurDays?: number;
  completedAt?: Date | null;
  createdAt: Date;
}) {
  return {
    id: r._id.toString(),
    dogId: r.dogId.toString(),
    kind: r.kind,
    title: r.title,
    dueDate: r.dueDate.toISOString(),
    recurDays: r.recurDays,
    completedAt: r.completedAt ? r.completedAt.toISOString() : undefined,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dogId = searchParams.get("dogId");
  const upcoming = searchParams.get("upcoming") === "1";

  await connectDB();

  const ownedDogs = await Dog.find({ ownerId: session.user.id }, "_id");
  const ownedIds = ownedDogs.map((d) => d._id);

  const filter: Record<string, unknown> = { dogId: { $in: ownedIds } };
  if (dogId) {
    if (!ownedIds.some((id) => id.toString() === dogId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    filter.dogId = dogId;
  }
  if (upcoming) {
    filter.completedAt = { $exists: false };
  }

  const reminders = await Reminder.find(filter).sort({ dueDate: 1 }).limit(200);
  return NextResponse.json(reminders.map(serialize));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dogId, kind, title, dueDate, recurDays } = await req.json();
  if (!dogId || !kind || !title || !dueDate) {
    return NextResponse.json(
      { error: "dogId, kind, title, dueDate required" },
      { status: 400 }
    );
  }

  await connectDB();
  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reminder = await Reminder.create({
    dogId,
    kind,
    title,
    dueDate: new Date(dueDate),
    recurDays: recurDays ? Number(recurDays) : undefined,
  });

  return NextResponse.json(serialize(reminder));
}
