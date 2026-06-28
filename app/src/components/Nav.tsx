"use client";

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-black/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        <span className="font-black text-white tracking-tighter text-lg">VOID</span>

        <nav className="flex items-center gap-8 text-xs font-medium tracking-widest uppercase text-secondary">
          <a href="#mint" className="hover:text-white transition-colors">Mint</a>
          <a href="#collection" className="hover:text-white transition-colors">Collection</a>
        </nav>

        <button
          className="btn-ghost px-4 py-2 text-xs font-mono tracking-widest uppercase rounded-sm"
          disabled
          title="Wallet support coming soon"
        >
          Connect Wallet
        </button>

      </div>
    </header>
  );
}
