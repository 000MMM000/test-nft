"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

function repairApiMessages(msgs: unknown[]): unknown[] {
  const fixed: unknown[] = [];
  for (const msg of msgs) {
    const m = msg as { role: string; content: unknown };
    if (m.role === "user" && (!m.content || (Array.isArray(m.content) && m.content.length === 0))) continue;
    if (m.role === "user" && fixed.length > 0 && (fixed[fixed.length - 1] as { role: string }).role === "user") {
      fixed.push({ role: "assistant", content: [{ type: "text", text: "..." }] });
    }
    fixed.push(msg);
  }
  while (fixed.length && (fixed[fixed.length - 1] as { role: string }).role === "assistant") fixed.pop();
  return fixed;
}


interface Message {
  role: "user" | "assistant";
  text: string;
  minted?: boolean;
}

interface MintData {
  ready:    boolean;
  txBase64: string;
  count:    number;
  wallet:   string;
}

function storageKey(wallet: string) {
  return "clawd_chat_" + wallet;
}
function apiStorageKey(wallet: string) {
  return "clawd_api_" + wallet;
}

export default function ClaudChat({ onMintSuccess }: { onMintSuccess?: () => void }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection }                 = useConnection();

  const [messages, setMessages]       = useState<Message[]>([]);
  const [apiMessages, setApiMessages] = useState<unknown[]>([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  const walletKey = publicKey?.toBase58() ?? "";

  // Load history from localStorage when wallet connects
  useEffect(() => {
    if (!publicKey) {
      setMessages([]);
      setApiMessages([]);
      return;
    }

    const saved    = localStorage.getItem(storageKey(walletKey));
    const savedApi = localStorage.getItem(apiStorageKey(walletKey));

    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        const rawApi: unknown[] = savedApi ? JSON.parse(savedApi) : [];
        setApiMessages(repairApiMessages(rawApi));
        return;
      } catch (_e) { /* corrupt, start fresh */ }
    }

    // First time — show greeting
    const greeting: Message = {
      role: "assistant",
      text: "gm fren. clawd pepe online. say \"mint me $CLAWD\" and i'll hook you up.",
    };
    setMessages([greeting]);
    setApiMessages([]);
  }, [walletKey]);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (!walletKey || messages.length === 0) return;
    localStorage.setItem(storageKey(walletKey), JSON.stringify(messages));
    localStorage.setItem(apiStorageKey(walletKey), JSON.stringify(apiMessages));
  }, [messages, apiMessages, walletKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const executeMint = useCallback(async (mintData: MintData) => {
    if (!publicKey || !signTransaction) return;

    // Deserialize the server-partially-signed transaction
    const tx = Transaction.from(Buffer.from(mintData.txBase64, "base64"));

    // User signs (server already partial-signed server-side)
    const signed  = await signTransaction(tx);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const txSig   = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
    const result  = await connection.confirmTransaction({ signature: txSig, blockhash, lastValidBlockHeight }, "confirmed");
    if (result.value.err) throw new Error("tx failed: " + JSON.stringify(result.value.err));
    return [txSig];
  }, [publicKey, connection, signTransaction]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading || !publicKey) return;
    setInput("");
    setLoading(true);
    setError(null);

    const userMsg: Message = { role: "user", text };
    const updatedMessages  = [...messages, userMsg];
    setMessages(updatedMessages);

    const newApiMessages = [...apiMessages, { role: "user", content: text }];

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: newApiMessages,
          wallet:   publicKey.toBase58(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error ?? "Request failed");
      }

      const data = await res.json();

      const assistantMsg: Message = { role: "assistant", text: data.text };
      const withAssistant = [...updatedMessages, assistantMsg];
      setMessages(withAssistant);
      setApiMessages(data.messages);

      if (data.mintData) {
        try {
          await executeMint(data.mintData);
          const count  = data.mintData.count || 1;
          const tokens = (count * 1050).toLocaleString("en-US");
          // Poll chain until count updates
          let newTotal = count;
          for (let i = 0; i < 8; i++) {
            await new Promise(r => setTimeout(r, 500));
            try {
              const r = await fetch("/api/wallet?address=" + publicKey.toBase58());
              const d = await r.json();
              if ((d.mintCount ?? 0) > 0) { newTotal = d.mintCount; break; }
            } catch (_) {}
          }
          const successMsg: Message = {
            role:   "assistant",
            text:   `minted ${count}x! ${tokens} $CLAWD in your wallet. total: ${newTotal}/10.`,
            minted: true,
          };
          setMessages((prev) => [...prev, successMsg]);
          setApiMessages([]); // reset tool call history so Claude doesn't re-trigger
          onMintSuccess?.();
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : "unknown error";
          setMessages((prev) => [...prev, {
            role: "assistant",
            text: "transaction failed: " + errMsg,
          }]);
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "failed";
      setError(errMsg);
      setMessages((prev) => [...prev, {
        role: "assistant",
        text: "error: " + errMsg + ". try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, publicKey, messages, apiMessages, executeMint]);

  function clearHistory() {
    if (!walletKey) return;
    localStorage.removeItem(storageKey(walletKey));
    localStorage.removeItem(apiStorageKey(walletKey));
    const greeting: Message = {
      role: "assistant",
      text: "gm fren. clawd pepe online. say \"mint me $CLAWD\" and i'll hook you up.",
    };
    setMessages([greeting]);
    setApiMessages([]);
  }

  if (!publicKey) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="border border-border rounded-2xl bg-card overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green/60" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              <Image src="/clawd.png" alt="Clawd" width={40} height={40} className="w-full h-full object-cover scale-[1.35] object-center" />
            </div>
            <span className="text-xs font-semibold text-gray-300">Clawd Terminal</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={clearHistory}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              clear
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-xs text-gray-600">online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={"flex gap-3 " + (msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                  <Image src="/clawd.png" alt="Clawd" width={48} height={48} className="w-full h-full object-cover scale-[1.35] object-center" />
                </div>
              )}
              <div
                className={
                  "max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed " +
                  (msg.role === "user"
                    ? "bg-purple/20 text-purple border border-purple/30"
                    : msg.minted
                    ? "bg-green/10 text-green border border-green/30"
                    : "bg-white/5 text-gray-300 border border-border")
                }
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/clawd.png" alt="Clawd" width={48} height={48} className="w-full h-full object-cover scale-[1.35] object-center" />
              </div>
              <div className="bg-white/5 border border-border px-3 py-2 rounded-xl flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                      style={{ animationDelay: i * 150 + "ms" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 text-center" style={{ fontFamily: "'Space Mono', monospace" }}>{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder='say "mint me $CLAWD" ...'
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            style={{ fontFamily: "'Space Mono', monospace" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple to-green text-bg text-xs font-bold disabled:opacity-30 hover:opacity-90 transition-all"
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
}
