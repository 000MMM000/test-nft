"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import ClaudChat from "./ClaudChat";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const MAX_MINTS        = 10_000;
const TOKENS_PER_MINT  = 1_050;
const TOTAL_FOR_PUBLIC = MAX_MINTS * TOKENS_PER_MINT;

function truncate(addr: string) {
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

export default function MintPage() {
  const { publicKey } = useWallet();
  const [globalMinted, setGlobalMinted]       = useState(0);
  const [walletMinted, setWalletMinted]       = useState<number | null>(null);
  const [tokenBalance, setTokenBalance]       = useState<number | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res  = await fetch("/api/status");
      const data = await res.json();
      setGlobalMinted(data.totalMinted ?? 0);
    } catch (_e) { /* silent */ }
  }, []);

  const fetchWalletMints = useCallback(async () => {
    if (!publicKey) return;
    try {
      const res  = await fetch("/api/wallet?address=" + publicKey.toBase58());
      const data = await res.json();
      setWalletMinted(data.mintCount ?? 0);
      setTokenBalance(data.balance   ?? 0);
    } catch (_e) { /* silent */ }
  }, [publicKey]);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 3000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  useEffect(() => {
    if (publicKey) {
      fetchWalletMints();
      const t = setInterval(fetchWalletMints, 3000);
      return () => clearInterval(t);
    } else {
      setWalletMinted(null);
      setTokenBalance(null);
    }
  }, [publicKey, fetchWalletMints]);

  const tokensMinted = globalMinted * TOKENS_PER_MINT;
  const pct          = Math.min((tokensMinted / TOTAL_FOR_PUBLIC) * 100, 100);
  const soldOut      = globalMinted >= MAX_MINTS;

  return (
    <div className="max-w-3xl mx-auto px-4 py-24 space-y-12">

      {/* Hero */}
      <section className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple/40 bg-purple/10 text-purple text-xs font-semibold tracking-widest">
          SOLANA / AI-GATED MINT
        </div>

        <h1 className="text-5xl sm:text-7xl font-black leading-none tracking-tight">
          <span className="text-white">MINT </span>
          <span className="grad">$CLAWD</span>
          <br />
          <span className="text-white text-4xl sm:text-5xl font-bold">through Claude</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          Connect wallet. Chat with Clawd Pepe. Get tokens.
          <br />
          No scripts. No bots. Just vibes.
        </p>
      </section>

      {/* Wallet + Status */}
      <section className="space-y-3 relative z-10">
        <div className="border border-border rounded-2xl bg-card/80 p-5 space-y-4">

          {/* Connect wallet */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={"w-2 h-2 rounded-full " + (publicKey ? "bg-green animate-pulse" : "bg-gray-700")} />
              <span className="text-sm text-gray-400 mono">
                {publicKey ? truncate(publicKey.toBase58()) : "Connect your wallet"}
              </span>
            </div>
            <WalletMultiButton />
          </div>

          {/* Wallet stats */}
          {publicKey && (
            <div className="border-t border-border pt-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Your mints</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white mono">{walletMinted ?? "—"}</span>
                  <span className="text-gray-600 mono">/ 10</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple to-green transition-all"
                      style={{ width: ((walletMinted ?? 0) / 10 * 100) + "%" }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">$CLAWD balance</span>
                <span className="font-bold mono grad">
                  {tokenBalance === null ? "—" : tokenBalance.toLocaleString("en-US") + " $CLAWD"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Global progress */}
        <div className="border border-border rounded-2xl bg-card/80 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Global progress</span>
            <span className="mono text-xs">
              <span className="text-white font-bold">{globalMinted.toLocaleString("en-US")}</span>
              <span className="text-gray-600"> / {MAX_MINTS.toLocaleString("en-US")} mints</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: pct + "%", background: "linear-gradient(90deg, #9945FF, #03E1FF, #14F195)" }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mono">
            <span>{pct.toFixed(1)}% minted</span>
            <span>{(MAX_MINTS - globalMinted).toLocaleString("en-US")} left</span>
          </div>
        </div>

        {soldOut && (
          <div className="text-center py-3 rounded-xl border border-red-800/40 bg-red-900/10 text-red-400 text-sm font-semibold">
            SOLD OUT
          </div>
        )}
      </section>

      {/* Chat */}
      {publicKey ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Clawd Terminal
          </h2>
          <ClaudChat onMintSuccess={fetchWalletMints} />
        </section>
      ) : (
        <section className="border border-dashed border-border rounded-2xl p-10 text-center">
          <p className="text-gray-600 text-sm">Connect wallet to open Clawd Terminal</p>
        </section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Price",        value: "0.015 SOL" },
          { label: "Per mint",     value: "1,050"     },
          { label: "Max / wallet", value: "10"        },
          { label: "Total supply", value: "21M"       },
        ].map(({ label, value }) => (
          <div key={label} className="border border-border rounded-xl bg-card/80 px-4 py-3 text-center">
            <p className="text-xs text-gray-500 tracking-wider uppercase">{label}</p>
            <p className="text-lg font-black grad mt-1 mono">{value}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { num: "01", dot: "bg-purple", title: "Connect Wallet",  desc: "Connect your wallet. One click." },
            { num: "02", dot: "bg-blue",   title: "Chat with Clawd", desc: 'Type "mint me $CLAWD" in the terminal above.' },
            { num: "03", dot: "bg-green",  title: "Confirm & Done",  desc: "Wallet pops up. One confirm. $CLAWD arrives." },
          ].map(({ num, dot, title, desc }) => (
            <div key={num} className="border border-border rounded-2xl bg-card/80 p-5 space-y-2 hover:border-purple/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className={"w-1.5 h-1.5 rounded-full " + dot} />
                <span className="text-xs mono text-gray-600">{num}</span>
              </div>
              <p className="font-bold text-white text-sm">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
