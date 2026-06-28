"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL = 10_000;
const MINTED = 0;

export default function MintSection() {
  const [qty, setQty] = useState(1);
  const pct = Math.min((MINTED / TOTAL) * 100, 100);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from([".hero-tag", ".hero-title", ".hero-sub", ".hero-ctas", ".widget-inner"], {
        y: 28, opacity: 0, duration: 0.8,
        stagger: 0.1, ease: "power2.out", delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <section id="mint" style={{ position: "relative", zIndex: 10 }}>

      {/* ── Hero — centered ── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "160px 32px 72px", textAlign: "center" }}>

        <div className="hero-tag" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "36px" }}>
          <div style={{ width: "28px", height: "1px", background: "rgba(255,255,255,0.3)" }} />
          <span style={{ ...mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            Built on Midnight Network
          </span>
          <div style={{ width: "28px", height: "1px", background: "rgba(255,255,255,0.3)" }} />
        </div>

        <h1 className="hero-title" style={{
          ...grotesk, fontWeight: 800,
          fontSize: "clamp(60px, 9vw, 96px)",
          lineHeight: 0.92, letterSpacing: "-3px", color: "#fff",
          marginBottom: "28px",
        }}>
          Mint in<br />
          the{" "}
          <span style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.5)", color: "transparent" }}>
            dark.
          </span>
        </h1>

        <p className="hero-sub" style={{
          ...grotesk, fontSize: "15px", lineHeight: 1.7,
          color: "rgba(255,255,255,0.5)", marginBottom: "40px",
        }}>
          Privacy-first NFT collection on Midnight.<br />
          Your assets shielded by zero-knowledge proofs.
        </p>

      </div>

      {/* ── Mint widget — centered ── */}
      <div id="mint-widget" style={{ display: "flex", justifyContent: "center", padding: "0 32px 128px" }}>
        <div className="widget-inner" style={{
          width: "100%", maxWidth: "460px",
          background: "rgba(10,10,10,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
          padding: "36px",
        }}>

          {/* Progress */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ ...mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Minted</span>
              <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                <span style={{ color: "#fff", fontWeight: 700 }}>{MINTED.toLocaleString()}</span> / {TOTAL.toLocaleString()}
              </span>
            </div>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}>
              <div style={{ height: "1px", background: "#fff", width: pct + "%" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
              <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{pct.toFixed(1)}%</span>
              <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{(TOTAL - MINTED).toLocaleString()} left</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px", padding: "20px 0", marginBottom: "24px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            {[{ label: "Price", value: "FREE" }, { label: "Per wallet", value: "10" }, { label: "Supply", value: "10,000" }].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>{label}</p>
                <p style={{ ...mono, fontSize: "13px", fontWeight: 700, color: "#fff" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <span style={{ ...mono, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {[{ sym: "−", fn: () => setQty(q => Math.max(1, q - 1)) }, { sym: "+", fn: () => setQty(q => Math.min(10, q + 1)) }].map(({ sym, fn }, i) => (
                <button key={i} onClick={fn} style={{
                  width: "30px", height: "30px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "transparent", color: "rgba(255,255,255,0.6)",
                  fontSize: "18px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                >
                  {sym}
                </button>
              ))}
              <span style={{ ...mono, fontSize: "20px", fontWeight: 700, color: "#fff", width: "24px", textAlign: "center" }}>{qty}</span>
            </div>
            <span style={{ ...mono, fontSize: "13px", fontWeight: 700, color: "#fff" }}>FREE</span>
          </div>

          {/* Button */}
          <button disabled style={{
            width: "100%", padding: "14px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)",
            ...grotesk, fontWeight: 600, fontSize: "13px",
            letterSpacing: "0.08em", textTransform: "uppercase",
            cursor: "not-allowed", borderRadius: "4px",
          }}>
            Connect wallet to mint
          </button>

        </div>
      </div>

    </section>
  );
}
