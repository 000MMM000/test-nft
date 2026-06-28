"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const DEVNET_GENESIS = "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG";

export default function NetworkCheck() {
  const { connection } = useConnection();
  const { connected }  = useWallet();
  const [wrongNet, setWrongNet] = useState(false);

  useEffect(() => {
    if (!connected) { setWrongNet(false); return; }
    connection.getGenesisHash().then((hash) => {
      setWrongNet(hash !== DEVNET_GENESIS);
    }).catch(() => {});
  }, [connected, connection]);

  if (!wrongNet) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-sm font-semibold text-center py-2.5 px-4">
      ⚠ Switch Phantom to <strong>Devnet</strong>: Settings → Developer Settings → Change Network → Devnet
    </div>
  );
}
