"use client";

import { usePathname } from "next/navigation";
import ParticleField from "./ParticleField";
import MarketBg from "./MarketBg";
import DocsBg from "./DocsBg";

export default function Background() {
  const pathname = usePathname();

  return (
    <>
      <div className="scan-line" />
      <div className="bg-vignette" />

      {pathname === "/" && <ParticleField />}
      {pathname === "/market" && <MarketBg />}
      {pathname === "/docs" && <DocsBg />}
    </>
  );
}
