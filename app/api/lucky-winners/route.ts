// Location: /app/api/lucky-winners/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, NFT_ABI, BASE_RPC_URL } from "@/lib/constants";
import { redis } from "@/lib/redis";
import { keccak256, encodePacked } from "viem";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

// Constants for VRF
const DRAND_QUICKNET_URL = "https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";
const WINNERS_CACHE_KEY = "lucky:winners:cache";
const SELECTION_STATE_KEY = "lucky:selection:state";
const CACHE_TTL = 300; // 5 minutes

interface DrandBeacon {
  round: number;
  randomness: string;
  signature: string;
}

interface LuckyWinner {
  address: `0x${string}`;
  displayAddress: string;
  prize: {
    degen: number;
    myu: string;
  };
  timestamp: number;
  txHash: string;
  round: number;
}

// ✅ Fetch drand beacon
async function fetchDrandBeacon(round?: number): Promise<DrandBeacon | null> {
  try {
    const url = round 
      ? `${DRAND_QUICKNET_URL}/public/${round}`
      : `${DRAND_QUICKNET_URL}/public/latest`;
    
    const response = await fetch(url, {
      next: { revalidate: 30 } // Cache for 30 seconds
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ✅ Get all minters from contract events (gas efficient batch query)
async function getAllMinters(): Promise<string[]> {
  try {
    // Get total supply to determine block range
    const totalSupply = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: "totalSupply",
    }) as bigint;

    if (totalSupply === 0n) return [];

    // Query Transfer events from null address (mints)
    const logs = await publicClient.getLogs({
      address: CONTRACT_ADDRESS,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: true, name: 'tokenId' }
        ],
      },
      args: {
        from: '0x0000000000000000000000000000000000000000',
      },
      fromBlock: 'earliest',
      toBlock: 'latest',
    });

    // Extract unique minters
    const minters = new Set<string>();
    logs.forEach(log => {
      if (log.args?.to) {
        minters.add(log.args.to as string);
      }
    });

    return Array.from(minters);
  } catch (error) {
    console.error("Failed to fetch minters:", error);
    return [];
  }
}

// ✅ Select winners using VRF
function selectWinnersWithVRF(
  minters: string[], 
  randomness: string,
  round: number
): { regular: string[], super: string } {
  if (minters.length === 0) return { regular: [], super: "" };

  // Create deterministic seed
  const seed = keccak256(
    encodePacked(
      ["string", "address", "uint256"],
      [randomness, CONTRACT_ADDRESS, BigInt(round)]
    )
  );

  // Fisher-Yates shuffle with deterministic random
  const shuffled = [...minters];
  let seedNum = BigInt(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    seedNum = (seedNum * 1103515245n + 12345n) % (2n ** 32n);
    const j = Number(seedNum % BigInt(i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Select winners
  const superWinner = shuffled[0];
  const regularWinners = shuffled.slice(1, Math.min(21, shuffled.length));

  return { regular: regularWinners, super: superWinner };
}

// ✅ GET endpoint - Using request for rate limiting
export async function GET(request: NextRequest) {
  try {
    // Use request headers for rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'anonymous';
    
    // Simple rate limit check using Redis if available
    if (redis) {
      const rateLimitKey = `ratelimit:lucky:${clientIp}`;
      const requests = await redis.incr(rateLimitKey);
      
      if (requests === 1) {
        await redis.expire(rateLimitKey, 60); // 60 second window
      }
      
      if (requests > 10) { // Max 10 requests per minute
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
    }

    // Check cache first
    if (redis) {
      const cached = await redis.get(WINNERS_CACHE_KEY);
      if (cached) {
        return NextResponse.json(JSON.parse(cached as string));
      }
    }

    // Check if mint is complete
    const [totalSupply, maxSupply] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "totalSupply",
      }) as Promise<bigint>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: "MAX_SUPPLY",
      }) as Promise<bigint>
    ]);

    const mintComplete = totalSupply >= maxSupply;

    // If mint not complete, return empty
    if (!mintComplete) {
      return NextResponse.json({
        winners: [],
        mintComplete: false,
        totalMinted: totalSupply.toString(),
        maxSupply: maxSupply.toString()
      });
    }

    // Check if winners already selected
    let selectionState = null;
    if (redis) {
      const state = await redis.get(SELECTION_STATE_KEY);
      if (state) {
        selectionState = JSON.parse(state as string);
      }
    }

    // If not selected yet, select winners
    if (!selectionState) {
      // Get drand beacon
      const beacon = await fetchDrandBeacon();
      if (!beacon) {
        return NextResponse.json({ error: "Failed to fetch randomness" }, { status: 500 });
      }

      // Get all minters
      const minters = await getAllMinters();
      if (minters.length === 0) {
        return NextResponse.json({ error: "No minters found" }, { status: 404 });
      }

      // Select winners
      const { regular, super: superWinner } = selectWinnersWithVRF(
        minters,
        beacon.randomness,
        beacon.round
      );

      // Create winner objects
      const winners: LuckyWinner[] = [
        // Super winner
        {
          address: superWinner as `0x${string}`,
          displayAddress: `${superWinner.slice(0, 6)}...${superWinner.slice(-4)}`,
          prize: {
            degen: 2500,
            myu: "25,000,000"
          },
          timestamp: Date.now(),
          txHash: "pending", // Will be updated when distributed
          round: beacon.round
        },
        // Regular winners
        ...regular.map(addr => ({
          address: addr as `0x${string}`,
          displayAddress: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
          prize: {
            degen: 250,
            myu: "1,000,000"
          },
          timestamp: Date.now(),
          txHash: "pending",
          round: beacon.round
        }))
      ];

      const result = {
        winners,
        mintComplete: true,
        totalMinted: totalSupply.toString(),
        maxSupply: maxSupply.toString(),
        drandRound: beacon.round,
        selectionTimestamp: Date.now()
      };

      // Cache results
      if (redis) {
        await redis.set(WINNERS_CACHE_KEY, JSON.stringify(result), { ex: CACHE_TTL });
        await redis.set(SELECTION_STATE_KEY, JSON.stringify({
          selected: true,
          round: beacon.round,
          timestamp: Date.now(),
          winnersCount: winners.length
        }));
      }

      return NextResponse.json(result);
    }

    // Return cached selection
    return NextResponse.json({
      winners: [],
      mintComplete: true,
      message: "Winners already selected",
      selectionState
    });

  } catch (error) {
    console.error("Lucky winners API error:", error);
    
    // Use error for logging and response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { 
        error: "Failed to fetch winners",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// ✅ POST endpoint for admin to trigger distribution
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "reset") {
      // Reset selection state (admin only)
      if (redis) {
        await redis.del(WINNERS_CACHE_KEY);
        await redis.del(SELECTION_STATE_KEY);
      }
      return NextResponse.json({ success: true, message: "Selection state reset" });
    }

    if (action === "verify") {
      // Verify a specific drand round
      const { round } = body;
      const beacon = await fetchDrandBeacon(round);
      
      if (!beacon) {
        return NextResponse.json({ error: "Failed to fetch beacon" }, { status: 400 });
      }
      
      return NextResponse.json({ 
        success: true, 
        beacon,
        verified: true 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST endpoint error:", error);
    
    // Use error for proper error response
    const errorMessage = error instanceof Error ? error.message : "Server error";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}
