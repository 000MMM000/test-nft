"use client";

import { useState } from "react";

const TOTAL_SUPPLY = 10_000;
const PRICE = 25; // DUST placeholder
// Replace with real minted count from contract later
const MINTED = 0;

export default function MintSection() {
  const [qty, setQty] = useState(1);

  const pct = Math.min((MINTED / TOTAL_SUPPLY) * 100, 100);
  const remaining = TOTAL_SUPPLY - MINTED;

  return (
    <section id="mint" className="max-w-lg mx-auto px-6 pt-40 pb-24">

      {/* Label */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-8">
        Midnight Chain · Public Mint
      </p>

      {/* Heading */}
      <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-none text-white mb-4 fade-up">
        VOID
      </h1>
      <p className="text-secondary text-sm leading-relaxed mb-12 fade-up-2">
        10,000 unique pieces. Privacy-first.
        <br />
        Connect your Midnight wallet to mint.
      </p>

      {/* Mint card */}
      <div className="border border-border bg-surface rounded-sm p-6 space-y-6 fade-up-3">

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted uppercase tracking-widest">Minted</span>
            <span className="font-mono text-xs text-secondary">
              <span className="text-white font-bold">{MINTED.toLocaleString()}</span>
              {" "}/ {TOTAL_SUPPLY.toLocaleString()}
            </span>
          </div>
          <div className="h-px w-full bg-border2 relative overflow-visible">
            <div
              className="progress-fill absolute left-0 top-0 h-px bg-white"
              style={{ width: pct + "%" }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-muted">
            <span>{pct.toFixed(1)}%</span>
            <span>{remaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          {[
            { label: "Price",      value: `${PRICE} DUST` },
            { label: "Per wallet", value: "10 max"        },
            { label: "Supply",     value: "10,000"        },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-muted uppercase tracking-widest mb-1">{label}</p>
              <p className="font-mono text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted uppercase tracking-widest">Quantity</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 border border-border2 text-secondary hover:text-white hover:border-border2 transition-colors text-lg leading-none flex items-center justify-center"
            >
              −
            </button>
            <span className="font-mono text-xl font-bold w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(10, q + 1))}
              className="w-8 h-8 border border-border2 text-secondary hover:text-white hover:border-border2 transition-colors text-lg leading-none flex items-center justify-center"
            >
              +
            </button>
          </div>
          <span className="font-mono text-sm text-secondary">
            {qty * PRICE} <span className="text-muted">DUST</span>
          </span>
        </div>

        {/* Mint button */}
        <button
          className="btn-mint w-full py-4 text-sm rounded-sm"
          disabled
        >
          Connect Wallet to Mint
        </button>

        <p className="text-center text-xs text-muted">
          Midnight wallet support coming soon
        </p>

      </div>

    </section>
  );
}
