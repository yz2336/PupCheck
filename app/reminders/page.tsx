"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DogSelector from "@/components/DogSelector";
import {
  REMINDER_KINDS,
  type DogDTO,
  type ReminderDTO,
  type ReminderKind,
} from "@/types";

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function RemindersPage() {
  const [dogs, setDogs] = useState<DogDTO[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [kind, setKind] = useState<ReminderKind>("vaccine");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayPlus(30));
  const [recurDays, setRecurDays] = useState("");
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
    fetch(`/api/reminders?dogId=${dogId}`)
      .then((r) => r.json())
      .then((data: ReminderDTO[]) => {
        if (Array.isArray(data)) setReminders(data);
      })
      .finally(() => setLoading(false));
  }, [dogId]);

  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!dogId || !title.trim()) {
      toast.error("Add a title and pick a dog.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dogId,
          kind,
          title: title.trim(),
          dueDate,
          recurDays: recurDays ? Number(recurDays) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to add.");
        return;
      }
      setReminders((prev) =>
        [...prev, data].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        )
      );
      setTitle("");
      setRecurDays("");
      toast.success("Reminder added.");
    } finally {
      setSaving(false);
    }
  }

  async function complete(id: string) {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error("Failed.");
      return;
    }
    setReminders((prev) =>
      prev
        .map((r) => (r.id === id ? data : r))
        .concat(
          prev.find((r) => r.id === id)?.recurDays ? [] : []
        )
    );
    fetch(`/api/reminders?dogId=${dogId}`)
      .then((r) => r.json())
      .then((d: ReminderDTO[]) => Array.isArray(d) && setReminders(d));
    toast.success("Done ✨");
  }

  async function remove(id: string) {
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed.");
      return;
    }
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      toast.error("Notifications aren't supported in this browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      toast.success("Notifications enabled.");
      new Notification("PupCheck reminders on 🐶", {
        body: "We'll nudge you when something's due.",
      });
    } else {
      toast.error("Notifications blocked.");
    }
  }

  const { upcoming, done } = useMemo(() => {
    const u: ReminderDTO[] = [];
    const d: ReminderDTO[] = [];
    for (const r of reminders) {
      if (r.completedAt) d.push(r);
      else u.push(r);
    }
    return { upcoming: u, done: d };
  }, [reminders]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reminders 🔔</h1>
            <p className="mt-1 text-sm text-gray-600">
              Vaccines, flea/tick, weigh-ins — never miss a date.
            </p>
          </div>
          <button
            onClick={enableNotifications}
            className="shrink-0 rounded-xl border border-brand/20 bg-white px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/5"
          >
            🔔 Enable alerts
          </button>
        </div>

        <div className="mt-4">
          <DogSelector dogs={dogs} selectedId={dogId} onChange={setDogId} />
        </div>

        <form onSubmit={addReminder} className="card mt-5 space-y-3">
          <div>
            <label className="label">Type</label>
            <div className="mt-1 grid grid-cols-4 gap-2 md:grid-cols-7">
              {REMINDER_KINDS.map((k) => (
                <button
                  type="button"
                  key={k.key}
                  onClick={() => setKind(k.key)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl border-2 p-2 text-[11px] font-semibold ${
                    kind === k.key
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-transparent bg-white text-gray-700"
                  }`}
                >
                  <span className="text-xl">{k.emoji}</span>
                  <span>{k.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Title</label>
            <input
              className="input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rabies booster"
              maxLength={120}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">Due date</label>
              <input
                type="date"
                className="input mt-1"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Repeat every (days) — optional</label>
              <input
                type="number"
                min="1"
                className="input mt-1"
                value={recurDays}
                onChange={(e) => setRecurDays(e.target.value)}
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? "Adding…" : "Add reminder"}
          </button>
        </form>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
            Upcoming ({upcoming.length})
          </h2>
          {loading ? (
            <div className="h-16 animate-pulse rounded-2xl bg-gray-200" />
          ) : upcoming.length === 0 ? (
            <div className="card text-center text-sm text-gray-500">
              Nothing pending. Nice work! 🐾
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((r) => (
                <ReminderRow
                  key={r.id}
                  reminder={r}
                  onComplete={() => complete(r.id)}
                  onDelete={() => remove(r.id)}
                />
              ))}
            </ul>
          )}
        </section>

        {done.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
              Completed
            </h2>
            <ul className="space-y-2 opacity-60">
              {done.slice(0, 20).map((r) => (
                <ReminderRow
                  key={r.id}
                  reminder={r}
                  onComplete={() => {}}
                  onDelete={() => remove(r.id)}
                  done
                />
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function ReminderRow({
  reminder,
  onComplete,
  onDelete,
  done,
}: {
  reminder: ReminderDTO;
  onComplete: () => void;
  onDelete: () => void;
  done?: boolean;
}) {
  const meta = REMINDER_KINDS.find((k) => k.key === reminder.kind);
  const due = new Date(reminder.dueDate);
  const days = Math.round(
    (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const status =
    days < 0
      ? { label: `${Math.abs(days)}d overdue`, cls: "text-severity-red" }
      : days === 0
      ? { label: "Today", cls: "text-severity-yellow" }
      : days <= 7
      ? { label: `in ${days}d`, cls: "text-severity-yellow" }
      : { label: `in ${days}d`, cls: "text-gray-500" };

  return (
    <li className="card flex items-center gap-3 p-3">
      <div className="text-2xl">{meta?.emoji ?? "📌"}</div>
      <div className="min-w-0 flex-1">
        <div
          className={`truncate font-semibold ${
            done ? "text-gray-500 line-through" : "text-gray-900"
          }`}
        >
          {reminder.title}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">
            {due.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {!done && <span className={`font-semibold ${status.cls}`}>· {status.label}</span>}
          {reminder.recurDays && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
              repeats every {reminder.recurDays}d
            </span>
          )}
        </div>
      </div>
      {!done && (
        <button
          onClick={onComplete}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white"
        >
          ✓ Done
        </button>
      )}
      <button
        onClick={onDelete}
        className="rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-severity-red"
      >
        ✕
      </button>
    </li>
  );
}
