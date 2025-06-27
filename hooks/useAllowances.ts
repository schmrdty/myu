// Location: /hooks/useAllowances.ts

import { useAccount, useReadContract } from "wagmi";
import { ERC20_ABI, TOKENS, CONTRACT_ADDRESS } from "@/lib/constants";

export function useAllowances(myuPrice: bigint, degenPrice: bigint) {
  const { address, isConnected, chain } = useAccount();
  const isBase = chain?.id === 8453;
  const enabled = !!address && isConnected && isBase;

  // Maximum approval = price * 101 (for up to 101 mint)
  const maxMyuApproval = myuPrice * 101n;
  const maxDegenApproval = degenPrice * 101n;

  const { data: myu } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.MYU.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled },
  });

  const { data: degen } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.DEGEN.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled },
  });

  return {
    myu: typeof myu === "bigint" ? myu : 0n,
    degen: typeof degen === "bigint" ? degen : 0n,
    maxMyuApproval,
    maxDegenApproval,
    isBase,
    address,
  };
}
