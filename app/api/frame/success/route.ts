// Location: /app/api/frame/success/route.ts

import type { NextRequest } from "next/server";
import { redis, getMintTransaction } from "@/lib/redis";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const txHash = body.transactionHash || "";
  
  // ✅ Get transaction details from Redis if available
  let mintDetails = null;
  if (txHash && redis) {
    mintDetails = await getMintTransaction(txHash);
  }
  
  const shareText = encodeURIComponent(
    `Just minted my Myutruvian NFT! 🍄✨${mintDetails ? ` (Token #${mintDetails.tokenId})` : ""}\n\nJoin the mycelial network:\n${process.env.NEXT_PUBLIC_HOST || "https://yoursite.com"}`
  );
  
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}`;

  return Response.json({
    image: `${process.env.NEXT_PUBLIC_HOST || "https://yoursite.com"}/api/frame/og/success`,
    buttons: [
      { 
        label: "Share on Farcaster 🔄", 
        action: { 
          type: "link", 
          target: shareUrl 
        } 
      },
      { 
        label: "Mint More", 
        action: { 
          type: "post", 
          target: "/api/frame" 
        } 
      },
      { 
        label: "View on OpenSea", 
        action: { 
          type: "link", 
          target: "https://opensea.io/collection/myutruvian" 
        } 
      },
      ...(txHash ? [{
        label: "View Transaction",
        action: {
          type: "link",
          target: `https://basescan.org/tx/${txHash}`
        }
      }] : [])
    ],
    state: {
      success: true,
      txHash,
      timestamp: Date.now().toString(),
      ...(mintDetails ? { tokenId: mintDetails.tokenId } : {})
    }
  });
}
