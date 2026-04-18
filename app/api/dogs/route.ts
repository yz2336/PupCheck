import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const dogs = await Dog.find({ ownerId: session.user.id }).sort({ createdAt: 1 });

  return NextResponse.json(
    dogs.map((d) => ({
      id: d._id.toString(),
      ownerId: d.ownerId.toString(),
      name: d.name,
      breed: d.breed,
      age: d.age,
      weight: d.weight,
      photoUrl: d.photoUrl,
      createdAt: d.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, breed, age, weight, photoDataUrl } = body;

    if (!name || !breed || age === undefined || weight === undefined) {
      return NextResponse.json(
        { error: "Name, breed, age, and weight are required." },
        { status: 400 }
      );
    }

    await connectDB();

    let photoUrl: string | undefined;
    if (photoDataUrl && typeof photoDataUrl === "string" && photoDataUrl.startsWith("data:")) {
      photoUrl = await uploadImage(photoDataUrl, "pupcheck/dogs");
    }

    const dog = await Dog.create({
      ownerId: session.user.id,
      name,
      breed,
      age: Number(age),
      weight: Number(weight),
      photoUrl,
    });

    return NextResponse.json({
      id: dog._id.toString(),
      ownerId: dog.ownerId.toString(),
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      weight: dog.weight,
      photoUrl: dog.photoUrl,
      createdAt: dog.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("create dog error", err);
    return NextResponse.json({ error: "Failed to create dog." }, { status: 500 });
  }
}
