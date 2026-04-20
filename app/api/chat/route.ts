import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/mongodb";
import Dog from "@/models/Dog";
import Scan from "@/models/Scan";
import ChatSession from "@/models/ChatSession";
import WellnessEntry from "@/models/WellnessEntry";
import openai from "@/lib/openai";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

interface WellnessCtx {
  date: Date;
  mood?: string;
  appetite?: string;
  weight?: number;
  notes?: string;
}

function buildSystemPrompt(
  dog: { name: string; breed: string; age: number; weight: number },
  scans: { createdAt: Date; scanType: string; aiResult: { severity: string; title: string; summary: string } }[],
  wellness: WellnessCtx[]
) {
  const scanBlock =
    scans.length > 0
      ? scans
          .map(
            (s) =>
              `[${s.createdAt.toISOString().slice(0, 10)}] - ${s.scanType} scan: ${s.aiResult.severity} - ${s.aiResult.title}. ${s.aiResult.summary}`
          )
          .join("\n")
      : "No recent scans yet.";

  const wellnessBlock =
    wellness.length > 0
      ? wellness
          .map((w) => {
            const parts = [];
            if (w.mood) parts.push(`mood=${w.mood}`);
            if (w.appetite) parts.push(`appetite=${w.appetite}`);
            if (typeof w.weight === "number")
              parts.push(`weight=${w.weight}lbs`);
            if (w.notes) parts.push(`notes="${w.notes}"`);
            return `[${w.date.toISOString().slice(0, 10)}] ${parts.join(", ")}`;
          })
          .join("\n")
      : "No wellness log entries yet.";

  return `You are PupCheck AI, a friendly and knowledgeable veterinary health assistant. You help dog owners understand their dog's health concerns and provide guidance.

You are chatting about a dog with this profile:
- Name: ${dog.name}
- Breed: ${dog.breed}
- Age: ${dog.age} years
- Weight: ${dog.weight} lbs

Recent health scan history:
${scanBlock}

Recent wellness log (owner-reported mood/appetite/weight):
${wellnessBlock}

Guidelines:
- Be warm, friendly, and reassuring but honest
- Use the dog's name when appropriate
- Reference the scan history when relevant to give personalized advice
- Consider breed-specific health tendencies
- Always remind owners you're an AI assistant, not a veterinarian, when giving health advice
- If something sounds serious, recommend seeing a vet
- You can discuss: diet, exercise, grooming, common breed issues, medication questions (general only), behavioral concerns, preventive care
- Keep responses concise — 2-4 paragraphs max unless the user asks for detail`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = checkRateLimit(`chat:${session.user.id}`, 50);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Daily chat limit reached. Try again tomorrow." },
      { status: 429 }
    );
  }

  const { dogId, sessionId, message, scanContextId, stream: wantStream } =
    await req.json();

  if (!dogId || !message) {
    return NextResponse.json(
      { error: "dogId and message are required." },
      { status: 400 }
    );
  }

  await connectDB();

  const dog = await Dog.findById(dogId);
  if (!dog || dog.ownerId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Dog not found" }, { status: 404 });
  }

  let chat = sessionId ? await ChatSession.findById(sessionId) : null;
  if (chat && chat.dogId.toString() !== dogId) {
    return NextResponse.json({ error: "Session mismatch" }, { status: 400 });
  }
  if (!chat) {
    chat = await ChatSession.create({ dogId, messages: [] });
  }

  const recentScans = await Scan.find({ dogId }).sort({ createdAt: -1 }).limit(5);
  const recentWellness = await WellnessEntry.find({ dogId })
    .sort({ date: -1 })
    .limit(7);

  let systemPrompt = buildSystemPrompt(
    { name: dog.name, breed: dog.breed, age: dog.age, weight: dog.weight },
    recentScans.map((s) => ({
      createdAt: s.createdAt,
      scanType: s.scanType,
      aiResult: s.aiResult,
    })),
    recentWellness.map((w) => ({
      date: w.date,
      mood: w.mood,
      appetite: w.appetite,
      weight: w.weight,
      notes: w.notes,
    }))
  );

  if (scanContextId && chat.messages.length === 0) {
    const ctx = await Scan.findById(scanContextId);
    if (ctx && ctx.dogId.toString() === dogId) {
      systemPrompt += `\n\nThe user just completed a ${ctx.scanType} scan with these results:\n- Severity: ${ctx.aiResult.severity}\n- Title: ${ctx.aiResult.title}\n- Summary: ${ctx.aiResult.summary}\n- Concerns: ${ctx.aiResult.concerns.join(", ") || "none"}\n- Recommendations: ${ctx.aiResult.recommendations.join(", ") || "none"}\n\nThey may be asking follow-up questions about this scan.`;
    }
  }

  chat.messages.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  const recentHistory = chat.messages.slice(-20).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  if (!wantStream) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...recentHistory],
        temperature: 0.6,
        max_tokens: 600,
      });

      const reply =
        completion.choices[0]?.message?.content ??
        "Sorry, I couldn't come up with a response.";

      chat.messages.push({
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      });
      await chat.save();

      return NextResponse.json({
        sessionId: chat._id.toString(),
        reply,
        messages: chat.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        })),
      });
    } catch (err) {
      console.error("chat error", err);
      return NextResponse.json(
        { error: "Chat failed. Please try again." },
        { status: 500 }
      );
    }
  }

  const chatRef = chat;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send({ sessionId: chatRef._id.toString() });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...recentHistory,
          ],
          temperature: 0.6,
          max_tokens: 600,
          stream: true,
        });

        let full = "";
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            full += delta;
            send({ delta });
          }
        }

        if (!full) full = "Sorry, I couldn't come up with a response.";

        chatRef.messages.push({
          role: "assistant",
          content: full,
          timestamp: new Date(),
        });
        await chatRef.save();

        send({
          done: true,
          sessionId: chatRef._id.toString(),
          reply: full,
        });
      } catch (err) {
        console.error("chat stream error", err);
        send({ error: "Chat failed. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
