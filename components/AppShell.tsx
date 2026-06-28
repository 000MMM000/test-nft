"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Nav from "./Nav";
import Footer from "./Footer";
import Background from "./Background";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    gsap.set(cursor, { x: -300, y: -300 });
    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX - 300, y: e.clientY - 300, duration: 0.9, ease: "power3.out", overwrite: "auto" });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      {/* Cursor glow */}
      <div ref={cursorRef} className="cursor-glow" />

      {/* Per-page background */}
      <Background />

      {/* Content */}
      <Nav />
      <main style={{ position: "relative", zIndex: 10 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
