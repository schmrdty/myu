// Location: /components/MintWidget.tsx

import { useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useSimulateContract } from "wagmi";
import { formatUnits, parseUnits, formatEther } from "viem";
import { CONTRACT_ADDRESS, NFT_ABI, TOKENS, ERC20_ABI } from "@/lib/constants";
import { Button } from "@/components/DemoComponents";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

function formatTokenAmount(amount: bigint, decimals: number) {
  const v = Number(formatUnits(amount, decimals));
  return v.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

export default function MintWidget() {
  const { address, chain } = useAccount();
  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // ⏺️ Read all mint info from contract (single call for everything)
  const { data: mintInfoRaw, isLoading: isMintInfoLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getMintInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
  });

  // Parse contract return (guard for undefined)
  const [
    userMints,
    remainingMints,
    currentTierNum,
    ethPriceRaw,
    myuPriceRaw,
    degenPriceRaw,
    totalMinted,
    maxSupply,
  ] = Array.isArray(mintInfoRaw) && mintInfoRaw.length === 8
    ? mintInfoRaw as [
        bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint
      ]
    : [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];

  // Prices per NFT (for current tier)
  const ethPrice = ethPriceRaw * BigInt(mintAmount);
  const myuPrice = myuPriceRaw * BigInt(mintAmount);
  const degenPrice = degenPriceRaw * BigInt(mintAmount);

  // Read ERC20 allowance for MYU and DEGEN
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
  const needsMyuApproval = myuAllowance < myuPrice;
  const needsDegenApproval = degenAllowance < degenPrice;

  // Approve & mint hooks
  const { writeContract: writeApproveMyu, isPending: isMyuApproving } = useWriteContract();
  const { writeContract: writeApproveDegen, isPending: isDegenApproving } = useWriteContract();
  const { writeContract: writeMintEth, isPending: isMintEth } = useWriteContract();
  const { writeContract: writeMintMyu, isPending: isMintMyu } = useWriteContract();
  const { writeContract: writeMintDegen, isPending: isMintDegen } = useWriteContract();

  // Simulate contract calls for error handling
  const { data: canMintEth, error: mintEthSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithEth",
    args: [mintAmount],
    value: ethPrice,
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
        value: ethPrice,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to mint with ETH");
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
      setError(e instanceof Error ? e.message : "Failed to mint with MYU");
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
      setError(e instanceof Error ? e.message : "Failed to mint with DEGEN");
    }
  }
  function handleApproveMyu() {
    setError(null);
    try {
      writeApproveMyu({
        abi: ERC20_ABI,
        address: TOKENS.MYU.address as `0x${string}`,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, myuPrice],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to approve MYU");
    }
  }
  function handleApproveDegen() {
    setError(null);
    try {
      writeApproveDegen({
        abi: ERC20_ABI,
        address: TOKENS.DEGEN.address as `0x${string}`,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, degenPrice],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to approve DEGEN");
    }
  }

  // --- Loading state for contract reads ---
  const isLoading = isMintInfoLoading;

  // --- Render ---
  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-4">Mint Myutruvian NFT</h2>
      {isLoading ? (
        <div className="mb-2">Loading mint info...</div>
      ) : (
        <>
          <div className="mb-2">
            <strong>Minted:</strong> {Number(totalMinted)}/{Number(maxSupply)}
          </div>
          <div className="mb-2">
            <strong>Your Mints:</strong> {Number(userMints)}/501
          </div>
          <div className="mb-2">
            <strong>Remaining:</strong> {Number(remainingMints)}
          </div>
          <div className="mb-2">
            <strong>Current Tier:</strong> {Number(currentTierNum)}
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
        <strong>ETH Price:</strong> {formatEther(ethPrice)} ETH
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
        <strong>MYU Price:</strong> {formatUnits(myuPrice, TOKENS.MYU.decimals)} MYU
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
        <strong>DEGEN Price:</strong> {formatUnits(degenPrice, TOKENS.DEGEN.decimals)} DEGEN
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
      {/* Optional: Network guardrail */}
      {chain && chain.id !== 8453 && (
        <div className="mt-4 text-yellow-500">
          You are not connected to Base! Please switch network in your wallet.
        </div>
      )}
    </div>
  );
}
