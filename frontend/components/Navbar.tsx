/**
 * Navbar — sticky, glassmorphism, with brand logo and CTA
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(8, 8, 16, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--gradient-brand)" }}>
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
          Resume<span className="gradient-text">IQ</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <Link href="/#features"
          className="transition-colors duration-200"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--foreground-muted)"}
        >
          Features
        </Link>
        <Link href="/#how-it-works"
          className="transition-colors duration-200"
          style={{ color: "var(--foreground-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--foreground)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--foreground-muted)"}
        >
          How it works
        </Link>
      </nav>

      {/* CTA */}
      <Link href="/analyze">
        <button className="btn-glow px-5 py-2 text-sm font-semibold text-white cursor-pointer">
          Analyze My Resume →
        </button>
      </Link>
    </header>
  );
}
