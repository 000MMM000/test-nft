"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function BackgroundGeo() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slow rotation of the whole group
      gsap.to(".geo-group", {
        rotation: 360,
        duration: 90,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });

      // Individual circles breathe at different speeds
      gsap.to(".geo-c1", { scale: 1.06, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(".geo-c2", { scale: 0.94, duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(".geo-c3", { scale: 1.04, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(".geo-c4", { scale: 0.96, duration: 15, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  const circle = (r: number, extra?: React.CSSProperties) => ({
    position: "absolute" as const,
    width: `${r * 2}px`, height: `${r * 2}px`,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.07)",
    top: "50%", left: "50%",
    transform: `translate(-50%, -50%)`,
    ...extra,
  });

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed", inset: 0,
        zIndex: 0, pointerEvents: "none", overflow: "hidden",
      }}
    >
      {/* Positioned right-center like the reference */}
      <div
        className="geo-group"
        style={{
          position: "absolute",
          right: "-8%", top: "5%",
          width: "65vw", height: "90vh",
        }}
      >
        <div className="geo-c1" style={circle(340)} />
        <div className="geo-c2" style={circle(260, { borderColor: "rgba(255,255,255,0.05)" })} />
        <div className="geo-c3" style={circle(180, { borderColor: "rgba(255,255,255,0.08)" })} />
        <div className="geo-c4" style={circle(110, { borderColor: "rgba(255,255,255,0.06)" })} />
        {/* offset circle like in reference */}
        <div style={{
          ...circle(200),
          top: "30%", left: "70%",
          borderColor: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          ...circle(140),
          top: "65%", left: "40%",
          borderColor: "rgba(255,255,255,0.05)",
        }} />
      </div>
    </div>
  );
}
