"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import ScanResult from "@/components/ScanResult";
import { SCAN_TYPES, type DogDTO, type ScanDTO, type ScanType } from "@/types";

function ComparePageInner() {
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  const [scanType, setScanType] = useState<ScanType>("skin");
  const [scans, setScans] = useState<ScanDTO[]>([]);
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    const params = new URLSearchParams({
      dogId,
      type: scanType,
      limit: "100",
    });
    fetch(`/api/scans?${params.toString()}`)
      .then((r) => r.json())
      .then((data: ScanDTO[]) => {
        if (!Array.isArray(data)) return;
        setScans(data);
        setLeftId(data[1]?.id ?? data[0]?.id ?? null);
        setRightId(data[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, [dogId, scanType]);

  const left = useMemo(() => scans.find((s) => s.id === leftId), [scans, leftId]);
  const right = useMemo(() => scans.find((s) => s.id === rightId), [scans, rightId]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare scans 🔎</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pick two scans of the same type to see progression side-by-side.
        </p>

        <div className="mt-4 space-y-3">
          <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />
          <div className="flex gap-2 overflow-x-auto">
            {SCAN_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => setScanType(t.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  scanType === t.key
                    ? "bg-brand text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        ) : scans.length < 2 ? (
          <div className="card mt-6 text-center text-sm text-gray-500">
            Need at least two {scanType} scans to compare. Do another scan to
            unlock compare mode.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Column
              label="Earlier"
              scans={scans}
              value={leftId}
              onChange={setLeftId}
            />
            <Column
              label="Later"
              scans={scans}
              value={rightId}
              onChange={setRightId}
            />
            {left && (
              <div>
                <ScanResult scan={left} />
              </div>
            )}
            {right && (
              <div>
                <ScanResult scan={right} />
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function Column({
  label,
  scans,
  value,
  onChange,
}: {
  label: string;
  scans: ScanDTO[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div className="card">
      <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </div>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-2"
      >
        {scans.map((s) => (
          <option key={s.id} value={s.id}>
            {new Date(s.createdAt).toLocaleDateString()} — {s.aiResult.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  );
}
