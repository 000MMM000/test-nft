export const RARITIES = ["Common", "Rare", "Epic", "Legendary"] as const;
export type Rarity = typeof RARITIES[number];

export const RARITY_COLOR: Record<Rarity, string> = {
  Common:    "rgba(255,255,255,0.3)",
  Rare:      "rgba(120,180,255,0.7)",
  Epic:      "rgba(180,120,255,0.8)",
  Legendary: "rgba(255,200,80,0.85)",
};
export const RARITY_STRIPE: Record<Rarity, string> = {
  Common:    "rgba(255,255,255,0.18)",
  Rare:      "rgba(100,160,255,0.55)",
  Epic:      "rgba(160,100,255,0.65)",
  Legendary: "rgba(255,190,60,0.75)",
};
export const RARITY_BG: Record<Rarity, string> = {
  Common:    "rgba(255,255,255,0.04)",
  Rare:      "rgba(80,140,255,0.07)",
  Epic:      "rgba(140,80,255,0.08)",
  Legendary: "rgba(255,180,40,0.08)",
};

const RARITY_WEIGHT = [60, 28, 10, 2];

const TRAIT_TYPES = ["Background", "Form", "Core", "Glow", "Edge"];
const TRAIT_VALUES: Record<string, string[]> = {
  Background: ["Void", "Abyss", "Static", "Ash", "Onyx"],
  Form:       ["Fractured", "Solid", "Ghost", "Mirror", "Hollow"],
  Core:       ["Dark", "Bright", "Split", "Null", "Raw"],
  Glow:       ["Purple", "White", "None", "Amber", "Cyan"],
  Edge:       ["Sharp", "Blurred", "Cracked", "Clean", "Worn"],
};

function rng(id: number, salt: number): number {
  return ((id * 7919 * (salt + 1) * 1103515245) & 0x7fffffff);
}

function rarityFromId(id: number): Rarity {
  const v = rng(id, 0) % 100;
  let acc = 0;
  for (let i = 0; i < RARITIES.length; i++) {
    acc += RARITY_WEIGHT[i];
    if (v < acc) return RARITIES[i];
  }
  return "Common";
}

export interface NFTMeta {
  id: number;
  rarity: Rarity;
  listed: boolean;
  price: number | null;
  owner: string;
  topOffer: number;
  collectionFloor: number;
  lastSale: number | null;
  traits: { type: string; value: string; count: number; pct: string }[];
  orders: { type: string; price: number; qty: number; from: string; expiry: string }[];
  activity: { event: string; price: number | null; from: string; to: string; time: string }[];
}

function buildNFT(id: number): NFTMeta {
  const rarity = rarityFromId(id);
  const rarBase = rarity === "Legendary" ? 800 : rarity === "Epic" ? 200 : rarity === "Rare" ? 60 : 15;
  const listed  = (rng(id, 99) % 100) > 44;
  const price   = listed ? Math.round(rarBase + (rng(id, 88) % Math.round(rarBase * 0.8))) : null;
  const lastSale = (rng(id, 77) % 100) > 30 ? Math.round(rarBase * 0.7 + (rng(id, 66) % Math.round(rarBase * 0.5))) : null;
  const topOffer = Math.round(rarBase * 0.6 + (rng(id, 55) % Math.round(rarBase * 0.3)));
  const floor    = Math.round(rarBase + (rng(id, 44) % 20));

  const traits = TRAIT_TYPES.map((type, i) => {
    const vals  = TRAIT_VALUES[type];
    const value = vals[rng(id, i) % vals.length];
    const pct   = 3 + (rng(id, i + 10) % 28);
    return { type, value, count: Math.round((pct / 100) * 10000), pct: `${pct}%` };
  });

  const orders = Array.from({ length: 3 + (rng(id, 20) % 4) }, (_, i) => ({
    type:   i === 0 ? "Item Offer" : "Collection Offer",
    price:  Math.round(topOffer * (1 - i * 0.08)),
    qty:    i === 0 ? 1 : 1 + (rng(id, i + 30) % 3),
    from:   `${(rng(id, i + 40) % 0xffff).toString(16).padStart(4,"0")}...${(rng(id, i+50) % 0xffff).toString(16).padStart(4,"0")}`,
    expiry: ["3h","7d","11m","3d","6h","2w"][rng(id, i + 60) % 6],
  }));

  const activity = [
    ...(listed ? [{ event: "Listed", price, from: `0x${(rng(id,3)%0xffff).toString(16)}...`, to: "—", time: `${1 + rng(id,4) % 12}h ago` }] : []),
    ...(lastSale ? [{ event: "Sale", price: lastSale, from: `${(rng(id,5)%0xffff).toString(16)}...`, to: `0x${(rng(id,6)%0xffff).toString(16)}...`, time: `${1 + rng(id,7) % 14}d ago` }] : []),
    { event: "Mint", price: null, from: "NullAddress", to: `${(rng(id,8)%0xffff).toString(16)}...`, time: `${1 + rng(id,9) % 4}w ago` },
  ];

  return {
    id, rarity, listed, price,
    owner: `0x${(rng(id,1) % 0xffff).toString(16).padStart(4,"0")}...${(rng(id,2) % 0xffff).toString(16).padStart(4,"0")}`,
    topOffer, collectionFloor: floor, lastSale,
    traits, orders, activity,
  };
}

// Pre-generate all 100 NFTs once at module load
export const ALL_NFTS: NFTMeta[] = Array.from({ length: 100 }, (_, i) => buildNFT(i + 1));
