// Location: /components/MintWidget.tsx

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useSimulateContract,
  useSwitchChain,
} from "wagmi";
import { formatUnits, formatEther } from "viem";
import { CONTRACT_ADDRESS, NFT_ABI, TOKENS, ERC20_ABI } from "@/lib/constants";
import { Button } from "@/components/DemoComponents";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

function formatTokenDisplay(amount: bigint, decimals: number, decimalsToShow = 0) {
  const value = Number(formatUnits(amount, decimals));
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimalsToShow,
    minimumFractionDigits: decimalsToShow,
  });
}

export default function MintWidget() {
  // ⏺️ Use Coinbase/OnchainKit: wagmi hooks for account/chain
  const { address, chain, isConnected } = useAccount();

  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  // Chain validation & autoswitch
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  useEffect(() => {
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id === 8453) {
      setChainError(null);
    } else if (chain && chain.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      try {
        switchChain?.({ chainId: 8453 });
      } catch {
        // Silent fail, show error only
      }
    }
  }, [chain, switchChain, isConnected]);

  // Fetch live mint info from contract
  const { data: mintInfoRaw, isLoading: isMintInfoLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getMintInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: isConnected && chain?.id === 8453 },
  });

  // Parse and guard contract return
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
    ? (mintInfoRaw as [
        bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint
      ])
    : [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n];

  // Calculate total prices for the input amount
  const ethPrice = ethPriceRaw * BigInt(mintAmount);
  const myuPrice = myuPriceRaw * BigInt(mintAmount);
  const degenPrice = degenPriceRaw * BigInt(mintAmount);

  // Read ERC20 allowance for MYU and DEGEN
  const { data: myuAllowanceRaw } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.MYU.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled: !!address && chain?.id === 8453 },
  });
  const { data: degenAllowanceRaw } = useReadContract({
    abi: ERC20_ABI,
    address: TOKENS.DEGEN.address as `0x${string}`,
    functionName: "allowance",
    args: [address ?? "0x0", CONTRACT_ADDRESS],
    query: { enabled: !!address && chain?.id === 8453 },
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

  // Simulate contract calls for error handling (only enabled if on Base)
  const { data: canMintEth, error: mintEthSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithEth",
    args: [mintAmount],
    value: ethPrice,
    query: { enabled: !!address && mintAmount > 0 && chain?.id === 8453 },
  });
  const { data: canMintMyu, error: mintMyuSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithMyu",
    args: [mintAmount],
    query: { enabled: !!address && mintAmount > 0 && !needsMyuApproval && chain?.id === 8453 },
  });
  const { data: canMintDegen, error: mintDegenSimError } = useSimulateContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "mintWithDegen",
    args: [mintAmount],
    query: { enabled: !!address && mintAmount > 0 && !needsDegenApproval && chain?.id === 8453 },
  });

  // --- Handlers ---
  function handleMintEth() {
    setError(null);
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      return;
    }
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
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      return;
    }
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
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      return;
    }
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
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      return;
    }
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
    if (!isConnected) {
      setChainError("Connect your wallet to mint!");
      return;
    }
    if (chain?.id !== 8453) {
      setChainError("Myutruvian is only on base... for now! Switch to base chain to mint.");
      return;
    }
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

  const isLoading = isMintInfoLoading;

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-4">Mint Myutruvian NFT</h2>
      {isLoading ? (
        <div className="mb-2">Loading mint info...</div>
      ) : (
        <>
          <div className="mb-2">
            <strong>Minted:</strong> {Number(totalMinted).toLocaleString()}/{Number(maxSupply).toLocaleString()}
          </div>
          <div className="mb-2">
            <strong>Your Mints:</strong> {Number(userMints)}/501
          </div>
          <div className="mb-2">
            <strong>Remaining:</strong> {Number(remainingMints).toLocaleString()}
          </div>
          <div className="mb-2">
            <strong>Current Tier:</strong> {Number(currentTierNum)}
          </div>
        </>
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
            !canMintEth ||
            !!mintEthSimError ||
            isLoading ||
            chain?.id !== 8453 ||
            !isConnected
          }
        >
          {isMintEth
            ? "Minting..."
            : isSwitching
            ? "Switching..."
            : `Mint with ETH (${formatEther(ethPrice)} ETH)`}
        </Button>
        {mintEthSimError && chain?.id === 8453 && isConnected && (
          <div className="text-red-600 mb-2 text-xs">{mintEthSimError.message}</div>
        )}
      </div>
      <div className="mb-2">
        {needsMyuApproval ? (
          <Button
            variant="secondary"
            size="md"
            onClick={handleApproveMyu}
            disabled={isMyuApproving || isLoading || chain?.id !== 8453 || !isConnected}
          >
            {isMyuApproving
              ? "Approving..."
              : isSwitching
              ? "Switching..."
              : `Approve MYU (${formatTokenDisplay(myuPrice, TOKENS.MYU.decimals, 0)} MYU)`}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintMyu}
            disabled={
              isMintMyu ||
              !canMintMyu ||
              !!mintMyuSimError ||
              isLoading ||
              chain?.id !== 8453 ||
              !isConnected
            }
          >
            {isMintMyu
              ? "Minting..."
              : isSwitching
              ? "Switching..."
              : `Mint with MYU (${formatTokenDisplay(myuPrice, TOKENS.MYU.decimals, 0)} MYU)`}
          </Button>
        )}
        {mintMyuSimError && chain?.id === 8453 && isConnected && (
          <div className="text-red-600 mb-2 text-xs">{mintMyuSimError.message}</div>
        )}
      </div>
      <div className="mb-2">
        {needsDegenApproval ? (
          <Button
            variant="secondary"
            size="md"
            onClick={handleApproveDegen}
            disabled={isDegenApproving || isLoading || chain?.id !== 8453 || !isConnected}
          >
            {isDegenApproving
              ? "Approving..."
              : isSwitching
              ? "Switching..."
              : `Approve DEGEN (${formatTokenDisplay(degenPrice, TOKENS.DEGEN.decimals, 0)} DEGEN)`}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintDegen}
            disabled={
              isMintDegen ||
              !canMintDegen ||
              !!mintDegenSimError ||
              isLoading ||
              chain?.id !== 8453 ||
              !isConnected
            }
          >
            {isMintDegen
              ? "Minting..."
              : isSwitching
              ? "Switching..."
              : `Mint with DEGEN (${formatTokenDisplay(degenPrice, TOKENS.DEGEN.decimals, 0)} DEGEN)`}
          </Button>
        )}
        {mintDegenSimError && chain?.id === 8453 && isConnected && (
          <div className="text-red-600 mb-2 text-xs">{mintDegenSimError.message}</div>
        )}
      </div>
      {chain?.id !== 8453 && (
        <div className="mt-4 text-yellow-500">
          Myutruvian is only on base... for now! Switch to base chain to mint.
        </div>
      )}
      {!isConnected && (
        <div className="mt-4 text-yellow-500">
          Connect your wallet to mint!
        </div>
      )}
    </div>
  );
}
