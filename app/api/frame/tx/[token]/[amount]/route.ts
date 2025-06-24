// Location: /app/api/frame/tx/[token]/[amount]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { parseEther, encodeFunctionData } from "viem";

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

  // ✅ Removed unused userAddress variable
  const functionName = token === "eth" ? "mintWithEth" : 
                      token === "myu" ? "mintWithMyu" : "mintWithDegen";

  const data = encodeFunctionData({
    abi: [{
      inputs: [{ name: "count", type: "uint256" }],
      name: functionName,
      outputs: [],
      stateMutability: token === "eth" ? "payable" : "nonpayable",
      type: "function"
    }],
    functionName,
    args: [BigInt(amountNum)]
  });

  const value = token === "eth" ? 
    parseEther((0.01 * amountNum).toString()) : BigInt(0);

  return NextResponse.json({
    chainId: "eip155:8453",
    method: "eth_sendTransaction",
    params: {
      to: CONTRACT_ADDRESS,
      data,
      value: `0x${value.toString(16)}`,
    },
  });
}
