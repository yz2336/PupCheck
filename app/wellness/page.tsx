"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import type {
  Appetite,
  DogDTO,
  Mood,
  WellnessEntryDTO,
} from "@/types";

const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: "happy", emoji: "😄", label: "Happy" },
  { key: "normal", emoji: "🙂", label: "Normal" },
  { key: "low", emoji: "😕", label: "Low" },
  { key: "sick", emoji: "🤒", label: "Sick" },
];

const APPETITES: { key: Appetite; label: string }[] = [
  { key: "good", label: "Good" },
  { key: "normal", label: "Normal" },
  { key: "low", label: "Low" },
  { key: "none", label: "None" },
];

export default function WellnessPage() {
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  const [entries, setEntries] = useState<WellnessEntryDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [mood, setMood] = useState<Mood | null>(null);
  const [appetite, setAppetite] = useState<Appetite | null>(null);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

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
    fetch(`/api/wellness?dogId=${dogId}&limit=100`)
      .then((r) => r.json())
      .then((data: WellnessEntryDTO[]) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .finally(() => setLoading(false));
  }, [dogId]);

  async function addEntry() {
    if (!dogId) return;
    if (!mood && !appetite && !weight && !notes.trim()) {
      toast.error("Add at least one field.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dogId, mood, appetite, weight, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to log.");
        return;
      }
      setEntries((prev) => [data, ...prev]);
      setMood(null);
      setAppetite(null);
      setWeight("");
      setNotes("");
      toast.success("Logged!");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: string) {
    const res = await fetch(`/api/wellness/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const weightData = [...entries]
    .filter((e) => typeof e.weight === "number")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({
      date: new Date(e.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      weight: e.weight,
    }));

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Wellness log 📔</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quick daily check-ins. The AI vet uses these for better advice.
        </p>

        <div className="mt-4">
          <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />
        </div>

        <section className="mt-5 card space-y-4">
          <div>
            <div className="label mb-2">How&rsquo;s their mood?</div>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition ${
                    mood === m.key
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-transparent bg-white text-gray-700 hover:border-brand/20"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label mb-2">Appetite</div>
            <div className="flex gap-2">
              {APPETITES.map((a) => (
                <button
                  key={a.key}
                  onClick={() =>
                    setAppetite(appetite === a.key ? null : a.key)
                  }
                  className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    appetite === a.key
                      ? "border-brand bg-brand text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Weight (lbs) — optional</label>
            <input
              type="number"
              step="0.1"
              className="input mt-1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 42.5"
            />
          </div>

          <div>
            <label className="label">Notes — optional</label>
            <textarea
              rows={2}
              className="input mt-1 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything noteworthy today?"
              maxLength={500}
            />
          </div>

          <button
            onClick={addEntry}
            disabled={saving || !dogId}
            className="btn-primary w-full"
          >
            {saving ? "Saving…" : "Log today"}
          </button>
        </section>

        {weightData.length >= 2 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Weight trend
            </h2>
            <div className="h-48 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#0F6E56"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Recent entries
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="card text-center text-sm text-gray-500">
              No entries yet. Log your first one above.
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="card flex items-start gap-3 p-3"
                >
                  <div className="text-2xl">
                    {MOODS.find((m) => m.key === e.mood)?.emoji ?? "📝"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-500">
                      {new Date(e.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                      {e.appetite && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          Appetite: {e.appetite}
                        </span>
                      )}
                      {typeof e.weight === "number" && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                          {e.weight} lbs
                        </span>
                      )}
                    </div>
                    {e.notes && (
                      <p className="mt-1 text-sm text-gray-800">{e.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="text-xs text-gray-400 hover:text-severity-red"
                    aria-label="Delete entry"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
