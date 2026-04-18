"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import DogProfileCard from "@/components/DogProfileCard";
import SeverityBadge from "@/components/SeverityBadge";
import HealthChart from "@/components/HealthChart";
import type { DogDTO, ScanDTO } from "@/types";

const TYPE_EMOJI: Record<string, string> = {
  poop: "💩",
  ears: "👂",
  teeth: "🦷",
  skin: "🐾",
  eyes: "👁️",
};

export default function DashboardPage() {
  const router = useRouter();
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data: DogDTO[]) => {
        if (!Array.isArray(data)) return;
        setDogs(data);
        if (data.length === 0) {
          router.push("/onboarding");
        } else {
          setSelectedId(data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/scans?dogId=${selectedId}&limit=100`)
      .then((r) => r.json())
      .then((data: ScanDTO[]) => {
        if (Array.isArray(data)) setScans(data);
      });
  }, [selectedId]);

  const selected = useMemo(
    () => dogs.find((d) => d.id === selectedId) ?? null,
    [dogs, selectedId]
  );
  const recent = scans.slice(0, 5);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading ? (
          <SkeletonDashboard />
        ) : !selected ? (
          <div className="card text-center">
            <p className="text-gray-600">Add your first dog to get started.</p>
            <Link href="/onboarding" className="btn-primary mt-4 inline-flex">
              Add a dog
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 flex-1">
                <DogSelector
                  dogs={dogs}
                  selectedId={selectedId}
                  onChange={setSelectedId}
                />
              </div>
              <Link href="/settings" className="btn-secondary shrink-0">
                + Add another dog
              </Link>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.5fr]">
              <DogProfileCard dog={selected} />
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/scan?dogId=${selected.id}`}
                  className="card flex flex-col items-start justify-between gap-3 transition hover:border-brand/30 hover:shadow-md"
                >
                  <div className="text-3xl">🔍</div>
                  <div>
                    <div className="font-bold text-gray-900">New Scan</div>
                    <div className="text-xs text-gray-500">
                      Poop, ears, teeth, skin, eyes
                    </div>
                  </div>
                </Link>
                <Link
                  href={`/chat?dogId=${selected.id}`}
                  className="card flex flex-col items-start justify-between gap-3 transition hover:border-brand/30 hover:shadow-md"
                >
                  <div className="text-3xl">💬</div>
                  <div>
                    <div className="font-bold text-gray-900">Ask AI Vet</div>
                    <div className="text-xs text-gray-500">
                      Personalized for {selected.name}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                Health trend
              </h2>
              <HealthChart scans={scans} />
            </section>

            <section className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Recent scans
                </h2>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  View all →
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="card text-center text-sm text-gray-500">
                  No scans yet for {selected.name}. Try your first one!
                  <div className="mt-3">
                    <Link
                      href={`/scan?dogId=${selected.id}`}
                      className="btn-primary"
                    >
                      Start a scan
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recent.map((s) => (
                    <li key={s.id} className="card flex items-center gap-3 p-4">
                      <div className="text-2xl">{TYPE_EMOJI[s.scanType] ?? "🐾"}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-gray-900">
                            {s.aiResult.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="capitalize">{s.scanType}</span>
                          <span>·</span>
                          <span>
                            {new Date(s.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <SeverityBadge severity={s.aiResult.severity} small />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-56 animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}
