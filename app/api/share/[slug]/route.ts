import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Scan from "@/models/Scan";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await connectDB();
  const dog = await Dog.findOne({ shareSlug: params.slug });
  if (!dog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const scans = await Scan.find({ dogId: dog._id })
    .sort({ createdAt: -1 })
    .limit(100);

  return NextResponse.json({
    dog: {
      id: dog._id.toString(),
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      weight: dog.weight,
      photoUrl: dog.photoUrl,
      createdAt: dog.createdAt.toISOString(),
    },
    scans: scans.map((s) => ({
      id: s._id.toString(),
      scanType: s.scanType,
      imageUrl: s.imageUrl,
      aiResult: s.aiResult,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
