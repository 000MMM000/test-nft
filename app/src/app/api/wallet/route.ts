export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const TOKENS_PER_MINT = 1_050;

export async function GET(req: NextRequest) {
  const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? "FyRAoLQQDKY3W2MJDASTEthxaDrpDNn4wrtCLtzVMoF7"
  );
  const connection = new Connection(
    process.env.RPC_ENDPOINT ?? clusterApiUrl("devnet"),
    "confirmed"
  );
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ mintCount: 0, balance: 0 });

  try {
    const wallet = new PublicKey(address);
    const [tokenMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_mint")],
      PROGRAM_ID
    );
    const ata = getAssociatedTokenAddressSync(tokenMintPda, wallet);
    const info = await connection.getTokenAccountBalance(ata);
    const balance   = Number(info.value.uiAmount ?? 0);
    const mintCount = Math.floor(balance / TOKENS_PER_MINT);
    return NextResponse.json({ mintCount, balance });
  } catch {
    return NextResponse.json({ mintCount: 0, balance: 0 });
  }
}
