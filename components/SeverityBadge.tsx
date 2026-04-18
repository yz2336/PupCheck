import type { Severity } from "@/types";

const STYLES: Record<Severity, { bg: string; text: string; label: string; emoji: string }> = {
  green: {
    bg: "bg-severity-green/15 border-severity-green/30",
    text: "text-severity-green",
    label: "Looks Good",
    emoji: "✅",
  },
  yellow: {
    bg: "bg-severity-yellow/15 border-severity-yellow/40",
    text: "text-yellow-700",
    label: "Monitor",
    emoji: "⚠️",
  },
  red: {
    bg: "bg-severity-red/15 border-severity-red/40",
    text: "text-severity-red",
    label: "Vet Visit Recommended",
    emoji: "🚨",
  },
};

export default function SeverityBadge({
  severity,
  small,
}: {
  severity: Severity;
  small?: boolean;
}) {
  const s = STYLES[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${s.bg} ${s.text} ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>{s.emoji}</span>
      {s.label}
    </span>
  );
}
