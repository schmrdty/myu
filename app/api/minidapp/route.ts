// Location: /app/api/frame/route.ts

import type { NextRequest } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { base } from "viem/chains";
import { CONTRACT_ADDRESS, NFT_ABI, BASE_RPC_URL } from "@/lib/constants";

const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL)
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userAddress = searchParams.get("address") || "0x0000000000000000000000000000000000000000";

  try {
    const [
      userMints,
      remainingMints,
      currentTierNum,
      ethPrice,
      myuPrice,
      degenPrice,
      totalMinted,
      maxSupply
    ] = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: NFT_ABI,
      functionName: "getMintInfo",
      args: [userAddress as `0x${string}`],
      }) as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

    // ✅ Use all variables in the URL
    const ogImageUrl = new URL(`${process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz"}/api/frame/og`);
    ogImageUrl.searchParams.set("totalMinted", totalMinted.toString());
    ogImageUrl.searchParams.set("maxSupply", maxSupply.toString());
    ogImageUrl.searchParams.set("userMints", userMints.toString());
    ogImageUrl.searchParams.set("remainingMints", remainingMints.toString());
    ogImageUrl.searchParams.set("tier", currentTierNum.toString());
    ogImageUrl.searchParams.set("ethPrice", formatEther(ethPrice));
    ogImageUrl.searchParams.set("myuPrice", myuPrice.toString());
    ogImageUrl.searchParams.set("degenPrice", degenPrice.toString());

    return Response.json({
      image: ogImageUrl.toString(),
      buttons: [
        { label: `Mint with ETH (${formatEther(ethPrice)})`, action: { type: "post", target: "/api/frame/mint/eth" } },
        { label: `Mint with MYU (${myuPrice})`, action: { type: "post", target: "/api/frame/mint/myu" } },
        { label: `Mint with DEGEN (${degenPrice})`, action: { type: "post", target: "/api/frame/mint/degen" } },
        { label: "View Contract", action: { type: "link", target: `https://basescan.org/address/${CONTRACT_ADDRESS}` } }
      ],
      postUrl: `${process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz"}/api/frame`,
      state: {
        totalMinted: totalMinted.toString(),
        userMints: userMints.toString(),
        maxSupply: maxSupply.toString(),
        remainingMints: remainingMints.toString()
      },
      inputText: "Enter amount to mint (1-10)",
      ogTitle: "Myutruvian NFT - Mint Now",
      ogDescription: `${totalMinted}/${maxSupply} minted | Tier ${currentTierNum} | ${remainingMints} remaining`,
    });
  } catch (error) {
    console.error("Failed to fetch mint info:", error);
    
    return Response.json({
      image: `${process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz"}/api/frame/og`,
      buttons: [
        { label: "Mint with ETH", action: { type: "post", target: "/api/frame/mint/eth" } },
        { label: "Mint with MYU", action: { type: "post", target: "/api/frame/mint/myu" } },
        { label: "View Contract", action: { type: "link", target: `https://basescan.org/address/${CONTRACT_ADDRESS}` } }
      ],
    });
  }
}
