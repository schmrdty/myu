import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, NFT_ABI } from "@/lib/constants";

/**
 * Fetch the current payment split percentages from the contract
 */
export function useSplitInfo() {
  console.log('🔍 DEBUG: useSplitInfo hook called');
  
  const { data, isLoading, error } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "currentSplit",
    query: {
      staleTime: 300_000, // Cache for 5 minutes
    },
  });

  // Debug logs should be inside a conditional checking if data exists
  if (data) {
    console.log('🔍 DEBUG: Raw split from contract:', {
      data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'not array'
    });
  }

  let splitInfo = null;
  if (data && Array.isArray(data) && data.length >= 2) {
    splitInfo = {
      sendPct: Number(data[0]),
      vaultPct: Number(data[1]),
    };
    
    console.log('🔍 DEBUG: Parsed split values:', {
      sendPct: splitInfo.sendPct,
      vaultPct: splitInfo.vaultPct,
      total: splitInfo.sendPct + splitInfo.vaultPct
    });
  }

  return {
    loading: isLoading,
    error: error ?? null,
    data: splitInfo,
  };
}
