"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number;
}

const MOUSE_RADIUS = 170;
const CONNECT_RADIUS = 110;

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, rafId = 0;
    let particles: Particle[] = [];
    const mouse = { x: -2000, y: -2000 };

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(Math.floor((w * h) / 9000), 220);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.2 + 0.07,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const factor = d < MOUSE_RADIUS ? 1 - d / MOUSE_RADIUS : 0;

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + factor * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.a + factor * 0.75})`;
        ctx.fill();

        // Lines to nearby particles when mouse close
        if (factor > 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const ddx = p.x - p2.x;
            const ddy = p.y - p2.y;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < CONNECT_RADIUS) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255,255,255,${factor * 0.45 * (1 - dd / CONNECT_RADIUS)})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -2000; mouse.y = -2000; };

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
