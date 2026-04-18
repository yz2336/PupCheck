"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import ImageUploader from "@/components/ImageUploader";
import ScanResult from "@/components/ScanResult";
import { SCAN_TYPES, type DogDTO, type ScanDTO, type ScanType } from "@/types";

function ScanInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDogId = searchParams.get("dogId");

  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(initialDogId);
  const [scanType, setScanType] = useState<ScanType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanDTO | null>(null);

  useEffect(() => {
    fetch("/api/dogs")
      .then((r) => r.json())
      .then((data: DogDTO[]) => {
        if (!Array.isArray(data)) return;
        setDogs(data);
        if (!dogId && data[0]) setDogId(data[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedDog = useMemo(
    () => dogs.find((d) => d.id === dogId) ?? null,
    [dogs, dogId]
  );

  async function analyze() {
    if (!dogId || !scanType || !image) {
      toast.error("Pick a dog, scan type, and photo.");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId, scanType, imageDataUrl: image }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Scan failed.");
        return;
      }
      setResult(data);
      toast.success("Analysis complete ✨");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setResult(null);
    setImage(null);
    setScanType(null);
  }

  if (result) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Results for {selectedDog?.name}
          </h1>
          <ScanResult scan={result} />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Link
              href={`/chat?dogId=${dogId}&scanId=${result.id}`}
              className="btn-secondary w-full"
            >
              💬 Ask a follow-up
            </Link>
            <button onClick={reset} className="btn-primary w-full">
              🔍 Save &amp; do another
            </button>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-3 w-full rounded-xl py-2 text-sm text-gray-500 hover:text-gray-800"
          >
            Back to dashboard
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">New scan 🔍</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose a scan type, snap a photo, and we&rsquo;ll check it.
        </p>

        <div className="mt-5 space-y-5">
          <div className="card">
            <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />
          </div>

          <div>
            <h2 className="label mb-2">Scan type</h2>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {SCAN_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setScanType(t.key)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition ${
                    scanType === t.key
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-transparent bg-white text-gray-700 hover:border-brand/20"
                  }`}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="text-xs font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="label mb-2">Photo</h2>
            <ImageUploader onChange={setImage} />
          </div>

          <button
            onClick={analyze}
            disabled={analyzing || !dogId || !scanType || !image}
            className="btn-accent w-full"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <Spinner /> Analyzing {selectedDog?.name}&rsquo;s {scanType}...
              </span>
            ) : (
              "✨ Analyze with AI"
            )}
          </button>

          {analyzing && (
            <p className="text-center text-xs text-gray-500">
              This usually takes 5–10 seconds. Hang tight!
            </p>
          )}
        </div>
      </main>
    </>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanInner />
    </Suspense>
  );
}
