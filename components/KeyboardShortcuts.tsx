"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SHORTCUTS: { key: string; label: string; action: (r: ReturnType<typeof useRouter>) => void }[] = [
  { key: "d", label: "Dashboard", action: (r) => r.push("/dashboard") },
  { key: "n", label: "New scan", action: (r) => r.push("/scan") },
  { key: "c", label: "Chat", action: (r) => r.push("/chat") },
  { key: "h", label: "History", action: (r) => r.push("/history") },
  { key: "s", label: "Settings", action: (r) => r.push("/settings") },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }
      const hit = SHORTCUTS.find((s) => s.key === e.key.toLowerCase());
      if (hit) {
        e.preventDefault();
        hit.action(router);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900">Keyboard shortcuts</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          {SHORTCUTS.map((s) => (
            <li key={s.key} className="flex items-center justify-between">
              <span>{s.label}</span>
              <kbd className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-mono text-gray-700">
                {s.key.toUpperCase()}
              </kbd>
            </li>
          ))}
          <li className="flex items-center justify-between border-t pt-2">
            <span>Show this help</span>
            <kbd className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-mono text-gray-700">
              ?
            </kbd>
          </li>
        </ul>
        <button
          onClick={() => setShowHelp(false)}
          className="mt-4 w-full rounded-xl bg-gray-100 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
        >
          Close (Esc)
        </button>
      </div>
    </div>
  );
}
