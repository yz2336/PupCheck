"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

function apply(mode: Mode) {
  const root = document.documentElement;
  const effective =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  root.classList.toggle("dark", effective === "dark");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("pupcheck-theme") as Mode) || "system";
    setMode(stored);
    apply(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("pupcheck-theme") as Mode) === "system") {
        apply("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    const next: Mode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(next);
    localStorage.setItem("pupcheck-theme", next);
    apply(next);
  }

  const icon = mode === "light" ? "☀️" : mode === "dark" ? "🌙" : "🖥️";
  const label =
    mode === "light"
      ? "Light"
      : mode === "dark"
      ? "Dark"
      : "System";

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
      className="rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-100"
    >
      <span>{icon}</span>
    </button>
  );
}
