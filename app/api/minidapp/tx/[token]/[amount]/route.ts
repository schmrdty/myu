// Location: /app/api/frame/tx/[token]/[amount]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { CONTRACT_ADDRESS, NFT_ABI, BASE_RPC_URL, RU_BASED } from "@/lib/constants";
import { encodeFunctionData } from "viem";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL || RU_BASED),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; amount: string }> }
) {
  const { token, amount } = await params;

  if (!["eth", "myu", "degen"].includes(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const amountNum = parseInt(amount);
  if (isNaN(amountNum) || amountNum < 1 || amountNum > 10) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  // Fetch live price per unit from contract
  let ethPrice = 0n, myuPrice = 0n, degenPrice = 0n;
  try {
    [
      /* userMints */,
      /* remainingMints */,
      /* currentTierNum */,
      ethPrice,
      myuPrice,
      degenPrice
      /* totalMinted */,
      /* maxSupply */
    ] = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: "getMintInfo",
      args: ["0x0000000000000000000000000000000000000000"],
    }) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mint price from contract" }, { status: 500 });
  }

  // Value for ETH (0 for tokens)
  const value = token === "eth" ? ethPrice * BigInt(amountNum) : 0n;

  const functionName =
    token === "eth" ? "mintWithEth"
    : token === "myu" ? "mintWithMyu"
    : "mintWithDegen";

  const data = encodeFunctionData({
    abi: [{
      inputs: [{ name: "count", type: "uint256" }],
      name: functionName,
      outputs: [],
      stateMutability: token === "eth" ? "payable" : "nonpayable",
      type: "function"
    }],
    functionName,
    args: [BigInt(amountNum)],
  });

  // Optionally, include prices in response for frame UI
  return NextResponse.json({
    chainId: "eip155:8453",
    method: "eth_sendTransaction",
    params: {
      to: CONTRACT_ADDRESS,
      data,
      value: `0x${value.toString(16)}`,
    },
    prices: {
      eth: ethPrice.toString(),
      myu: myuPrice.toString(),
      degen: degenPrice.toString(),
    }
  });
}
