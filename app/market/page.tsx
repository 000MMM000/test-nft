"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ALL_NFTS, RARITY_COLOR, RARITY_STRIPE, type Rarity } from "@/lib/mockNFTs";
import NFTModal from "@/components/NFTModal";

type Status = "all" | "listed" | "unlisted";
type SortKey = "id" | "price_asc" | "price_desc" | "recent";
type RarityFilter = "All" | Rarity;

const RARITIES = ["Common", "Rare", "Epic", "Legendary"] as const;
const PAGE_SIZE = 20;

function CardArt({ id, rarity }: { id: number; rarity: Rarity }) {
  const seed = id * 7919;
  const r = (n: number) => ((seed * (n + 1) * 1103515245) & 0x7fffffff) % 100;
  const col = RARITY_COLOR[rarity];
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", aspectRatio: "1", display: "block", background: "#080808" }}>
      {[40,80,120,160].map(v => (
        <g key={v}>
          <line x1={v} y1="0" x2={v} y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="0" y1={v} x2="200" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </g>
      ))}
      <circle cx={50 + r(0)} cy={50 + r(1)} r={20 + r(2) * 0.4} fill="none" stroke={col} strokeWidth="0.8" />
      <rect x={r(3) * 1.2 + 20} y={r(4) * 1.2 + 20} width={40 + r(5) * 0.5} height={40 + r(6) * 0.5} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
      <line x1={r(7) * 2} y1={r(8) * 2} x2={200 - r(9) * 1.5} y2={200 - r(10) * 1.5} stroke={col} strokeWidth="0.5" opacity="0.4" />
      <circle cx={100 + r(11) * 0.6 - 30} cy={100 + r(12) * 0.6 - 30} r={4 + r(13) * 0.08} fill={col} opacity="0.5" />
      <path d="M0 14 L0 0 L14 0" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M186 0 L200 0 L200 14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M200 186 L200 200 L186 200" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
      <path d="M14 200 L0 200 L0 186" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
    </svg>
  );
}

function NFTCard({ nft, onSelect }: { nft: typeof ALL_NFTS[0]; onSelect: (id: number) => void }) {
  const [hov, setHov] = useState(false);
  const col = RARITY_COLOR[nft.rarity];
  return (
    <div
      onClick={() => onSelect(nft.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#0a0a0a",
        border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        cursor: "pointer", transition: "border-color 0.2s",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      <div style={{ height: "2px", background: RARITY_STRIPE[nft.rarity], opacity: hov ? 1 : 0.7, transition: "opacity 0.2s" }} />
      <CardArt id={nft.id} rarity={nft.rarity} />
      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
      <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#fff" }}>
            #{String(nft.id).padStart(4, "0")}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "9px", textTransform: "uppercase", color: col }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: col, display: "inline-block" }} />
            {nft.rarity}
          </span>
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "13px", color: nft.listed ? "#fff" : "rgba(255,255,255,0.2)" }}>
          {nft.listed ? `${nft.price} tDUST` : "—"}
        </div>
      </div>
    </div>
  );
}

function FilterItem({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: "0.08em",
      textTransform: "uppercase", background: "none", border: "none", cursor: "pointer",
      padding: "6px 0", textAlign: "left", display: "flex", alignItems: "center", gap: "8px",
      color: active ? "#fff" : hov ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)",
      transition: "color 0.15s",
      borderBottom: active ? "1px solid rgba(255,255,255,0.35)" : "1px solid transparent",
    }}>
      {dot && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      {label}
    </button>
  );
}

export default function MarketPage() {
  const mono: React.CSSProperties    = { fontFamily: "'Space Mono',monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk',sans-serif" };

  const [status,       setStatus]       = useState<Status>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("All");
  const [sort,         setSort]         = useState<SortKey>("recent");
  const [loaded,       setLoaded]       = useState(PAGE_SIZE);
  const [selectedId,   setSelectedId]   = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = [...ALL_NFTS];
    if (status === "listed")    list = list.filter(n => n.listed);
    if (status === "unlisted")  list = list.filter(n => !n.listed);
    if (rarityFilter !== "All") list = list.filter(n => n.rarity === rarityFilter);
    if (sort === "price_asc")   list.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
    if (sort === "price_desc")  list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "id")          list.sort((a, b) => a.id - b.id);
    if (sort === "recent")      list.sort((a, b) => b.id - a.id);
    return list;
  }, [status, rarityFilter, sort]);

  const visible = filtered.slice(0, loaded);
  useEffect(() => { setLoaded(PAGE_SIZE); }, [status, rarityFilter, sort]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLoaded(p => Math.min(p + PAGE_SIZE, filtered.length)); },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length]);

  const sortOptions: [SortKey, string][] = [["recent","Recent"],["id","ID #"],["price_asc","Price ↑"],["price_desc","Price ↓"]];

  return (
    <>
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px 96px" }}>

      <div style={{ marginBottom: "40px" }}>
        <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "10px" }}>
          TEST Collection
        </p>
        <h1 style={{ ...grotesk, fontWeight: 800, fontSize: "clamp(36px,5vw,56px)", letterSpacing: "-2px", lineHeight: 1, color: "#fff" }}>
          Market
        </h1>
      </div>

      <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "36px" }} />

      <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>

        {/* Sidebar */}
        <div style={{ width: "160px", flexShrink: 0 }}>
          <div style={{ marginBottom: "28px" }}>
            <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "8px" }}>Status</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <FilterItem label="All"        active={status === "all"}      onClick={() => setStatus("all")} />
              <FilterItem label="Listed"     active={status === "listed"}   onClick={() => setStatus("listed")} />
              <FilterItem label="Not listed" active={status === "unlisted"} onClick={() => setStatus("unlisted")} />
            </div>
          </div>
          <div>
            <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "8px" }}>Rarity</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <FilterItem label="All" active={rarityFilter === "All"} onClick={() => setRarityFilter("All")} />
              {RARITIES.map(r => (
                <FilterItem key={r} label={r} active={rarityFilter === r} onClick={() => setRarityFilter(r)} dot={RARITY_COLOR[r]} />
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.2)", marginRight: "12px" }}>Sort</span>
              {sortOptions.map(([key, label]) => (
                <button key={key} onClick={() => setSort(key)} style={{
                  ...mono, fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase",
                  background: "none", border: "none", cursor: "pointer", padding: "4px 10px",
                  color: sort === key ? "#fff" : "rgba(255,255,255,0.28)",
                  borderBottom: sort === key ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                  transition: "color 0.15s",
                }}>{label}</button>
              ))}
            </div>
            <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>{filtered.length} items</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "80px", textAlign: "center" }}>
              <p style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>No results</p>
            </div>
          ) : (
            <div style={{
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              padding: "0 16px",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "12px" }}>
                {visible.map(nft => <NFTCard key={nft.id} nft={nft} onSelect={setSelectedId} />)}
              </div>
            </div>
          )}
          <div ref={sentinelRef} style={{ height: "1px" }} />
        </div>
      </div>
    </div>

    {selectedId !== null && (
      <NFTModal id={selectedId} onClose={() => setSelectedId(null)} />
    )}
  </>
  );
}
