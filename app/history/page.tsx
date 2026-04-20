"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import ScanResult from "@/components/ScanResult";
import SeverityBadge from "@/components/SeverityBadge";
import { SCAN_TYPES, type DogDTO, type ScanDTO, type ScanType } from "@/types";

const TYPE_EMOJI: Record<string, string> = {
  poop: "💩",
  ears: "👂",
  teeth: "🦷",
  skin: "🐾",
  eyes: "👁️",
};

type Filter = ScanType | "all";

function HistoryInner() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("scanId");
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [expanded, setExpanded] = useState<string | null>(deepLinkId);
  const [loading, setLoading] = useState(true);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data: DogDTO[]) => {
        if (!Array.isArray(data)) return;
        setDogs(data);
        if (data[0]) setDogId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!dogId) return;
    setLoading(true);
    const params = new URLSearchParams({ dogId, limit: "200" });
    if (filter !== "all") params.set("type", filter);
    fetch(`/api/scans?${params.toString()}`)
      .then((r) => r.json())
      .then((data: ScanDTO[]) => {
        if (Array.isArray(data)) setScans(data);
      })
      .finally(() => setLoading(false));
  }, [dogId, filter]);

  useEffect(() => {
    if (!deepLinkId || scans.length === 0) return;
    const node = itemRefs.current[deepLinkId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [deepLinkId, scans]);

  const filters: { key: Filter; label: string }[] = useMemo(
    () => [
      { key: "all", label: "All" },
      ...SCAN_TYPES.map((t) => ({ key: t.key, label: t.label })),
    ],
    []
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan history</h1>
            <p className="mt-1 text-sm text-gray-600">
              Every scan, one place.
            </p>
          </div>
          <Link
            href="/compare"
            className="shrink-0 rounded-xl border border-brand/20 bg-white px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/5"
          >
            🔎 Compare
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filter === f.key
                    ? "bg-brand text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-4">
          {loading ? (
            <ul className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </ul>
          ) : scans.length === 0 ? (
            <div className="card text-center text-sm text-gray-500">
              No scans yet{filter !== "all" ? ` for ${filter}` : ""}.
            </div>
          ) : (
            <ul className="space-y-2">
              {scans.map((s) => {
                const isOpen = expanded === s.id;
                return (
                  <li
                    key={s.id}
                    ref={(el) => {
                      itemRefs.current[s.id] = el;
                    }}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : s.id)}
                      className={`card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-md ${
                        isOpen ? "ring-2 ring-brand/30" : ""
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.imageUrl}
                        alt={s.scanType}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{TYPE_EMOJI[s.scanType]}</span>
                          <span className="truncate font-semibold text-gray-900">
                            {s.aiResult.title}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {new Date(s.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          · {s.scanType}
                        </div>
                      </div>
                      <SeverityBadge severity={s.aiResult.severity} small />
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
      </main>
    </>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={null}>
      <HistoryInner />
    </Suspense>
  );
}
