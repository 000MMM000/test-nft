"use client";

import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
  a: number;
}

export default function PortfolioBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, rafId = 0;
    let drops: Drop[] = [];
    const COL = 28; // column spacing px

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      drops = [];
      const cols = Math.floor(w / COL);
      for (let i = 0; i < cols; i++) {
        const count = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < count; j++) {
          drops.push({
            x: i * COL + COL / 2,
            y: Math.random() * h,
            speed: 0.3 + Math.random() * 0.7,
            length: 12 + Math.random() * 32,
            a: 0.04 + Math.random() * 0.09,
          });
        }
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const d of drops) {
        const grad = ctx.createLinearGradient(d.x, d.y - d.length, d.x, d.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.5, `rgba(255,255,255,${d.a})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.length);
        ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // leading dot — slightly brighter
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.a * 2.5})`;
        ctx.fill();

        d.y += d.speed;
        if (d.y - d.length > h) d.y = -d.length;
      }

      rafId = requestAnimationFrame(tick);
    };

    init();
    tick();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}
