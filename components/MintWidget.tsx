// Location: /components/MintWidget.tsx

import { useState, useEffect, useCallback } from "react";
import { formatEther, formatUnits, decodeEventLog, type TransactionReceipt, type Log } from "viem";
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Button } from "@/components/DemoComponents";
import { useMintInfo } from "@/hooks/useMintInfo";
import { useAllowances } from "@/hooks/useAllowances";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useSplitInfo } from "@/hooks/useSplitInfo";
import { useMiniAppContext } from "@/hooks/useMiniAppContext";
import { NFT_ABI, ERC20_ABI, CONTRACT_ADDRESS, TOKENS } from "@/lib/constants";
import { MintSuccessModal } from "@/components/MintSuccessModal";
import { toast } from "react-hot-toast";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

export default function MintWidget() {
  const [mintAmount, setMintAmount] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastMintTxHash, setLastMintTxHash] = useState<string>("");
  const [lastPaymentMethod, setLastPaymentMethod] = useState<"ETH" | "MYU" | "DEGEN">("ETH");
  const [mintedTokenIds, setMintedTokenIds] = useState<number[]>([]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { isMiniApp } = useMiniAppContext();
  
  const isOnBase = chainId === base.id;
  const showWalletConnect = !isMiniApp && !isConnected;
  const showSwitchNetwork = (isConnected || isMiniApp) && !isOnBase;
  const canMint = (isConnected || isMiniApp) && isOnBase;

  const { loading: loadingMint, data: mintInfo } = useMintInfo();
  const { data: splitInfo, refreshSplitInfo } = useSplitInfo();
  const { myu: myuBalance, degen: degenBalance } = useTokenBalances();
  const { myu: myuAllowance, degen: degenAllowance, maxMyuApproval, maxDegenApproval } = useAllowances(
    mintInfo?.myuPrice ?? 0n,
    mintInfo?.degenPrice ?? 0n
  );

  const { writeContract: writeApproveMyu, isPending: isMyuApproving } = useWriteContract();
  const { writeContract: writeApproveDegen, isPending: isDegenApproving } = useWriteContract();
  const { writeContract: writeMintEth, isPending: isMintEth, data: ethMintHash } = useWriteContract();
  const { writeContract: writeMintMyu, isPending: isMintMyu, data: myuMintHash } = useWriteContract();
  const { writeContract: writeMintDegen, isPending: isMintDegen, data: degenMintHash } = useWriteContract();

  const { data: ethReceipt } = useWaitForTransactionReceipt({ hash: ethMintHash });
  const { data: myuReceipt } = useWaitForTransactionReceipt({ hash: myuMintHash });
  const { data: degenReceipt } = useWaitForTransactionReceipt({ hash: degenMintHash });

  const needsMyuApproval = myuAllowance < ((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount));
  const needsDegenApproval = degenAllowance < ((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount));
  const soldOut = !!(mintInfo && mintInfo.remainingMints <= 0);
  const userMaxed = !!(mintInfo && mintInfo.userMints >= 500);

  // Handle mint success
  useEffect(() => {
    const handleMintSuccess = async (
      receipt: TransactionReceipt | undefined,
      method: "ETH" | "MYU" | "DEGEN"
    ) => {
      if (!receipt || receipt.status !== 'success') return;
      
      // Extract token IDs from receipt logs
      const tokenIds: number[] = [];
      receipt.logs.forEach((log: Log) => {
        try {
          const decoded = decodeEventLog({
            abi: NFT_ABI,
            data: log.data,
            topics: log.topics,
          });
          
          if (decoded.eventName === 'Minted' && decoded.args) {
            const [, startId, count] = decoded.args as readonly [string, bigint, bigint, string];
            const startIdNum = Number(startId);
            const countNum = Number(count);
            for (let i = 0; i < countNum; i++) {
              tokenIds.push(startIdNum + i);
            }
          }
        } catch (err) {
          // Not a Minted event, skip - error handled by not adding to tokenIds
          console.debug('Skipping non-Minted event');
        }
      });
      
      if (tokenIds.length > 0) {
        setMintedTokenIds(tokenIds);
        setLastMintTxHash(receipt.transactionHash);
        setLastPaymentMethod(method);
        setShowSuccessModal(true);
        
        // Refresh split info after successful mint
        await refreshSplitInfo();
        
        // Show success notification with address info
        toast.success(
          `Successfully minted ${tokenIds.length} NFT${tokenIds.length > 1 ? 's' : ''} to ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'your wallet'}!`
        );
      }
    };

    if (ethReceipt?.status === 'success') handleMintSuccess(ethReceipt, "ETH");
    if (myuReceipt?.status === 'success') handleMintSuccess(myuReceipt, "MYU");
    if (degenReceipt?.status === 'success') handleMintSuccess(degenReceipt, "DEGEN");
  }, [ethReceipt, myuReceipt, degenReceipt, refreshSplitInfo, address]);

  const handleSwitchNetwork = useCallback(async () => {
    try {
      await switchChain({ chainId: base.id });
      toast.success("Switched to Base network!");
    } catch (err) {
      console.error("Network switch error:", err);
      toast.error("Failed to switch network. Please switch manually.");
    }
  }, [switchChain]);

  const handleApproveMyu = () => {
    const toastId = toast.loading("Approving MYU...");
    writeApproveMyu({
      abi: ERC20_ABI,
      address: TOKENS.MYU.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxMyuApproval],
    }, {
      onSuccess: () => toast.success("MYU approved!", { id: toastId }),
      onError: (err) => toast.error(`Approval failed: ${err.message}`, { id: toastId }),
    });
  };

  const handleApproveDegen = () => {
    const toastId = toast.loading("Approving DEGEN...");
    writeApproveDegen({
      abi: ERC20_ABI,
      address: TOKENS.DEGEN.address as `0x${string}`,
      functionName: "approve",
      args: [CONTRACT_ADDRESS, maxDegenApproval],
    }, {
      onSuccess: () => toast.success("DEGEN approved!", { id: toastId }),
      onError: (err) => toast.error(`Approval failed: ${err.message}`, { id: toastId }),
    });
  };

  const handleMintEth = () => {
    const toastId = toast.loading("Minting with ETH...");
    writeMintEth({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithEth",
      args: [mintAmount],
      value: (mintInfo?.ethPrice ?? 0n) * BigInt(mintAmount),
    }, {
      onError: (err) => toast.error(`Mint failed: ${err.message}`, { id: toastId }),
    });
  };

  const handleMintMyu = () => {
    const toastId = toast.loading("Minting with MYU...");
    writeMintMyu({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithMyu",
      args: [mintAmount],
    }, {
      onError: (err) => toast.error(`Mint failed: ${err.message}`, { id: toastId }),
    });
  };

  const handleMintDegen = () => {
    const toastId = toast.loading("Minting with DEGEN...");
    writeMintDegen({
      abi: NFT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "mintWithDegen",
      args: [mintAmount],
    }, {
      onError: (err) => toast.error(`Mint failed: ${err.message}`, { id: toastId }),
    });
  };

  const formatTokenDisplay = (amount: bigint | string | number, decimals: number) => {
    const value = Number(formatUnits(BigInt(amount), decimals));
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="w-full space-y-4">
      {/* Mint Info */}
      {loadingMint ? (
        <div className="text-center">Loading mint info...</div>
      ) : mintInfo ? (
        <div className="space-y-2 text-center">
          <div><strong>Minted:</strong> {mintInfo.totalMinted.toLocaleString()}/{mintInfo.maxSupply.toLocaleString()}</div>
          <div><strong>Your Mints:</strong> {mintInfo.userMints}/500</div>
          <div><strong>Remaining:</strong> {mintInfo.remainingMints.toLocaleString()}</div>
        </div>
      ) : (
        <div className="text-center text-red-500">No mint info available</div>
      )}

      {/* Payment Split Info */}
      {splitInfo && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
          <div className="flex items-start">
            <span className="text-blue-600 dark:text-blue-400 mr-2">ℹ️</span>
            <div>
              <strong className="text-blue-900 dark:text-blue-300">Payment Split:</strong>
              <p className="text-blue-800 dark:text-blue-400 mt-1">
                {splitInfo.vaultPct}% to vault, {splitInfo.sendPct}% to developer
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {soldOut && (
        <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded">
          Sold out! No NFTs left to mint.
        </div>
      )}
      {userMaxed && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 p-3 rounded">
          You have minted the maximum allowed NFTs (500).
        </div>
      )}

      {/* Mint Amount Selector */}
      {!soldOut && !userMaxed && (
        <div className="text-center">
          <label className="block mb-2 font-semibold">Mint Amount:</label>
          <select
            className="rounded px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            value={mintAmount}
            onChange={e => setMintAmount(Number(e.target.value))}
            disabled={!!soldOut || !!userMaxed}
          >
            {MINT_OPTIONS.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Connect Wallet */}
        {showWalletConnect && (
          <div className="text-center">
            <ConnectWalletButton />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Connect your wallet to mint!
            </p>
          </div>
        )}

        {/* Switch Network */}
        {showSwitchNetwork && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSwitchNetwork}
            className="w-full"
          >
            Switch to Base Network
          </Button>
        )}

        {/* Mint Buttons */}
        {canMint && !soldOut && !userMaxed && (
          <>
            {/* ETH Mint */}
            <div className="space-y-1">
              <Button
                variant="primary"
                size="lg"
                onClick={handleMintEth}
                disabled={isMintEth || loadingMint}
                className="w-full"
              >
                {isMintEth ? "Minting..." : `Mint with ETH`}
              </Button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {formatEther((mintInfo?.ethPrice ?? 0n) * BigInt(mintAmount))} ETH
              </p>
            </div>

            {/* MYU Mint */}
            <div className="space-y-1">
              {needsMyuApproval ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleApproveMyu}
                  disabled={isMyuApproving || loadingMint}
                  className="w-full"
                >
                  {isMyuApproving ? "Approving..." : "Approve MYU"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMintMyu}
                  disabled={isMintMyu || loadingMint}
                  className="w-full"
                >
                  {isMintMyu ? "Minting..." : "Mint with MYU"}
                </Button>
              )}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {formatTokenDisplay((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount), TOKENS.MYU.decimals)} MYU
              </p>
            </div>

            {/* DEGEN Mint */}
            <div className="space-y-1">
              {needsDegenApproval ? (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleApproveDegen}
                  disabled={isDegenApproving || loadingMint}
                  className="w-full"
                >
                  {isDegenApproving ? "Approving..." : "Approve DEGEN"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMintDegen}
                  disabled={isMintDegen || loadingMint}
                  className="w-full"
                >
                  {isMintDegen ? "Minting..." : "Mint with DEGEN"}
                </Button>
              )}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {formatTokenDisplay((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount), TOKENS.DEGEN.decimals)} DEGEN
              </p>
            </div>
          </>
        )}
      </div>

      {/* Token Balances */}
      {isConnected && (
        <div className="text-center text-sm space-y-1">
          <div><strong>MYU Balance:</strong> {formatTokenDisplay(myuBalance, TOKENS.MYU.decimals)}</div>
          <div><strong>DEGEN Balance:</strong> {formatTokenDisplay(degenBalance, TOKENS.DEGEN.decimals)}</div>
        </div>
      )}

      <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        tokenIds={mintedTokenIds}
        txHash={lastMintTxHash}
        paymentMethod={lastPaymentMethod}
        totalPaid={
          lastPaymentMethod === "ETH"
            ? formatEther((mintInfo?.ethPrice ?? 0n) * BigInt(mintAmount))
            : lastPaymentMethod === "MYU"
            ? formatTokenDisplay((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount), TOKENS.MYU.decimals)
            : formatTokenDisplay((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount), TOKENS.DEGEN.decimals)
        }
        splitInfo={splitInfo}
      />
    </div>
  );
}
