"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import DogProfileCard from "@/components/DogProfileCard";
import SeverityBadge from "@/components/SeverityBadge";
import HealthChart from "@/components/HealthChart";
import type { DogDTO, ReminderDTO, ScanDTO } from "@/types";

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
  const [reminders, setReminders] = useState<ReminderDTO[]>([]);
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
    fetch(`/api/reminders?dogId=${selectedId}&upcoming=1`)
      .then((r) => r.json())
      .then((data: ReminderDTO[]) => {
        if (Array.isArray(data)) setReminders(data);
      });
  }, [selectedId]);

  const selected = useMemo(
    () => dogs.find((d) => d.id === selectedId) ?? null,
    [dogs, selectedId]
  );
  const recent = scans.slice(0, 5);

  const summary30 = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const counts = { green: 0, yellow: 0, red: 0 };
    for (const s of scans) {
      if (new Date(s.createdAt).getTime() >= since) {
        const k = s.aiResult.severity as "green" | "yellow" | "red";
        if (k in counts) counts[k] += 1;
      }
    }
    return counts;
  }, [scans]);

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
                <Link
                  href="/wellness"
                  className="card flex flex-col items-start justify-between gap-3 transition hover:border-brand/30 hover:shadow-md"
                >
                  <div className="text-3xl">📔</div>
                  <div>
                    <div className="font-bold text-gray-900">Wellness Log</div>
                    <div className="text-xs text-gray-500">
                      Mood, appetite, weight
                    </div>
                  </div>
                </Link>
                <Link
                  href="/reminders"
                  className="card flex flex-col items-start justify-between gap-3 transition hover:border-brand/30 hover:shadow-md"
                >
                  <div className="text-3xl">🔔</div>
                  <div>
                    <div className="font-bold text-gray-900">Reminders</div>
                    <div className="text-xs text-gray-500">
                      Vaccines, flea/tick, weigh-ins
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {reminders.length > 0 && (
              <section className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Upcoming
                  </h2>
                  <Link
                    href="/reminders"
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
                <ul className="space-y-2">
                  {reminders.slice(0, 3).map((r) => {
                    const due = new Date(r.dueDate);
                    const days = Math.round(
                      (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    const statusCls =
                      days < 0
                        ? "text-severity-red"
                        : days <= 7
                        ? "text-severity-yellow"
                        : "text-gray-500";
                    const statusLabel =
                      days < 0
                        ? `${Math.abs(days)}d overdue`
                        : days === 0
                        ? "Today"
                        : `in ${days}d`;
                    return (
                      <li
                        key={r.id}
                        className="card flex items-center gap-3 p-3"
                      >
                        <span className="text-xl">🔔</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-gray-900">
                            {r.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {due.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold ${statusCls}`}
                        >
                          {statusLabel}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                Last 30 days
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <SummaryTile
                  count={summary30.green}
                  label="Healthy"
                  emoji="✅"
                  color="green"
                />
                <SummaryTile
                  count={summary30.yellow}
                  label="Monitor"
                  emoji="⚠️"
                  color="yellow"
                />
                <SummaryTile
                  count={summary30.red}
                  label="Urgent"
                  emoji="🚨"
                  color="red"
                />
              </div>
            </section>

            <section className="mt-6">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                Health trend
              </h2>
              <HealthChart
                scans={scans}
                onScanClick={(id) => router.push(`/history?scanId=${id}`)}
              />
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

function SummaryTile({
  count,
  label,
  emoji,
  color,
}: {
  count: number;
  label: string;
  emoji: string;
  color: "green" | "yellow" | "red";
}) {
  const ring =
    color === "green"
      ? "border-severity-green/30 bg-severity-green/5"
      : color === "yellow"
      ? "border-severity-yellow/40 bg-severity-yellow/5"
      : "border-severity-red/30 bg-severity-red/5";
  const text =
    color === "green"
      ? "text-severity-green"
      : color === "yellow"
      ? "text-yellow-700"
      : "text-severity-red";
  return (
    <div className={`rounded-2xl border p-3 ${ring}`}>
      <div className="flex items-center justify-between">
        <span className="text-xl">{emoji}</span>
        <span className={`text-2xl font-bold ${text}`}>{count}</span>
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
        {label}
      </div>
    </div>
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
