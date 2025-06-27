// Location: /components/MintWidget.tsx

import { useState } from "react";
import { formatEther, formatUnits } from "viem";
import Image from "next/image";
import { Button } from "@/components/DemoComponents";
import { useMintInfo } from "@/hooks/useMintInfo";
import { useAllowances } from "@/hooks/useAllowances";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useChainGuard } from "@/hooks/useChainGuard";
import { useWriteContract } from "wagmi";
import { NFT_ABI, ERC20_ABI, CONTRACT_ADDRESS, TOKENS } from "@/lib/constants";

const TIER_IMAGES = [
  process.env.NEXT_PUBLIC_0,
  process.env.NEXT_PUBLIC_1,
  process.env.NEXT_PUBLIC_2,
  process.env.NEXT_PUBLIC_3,
  process.env.NEXT_PUBLIC_4,
  process.env.NEXT_PUBLIC_5,
  process.env.NEXT_PUBLIC_6,
  process.env.NEXT_PUBLIC_7,
  process.env.NEXT_PUBLIC_8,
];

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

// Format tokens for human display
function toBigIntSafe(x: bigint | string | number): bigint {
  if (typeof x === "bigint") return x;
  if (typeof x === "string") return BigInt(x);
  return BigInt(x);
}

function formatTokenDisplay(amount: bigint | string | number, decimals: number, decimalsToShow = 0) {
  const value = Number(formatUnits(toBigIntSafe(amount), decimals));
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

  // Allowances
  const { myu: myuAllowance, degen: degenAllowance, maxMyuApproval, maxDegenApproval } = useAllowances(
    mintInfo?.myuPrice ?? 0n,
    mintInfo?.degenPrice ?? 0n
  );

  // Write contract hooks
  const { writeContract: writeApproveMyu, isPending: isMyuApproving } = useWriteContract();
  const { writeContract: writeApproveDegen, isPending: isDegenApproving } = useWriteContract();
  const { writeContract: writeMintEth, isPending: isMintEth } = useWriteContract();
  const { writeContract: writeMintMyu, isPending: isMintMyu } = useWriteContract();
  const { writeContract: writeMintDegen, isPending: isMintDegen } = useWriteContract();

  const needsMyuApproval = myuAllowance < ((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount));
  const needsDegenApproval = degenAllowance < ((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount));

  // Robust booleans
  const soldOut = !!(mintInfo && mintInfo.remainingMints <= 0);
  const userMaxed = !!(mintInfo && mintInfo.userMints >= 500);

  // Show static tier image if available
  const tierNum = mintInfo?.currentTierNum ?? 0;
  const tierImage = TIER_IMAGES[tierNum] || null;

  function handleApproveMyu() {
    setError(null);
    writeApproveMyu({
      abi: ERC20_ABI,
      address: TOKENS.MYU.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxMyuApproval],
    });
  }
  function handleApproveDegen() {
    setError(null);
    writeApproveDegen({
      abi: ERC20_ABI,
      address: TOKENS.DEGEN.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxDegenApproval],
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
          <div className="mb-2"><strong>Minted:</strong> {mintInfo.totalMinted.toLocaleString()}/{mintInfo.maxSupply.toLocaleString()}</div>
          <div className="mb-2"><strong>Your Mints:</strong> {mintInfo.userMints}/500</div>
          <div className="mb-2"><strong>Remaining:</strong> {mintInfo.remainingMints.toLocaleString()}</div>
          <div className="mb-2"><strong>Current Tier:</strong> {tierNum}</div>
          {tierImage && (
            <Image
              src={tierImage}
              alt={`Tier ${tierNum} price chart`}
              width={320}
              height={80}
              style={{ margin: "0 auto", borderRadius: 12, boxShadow: "0 0 12px #7fffd4, 0 0 28px #ff90c2" }}
              unoptimized // <-- add this if you want to skip Next.js optimization for IPFS
	      priority // optionally, mark as high-priority for LCP
            />
	  )}

            <div className="mb-2">
            <strong>Price per Mint:</strong>
            <ul>
              <li>ETH: {formatEther(mintInfo.ethPrice)} ETH</li>
              <li>MYU: {formatTokenDisplay(mintInfo.myuPrice, TOKENS.MYU.decimals, 0)} MYU</li>
              <li>DEGEN: {formatTokenDisplay(mintInfo.degenPrice, TOKENS.DEGEN.decimals, 0)} DEGEN</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="mb-2 text-red-500">No mint info available</div>
      )}

      {soldOut && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
          Sold out! No NFTs left to mint.
        </div>
      )}
      {userMaxed && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-3">
          You have minted the maximum allowed NFTs (500).
        </div>
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
          disabled={!!soldOut || !!userMaxed}
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
            !isBase ||
            soldOut ||
            userMaxed
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
            disabled={isMyuApproving || loadingMint || !isConnected || !isBase || soldOut || userMaxed}
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
              !isBase ||
              soldOut ||
              userMaxed
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
            disabled={isDegenApproving || loadingMint || !isConnected || !isBase || soldOut || userMaxed}
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
              !isBase ||
              soldOut ||
              userMaxed
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
