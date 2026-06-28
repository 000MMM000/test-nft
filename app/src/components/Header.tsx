"use client";

import Image from "next/image";

type Tab = "mint" | "info";

interface Props {
  active: Tab;
  onTab: (t: Tab) => void;
  twitterUrl?: string;
}

export default function Header({ active, onTab, twitterUrl = "#" }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center">

        {/* Logo — left (fixed width so nav stays truly centred) */}
        <div className="flex items-center gap-2.5 w-48 shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <Image
              src="/clawd.png"
              alt="Clawd Pepe"
              width={72}
              height={72}
              className="w-full h-full object-cover scale-[1.35] object-center"
            />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm text-white tracking-wide">CLAWD PEPE</p>
            <p className="text-[11px] text-gray-500" style={{ fontFamily: "'Space Mono', monospace" }}>$CLAWD</p>
          </div>
        </div>

        {/* Nav — truly centred */}
        <nav className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {(["mint", "info"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => onTab(tab)}
                className={`px-6 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                  active === tab
                    ? "bg-gradient-to-r from-purple to-green text-bg shadow-lg"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        {/* Twitter — right (fixed width to mirror logo) */}
        <div className="w-48 flex justify-end shrink-0">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center
                       text-gray-500 hover:text-white hover:border-purple/60 transition-all"
            aria-label="X / Twitter"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

      </div>
    </header>
  );
}
