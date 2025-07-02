// Location: /app/api/split-info/route.ts

import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, BASE_RPC_URL } from "@/lib/constants";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

// ABI for the currentSplit function
const SPLIT_ABI = [
  {
    inputs: [],
    name: "currentSplit",
    outputs: [
      { name: "sendPct", type: "uint256" },
      { name: "vaultPct", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

// ABI for the currentTier function
const TIER_ABI = [
  {
    inputs: [],
    name: "currentTier",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// Tiered split percentages [sendPct, vaultPct]
const TIERED_SPLITS: Record<number, [number, number]> = {
  0: [50, 50],
  1: [45, 55],
  2: [40, 60],
  3: [35, 65],
  4: [30, 70],
  5: [25, 75],
  6: [20, 80],
  7: [15, 85],
  8: [10, 90],
};

export async function GET() {
  let sendPct: number;
  let vaultPct: number;
  let tier: number | null = null;
  let method: 'currentSplit' | 'tier' | 'fallback' = 'currentSplit';

  try {
    // First, try to fetch current split directly from contract
    const splitResult = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: SPLIT_ABI,
      functionName: "currentSplit",
    }) as readonly [bigint, bigint];

    sendPct = Number(splitResult[0]);
    vaultPct = Number(splitResult[1]);
    
    // Also try to get tier for informational purposes
    try {
      const tierResult = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: TIER_ABI,
        functionName: "currentTier",
      }) as bigint;
      tier = Number(tierResult);
    } catch {
      // Tier fetch failed, but we have split, so continue
      console.log("Could not fetch tier, but have split percentages");
    }

  } catch (splitError) {
    console.error("Failed to fetch currentSplit, trying tier fallback:", splitError);
    
    try {
      // Fallback: Get tier and calculate split
      const tierResult = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: TIER_ABI,
        functionName: "currentTier",
      }) as bigint;
      
      tier = Number(tierResult);
      method = 'tier';
      
      // Validate tier is in valid range
      if (tier < 0 || tier > 8) {
        throw new Error(`Invalid tier number: ${tier}`);
      }
      
      // Get split percentages from tier
      [sendPct, vaultPct] = TIERED_SPLITS[tier];
      
    } catch (tierError) {
      console.error("Failed to fetch tier, using default split:", tierError);
      
      // Final fallback: Use tier 0 (50/50 split)
      sendPct = 50;
      vaultPct = 50;
      tier = 0;
      method = 'fallback';
    }
  }

  // Return the split configuration with vault addresses and tier info
  return NextResponse.json({
    // Addresses
    sendAddr: "0x7385e1a824a405cbb13b64829bf1509cd2a471f7",
    ethVault: "0x44459112088Ff8BbB6967bfCA7A8CD31980F3cF4",
    myuVault: "0x2d26B3Da95331e169ea9F31cA8CED9fa761deb26",
    degenVault: "0x2d26B3Da95331e169ea9F31cA8CED9fa761deb26",
    
    // Split percentages
    sendPct,
    vaultPct,
    
    // Additional info
    currentTier: tier,
    method, // How we got the data (for debugging)
    
    // Computed info
    isMaxTier: tier === 8,
    nextTierSplit: tier !== null && tier < 8 ? TIERED_SPLITS[tier + 1] : null,
  });
}
