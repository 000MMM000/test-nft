export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const TOKENS_PER_MINT = 1_050;
const PREMINE_TOKENS  = 10_500_000; // 50% premine for liquidity

export async function GET() {
  const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? "FyRAoLQQDKY3W2MJDASTEthxaDrpDNn4wrtCLtzVMoF7"
  );
  const connection = new Connection(
    process.env.RPC_ENDPOINT ?? clusterApiUrl("devnet"),
    "confirmed"
  );
  try {
    const [tokenMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_mint")],
      PROGRAM_ID
    );
    const supply = await connection.getTokenSupply(tokenMintPda);
    const totalTokens = Number(supply.value.uiAmount ?? 0);
    const publicTokens = Math.max(totalTokens - PREMINE_TOKENS, 0);
    const totalMinted  = Math.floor(publicTokens / TOKENS_PER_MINT);
    return NextResponse.json({ totalMinted });
  } catch {
    return NextResponse.json({ totalMinted: 0 });
  }
}
