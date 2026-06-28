"use client";

const FILTERS = ["All", "Common", "Rare", "Epic", "Legendary"];

export default function MarketPage() {
  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  const grotesk: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 32px 96px" }}>

      {/* Header */}
      <div style={{ marginBottom: "48px" }}>
        <p style={{ ...mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "16px" }}>
          TEST Collection
        </p>
        <h1 style={{ ...grotesk, fontWeight: 800, fontSize: "clamp(40px, 6vw, 64px)", letterSpacing: "-2px", lineHeight: 0.95, color: "#fff", marginBottom: "24px" }}>
          Market
        </h1>
        <p style={{ ...grotesk, fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: "480px" }}>
          Buy and sell TEST NFTs. Listings go live after mint-out.
        </p>
      </div>

      <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "40px" }} />

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FILTERS.map((f, i) => (
            <button key={f} style={{
              ...mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "8px 16px",
              background: i === 0 ? "#fff" : "transparent",
              color: i === 0 ? "#000" : "rgba(255,255,255,0.45)",
              border: i === 0 ? "1px solid #fff" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: "4px", cursor: "pointer",
            }}>
              {f}
            </button>
          ))}
        </div>
        <span style={{ ...mono, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
          0 listings
        </span>
      </div>

      {/* Empty state */}
      <div style={{ border: "1px solid rgba(255,255,255,0.07)", padding: "96px 32px", textAlign: "center", background: "#0a0a0a" }}>
        <p style={{ ...mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "16px" }}>
          No listings yet
        </p>
        <p style={{ ...grotesk, fontSize: "15px", color: "rgba(255,255,255,0.35)" }}>
          Market opens after mint-out. Come back soon.
        </p>
      </div>

    </div>
  );
}
