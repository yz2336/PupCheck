import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Scan from "@/models/Scan";
import ChatSession from "@/models/ChatSession";
import { uploadImage } from "@/lib/cloudinary";

async function assertOwner(id: string, userId: string) {
  const dog = await Dog.findById(id);
  if (!dog) return { error: "Dog not found", status: 404 as const };
  if (dog.ownerId.toString() !== userId) {
    return { error: "Forbidden", status: 403 as const };
  }
  return { dog };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const result = await assertOwner(params.id, session.user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const body = await req.json();
    const { name, breed, age, weight, photoDataUrl } = body;

    if (name !== undefined) result.dog.name = name;
    if (breed !== undefined) result.dog.breed = breed;
    if (age !== undefined) result.dog.age = Number(age);
    if (weight !== undefined) result.dog.weight = Number(weight);
    if (photoDataUrl && typeof photoDataUrl === "string" && photoDataUrl.startsWith("data:")) {
      result.dog.photoUrl = await uploadImage(photoDataUrl, "pupcheck/dogs");
    }

    await result.dog.save();

    return NextResponse.json({
      id: result.dog._id.toString(),
      ownerId: result.dog.ownerId.toString(),
      name: result.dog.name,
      breed: result.dog.breed,
      age: result.dog.age,
      weight: result.dog.weight,
      photoUrl: result.dog.photoUrl,
      createdAt: result.dog.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("update dog error", err);
    return NextResponse.json({ error: "Failed to update dog." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const result = await assertOwner(params.id, session.user.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await Scan.deleteMany({ dogId: result.dog._id });
    await ChatSession.deleteMany({ dogId: result.dog._id });
    await result.dog.deleteOne();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete dog error", err);
    return NextResponse.json({ error: "Failed to delete dog." }, { status: 500 });
  }
}
