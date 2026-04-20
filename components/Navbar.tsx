"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import KeyboardShortcuts from "./KeyboardShortcuts";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/scan", label: "Scan", icon: "🔍" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/history", label: "History", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <>
      <KeyboardShortcuts />
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-[#0f1715]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-brand"
          >
            <span className="text-2xl">🐶</span>
            <span className="text-lg tracking-tight">PupCheck</span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname?.startsWith(l.href)
                    ? "bg-brand/10 text-brand"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {session?.user && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-black/5 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-[#0f1715]/95 md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
                  active ? "text-brand" : "text-gray-500"
                }`}
              >
                <span className="text-xl leading-none">{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
