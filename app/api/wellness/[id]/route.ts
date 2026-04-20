import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import WellnessEntry from "@/models/WellnessEntry";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const entry = await WellnessEntry.findById(params.id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const dog = await Dog.findById(entry.dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await entry.deleteOne();
  return NextResponse.json({ ok: true });
}
