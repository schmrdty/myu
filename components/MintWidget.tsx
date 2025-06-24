// Location: /components/MintWidget.tsx

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useSimulateContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { CONTRACT_ADDRESS, NFT_ABI, TOKENS, ERC20_ABI } from "@/lib/constants";
import { Button } from "@/components/DemoComponents";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

function formatTokenAmount(amount: bigint, decimals: number) {
  const v = Number(formatUnits(amount, decimals));
  return v.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function MintWidget() {
  const { address } = useAccount();
  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Contract reads (live data)
  const { data: mintedRaw, isLoading: isMintedLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "totalSupply",
  });
  const { data: maxSupplyRaw, isLoading: isMaxSupplyLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "maxSupply",
  });
  const { data: remainingRaw, isLoading: isRemainingLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "remainingMints",
  });
  const { data: currentTierRaw, isLoading: isTierLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "currentTier",
  });
  // User mints: use mintsBy(address)
  const { data: userMintsRaw, isLoading: isUserMintsLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintsBy",
    args: [address ?? "0x0"],
    query: { enabled: !!address },
  });

  // Type guards for bigint responses
  const minted = typeof mintedRaw === "bigint" ? Number(mintedRaw) : 0;
  const maxSupply = typeof maxSupplyRaw === "bigint" ? Number(maxSupplyRaw) : 0;
  const remaining = typeof remainingRaw === "bigint" ? Number(remainingRaw) : 0;
  const currentTier = typeof currentTierRaw === "bigint" ? Number(currentTierRaw) : 0;
  const userMints = typeof userMintsRaw === "bigint" ? Number(userMintsRaw) : 0;

  // Prices (per unit * mintAmount)
  const ETH_PRICE = parseUnits("0.00069", 18) * BigInt(mintAmount);
  const MYU_PRICE = parseUnits("5000000000000000000", 18) * BigInt(mintAmount);
  const DEGEN_PRICE = parseUnits("5250000000000000000", 18) * BigInt(mintAmount);

  // Allowance checks (using wagmi hooks, cast as bigint)
  const { data: myuAllowanceRaw } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.MYU.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled: !!address },
  });
  const { data: degenAllowanceRaw } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.DEGEN.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled: !!address },
  });

  const myuAllowance: bigint = typeof myuAllowanceRaw === "bigint" ? myuAllowanceRaw : 0n;
  const degenAllowance: bigint = typeof degenAllowanceRaw === "bigint" ? degenAllowanceRaw : 0n;

  const needsMyuApproval = myuAllowance < MYU_PRICE;
  const needsDegenApproval = degenAllowance < DEGEN_PRICE;

  // Approve & mint hooks
  const { writeContract: writeApproveMyu, isPending: isMyuApproving } = useWriteContract();
  const { writeContract: writeApproveDegen, isPending: isDegenApproving } = useWriteContract();
  const { writeContract: writeMintEth, isPending: isMintEth } = useWriteContract();
  const { writeContract: writeMintMyu, isPending: isMintMyu } = useWriteContract();
  const { writeContract: writeMintDegen, isPending: isMintDegen } = useWriteContract();

  // --- Simulation hooks ---
  const { data: canMintEth, error: mintEthSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithEth",
    args: [mintAmount],
    value: ETH_PRICE,
    query: { enabled: !!address && mintAmount > 0 },
  });
  const { data: canMintMyu, error: mintMyuSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithMyu",
    args: [mintAmount],
    query: { enabled: !!address && mintAmount > 0 && !needsMyuApproval },
  });
  const { data: canMintDegen, error: mintDegenSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithDegen",
    args: [mintAmount],
    query: { enabled: !!address && mintAmount > 0 && !needsDegenApproval },
  });

  // --- Handlers ---
  function handleMintEth() {
    setError(null);
    try {
      writeMintEth({
        abi: NFT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "mintWithEth",
        args: [mintAmount],
        value: ETH_PRICE,
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message: string }).message);
      } else {
        setError("Failed to mint with ETH");
      }
    }
  }
  function handleMintMyu() {
    setError(null);
    try {
      writeMintMyu({
        abi: NFT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "mintWithMyu",
        args: [mintAmount],
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message: string }).message);
      } else {
        setError("Failed to mint with MYU");
      }
    }
  }
  function handleMintDegen() {
    setError(null);
    try {
      writeMintDegen({
        abi: NFT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "mintWithDegen",
        args: [mintAmount],
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message: string }).message);
      } else {
        setError("Failed to mint with DEGEN");
      }
    }
  }
  function handleApproveMyu() {
    setError(null);
    try {
      writeApproveMyu({
        abi: ERC20_ABI,
        address: TOKENS.MYU.address as `0x${string}`,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, MYU_PRICE],
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message: string }).message);
      } else {
        setError("Failed to approve MYU");
      }
    }
  }
  function handleApproveDegen() {
    setError(null);
    try {
      writeApproveDegen({
        abi: ERC20_ABI,
        address: TOKENS.DEGEN.address as `0x${string}`,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, DEGEN_PRICE],
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string") {
        setError((e as { message: string }).message);
      } else {
        setError("Failed to approve DEGEN");
      }
    }
  }

  // --- Loading state for contract reads ---
  const isLoading =
    isMintedLoading ||
    isMaxSupplyLoading ||
    isRemainingLoading ||
    isTierLoading ||
    isUserMintsLoading;

  // --- Render ---
  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-4">Mint Myutruvian NFT</h2>
      {isLoading ? (
        <div className="mb-2">Loading mint info...</div>
      ) : (
        <>
          <div className="mb-2">
            <strong>Minted:</strong> {minted}/{maxSupply}
          </div>
          <div className="mb-2">
            <strong>Your Mints:</strong> {userMints}/501
          </div>
          <div className="mb-2">
            <strong>Remaining:</strong> {remaining}
          </div>
          <div className="mb-2">
            <strong>Current Tier:</strong> {currentTier}
          </div>
        </>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {error}
        </div>
      )}
      <div className="mb-4">
        <strong>Mint Amount:</strong>{" "}
        <select
          className="rounded px-2 py-1"
          value={mintAmount}
          onChange={e => setMintAmount(Number(e.target.value))}
        >
          {MINT_OPTIONS.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <strong>ETH Price:</strong> {formatTokenAmount(ETH_PRICE, TOKENS.ETH.decimals)} ETH
      </div>
      {mintEthSimError && (
        <div className="text-red-600 mb-2">Simulation failed: {mintEthSimError.message}</div>
      )}
      <Button
        variant="primary"
        size="lg"
        onClick={handleMintEth}
        disabled={isMintEth || !canMintEth || !!mintEthSimError || isLoading}
      >
        {isMintEth ? "Minting..." : "Mint with ETH"}
      </Button>

      <div className="mt-4 mb-1">
        <strong>MYU Price:</strong> {formatTokenAmount(MYU_PRICE, TOKENS.MYU.decimals)} MYU
      </div>
      {needsMyuApproval ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleApproveMyu}
          disabled={isMyuApproving || isLoading}
        >
          {isMyuApproving ? "Approving..." : "Approve MYU"}
        </Button>
      ) : (
        <>
          {mintMyuSimError && (
            <div className="text-red-600 mb-2">Simulation failed: {mintMyuSimError.message}</div>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintMyu}
            disabled={isMintMyu || !canMintMyu || !!mintMyuSimError || isLoading}
          >
            {isMintMyu ? "Minting..." : "Mint with MYU"}
          </Button>
        </>
      )}
      <div className="mt-4 mb-1">
        <strong>DEGEN Price:</strong> {formatTokenAmount(DEGEN_PRICE, TOKENS.DEGEN.decimals)} DEGEN
      </div>
      {needsDegenApproval ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleApproveDegen}
          disabled={isDegenApproving || isLoading}
        >
          {isDegenApproving ? "Approving..." : "Approve DEGEN"}
        </Button>
      ) : (
        <>
          {mintDegenSimError && (
            <div className="text-red-600 mb-2">Simulation failed: {mintDegenSimError.message}</div>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintDegen}
            disabled={isMintDegen || !canMintDegen || !!mintDegenSimError || isLoading}
          >
            {isMintDegen ? "Minting..." : "Mint with DEGEN"}
          </Button>
        </>
      )}
    </div>
  );
}
