import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, NFT_ABI } from "@/lib/constants";

/**
 * Fetch the current payment split percentages from the contract
 */
export function useSplitInfo() {
  const { data, isLoading, error } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "currentSplit",
    query: {
      staleTime: 300_000, // Cache for 5 minutes
    },
  });

  let splitInfo = null;
  if (data && Array.isArray(data) && data.length >= 2) {
    splitInfo = {
      sendPct: Number(data[0]),
      vaultPct: Number(data[1]),
    };
  }

  return {
    loading: isLoading,
    error: error ?? null,
    data: splitInfo,
  };
}
