import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Reminder from "@/models/Reminder";

async function loadOwned(id: string, userId: string) {
  const reminder = await Reminder.findById(id);
  if (!reminder) return { error: "Not found", status: 404 as const };
  const dog = await Dog.findById(reminder.dogId);
  if (!dog || dog.ownerId.toString() !== userId) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { reminder };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const result = await loadOwned(params.id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const body = await req.json();
  const { title, dueDate, recurDays, complete } = body;

  if (title !== undefined) result.reminder.title = title;
  if (dueDate !== undefined) result.reminder.dueDate = new Date(dueDate);
  if (recurDays !== undefined) {
    result.reminder.recurDays = recurDays ? Number(recurDays) : undefined;
  }

  if (complete === true && !result.reminder.completedAt) {
    result.reminder.completedAt = new Date();
    if (result.reminder.recurDays) {
      const next = new Date(result.reminder.dueDate);
      next.setDate(next.getDate() + result.reminder.recurDays);
      await Reminder.create({
        dogId: result.reminder.dogId,
        kind: result.reminder.kind,
        title: result.reminder.title,
        dueDate: next,
        recurDays: result.reminder.recurDays,
      });
    }
  } else if (complete === false) {
    result.reminder.completedAt = undefined;
  }

  await result.reminder.save();
  return NextResponse.json({
    id: result.reminder._id.toString(),
    dogId: result.reminder.dogId.toString(),
    kind: result.reminder.kind,
    title: result.reminder.title,
    dueDate: result.reminder.dueDate.toISOString(),
    recurDays: result.reminder.recurDays,
    completedAt: result.reminder.completedAt
      ? result.reminder.completedAt.toISOString()
      : undefined,
    createdAt: result.reminder.createdAt.toISOString(),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const result = await loadOwned(params.id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await result.reminder.deleteOne();
  return NextResponse.json({ ok: true });
}
