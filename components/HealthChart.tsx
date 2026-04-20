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
const SEV_COLOR: Record<string, string> = {
  green: "#22C55E",
  yellow: "#EAB308",
  red: "#EF4444",
};

interface Props {
  scans: ScanDTO[];
  onScanClick?: (scanId: string) => void;
}

export default function HealthChart({ scans, onScanClick }: Props) {
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
    severity: s.aiResult.severity,
    title: s.aiResult.title,
    type: s.scanType,
    scanId: s.id,
  }));

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      <div className="h-56">
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
              dot={(props: {
                cx?: number;
                cy?: number;
                payload?: { severity?: string; scanId?: string };
                index?: number;
              }) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null || !payload) {
                  return <g key={index ?? 0} />;
                }
                const color = SEV_COLOR[payload.severity ?? "yellow"];
                return (
                  <circle
                    key={payload.scanId ?? index}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{ cursor: onScanClick ? "pointer" : "default" }}
                    onClick={() => {
                      if (onScanClick && payload.scanId) onScanClick(payload.scanId);
                    }}
                  />
                );
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-black/5 pt-2 text-xs text-gray-600">
        <LegendDot color="#22C55E" label="Healthy" />
        <LegendDot color="#EAB308" label="Monitor" />
        <LegendDot color="#EF4444" label="Urgent" />
        {onScanClick && (
          <span className="text-gray-400">· Tap a dot to open</span>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
