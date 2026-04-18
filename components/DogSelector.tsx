"use client";

import type { DogDTO } from "@/types";

interface Props {
  dogs: DogDTO[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

export default function DogSelector({ dogs, selectedId, onChange }: Props) {
  if (dogs.length === 0) return null;
  if (dogs.length === 1) {
    const d = dogs[0];
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand">
        <span>🐶</span>
        {d.name}
      </div>
    );
  }

  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-500">Which dog?</span>
      <select
        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {dogs.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} ({d.breed})
          </option>
        ))}
      </select>
    </label>
  );
}
