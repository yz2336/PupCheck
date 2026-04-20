import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";

async function assertOwner(id: string, userId: string) {
  const dog = await Dog.findById(id);
  if (!dog) return { error: "Dog not found", status: 404 as const };
  if (dog.ownerId.toString() !== userId) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { dog };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const result = await assertOwner(params.id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (!result.dog.shareSlug) {
    result.dog.shareSlug = randomBytes(10).toString("hex");
    await result.dog.save();
  }

  return NextResponse.json({ shareSlug: result.dog.shareSlug });
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
  const result = await assertOwner(params.id, session.user.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  result.dog.shareSlug = undefined;
  await result.dog.save();
  return NextResponse.json({ ok: true });
}
