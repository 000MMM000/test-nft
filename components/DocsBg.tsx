"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CELL = 72;
// States: 0=idle, 1=fadein, 2=hold, 3=fadeout
interface Cell { x: number; y: number; a: number; state: number; hold: number; }

export default function DocsBg() {
  const scan1Ref = useRef<HTMLDivElement>(null);
  const scan2Ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Slow scan lines
    if (scan1Ref.current) {
      gsap.fromTo(scan1Ref.current,
        { top: "-2px" },
        { top: "100vh", duration: 14, ease: "none", repeat: -1, delay: 0 }
      );
    }
    if (scan2Ref.current) {
      gsap.fromTo(scan2Ref.current,
        { top: "-2px" },
        { top: "100vh", duration: 22, ease: "none", repeat: -1, delay: 7 }
      );
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, rafId = 0;
    let cells: Cell[] = [];

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cells = [];
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          cells.push({ x: i * CELL, y: j * CELL, a: 0, state: 0, hold: 0 });
        }
      }
    };

    // Activate random cell every 600ms — far fewer, far slower
    const interval = setInterval(() => {
      // pick 1-2 idle cells
      const idle = cells.filter(c => c.state === 0);
      if (idle.length === 0) return;
      const pick = idle[Math.floor(Math.random() * idle.length)];
      pick.state = 1;
    }, 600);

    const FADE_IN  = 0.0025;  // very slow fade in
    const MAX_A    = 0.13;
    const HOLD_MAX = 180;     // frames to hold (~3s at 60fps)
    const FADE_OUT = 0.0012;  // even slower fade out

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.11)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x += CELL) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += CELL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      for (const c of cells) {
        if (c.state === 0) continue;

        if (c.state === 1) {          // fading in
          c.a += FADE_IN;
          if (c.a >= MAX_A) { c.a = MAX_A; c.state = 2; c.hold = HOLD_MAX; }
        } else if (c.state === 2) {   // holding
          c.hold--;
          if (c.hold <= 0) c.state = 3;
        } else if (c.state === 3) {   // fading out
          c.a -= FADE_OUT;
          if (c.a <= 0) { c.a = 0; c.state = 0; }
        }

        ctx.fillStyle = `rgba(255,255,255,${c.a})`;
        ctx.fillRect(c.x + 1, c.y + 1, CELL - 2, CELL - 2);
      }

      rafId = requestAnimationFrame(tick);
    };

    init();
    tick();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div ref={scan1Ref} style={{
        position: "fixed", left: 0, right: 0, height: "1px", zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 60%, transparent)",
      }} />
      <div ref={scan2Ref} style={{
        position: "fixed", left: 0, right: 0, height: "1px", zIndex: 1, pointerEvents: "none",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.07) 60%, transparent)",
      }} />
    </>
  );
}
