import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Scan from "@/models/Scan";
import Dog from "@/models/Dog";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const scan = await Scan.findById(params.id);
  if (!scan) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const dog = await Dog.findById(scan.dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: scan._id.toString(),
    dogId: scan.dogId.toString(),
    scanType: scan.scanType,
    imageUrl: scan.imageUrl,
    aiResult: scan.aiResult,
    createdAt: scan.createdAt.toISOString(),
  });
}
