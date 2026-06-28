"use client";

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963a.074.074 0 0 0-.041-.104 13.2 13.2 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
  </svg>
);

const SOCIALS = [
  { label: "Twitter", href: "#", Icon: XIcon },
  { label: "Discord", href: "#", Icon: DiscordIcon },
];

export default function Footer() {
  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };

  return (
    <footer style={{ position: "relative", zIndex: 10, maxWidth: "1100px", margin: "0 auto", padding: "0 32px 64px" }}>
      <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "40px" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>

        {/* Logo */}
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "18px", letterSpacing: "-1px", color: "#fff" }}>
          TEST
        </span>

        {/* Social buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "9px 18px",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "100px",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
                ...mono, fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
            >
              <Icon />
              {label}
            </a>
          ))}
        </div>

        {/* Chain label */}
        <span style={{ ...mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
          Midnight Chain
        </span>

      </div>
    </footer>
  );
}
