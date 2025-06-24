// Location: /components/MintWidget.tsx

"use client";

import { useState, useEffect } from "react";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants";
import { formatEther } from "viem";

export default function MintWidget() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  
  // ✅ State variables
  const [userMints, setUserMints] = useState<bigint>(0n);
  const [remainingMints, setRemainingMints] = useState<bigint>(0n);
  const [currentTierNum, setCurrentTierNum] = useState<bigint>(0n);
  const [ethPrice, setEthPrice] = useState<bigint>(0n);
  const [myuPrice, setMyuPrice] = useState<bigint>(0n);
  const [degenPrice, setDegenPrice] = useState<bigint>(0n);
  const [totalMinted, setTotalMinted] = useState<bigint>(0n);
  const [maxSupply, setMaxSupply] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;

    (async () => {
      try {
        setError(null);
        
        // ✅ If no address, fetch general contract info
        const contractAddress = address || "0x0000000000000000000000000000000000000000";
        
        console.log("Fetching mint info for:", contractAddress);
        
        const [
          userMints,
          remainingMints,
          currentTierNum,
          ethPrice,
          myuPrice,
          degenPrice,
          totalMinted,
          maxSupply
        ] = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getMintInfo",
          args: [contractAddress],
        }) as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

        setUserMints(userMints);
        setRemainingMints(remainingMints);
        setCurrentTierNum(currentTierNum);
        setEthPrice(ethPrice);
        setMyuPrice(myuPrice);
        setDegenPrice(degenPrice);
        setTotalMinted(totalMinted);
        setMaxSupply(maxSupply);
        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to fetch mint info:", error);
        setError("Failed to load contract data. Please check your connection.");
        setDataLoaded(true); // Set loaded even on error to show error state
      }
    })();
  }, [publicClient, address]);

  const handleMint = async (method: "eth" | "myu" | "degen", amount: number) => {
    // ✅ Check if wallet is connected
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (!walletClient || !address || !publicClient) return;

    setLoading(true);
    setError(null);
    
    try {
      // ✅ Removed unused functionName variable
      if (method === "eth") {
        const { request } = await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "mintWithEth",
          args: [BigInt(amount)],
          account: address,
          value: ethPrice * BigInt(amount),
        });
        await walletClient.writeContract(request);
      } else if (method === "myu") {
        const { request } = await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "mintWithMyu",
          args: [BigInt(amount)],
          account: address,
        });
        await walletClient.writeContract(request);
      } else if (method === "degen") {
        const { request } = await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "mintWithDegen",
          args: [BigInt(amount)],
          account: address,
        });
        await walletClient.writeContract(request);
      }
      
      // ✅ Refresh data after successful mint
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: unknown) { // ✅ Fixed: Proper error typing
      console.error("Mint failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Mint failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading state while data is being fetched
  if (!dataLoaded) {
    return (
      <div className="p-6 bg-card rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading contract data...</span>
        </div>
      </div>
    );
  }

  // ✅ Show error state if there's an error
  if (error && !isConnected) {
    return (
      <div className="p-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Mint Myutruvian NFT</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-gray-600">Please connect your wallet to mint.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Mint Myutruvian NFT</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-2 mb-6">
        <p>Minted: {totalMinted.toString()}/{maxSupply.toString()}</p>
        {isConnected && (
          <>
            <p>Your Mints: {userMints.toString()}/501</p>
            <p>Remaining: {remainingMints.toString()}</p>
          </>
        )}
        <p>Current Tier: {currentTierNum.toString()}</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2">ETH Price: {formatEther(ethPrice)} ETH</p>
          <button
            onClick={() => handleMint("eth", 1)}
            disabled={loading || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected ? "Connect Wallet" : loading ? "Minting..." : "Mint with ETH"}
          </button>
        </div>

        <div>
          <p className="mb-2">MYU Price: {myuPrice.toString()} MYU</p>
          <button
            onClick={() => handleMint("myu", 1)}
            disabled={loading || !isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected ? "Connect Wallet" : loading ? "Minting..." : "Mint with MYU"}
          </button>
        </div>

        <div>
          <p className="mb-2">DEGEN Price: {degenPrice.toString()} DEGEN</p>
          <button
            onClick={() => handleMint("degen", 1)}
            disabled={loading || !isConnected}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isConnected ? "Connect Wallet" : loading ? "Minting..." : "Mint with DEGEN"}
          </button>
        </div>
      </div>
    </div>
  );
}
