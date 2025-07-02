// Location: /app/api/leaderboard/route.ts

import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, BASE_RPC_URL } from "@/lib/constants";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

export async function GET() {
  try {
    // Get current block number
    const currentBlock = await publicClient.getBlockNumber();
    
    // Calculate blocks to scan (e.g., last 100,000 blocks or since deployment)
    const deploymentBlock = 12345678n; // Replace with your actual deployment block
    const blocksToScan = 500n; // Alchemy's limit
    
    // Aggregate mints per address
    const mintsPerAddress: Record<string, number> = {};
    
    // Scan in chunks of 500 blocks
    for (let fromBlock = deploymentBlock; fromBlock < currentBlock; fromBlock += blocksToScan) {
      const toBlock = fromBlock + blocksToScan - 1n > currentBlock ? currentBlock : fromBlock + blocksToScan - 1n;
      
      try {
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem('event Minted(address indexed minter, uint256 indexed startId, uint256 count, string paymentToken)'),
          fromBlock,
          toBlock,
        });
        
        logs.forEach((log) => {
          if (log.args && 'minter' in log.args && 'count' in log.args) {
            const address = (log.args.minter as string).toLowerCase();
            const count = Number(log.args.count);
            mintsPerAddress[address] = (mintsPerAddress[address] || 0) + count;
          }
        });
      } catch (err) {
        console.error(`Error fetching logs for blocks ${fromBlock}-${toBlock}:`, err);
      }
    }

    // Convert to leaderboard format
    const leaderboard = Object.entries(mintsPerAddress)
      .map(([address, mints]) => ({
        address: `${address.slice(0, 6)}...${address.slice(-4)}`,
        fullAddress: address,
        mints,
        rank: 0,
      }))
      .sort((a, b) => b.mints - a.mints)
      .slice(0, 100)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json({
      leaderboard,
      lastUpdated: new Date().toISOString(),
      totalPlayers: Object.keys(mintsPerAddress).length,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
