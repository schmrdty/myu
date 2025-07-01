// Location: /app/api/leaderboard/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, NFT_ABI, BASE_RPC_URL } from "@/lib/constants";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

export async function GET(request: NextRequest) {
  try {
    // For now, return mock data. You can implement actual leaderboard logic later
    const mockLeaderboard = [
      { address: "0x1234...5678", mints: 25, rank: 1 },
      { address: "0x8765...4321", mints: 20, rank: 2 },
      { address: "0xabcd...efgh", mints: 15, rank: 3 },
    ];

    return NextResponse.json({
      leaderboard: mockLeaderboard,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
