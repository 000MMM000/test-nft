"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const CARDS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1).padStart(4, "0"),
}));

export default function CollectionGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".nft-card", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.01,
      borderColor: "rgba(255,255,255,0.3)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const onLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      borderColor: "rgba(255,255,255,0.06)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <section ref={sectionRef} id="collection" className="relative z-10 max-w-5xl mx-auto px-8 py-32">
      <hr className="section-divider mb-16" />

      <div className="flex items-baseline justify-between mb-12">
        <h2 className="text-2xl font-bold tracking-tight">Collection Preview</h2>
        <span className="price-label text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Revealed after mint-out
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.06)" }}>
        {CARDS.map((card) => (
          <div
            key={card.id}
            className="nft-card cursor-pointer"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            {/* Placeholder art */}
            <div
              className="aspect-square relative overflow-hidden flex items-center justify-center"
              style={{ background: "#0a0a0a" }}
            >
              {/* Subtle geometric placeholder */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.08}>
                <rect x="1" y="1" width="46" height="46" stroke="white" strokeWidth="1"/>
                <line x1="1" y1="24" x2="47" y2="24" stroke="white" strokeWidth="0.5"/>
                <line x1="24" y1="1" x2="24" y2="47" stroke="white" strokeWidth="0.5"/>
                <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="0.5"/>
              </svg>
            </div>
            {/* Meta */}
            <div
              className="p-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="price-label text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                TEST #{card.id}
              </p>
              <p
                className="text-xs mt-1 font-medium"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Unrevealed
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
