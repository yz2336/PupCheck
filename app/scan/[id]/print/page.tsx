"use client";

import { useEffect, useState } from "react";
import type { DogDTO, ScanDTO } from "@/types";

const TYPE_EMOJI: Record<string, string> = {
  poop: "💩",
  ears: "👂",
  teeth: "🦷",
  skin: "🐾",
  eyes: "👁️",
};

const URGENCY_LABEL: Record<string, string> = {
  routine: "Routine — keep an eye on it",
  soon: "See a vet soon",
  urgent: "See a vet urgently",
};

export default function PrintScanPage({
  params,
}: {
  params: { id: string };
}) {
  const [scan, setScan] = useState<ScanDTO | null>(null);
  const [dog, setDog] = useState<DogDTO | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [scanRes, dogsRes] = await Promise.all([
          fetch(`/api/scans/${params.id}`),
          fetch("/api/dogs"),
        ]);
        if (!scanRes.ok) {
          setErr("Scan not found.");
          return;
        }
        const scanData: ScanDTO = await scanRes.json();
        const dogs: DogDTO[] = await dogsRes.json();
        if (cancelled) return;
        setScan(scanData);
        setDog(dogs.find((d) => d.id === scanData.dogId) ?? null);
      } catch {
        if (!cancelled) setErr("Failed to load scan.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (scan && dog) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [scan, dog]);

  if (err) {
    return <div className="p-8 text-center text-gray-700">{err}</div>;
  }
  if (!scan || !dog) {
    return <div className="p-8 text-center text-gray-500">Preparing PDF…</div>;
  }

  const date = new Date(scan.createdAt);

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-gray-900 print:p-6">
      <style>{`
        @page { margin: 14mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print mb-6 flex justify-end gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
        >
          Close
        </button>
      </div>

      <header className="mb-5 flex items-center justify-between border-b-2 border-brand pb-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-brand">
            🐶 PupCheck
          </div>
          <h1 className="mt-1 text-2xl font-bold">AI Wellness Scan Report</h1>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Generated</div>
          <div className="font-semibold text-gray-800">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 p-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Dog
          </div>
          <div className="mt-0.5 text-lg font-semibold">{dog.name}</div>
          <div className="text-sm text-gray-600">
            {dog.breed} · {dog.age} yr · {dog.weight} lbs
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Scan
          </div>
          <div className="mt-0.5 text-lg font-semibold capitalize">
            {TYPE_EMOJI[scan.scanType]} {scan.scanType}
          </div>
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {date.toLocaleTimeString()}
          </div>
        </div>
      </section>

      {scan.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={scan.imageUrl}
          alt="Scan"
          crossOrigin="anonymous"
          className="mb-5 max-h-80 w-full rounded-lg object-contain ring-1 ring-gray-200"
        />
      )}

      <section className="mb-4">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{
              background:
                scan.aiResult.severity === "green"
                  ? "#22C55E"
                  : scan.aiResult.severity === "yellow"
                  ? "#EAB308"
                  : "#EF4444",
            }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
            {scan.aiResult.severity === "green"
              ? "Healthy"
              : scan.aiResult.severity === "yellow"
              ? "Monitor"
              : "Urgent"}
          </span>
        </div>
        <h2 className="text-xl font-bold">{scan.aiResult.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-800">
          {scan.aiResult.summary}
        </p>
      </section>

      {scan.aiResult.concerns.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            Observations
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
            {scan.aiResult.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {scan.aiResult.recommendations.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            Recommendations
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-800">
            {scan.aiResult.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {scan.aiResult.shouldSeeVet && (
        <section className="mb-4 rounded-lg border-2 border-severity-red/40 bg-severity-red/5 p-3">
          <div className="text-sm font-bold text-severity-red">
            🩺 {URGENCY_LABEL[scan.aiResult.urgency] ?? "Vet visit recommended"}
          </div>
        </section>
      )}

      <footer className="mt-8 border-t border-gray-200 pt-3 text-[10px] leading-relaxed text-gray-500">
        PupCheck AI is a screening assistant, not a replacement for a licensed
        veterinarian. Use this report as a conversation starter with your vet.
      </footer>
    </div>
  );
}
