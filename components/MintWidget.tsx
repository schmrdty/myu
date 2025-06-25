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

// Format ERC20 numbers for user (e.g., 5000000 => 5,000,000)
function formatTokenDisplay(amount: bigint, decimals: number, decimalsToShow = 0) {
  const value = Number(formatUnits(amount, decimals));
  return value.toLocaleString(undefined, {
    maximumFractionDigits: decimalsToShow,
    minimumFractionDigits: decimalsToShow,
  });
}

export default function MintWidget() {
  const { address, chain } = useAccount();
  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  // Chain validation & autoswitch
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  useEffect(() => {
    // Clear chain error if user switches to Base
    if (chain?.id === 8453) setChainError(null);

    // If not on Base and connected, try to switch, else set error
    if (chain && chain.id !== 8453) {
      try {
        switchChain?.({ chainId: 8453 });
      } catch {
        setChainError("Please switch to the Base network to mint!");
      }
    }
  }, [chain, switchChain]);

  // Fetch live mint info from contract
  const { data: mintInfoRaw, isLoading: isMintInfoLoading } = useReadContract({
    abi: NFT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getMintInfo",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
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
    if (chain?.id !== 8453) {
      setChainError("Please switch to the Base network to mint!");
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
    if (chain?.id !== 8453) {
      setChainError("Please switch to the Base network to mint!");
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
    if (chain?.id !== 8453) {
      setChainError("Please switch to the Base network to mint!");
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
    if (chain?.id !== 8453) {
      setChainError("Please switch to the Base network to approve MYU!");
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
    if (chain?.id !== 8453) {
      setChainError("Please switch to the Base network to approve DEGEN!");
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
      <div className="mb-4">
        <strong>ETH Price:</strong>{" "}
        {formatEther(ethPrice)} ETH
      </div>
      {mintEthSimError && chain?.id === 8453 && (
        <div className="text-red-600 mb-2">Simulation failed: {mintEthSimError.message}</div>
      )}
      <Button
        variant="primary"
        size="lg"
        onClick={handleMintEth}
        disabled={
          isMintEth ||
          !canMintEth ||
          !!mintEthSimError ||
          isLoading ||
          chain?.id !== 8453
        }
      >
        {isMintEth
          ? "Minting..."
          : isSwitching
          ? "Switching..."
          : "Mint with ETH"}
      </Button>

      <div className="mt-4 mb-1">
        <strong>MYU Price:</strong>{" "}
        {formatTokenDisplay(myuPrice, TOKENS.MYU.decimals, 0)} MYU
      </div>
      {needsMyuApproval ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleApproveMyu}
          disabled={isMyuApproving || isLoading || chain?.id !== 8453}
        >
          {isMyuApproving
            ? "Approving..."
            : isSwitching
            ? "Switching..."
            : "Approve MYU"}
        </Button>
      ) : (
        <>
          {mintMyuSimError && chain?.id === 8453 && (
            <div className="text-red-600 mb-2">Simulation failed: {mintMyuSimError.message}</div>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintMyu}
            disabled={
              isMintMyu ||
              !canMintMyu ||
              !!mintMyuSimError ||
              isLoading ||
              chain?.id !== 8453
            }
          >
            {isMintMyu
              ? "Minting..."
              : isSwitching
              ? "Switching..."
              : "Mint with MYU"}
          </Button>
        </>
      )}
      <div className="mt-4 mb-1">
        <strong>DEGEN Price:</strong>{" "}
        {formatTokenDisplay(degenPrice, TOKENS.DEGEN.decimals, 0)} DEGEN
      </div>
      {needsDegenApproval ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleApproveDegen}
          disabled={isDegenApproving || isLoading || chain?.id !== 8453}
        >
          {isDegenApproving
            ? "Approving..."
            : isSwitching
            ? "Switching..."
            : "Approve DEGEN"}
        </Button>
      ) : (
        <>
          {mintDegenSimError && chain?.id === 8453 && (
            <div className="text-red-600 mb-2">Simulation failed: {mintDegenSimError.message}</div>
          )}
          <Button
            variant="primary"
            size="lg"
            onClick={handleMintDegen}
            disabled={
              isMintDegen ||
              !canMintDegen ||
              !!mintDegenSimError ||
              isLoading ||
              chain?.id !== 8453
            }
          >
            {isMintDegen
              ? "Minting..."
              : isSwitching
              ? "Switching..."
              : "Mint with DEGEN"}
          </Button>
        </>
      )}
      {chain?.id !== 8453 && (
        <div className="mt-4 text-yellow-500">
          You are not connected to Base! Please switch network in your wallet.
        </div>
      )}
    </div>
  );
}
