"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function HistoryPage() {
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    const params = new URLSearchParams({ dogId, limit: "200" });
    if (filter !== "all") params.set("type", filter);
    fetch(`/api/scans?${params.toString()}`)
      .then((r) => r.json())
      .then((data: ScanDTO[]) => {
        if (Array.isArray(data)) setScans(data);
      });
  }, [dogId, filter]);

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
        <h1 className="text-2xl font-bold text-gray-900">Scan history</h1>
        <p className="mt-1 text-sm text-gray-600">
          Every scan, one place.
        </p>

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
          {scans.length === 0 ? (
            <div className="card text-center text-sm text-gray-500">
              No scans yet{filter !== "all" ? ` for ${filter}` : ""}.
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
