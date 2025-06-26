// Location: /components/MintWidget.tsx

import { useState } from "react";
import { formatEther, formatUnits } from "viem";
import { Button } from "@/components/DemoComponents";
import { useMintInfo } from "@/hooks/useMintInfo";
import { useAllowances } from "@/hooks/useAllowances";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useChainGuard } from "@/hooks/useChainGuard";
import { useWriteContract, useSimulateContract } from "wagmi";
import { NFT_ABI, ERC20_ABI, CONTRACT_ADDRESS, TOKENS } from "@/lib/constants";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

function formatTokenDisplay(amount: bigint, decimals: number, decimalsToShow = 0) {
  const value = Number(formatUnits(amount, decimals));
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimalsToShow,
    minimumFractionDigits: decimalsToShow,
  });
}

export default function MintWidget() {
  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Chain/connection state and error
  const { isConnected, isBase, error: chainError } = useChainGuard();

  // Mint info (prices, supply, etc)
  const { loading: loadingMint, data: mintInfo } = useMintInfo();

  // Token balances (for MYU, DEGEN)
  const { myu: myuBalance, degen: degenBalance } = useTokenBalances();

  // Allowances, capped to allow 101x buy
  const { myu: myuAllowance, degen: degenAllowance, maxMyuApproval, maxDegenApproval } = useAllowances(
    mintInfo?.myuPrice ?? 0n,
    mintInfo?.degenPrice ?? 0n
  );

  // Approve & mint hooks
  const { writeContract: writeApproveMyu, isPending: isMyuApproving } = useWriteContract();
  const { writeContract: writeApproveDegen, isPending: isDegenApproving } = useWriteContract();
  const { writeContract: writeMintEth, isPending: isMintEth } = useWriteContract();
  const { writeContract: writeMintMyu, isPending: isMintMyu } = useWriteContract();
  const { writeContract: writeMintDegen, isPending: isMintDegen } = useWriteContract();

  // Simulate contract calls for error handling (optional, advanced)
  // ... (omitted for brevity, but you can wire up as before)

  const needsMyuApproval = myuAllowance < ((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount));
  const needsDegenApproval = degenAllowance < ((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount));

  function handleApproveMyu() {
    setError(null);
    writeApproveMyu({
      abi: ERC20_ABI,
      address: TOKENS.MYU.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxMyuApproval], // Cap to 101x
    });
  }
  function handleApproveDegen() {
    setError(null);
    writeApproveDegen({
      abi: ERC20_ABI,
      address: TOKENS.DEGEN.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxDegenApproval], // Cap to 101x
    });
  }
  function handleMintEth() {
    setError(null);
    writeMintEth({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithEth",
      args: [mintAmount],
      value: (mintInfo?.ethPrice ?? 0n) * BigInt(mintAmount),
    });
  }
  function handleMintMyu() {
    setError(null);
    writeMintMyu({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithMyu",
      args: [mintAmount],
    });
  }
  function handleMintDegen() {
    setError(null);
    writeMintDegen({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithDegen",
      args: [mintAmount],
    });
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-4">Mint Myutruvian NFT</h2>
      {loadingMint ? (
        <div className="mb-2">Loading mint info...</div>
      ) : mintInfo ? (
        <>
          <div className="mb-2">
            <strong>Minted:</strong> {mintInfo.totalMinted.toLocaleString()}/{mintInfo.maxSupply.toLocaleString()}
          </div>
          <div className="mb-2">
            <strong>Your Mints:</strong> {mintInfo.userMints}/501
          </div>
          <div className="mb-2">
            <strong>Remaining:</strong> {mintInfo.remainingMints.toLocaleString()}
          </div>
          <div className="mb-2">
            <strong>Current Tier:</strong> {mintInfo.currentTierNum}
          </div>
        </>
      ) : (
        <div className="mb-2 text-red-500">No mint info available</div>
      )}
      {(chainError || error) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          {chainError || error}
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
      <div className="mb-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleMintEth}
          disabled={
            isMintEth ||
            loadingMint ||
            !isConnected ||
            !isBase
          }
        >
          {isMintEth
            ? "Minting..."
            : `Mint with ETH (${formatEther((mintInfo?.ethPrice ?? 0n) * BigInt(mintAmount))} ETH)`}
        </Button>
      </div>
      <div className="mb-2">
        {needsMyuApproval ? (
          <Button
            variant="secondary"
            size="md"
            onClick={handleApproveMyu}
            disabled={isMyuApproving || loadingMint || !isConnected || !isBase}
          >
            {isMyuApproving
              ? "Approving..."
              : `Approve MYU (Up to ${formatTokenDisplay(maxMyuApproval, TOKENS.MYU.decimals, 0)} MYU)`}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintMyu}
            disabled={
              isMintMyu ||
              loadingMint ||
              !isConnected ||
              !isBase
            }
          >
            {isMintMyu
              ? "Minting..."
              : `Mint with MYU (${formatTokenDisplay((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount), TOKENS.MYU.decimals, 0)} MYU)`}
          </Button>
        )}
      </div>
      <div className="mb-2">
        {needsDegenApproval ? (
          <Button
            variant="secondary"
            size="md"
            onClick={handleApproveDegen}
            disabled={isDegenApproving || loadingMint || !isConnected || !isBase}
          >
            {isDegenApproving
              ? "Approving..."
              : `Approve DEGEN (Up to ${formatTokenDisplay(maxDegenApproval, TOKENS.DEGEN.decimals, 0)} DEGEN)`}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintDegen}
            disabled={
              isMintDegen ||
              loadingMint ||
              !isConnected ||
              !isBase
            }
          >
            {isMintDegen
              ? "Minting..."
              : `Mint with DEGEN (${formatTokenDisplay((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount), TOKENS.DEGEN.decimals, 0)} DEGEN)`}
          </Button>
        )}
      </div>
      <div className="mb-2">
        <div>
          <strong>MYU Balance:</strong> {formatTokenDisplay(myuBalance, TOKENS.MYU.decimals, 0)}
        </div>
        <div>
          <strong>DEGEN Balance:</strong> {formatTokenDisplay(degenBalance, TOKENS.DEGEN.decimals, 0)}
        </div>
      </div>
      {!isConnected && (
        <div className="mt-4 text-green-500">
          Connect your wallet to mint!
        </div>
      )}
    </div>
  );
}
