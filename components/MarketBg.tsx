"use client";

import { useEffect, useRef } from "react";

interface Wave {
  yRatio: number;  // vertical position 0-1
  freq: number;
  amp: number;
  speed: number;
  phase: number;
  a: number;       // base opacity
  width: number;   // line width
}

const WAVES: Wave[] = [
  { yRatio: 0.12, freq: 0.007, amp: 28, speed: 0.22, phase: 0,    a: 0.07, width: 0.8 },
  { yRatio: 0.25, freq: 0.013, amp: 18, speed: 0.38, phase: 1.1,  a: 0.10, width: 1.0 },
  { yRatio: 0.37, freq: 0.005, amp: 40, speed: 0.16, phase: 2.3,  a: 0.06, width: 0.6 },
  { yRatio: 0.50, freq: 0.010, amp: 32, speed: 0.30, phase: 0.7,  a: 0.14, width: 1.2 }, // center — most visible
  { yRatio: 0.63, freq: 0.016, amp: 14, speed: 0.48, phase: 3.5,  a: 0.09, width: 0.8 },
  { yRatio: 0.75, freq: 0.006, amp: 36, speed: 0.20, phase: 1.8,  a: 0.07, width: 0.7 },
  { yRatio: 0.88, freq: 0.011, amp: 22, speed: 0.34, phase: 2.9,  a: 0.08, width: 0.9 },
];

export default function MarketBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, rafId = 0;
    let mouseY = -1000;

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const wave of WAVES) {
        wave.phase += wave.speed * 0.012;

        const waveY = wave.yRatio * h;
        const distToMouse = Math.abs(waveY - mouseY);
        const proximity = distToMouse < 180 ? (1 - distToMouse / 180) : 0;
        const opacity = wave.a + proximity * 0.25;
        const amp = wave.amp + proximity * 20;

        ctx.beginPath();
        ctx.moveTo(0, waveY + Math.sin(wave.phase) * amp);

        for (let x = 1; x <= w; x += 2) {
          const y = waveY + Math.sin(x * wave.freq + wave.phase) * amp;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth = wave.width + proximity * 0.6;
        ctx.stroke();
      }

      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => { mouseY = e.clientY; };
    const onLeave = () => { mouseY = -1000; };

    init();
    tick();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
