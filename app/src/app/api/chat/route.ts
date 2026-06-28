import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  Connection, PublicKey, clusterApiUrl,
  Transaction, TransactionInstruction, SystemProgram, Keypair,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createHash } from "crypto";

const MAX_MINTS      = 10_000;
const MAX_PER_WALLET = 10;

function getConnection() {
  return new Connection(
    process.env.RPC_ENDPOINT ?? clusterApiUrl("devnet"),
    "confirmed"
  );
}

function getProgramId() {
  return new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  );
}

// Lazy-init server keypair
let _serverKeypair: Keypair | null = null;
function getServerKeypair(): Keypair {
  if (!_serverKeypair) {
    const raw = process.env.SERVER_SECRET_KEY;
    if (!raw) throw new Error("SERVER_SECRET_KEY not set");
    _serverKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
  }
  return _serverKeypair;
}

function disc(name: string): Buffer {
  return Buffer.from(createHash("sha256").update(`global:${name}`).digest()).subarray(0, 8);
}

// Read wallet mint count from chain
async function getWalletMintCount(wallet: string): Promise<number> {
  try {
    const connection = getConnection();
    const PROGRAM_ID = getProgramId();
    const pk  = new PublicKey(wallet);
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("wallet"), pk.toBuffer()], PROGRAM_ID
    );
    const info = await connection.getAccountInfo(pda);
    if (!info) return 0;
    return info.data[8 + 32];
  } catch (_e) { return 0; }
}

// Read global mint count from chain
async function getGlobalMintCount(): Promise<number> {
  try {
    const connection = getConnection();
    const PROGRAM_ID = getProgramId();
    const [pda] = PublicKey.findProgramAddressSync([Buffer.from("state")], PROGRAM_ID);
    const info  = await connection.getAccountInfo(pda);
    if (!info) return 0;
    return info.data.readUInt32LE(8 + 32 + 32 + 32 + 32);
  } catch (_e) { return 0; }
}

// Build and server-sign the mint transaction
async function prepareMintTx(wallet: string, batchCount: number): Promise<string> {
  const connection = getConnection();
  const PROGRAM_ID = getProgramId();
  const kp         = getServerKeypair();
  const userWallet = new PublicKey(wallet);

  const [statePda]  = PublicKey.findProgramAddressSync([Buffer.from("state")],          PROGRAM_ID);
  const [tokenMint] = PublicKey.findProgramAddressSync([Buffer.from("token_mint")],     PROGRAM_ID);
  const [mintAuth]  = PublicKey.findProgramAddressSync([Buffer.from("mint_authority")], PROGRAM_ID);
  const [walletRec] = PublicKey.findProgramAddressSync([Buffer.from("wallet"), userWallet.toBuffer()], PROGRAM_ID);
  const userAta     = getAssociatedTokenAddressSync(tokenMint, userWallet);

  const stateInfo = await connection.getAccountInfo(statePda);
  if (!stateInfo) throw new Error("Program not initialized");
  const treasury = new PublicKey(stateInfo.data.slice(8 + 32 + 32, 8 + 32 + 32 + 32));

  // batch_mint(count: u8) — discriminator + count
  const ixData = Buffer.concat([disc("batch_mint"), Buffer.from([batchCount])]);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: userWallet,             isSigner: true,  isWritable: true  },
      { pubkey: kp.publicKey,           isSigner: true,  isWritable: false },
      { pubkey: statePda,               isSigner: false, isWritable: true  },
      { pubkey: tokenMint,              isSigner: false, isWritable: true  },
      { pubkey: mintAuth,               isSigner: false, isWritable: false },
      { pubkey: userAta,                isSigner: false, isWritable: true  },
      { pubkey: treasury,               isSigner: false, isWritable: true  },
      { pubkey: walletRec,              isSigner: false, isWritable: true  },
      { pubkey: TOKEN_PROGRAM_ID,             isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,  isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId,      isSigner: false, isWritable: false },
    ],
    data: ixData,
  });

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({ recentBlockhash: blockhash, feePayer: userWallet });
  tx.add(ix);
  tx.partialSign(kp);

  return tx.serialize({ requireAllSignatures: false }).toString("base64");
}

// Claude tools
const tools: Anthropic.Tool[] = [
  {
    name: "check_wallet",
    description: "Check how many mints a wallet has done and how many are left globally.",
    input_schema: {
      type: "object" as const,
      properties: {
        wallet: { type: "string", description: "Solana wallet address" },
      },
      required: ["wallet"],
    },
  },
  {
    name: "prepare_mint",
    description: "Prepare one or more mint transactions. Returns signed transaction data for the frontend to send to Phantom.",
    input_schema: {
      type: "object" as const,
      properties: {
        wallet: { type: "string", description: "Solana wallet address to mint to" },
        count:  { type: "number", description: "How many mints to prepare (1-10). Default 1." },
      },
      required: ["wallet"],
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not set");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages, wallet } = await req.json();

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are Clawd — a witty meme frog AI living on Solana. You chat normally with users and also handle $CLAWD token minting.
Connected wallet: ${wallet ?? "not connected"}.

PERSONALITY: chill, dry humor, lowercase, 1 sentence max. never explain yourself, never use emojis, never start with "yo". just vibe.

MINTING — trigger when user says anything like:
- "mint me $clawd" / "mint me clawd" / "mint clawd" → mint 1
- "mint me 5 $clawd" / "mint 3 clawd" / "mint me 7" etc → mint that number
- any clear intent to mint $CLAWD tokens

When triggered: call check_wallet with wallet="${wallet}", then prepare_mint with wallet="${wallet}" and count=N. Do NOT explain anything, do NOT ask questions, just run the tools and respond with the result.
- If result has ready=true: say ONLY "confirm in wallet." — nothing else.
- If result has partial=true: say ONLY "only {available} left, want {available}? (yes/no)" — do NOT say "confirm in wallet", do NOT call prepare_mint yet.
- If user replies yes/yeah/yep/sure/ok/да after a partial prompt: THEN call prepare_mint with count={available}.
- If user replies no/nah/нет after partial: say "ok, no mint."
- If wallet limit reached: say "wallet limit reached."
- If not connected: say "connect your wallet first."

DO NOT mint unless the user uses one of the exact trigger phrases above. For everything else just have a normal conversation.
NEVER mention mint counts or how many times they've minted.`;

    const anthropicMessages: Anthropic.MessageParam[] = messages;
    let response = await client.messages.create({
      model:      "claude-haiku-4-5",
      max_tokens: 1024,
      system:     systemPrompt,
      tools,
      messages:   anthropicMessages,
    });

    // Handle tool calls
    let mintData: unknown = null;

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const input = toolUse.input as Record<string, string>;

        if (toolUse.name === "check_wallet") {
          const [mintCount, globalCount] = await Promise.all([
            getWalletMintCount(input.wallet),
            getGlobalMintCount(),
          ]);
          toolResults.push({
            type:        "tool_result",
            tool_use_id: toolUse.id,
            content:     JSON.stringify({
              mint_count:     mintCount,
              max_per_wallet: MAX_PER_WALLET,
              global_minted:  globalCount,
              global_max:     MAX_MINTS,
              can_mint:       mintCount < MAX_PER_WALLET && globalCount < MAX_MINTS,
            }),
          });
        }

        if (toolUse.name === "prepare_mint") {
          const targetWallet  = wallet || input.wallet;
          const mintCount     = await getWalletMintCount(targetWallet);
          const globalCount   = await getGlobalMintCount();
          const rawRequested  = Math.max(Number(input.count) || 1, 1);
          const available     = Math.min(MAX_PER_WALLET - mintCount, MAX_MINTS - globalCount, rawRequested);

          if (mintCount >= MAX_PER_WALLET) {
            toolResults.push({
              type: "tool_result", tool_use_id: toolUse.id,
              content: JSON.stringify({ error: "wallet_limit_reached" }),
            });
          } else if (globalCount >= MAX_MINTS) {
            toolResults.push({
              type: "tool_result", tool_use_id: toolUse.id,
              content: JSON.stringify({ error: "sold_out" }),
            });
          } else if (available < rawRequested) {
            // Partial — ask user first, don't fire tx yet
            toolResults.push({
              type: "tool_result", tool_use_id: toolUse.id,
              content: JSON.stringify({ partial: true, available, requested: rawRequested }),
            });
          } else {
            const txBase64 = await prepareMintTx(targetWallet, available);
            mintData = {
              ready:     true,
              txBase64,
              count:     available,
              wallet:    targetWallet,
            };
            toolResults.push({
              type: "tool_result", tool_use_id: toolUse.id,
              content: JSON.stringify(mintData),
            });
          }
        }
      }

      anthropicMessages.push(
        { role: "assistant", content: response.content },
        { role: "user",      content: toolResults }
      );

      response = await client.messages.create({
        model:      "claude-haiku-4-5",
        max_tokens: 1024,
        system:     systemPrompt,
        tools,
        messages:   anthropicMessages,
      });
    }

    // Include final assistant response so history stays user→assistant alternating
    anthropicMessages.push({ role: "assistant", content: response.content });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );
    const text = textBlocks.map((b) => b.text).join("");

    return NextResponse.json({ text, mintData, messages: anthropicMessages });
  } catch (e) {
    console.error("Chat API error:", e);
    const msg = e instanceof Error ? e.message : "Chat error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
