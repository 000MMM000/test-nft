import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

export async function GET(req: NextRequest) {
  const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID ?? "FyRAoLQQDKY3W2MJDASTEthxaDrpDNn4wrtCLtzVMoF7"
  );
  const connection = new Connection(
    process.env.RPC_ENDPOINT ?? clusterApiUrl("devnet"),
    "confirmed"
  );
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ balance: 0 });

  try {
    const wallet = new PublicKey(address);
    const [tokenMint] = PublicKey.findProgramAddressSync(
      [Buffer.from("token_mint")],
      PROGRAM_ID
    );
    const ata = getAssociatedTokenAddressSync(tokenMint, wallet);
    const info = await connection.getTokenAccountBalance(ata);
    const balance = Number(info.value.uiAmount ?? 0);
    return NextResponse.json({ balance });
  } catch {
    return NextResponse.json({ balance: 0 });
  }
}
