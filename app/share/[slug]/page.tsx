"use client";

import { useEffect, useState } from "react";
import ScanResult from "@/components/ScanResult";
import type { DogDTO, ScanDTO } from "@/types";

const TYPE_EMOJI: Record<string, string> = {
  poop: "💩",
  ears: "👂",
  teeth: "🦷",
  skin: "🐾",
  eyes: "👁️",
};

export default function SharePage({ params }: { params: { slug: string } }) {
  const [dog, setDog] = useState<DogDTO | null>(null);
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${params.slug}`)
      .then(async (r) => {
        if (!r.ok) {
          setErr("This share link is not valid or has been revoked.");
          return;
        }
        const data = await r.json();
        setDog(data.dog);
        setScans(data.scans);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center text-gray-500">
        Loading…
      </main>
    );
  }
  if (err || !dog) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 text-center">
        <div className="text-5xl">🔒</div>
        <p className="mt-3 text-sm text-gray-600">
          {err ?? "Share link not found."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-4 flex items-center gap-3 border-b border-black/5 pb-4">
        <span className="text-xl font-bold text-brand">🐶 PupCheck</span>
        <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
          Read-only share
        </span>
      </header>

      <div className="card flex items-center gap-4">
        {dog.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dog.photoUrl}
            alt={dog.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-xl font-bold text-brand">
            {dog.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-xl font-bold text-gray-900">{dog.name}</div>
          <div className="text-sm text-gray-600">
            {dog.breed} · {dog.age} yrs · {dog.weight} lbs
          </div>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
          Scan history ({scans.length})
        </h2>
        {scans.length === 0 ? (
          <div className="card text-center text-sm text-gray-500">
            No scans on record.
          </div>
        ) : (
          <ul className="space-y-2">
            {scans.map((s) => {
              const isOpen = expanded === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-md"
                  >
                    <span className="text-xl">
                      {TYPE_EMOJI[s.scanType] ?? "🐾"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-gray-900">
                        {s.aiResult.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                        {s.scanType}
                      </div>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      <ScanResult scan={s} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="mt-8 text-center text-[11px] leading-relaxed text-gray-400">
        Shared via PupCheck. This page is read-only and does not require sign-in.
      </footer>
    </main>
  );
}
