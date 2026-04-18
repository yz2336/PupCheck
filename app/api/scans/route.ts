import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Scan, { ScanType } from "@/models/Scan";
import openai from "@/lib/openai";
import { uploadImage } from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/rateLimit";

const SCAN_GUIDELINES = `Guidelines for each scan type:
- POOP: Look for color (brown=normal, black/red/white=concern), consistency (formed vs loose vs watery), visible parasites, mucus, foreign objects
- EARS: Look for redness, swelling, discharge, odor indicators (dark waxy buildup), scratching damage, mites
- TEETH: Look for tartar/plaque buildup, gum color (pink=healthy, red/white=concern), broken/missing teeth, swelling, bad breath indicators
- SKIN: Look for rashes, hot spots, hair loss, lumps/bumps, dryness/flaking, parasites (fleas/ticks), wounds
- EYES: Look for redness, discharge (clear vs colored), cloudiness, swelling, tear staining, third eyelid visibility

Be helpful but always err on the side of caution. If in doubt, recommend a vet visit. Consider breed-specific predispositions (e.g., bulldogs and skin folds, dachshunds and dental issues, labs and ear infections).`;

function buildSystemPrompt(
  dog: { name: string; breed: string; age: number; weight: number },
  scanType: ScanType,
  previous: { createdAt: Date; aiResult: { severity: string; title: string; summary: string } }[]
) {
  const prevBlock =
    previous.length > 0
      ? `\n\nPrevious ${scanType} scan results for ${dog.name}:\n` +
        previous
          .map(
            (s) =>
              `- ${s.createdAt.toISOString().slice(0, 10)}: [${s.aiResult.severity}] ${s.aiResult.title} — ${s.aiResult.summary}`
          )
          .join("\n")
      : "";

  return `You are PupCheck AI, a veterinary screening assistant. You help dog owners identify potential health concerns from photos. You are NOT a replacement for a veterinarian — always clarify this.

Analyze the uploaded image of a dog's ${scanType}. Here is the dog's profile:
- Name: ${dog.name}
- Breed: ${dog.breed}
- Age: ${dog.age} years
- Weight: ${dog.weight} lbs${prevBlock}

Respond in this exact JSON format (no markdown, no backticks):
{
  "severity": "green" | "yellow" | "red",
  "title": "Short 5-8 word summary of findings",
  "summary": "2-3 sentence plain-English explanation of what you see",
  "concerns": ["specific concern 1", "specific concern 2"],
  "recommendations": ["actionable step 1", "actionable step 2"],
  "shouldSeeVet": true/false,
  "urgency": "routine" | "soon" | "urgent"
}

${SCAN_GUIDELINES}`;
}

function safeParseAI(raw: string) {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(text);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const dogId = searchParams.get("dogId");
  const scanType = searchParams.get("type");
  const limit = Number(searchParams.get("limit") ?? "100");

  if (!dogId) {
    return NextResponse.json({ error: "dogId is required." }, { status: 400 });
  }

  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const query: Record<string, unknown> = { dogId };
  if (scanType && scanType !== "all") query.scanType = scanType;

  const scans = await Scan.find(query).sort({ createdAt: -1 }).limit(limit);

  return NextResponse.json(
    scans.map((s) => ({
      id: s._id.toString(),
      dogId: s.dogId.toString(),
      scanType: s.scanType,
      imageUrl: s.imageUrl,
      aiResult: s.aiResult,
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`scans:${session.user.id}`, 20);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Daily scan limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  try {
    const { dogId, scanType, imageDataUrl } = await req.json();

    if (!dogId || !scanType || !imageDataUrl) {
      return NextResponse.json(
        { error: "dogId, scanType, and imageDataUrl are required." },
        { status: 400 }
      );
    }

    const validTypes: ScanType[] = ["poop", "ears", "teeth", "skin", "eyes"];
    if (!validTypes.includes(scanType)) {
      return NextResponse.json({ error: "Invalid scanType." }, { status: 400 });
    }

    await connectDB();

    const dog = await Dog.findById(dogId);
    if (!dog || dog.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Dog not found" }, { status: 404 });
    }

    const previous = await Scan.find({ dogId, scanType })
      .sort({ createdAt: -1 })
      .limit(3);

    const imageUrl = await uploadImage(imageDataUrl, "pupcheck/scans");

    const systemPrompt = buildSystemPrompt(
      { name: dog.name, breed: dog.breed, age: dog.age, weight: dog.weight },
      scanType,
      previous.map((p) => ({ createdAt: p.createdAt, aiResult: p.aiResult }))
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this ${scanType} photo of ${dog.name}.`,
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    let aiResult;
    try {
      aiResult = safeParseAI(rawContent);
    } catch (err) {
      console.error("failed to parse AI response", err, rawContent);
      return NextResponse.json(
        { error: "Could not parse AI response. Please try again." },
        { status: 502 }
      );
    }

    const scan = await Scan.create({
      dogId,
      scanType,
      imageUrl,
      aiResult: {
        severity: aiResult.severity ?? "yellow",
        title: aiResult.title ?? "Scan complete",
        summary: aiResult.summary ?? "",
        concerns: Array.isArray(aiResult.concerns) ? aiResult.concerns : [],
        recommendations: Array.isArray(aiResult.recommendations)
          ? aiResult.recommendations
          : [],
        shouldSeeVet: Boolean(aiResult.shouldSeeVet),
        urgency: aiResult.urgency ?? "routine",
      },
    });

    return NextResponse.json({
      id: scan._id.toString(),
      dogId: scan.dogId.toString(),
      scanType: scan.scanType,
      imageUrl: scan.imageUrl,
      aiResult: scan.aiResult,
      createdAt: scan.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("scan error", err);
    return NextResponse.json({ error: "Scan failed. Please try again." }, { status: 500 });
  }
}
