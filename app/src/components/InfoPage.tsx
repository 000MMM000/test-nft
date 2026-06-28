"use client";

export default function InfoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-16">

      {/* About */}
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green/30 bg-green/5 text-green text-xs font-semibold tracking-widest">
          WHAT IS $CLAWD
        </div>
        <h2 className="text-4xl sm:text-5xl font-black leading-tight">
          <span className="text-white">A meme token that </span>
          <span className="grad">only Claude</span>
          <span className="text-white"> can mint.</span>
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
          $CLAWD is a meme token on Solana with a hard supply of 21,000,000.
          Half goes to the community through 10,000 AI-gated mints.
          The other half goes straight into liquidity — locked.
        </p>
      </section>

      {/* Why AI gated */}
      <section className="space-y-5">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Why AI-gated?</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: "No bots",
              desc: "You literally have to talk to an AI to mint. No contract ABI farming, no MEV bots, no scripts.",
            },
            {
              title: "On-chain enforcement",
              desc: "The contract verifies the AI signature. Even if you find the program address, you cannot mint without Claude.",
            },
            {
              title: "Fair distribution",
              desc: "Max 10 mints per wallet. 10,000 mints total. Every participant gets a real chance.",
            },
            {
              title: "100% to liquidity",
              desc: "All SOL from minting goes directly into a Raydium pool. Locked. No team wallet.",
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="border border-border rounded-2xl bg-card p-5 space-y-2 hover:border-purple/40 transition-colors"
            >
              <p className="font-bold text-white">{title}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tokenomics */}
      <section className="space-y-5">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Tokenomics</h3>

        <div className="border border-border rounded-2xl bg-card overflow-hidden">
          {[
            { label: "Public mint",    value: "10,500,000", pct: "50%", dot: "bg-purple" },
            { label: "Liquidity pool", value: "10,500,000", pct: "50%", dot: "bg-green"  },
            { label: "Team",           value: "0",          pct: "0%",  dot: "bg-gray-700" },
          ].map(({ label, value, pct, dot }, i, arr) => (
            <div
              key={label}
              className={"flex items-center justify-between px-5 py-4 " + (i < arr.length - 1 ? "border-b border-border" : "")}
            >
              <div className="flex items-center gap-3">
                <div className={"w-2 h-2 rounded-full " + dot} />
                <span className="text-sm text-gray-300">{label}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm mono text-gray-400">{value}</span>
                <span className="text-sm font-bold text-white w-10 text-right">{pct}</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03]">
            <span className="text-xs text-gray-500">Total Supply</span>
            <span className="text-sm font-black text-white mono">21,000,000 $CLAWD</span>
          </div>
        </div>

        <div className="h-3 rounded-full overflow-hidden flex">
          <div className="bg-purple" style={{ width: "50%" }} />
          <div className="bg-green"  style={{ width: "50%" }} />
        </div>
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple inline-block" />
            Public mint 50%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green inline-block" />
            Liquidity 50%
          </span>
        </div>
      </section>

      {/* Contract info */}
      <section className="space-y-5">
        <h3 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Contract Info</h3>
        <div className="border border-border rounded-2xl bg-card overflow-hidden">
          {[
            { label: "Network",          value: "Solana"                },
            { label: "Token standard",   value: "SPL Token / 6 decimals" },
            { label: "Mint price",       value: "0.015 SOL"             },
            { label: "Max mints",        value: "10,000"                },
            { label: "Max per wallet",   value: "10"                    },
            { label: "Liquidity locked", value: "Raydium / Streamflow"  },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={"flex items-center justify-between px-5 py-3 text-sm " + (i < arr.length - 1 ? "border-b border-border" : "")}
            >
              <span className="text-gray-500">{label}</span>
              <span className="mono text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
