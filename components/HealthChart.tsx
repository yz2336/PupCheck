"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { ScanDTO } from "@/types";

const SEV_SCORE: Record<string, number> = { green: 1, yellow: 2, red: 3 };
const SEV_LABEL: Record<number, string> = { 1: "Good", 2: "Monitor", 3: "Vet" };

export default function HealthChart({ scans }: { scans: ScanDTO[] }) {
  if (!scans || scans.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        No scan data yet. Do your first scan to see trends.
      </div>
    );
  }

  const sorted = [...scans].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const data = sorted.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    score: SEV_SCORE[s.aiResult.severity] ?? 2,
    title: s.aiResult.title,
    type: s.scanType,
  }));

  return (
    <div className="h-56 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0efeb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => SEV_LABEL[v] ?? ""}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number) => [SEV_LABEL[value] ?? value, "Severity"]}
            labelFormatter={(l) => `Date: ${l}`}
          />
          <ReferenceLine y={1} stroke="#22C55E" strokeDasharray="3 3" />
          <ReferenceLine y={2} stroke="#EAB308" strokeDasharray="3 3" />
          <ReferenceLine y={3} stroke="#EF4444" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0F6E56"
            strokeWidth={2.5}
            dot={{ r: 5, strokeWidth: 2 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
