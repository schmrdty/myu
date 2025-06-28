import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, NFT_ABI } from "@/lib/constants";
import type { MintInfo } from "@/types/mint";

/**
 * Fetch and parse Myutruvian NFT mint info for the connected user.
 */
export function useMintInfo() {
  const { address, isConnected, chain } = useAccount();
  const isBase = chain?.id === 8453;
  
  // Only enable the query when we have a real address
  const enabled = isConnected && isBase && !!address;

  const { data, isLoading, error } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getMintInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { 
      enabled,
      // Refetch when address changes
      refetchInterval: false,
      staleTime: 120_000, // Consider data stale after 120 seconds
    },
  });

  let parsed: MintInfo | null = null;
  if (Array.isArray(data) && data.length === 8) {
    parsed = {
      userMints: Number(data[0]),
      remainingMints: Number(data[1]),
      currentTierNum: Number(data[2]),
      ethPrice: data[3] as bigint,
      myuPrice: data[4] as bigint,
      degenPrice: data[5] as bigint,
      totalMinted: Number(data[6]),
      maxSupply: Number(data[7]),
    };
  }

  return {
    loading: isLoading,
    error: error ?? null,
    data: parsed,
    connected: isConnected,
    isBase,
    address,
  };
}
