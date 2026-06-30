"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Mint",      href: "/" },
  { label: "Market",    href: "/market" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Docs",      href: "/docs" },
];

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.style.background = "rgba(0,0,0,0.92)";
        nav.style.borderBottomColor = "rgba(255,255,255,0.1)";
      } else {
        nav.style.background = "rgba(0,0,0,0.55)";
        nav.style.borderBottomColor = "rgba(255,255,255,0.06)";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: "64px",
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "0 32px", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#fff", display: "block",
            animation: "blink 1.6s ease-in-out infinite",
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: "17px",
            letterSpacing: "0.08em", color: "#fff",
            textTransform: "uppercase",
          }}>
            TEST
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          {LINKS.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "13px", fontWeight: 500,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: active ? "#fff" : "rgba(255,255,255,0.45)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  borderBottom: active ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Connect wallet */}
        <button
          disabled
          style={{
            background: "#fff", color: "#000",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600, fontSize: "13px",
            padding: "10px 20px", borderRadius: "6px",
            border: "none", cursor: "not-allowed", opacity: 0.9,
          }}
        >
          Connect wallet
        </button>

      </div>
    </nav>
  );
}
