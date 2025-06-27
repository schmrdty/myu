// Location: /hooks/useChainGuard.ts

import { useAccount } from "wagmi";

/**
 * Checks wallet connection and chain, returns UI state and error.
 */
export function useChainGuard() {
  const { isConnected, chain } = useAccount();
  const isBase = chain?.id === 8453;

  let error: string | null = null;
  if (!isConnected) {
    error = "Connect your wallet to mint!";
  } else if (!isBase) {
    error = "Myutruvian is only on base... for now! Switch to base chain to mint.";
  }

  return { isConnected, isBase, chain, error };
}
