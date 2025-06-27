// Location: /hooks/useTokenBalances.ts

import { useAccount, useReadContract } from "wagmi";
import { ERC20_ABI, TOKENS } from "@/lib/constants";

/**
 * Fetch the user's MYU and DEGEN token balances.
 */
export function useTokenBalances() {
  const { address, isConnected, chain } = useAccount();
  const isBase = chain?.id === 8453;
  const enabled = !!address && isConnected && isBase;

  const { data: myu } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.MYU.address as `0x${string}`,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
    query: { enabled },
  });

  const { data: degen } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.DEGEN.address as `0x${string}`,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
    query: { enabled },
  });

  return {
    myu: typeof myu === "bigint" ? myu : 0n,
    degen: typeof degen === "bigint" ? degen : 0n,
    isBase,
    address,
  };
}
