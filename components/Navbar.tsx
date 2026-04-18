"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/scan", label: "Scan" },
    { href: "/chat", label: "Chat" },
    { href: "/history", label: "History" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-brand">
          <span className="text-2xl">🐶</span>
          <span className="text-lg tracking-tight">PupCheck</span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
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

        {session?.user && (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Sign out
          </button>
        )}
      </div>

      <nav className="flex overflow-x-auto border-t border-black/5 bg-white px-2 py-2 md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`mx-1 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              pathname?.startsWith(l.href)
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
