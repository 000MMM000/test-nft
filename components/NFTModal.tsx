"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ALL_NFTS, RARITY_COLOR, RARITY_STRIPE, RARITY_BG, type Rarity } from "@/lib/mockNFTs";

type Tab = "traits" | "orders" | "activity";

function NFTArt({ id, rarity }: { id: number; rarity: Rarity }) {
  const seed = id * 7919;
  const r = (n: number) => ((seed * (n + 1) * 1103515245) & 0x7fffffff) % 100;
  const col = RARITY_COLOR[rarity];
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", aspectRatio: "1", display: "block", background: "#080808" }}>
      {[80,160,240,320].map(v => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="400" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
          <line x1="0" y1={v} x2="400" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
        </g>
      ))}
      <circle cx={100 + r(0)*2} cy={100 + r(1)*2} r={40 + r(2)*0.8} fill="none" stroke={col} strokeWidth="1.2" />
      <rect x={r(3)*2.4+40} y={r(4)*2.4+40} width={80+r(5)} height={80+r(6)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <line x1={r(7)*4} y1={r(8)*4} x2={400-r(9)*3} y2={400-r(10)*3} stroke={col} strokeWidth="0.8" opacity="0.4" />
      <line x1={r(11)*4} y1={400-r(12)*2} x2={400-r(13)*2} y2={r(14)*4} stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
      <circle cx={200+r(15)*1.2-60} cy={200+r(16)*1.2-60} r={8+r(17)*0.15} fill={col} opacity="0.55" />
      <circle cx={r(18)*3+60} cy={r(19)*3+60} r={3+r(20)*0.05} fill="rgba(255,255,255,0.2)" />
      <path d="M0 28 L0 0 L28 0" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M372 0 L400 0 L400 28" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M400 372 L400 400 L372 400" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M28 400 L0 400 L0 372" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    </svg>
  );
}

interface Props {
  id: number;
  onClose: () => void;
  ownerActions?: { listed: boolean; listPrice: number | null };
}

const RARITY_RGB: Record<string, string> = {
  Common:    "255,255,255",
  Rare:      "100,160,255",
  Epic:      "160,100,255",
  Legendary: "255,190,60",
};

const WAVES = [
  { yRatio: 0.15, freq: 0.006, amp: 32, speed: 0.18, phase: 0,   a: 0.06, w: 0.8 },
  { yRatio: 0.30, freq: 0.011, amp: 20, speed: 0.32, phase: 1.2, a: 0.09, w: 1.0 },
  { yRatio: 0.48, freq: 0.008, amp: 38, speed: 0.22, phase: 2.5, a: 0.05, w: 0.7 },
  { yRatio: 0.65, freq: 0.014, amp: 15, speed: 0.42, phase: 0.8, a: 0.08, w: 0.9 },
  { yRatio: 0.82, freq: 0.005, amp: 28, speed: 0.15, phase: 3.1, a: 0.04, w: 0.6 },
];

function SheetBg({ rarity }: { rarity: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rgb = RARITY_RGB[rarity] ?? RARITY_RGB.Common;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const waves = WAVES.map(w => ({ ...w }));
    let w = 0, h = 0, raf = 0;

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      // radial glow bottom-center
      const g = ctx.createRadialGradient(w * 0.5, h, 0, w * 0.5, h, w * 0.7);
      g.addColorStop(0,   `rgba(${rgb},0.10)`);
      g.addColorStop(0.5, `rgba(${rgb},0.04)`);
      g.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // waves
      for (const wave of waves) {
        wave.phase += wave.speed * 0.012;
        const baseY = wave.yRatio * h;
        ctx.beginPath();
        ctx.moveTo(0, baseY + Math.sin(wave.phase) * wave.amp);
        for (let x = 1; x <= w; x += 2) {
          ctx.lineTo(x, baseY + Math.sin(x * wave.freq + wave.phase) * wave.amp);
        }
        ctx.strokeStyle = `rgba(${rgb},${wave.a})`;
        ctx.lineWidth = wave.w;
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    tick();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [rgb]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />;
}

export default function NFTModal({ id, onClose, ownerActions }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef    = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("traits");

  const nft = ALL_NFTS.find(n => n.id === id) ?? ALL_NFTS[0];
  const col    = RARITY_COLOR[nft.rarity];
  const stripe = RARITY_STRIPE[nft.rarity];
  const bg     = RARITY_BG[nft.rarity];

  const mono: React.CSSProperties    = { fontFamily: "'Space Mono',monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk',sans-serif" };

  // open animation
  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(sheetRef.current, { y: "100%" }, { y: "0%", duration: 0.45, ease: "power3.out" });
  }, []);

  const close = () => {
    gsap.to(sheetRef.current, { y: "100%", duration: 0.35, ease: "power3.in" });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: onClose });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={close}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "90vh",
          background: "#000",
          borderTop: `1px solid ${col.replace(/[\d.]+\)$/, "0.2)")}`,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Animated rarity background */}
        <SheetBg rarity={nft.rarity} />

        {/* Rarity stripe */}
        <div style={{ height: "3px", background: stripe, flexShrink: 0, position: "relative", zIndex: 1 }} />

        {/* Close handle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
          <span style={{ ...mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
            TEST #{String(nft.id).padStart(4,"0")}
          </span>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", ...mono, fontSize: "18px", lineHeight: 1, padding: "0 4px" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >×</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "flex-start" }}>

            {/* Art */}
            <div style={{ border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <NFTArt id={nft.id} rarity={nft.rarity} />
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              <div>
                <h1 style={{ ...grotesk, fontWeight: 800, fontSize: "32px", letterSpacing: "-1.5px", color: "#fff", marginBottom: "8px" }}>
                  TEST #{String(nft.id).padStart(4,"0")}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", ...mono, fontSize: "10px", textTransform: "uppercase", color: col }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: col, display: "inline-block" }} />
                    {nft.rarity}
                  </span>
                  <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    Owned by <span style={{ color: "rgba(255,255,255,0.6)" }}>{nft.owner}</span>
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
                {[["Top Offer", nft.topOffer], ["Collection Floor", nft.collectionFloor], ["Last Sale", nft.lastSale]].map(([label, val]) => (
                  <div key={label as string} style={{ flex: 1, background: "#0a0a0a", padding: "14px 18px" }}>
                    <p style={{ ...mono, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "5px" }}>{label}</p>
                    <p style={{ ...grotesk, fontWeight: 700, fontSize: "14px", color: "#fff" }}>{val === null ? "—" : `${val} tDUST`}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {ownerActions ? (
                /* ── Owner view ── */
                <div style={{ border: `1px solid ${col.replace(/[\d.]+\)$/, "0.2)")}`, padding: "18px 22px", background: bg }}>
                  {ownerActions.listed ? (
                    <>
                      <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>Listed at</p>
                      <p style={{ ...grotesk, fontWeight: 800, fontSize: "26px", letterSpacing: "-1px", color: "#fff", marginBottom: "14px" }}>{ownerActions.listPrice} tDUST</p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ flex: 1, padding: "11px", background: "transparent", color: "rgba(255,80,80,0.9)", border: "1px solid rgba(255,80,80,0.3)", ...mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Delist</button>
                        <button style={{ flex: 1, padding: "11px", background: "#fff", color: "#000", ...grotesk, fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>Accept offer</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "14px" }}>Not listed</p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={{ flex: 1, padding: "11px", background: "#fff", color: "#000", ...grotesk, fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>List for sale</button>
                        <button style={{ padding: "11px 18px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", ...mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Accept offer</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ── Buyer view ── */
                nft.listed ? (
                  <div style={{ border: `1px solid ${col.replace(/[\d.]+\)$/, "0.2)")}`, padding: "18px 22px", background: bg }}>
                    <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>Listed</p>
                    <p style={{ ...grotesk, fontWeight: 800, fontSize: "26px", letterSpacing: "-1px", color: "#fff", marginBottom: "14px" }}>{nft.price} tDUST</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ flex: 1, padding: "11px", background: "#fff", color: "#000", ...grotesk, fontWeight: 600, fontSize: "13px", border: "none", cursor: "pointer" }}>Buy now</button>
                      <button style={{ padding: "11px 18px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", ...mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Make offer</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: "1px solid rgba(255,255,255,0.07)", padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>Not listed</p>
                    <button style={{ padding: "9px 16px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", ...mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>Make offer</button>
                  </div>
                )
              )}

              {/* Tabs */}
              <div>
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: "16px" }}>
                  {(["traits","orders","activity"] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                      ...mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
                      background: "none", border: "none", cursor: "pointer", padding: "8px 14px",
                      color: tab === t ? "#fff" : "rgba(255,255,255,0.3)",
                      borderBottom: tab === t ? "1px solid #fff" : "1px solid transparent",
                      marginBottom: "-1px", transition: "color 0.15s",
                    }}>{t}</button>
                  ))}
                </div>

                {tab === "traits" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {nft.traits.map(tr => (
                      <div key={tr.type} style={{ background: bg, border: `1px solid ${col.replace(/[\d.]+\)$/, "0.15)")}`, padding: "12px 14px" }}>
                        <p style={{ ...mono, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "4px" }}>{tr.type}</p>
                        <p style={{ ...grotesk, fontWeight: 600, fontSize: "13px", color: "#fff", marginBottom: "8px" }}>{tr.value}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ ...mono, fontSize: "9px", background: col.replace(/[\d.]+\)$/, "0.15)"), color: col, padding: "2px 7px" }}>
                            {tr.count.toLocaleString()} · {tr.pct}
                          </span>
                          <span style={{ ...mono, fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{Math.round(nft.collectionFloor * 0.9)} tDUST</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "orders" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.5fr 1.2fr 0.7fr", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "8px", marginBottom: "4px" }}>
                      {["Type","Price","Qty","From","Expiry"].map(h => <span key={h} style={{ ...mono, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>{h}</span>)}
                    </div>
                    {nft.orders.map((o, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 0.5fr 1.2fr 0.7fr", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                        <span style={{ ...mono, fontSize: "10px", color: o.type === "Item Offer" ? col : "rgba(255,255,255,0.45)" }}>{o.type}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "#fff" }}>{o.price} tDUST</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>{o.qty}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>{o.from}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{o.expiry}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "activity" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1.2fr 0.8fr", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "8px", marginBottom: "4px" }}>
                      {["Event","Price","From","To","Time"].map(h => <span key={h} style={{ ...mono, fontSize: "8px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>{h}</span>)}
                    </div>
                    {nft.activity.map((a, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 1.2fr 0.8fr", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                        <span style={{ ...mono, fontSize: "10px", color: a.event === "Sale" ? "rgba(100,220,130,0.9)" : a.event === "Mint" ? "rgba(120,180,255,0.8)" : "rgba(255,255,255,0.55)" }}>{a.event}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "#fff" }}>{a.price ? `${a.price} tDUST` : "—"}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{a.from}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{a.to}</span>
                        <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
