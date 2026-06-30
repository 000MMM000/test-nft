"use client";

import { useState, useMemo } from "react";
import NFTModal from "@/components/NFTModal";

const RARITIES = ["Common", "Rare", "Epic", "Legendary"] as const;
type Rarity = typeof RARITIES[number];
type RarityFilter = "All" | Rarity;

const RARITY_COLOR: Record<Rarity, string> = {
  Common:    "rgba(255,255,255,0.3)",
  Rare:      "rgba(120,180,255,0.7)",
  Epic:      "rgba(180,120,255,0.8)",
  Legendary: "rgba(255,200,80,0.85)",
};
const RARITY_STRIPE: Record<Rarity, string> = {
  Common:    "rgba(255,255,255,0.18)",
  Rare:      "rgba(100,160,255,0.55)",
  Epic:      "rgba(160,100,255,0.65)",
  Legendary: "rgba(255,190,60,0.75)",
};

interface OwnedNFT {
  id: number;
  rarity: Rarity;
  acquired: "mint" | string;
  paid: number | null;
  floor: number;
  listed: boolean;
  listPrice: number | null;
}

// fake wallet data
const WALLET = "0x1a2b...9f0e";
const OWNED: OwnedNFT[] = [
  { id: 7,   rarity: "Legendary", acquired: "2024-02-14", paid: null, floor: 920, listed: false, listPrice: null },
  { id: 42,  rarity: "Epic",      acquired: "2024-02-14", paid: null, floor: 310, listed: true,  listPrice: 350 },
  { id: 88,  rarity: "Epic",      acquired: "2024-03-12", paid: 240,  floor: 310, listed: false, listPrice: null },
  { id: 13,  rarity: "Rare",      acquired: "2024-02-14", paid: null, floor: 82,  listed: false, listPrice: null },
  { id: 201, rarity: "Rare",      acquired: "2024-03-15", paid: 95,   floor: 82,  listed: true,  listPrice: 110 },
  { id: 56,  rarity: "Rare",      acquired: "2024-04-01", paid: 70,   floor: 82,  listed: false, listPrice: null },
  { id: 314, rarity: "Common",    acquired: "2024-02-14", paid: null, floor: 18,  listed: false, listPrice: null },
  { id: 512, rarity: "Common",    acquired: "2024-02-14", paid: null, floor: 18,  listed: false, listPrice: null },
  { id: 99,  rarity: "Common",    acquired: "2024-02-28", paid: 22,   floor: 18,  listed: false, listPrice: null },
];

function pnl(nft: OwnedNFT): number | null {
  if (nft.paid === null) return null;
  return nft.floor - nft.paid;
}

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

function NFTCard({ nft, onSelect }: { nft: OwnedNFT; onSelect: (n: OwnedNFT) => void }) {
  const [hov, setHov] = useState(false);
  const gain = pnl(nft);
  const col = RARITY_COLOR[nft.rarity];

  return (
    <div
      onClick={() => onSelect(nft)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#0a0a0a",
        border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
        cursor: "pointer", transition: "border-color 0.2s",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
      }}
    >
      {nft.listed && (
        <div style={{
          position: "absolute", top: "10px", left: "10px", zIndex: 2,
          fontFamily: "'Space Mono',monospace", fontSize: "8px", letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#000", background: "#fff",
          padding: "3px 7px",
        }}>Listed</div>
      )}
      <div style={{ height: "2px", background: RARITY_STRIPE[nft.rarity], opacity: hov ? 1 : 0.7, transition: "opacity 0.2s" }} />
      <CardArt id={nft.id} rarity={nft.rarity} />
      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

      <div style={{ padding: "12px 14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* ID + rarity */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", color: "#fff" }}>
            #{String(nft.id).padStart(4, "0")}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Space Mono',monospace", fontSize: "9px", textTransform: "uppercase", color: col }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: col, display: "inline-block" }} />
            {nft.rarity}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "3px" }}>Cost</p>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
              {nft.paid === null ? "FREE" : `${nft.paid} tDUST`}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "3px" }}>Floor</p>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "10px", color: "#fff" }}>
              {nft.floor} tDUST
            </p>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          width: "100%", padding: "7px 8px", textAlign: "center",
          background: nft.listed ? "rgba(255,255,255,0.04)" : "transparent",
          border: `1px solid ${nft.listed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
          fontFamily: "'Space Mono',monospace", fontSize: "9px",
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: nft.listed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
        }}>
          {nft.listed ? `Listed · ${nft.listPrice} tDUST` : "Not listed"}
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const mono: React.CSSProperties = { fontFamily: "'Space Mono',monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk',sans-serif" };
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("All");
  const [selectedNFT, setSelectedNFT] = useState<OwnedNFT | null>(null);

  const SORT_MODES = [
    { key: "rarity_desc", label: "Rarity ↓" },
    { key: "rarity_asc",  label: "Rarity ↑" },
    { key: "floor_asc",   label: "Floor ↑" },
    { key: "floor_desc",  label: "Floor ↓" },
  ] as const;
  type SortMode = typeof SORT_MODES[number]["key"];

  const RARITY_RANK: Record<Rarity, number> = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };

  const [sortIdx, setSortIdx] = useState(0);
  const sortMode = SORT_MODES[sortIdx].key as SortMode;

  const filtered = useMemo(() => {
    let list = rarityFilter === "All" ? [...OWNED] : OWNED.filter(n => n.rarity === rarityFilter);
    if (sortMode === "rarity_desc") list.sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]);
    if (sortMode === "rarity_asc")  list.sort((a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity]);
    if (sortMode === "floor_asc")   list.sort((a, b) => a.floor - b.floor);
    if (sortMode === "floor_desc")  list.sort((a, b) => b.floor - a.floor);
    return list;
  }, [rarityFilter, sortMode]);

  const totalFloor = OWNED.reduce((s, n) => s + n.floor, 0);
  const totalCost  = OWNED.reduce((s, n) => s + (n.paid ?? 0), 0);
  const totalPnl   = OWNED.filter(n => n.paid !== null).reduce((s, n) => s + pnl(n)!, 0);

  return (
    <>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 32px 96px" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{ ...mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "10px" }}>
          Your collection
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <h1 style={{ ...grotesk, fontWeight: 800, fontSize: "clamp(36px,5vw,56px)", letterSpacing: "-2px", lineHeight: 1, color: "#fff" }}>
            Portfolio
          </h1>
          <span style={{ ...mono, fontSize: "11px", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px" }}>
            {WALLET}
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "1px", background: "rgba(255,255,255,0.07)" }}>
          {[
            { label: "Owned",     value: `${OWNED.length} NFT` },
            { label: "Est. value",value: `${totalFloor} tDUST` },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: "#0a0a0a", padding: "20px 24px" }}>
              <p style={{ ...mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "8px" }}>{s.label}</p>
              <p style={{ ...grotesk, fontWeight: 700, fontSize: "20px", letterSpacing: "-0.5px", color: "#fff" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "28px" }} />

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["All", ...RARITIES] as RarityFilter[]).map(r => (
            <button key={r} onClick={() => setRarityFilter(r)} style={{
              ...mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
              background: "none", border: "none", cursor: "pointer", padding: "4px 12px",
              color: rarityFilter === r ? "#fff" : "rgba(255,255,255,0.28)",
              borderBottom: rarityFilter === r ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
              transition: "color 0.15s",
            }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setSortIdx(i => (i + 1) % SORT_MODES.length)}
            style={{
              ...mono, fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase",
              background: "none", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "5px 14px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
          >
            {SORT_MODES[sortIdx].label}
          </button>
          <span style={{ ...mono, fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
            {filtered.length} items
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
        {filtered.map(nft => <NFTCard key={nft.id} nft={nft} onSelect={setSelectedNFT} />)}
      </div>

    </div>

    {selectedNFT && (
      <NFTModal
        id={selectedNFT.id}
        onClose={() => setSelectedNFT(null)}
        ownerActions={{ listed: selectedNFT.listed, listPrice: selectedNFT.listPrice }}
      />
    )}
  </>
  );
}
