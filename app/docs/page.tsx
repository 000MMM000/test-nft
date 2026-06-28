"use client";

export default function DocsPage() {
  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 32px 96px" }}>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "11px", letterSpacing: "0.2em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
        marginBottom: "16px",
      }}>
        Documentation
      </p>
      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 800, fontSize: "clamp(40px, 6vw, 64px)",
        letterSpacing: "-2px", lineHeight: 0.95, color: "#fff",
      }}>
        Docs
      </h1>
    </div>
  );
}
