"use client";

import Nav from "@/components/Nav";
import MintSection from "@/components/MintSection";

const PLACEHOLDER_CARDS = [
  { id: "001", shade: "#0a0a0a" },
  { id: "002", shade: "#111" },
  { id: "003", shade: "#0d0d0d" },
  { id: "004", shade: "#0f0f0f" },
  { id: "005", shade: "#0b0b0b" },
  { id: "006", shade: "#131313" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Nav />

      {/* Mint section */}
      <MintSection />

      {/* Collection preview */}
      <section id="collection" className="max-w-5xl mx-auto px-6 py-24 border-t border-border">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-black text-xl tracking-tight">Collection Preview</h2>
          <span className="font-mono text-xs text-muted">Revealed after mint-out</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLACEHOLDER_CARDS.map((card) => (
            <div key={card.id} className="nft-card border border-border rounded-sm overflow-hidden">
              {/* Placeholder art */}
              <div
                className="aspect-square relative overflow-hidden"
                style={{ background: card.shade }}
              >
                <div className="nft-noise absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs text-muted opacity-30">?</span>
                </div>
              </div>
              {/* Card meta */}
              <div className="p-2 bg-surface border-t border-border">
                <p className="font-mono text-xs text-muted">#{card.id}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="font-black text-white tracking-tighter">VOID</span>
          <div className="flex items-center gap-6 text-xs text-muted font-mono uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
          </div>
          <span className="font-mono text-xs text-muted">Midnight Chain</span>
        </div>
      </footer>
    </div>
  );
}
