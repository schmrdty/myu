import { useState, useEffect } from "react";
import { formatEther, formatUnits, decodeEventLog, type TransactionReceipt, type Log } from "viem";
import { Button } from "@/components/DemoComponents";
import { useMintInfo } from "@/hooks/useMintInfo";
import { useAllowances } from "@/hooks/useAllowances";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useChainGuard } from "@/hooks/useChainGuard";
import { useSplitInfo } from "@/hooks/useSplitInfo";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NFT_ABI, ERC20_ABI, CONTRACT_ADDRESS, TOKENS } from "@/lib/constants";
import { MintSuccessModal } from "@/components/MintSuccessModal";
import { LuckyMintTracker } from "@/components/LuckyMintTracker";

const MINT_OPTIONS = [1, 5, 10, 20, 50, 100, 500];

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastMintTxHash, setLastMintTxHash] = useState<string>("");
  const [lastPaymentMethod, setLastPaymentMethod] = useState<"ETH" | "MYU" | "DEGEN">("ETH");
  const [mintedTokenIds, setMintedTokenIds] = useState<number[]>([]);

  const { isConnected, isBase, error: chainError } = useChainGuard();
  const { loading: loadingMint, data: mintInfo } = useMintInfo();
  const { data: splitInfo } = useSplitInfo();
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

  useEffect(() => {
    if (splitInfo) {
      console.log('🔍 DEBUG MintWidget: Split info received:', splitInfo);
      console.log('🔍 DEBUG MintWidget: Send %:', splitInfo.sendPct);
      console.log('🔍 DEBUG MintWidget: Vault %:', splitInfo.vaultPct);
      // Validation check
      if (splitInfo.sendPct + splitInfo.vaultPct !== 100) {
        console.warn('⚠️ WARNING: Split percentages do not add up to 100%:', splitInfo);
      }
    }
  }, [splitInfo]);

  useEffect(() => {
    const handleMintSuccess = (
      receipt: TransactionReceipt | undefined,
      paymentMethod: "ETH" | "MYU" | "DEGEN"
    ) => {
      if (!receipt) return;

      const tokenIds: number[] = [];
      receipt.logs.forEach((log: Log) => {
        try {
          const decoded = decodeEventLog({
            abi: NFT_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'Minted' && decoded.args) {
            // Minted event: [minter, startId, count, paymentToken]
            const argsArr = decoded.args as readonly [string, bigint, bigint, string] | readonly unknown[];
            const startId = Number(argsArr[1]);
            const count = Number(argsArr[2]);
            for (let i = 0; i < count; i++) {
              tokenIds.push(startId + i);
            }
          }
        } catch {
          // Not a Minted event, skip
        }
      });

      if (tokenIds.length > 0) {
        setMintedTokenIds(tokenIds);
        setLastMintTxHash(receipt.transactionHash);
        setLastPaymentMethod(paymentMethod);
        setShowSuccessModal(true);
      }
    };

    if (ethReceipt?.status === 'success') handleMintSuccess(ethReceipt, "ETH");
    if (myuReceipt?.status === 'success') handleMintSuccess(myuReceipt, "MYU");
    if (degenReceipt?.status === 'success') handleMintSuccess(degenReceipt, "DEGEN");
  }, [ethReceipt, myuReceipt, degenReceipt]);

  const needsMyuApproval = myuAllowance < ((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount));
  const needsDegenApproval = degenAllowance < ((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount));
  const soldOut = !!(mintInfo && mintInfo.remainingMints <= 0);
  const userMaxed = !!(mintInfo && mintInfo.userMints >= 500);
  const tierNum = mintInfo?.currentTierNum ?? 0;

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
    <div className="card" style={{ maxWidth: 450, margin: "0 auto" }}>
      <h2 className="cyberpunk text-2xl mb-4">Mint Myutruvian NFT</h2>
      {loadingMint ? (
        <div className="mb-2">Loading mint info...</div>
      ) : mintInfo ? (
        <>
          <div className="mb-2"><strong>Minted:</strong> {mintInfo.totalMinted.toLocaleString()}/{mintInfo.maxSupply.toLocaleString()}</div>
          <div className="mb-2"><strong>Your Mints:</strong> {mintInfo.userMints}/500</div>
          <div className="mb-2"><strong>Remaining:</strong> {mintInfo.remainingMints.toLocaleString()}</div>
          <div className="mb-2"><strong>Current Tier:</strong> {tierNum}</div>
          <div className="mb-2">
            <strong>Price per Mint:</strong>
            <ul>
              <li>ETH: {formatEther(mintInfo.ethPrice)} ETH</li>
              <li>MYU: {formatTokenDisplay(mintInfo.myuPrice, TOKENS.MYU.decimals, 0)} MYU</li>
              <li>DEGEN: {formatTokenDisplay(mintInfo.degenPrice, TOKENS.DEGEN.decimals, 0)} DEGEN</li>
            </ul>
          </div>

          {/* Payment Split Info */}
          {splitInfo && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm">
              <div className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">ℹ️</span>
                <div>
                  <strong className="text-blue-900 dark:text-blue-300">Payment Split:</strong>
                  <p className="text-blue-800 dark:text-blue-400 mt-1">
                    Your payment will be split: {splitInfo.vaultPct}% to vault, {splitInfo.sendPct}% to developer.
                    Your wallet may show multiple transfers.
                  </p>
                </div>
              </div>
            </div>
          )}
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
            ? formatTokenDisplay((mintInfo?.myuPrice ?? 0n) * BigInt(mintAmount), TOKENS.MYU.decimals, 0)
            : formatTokenDisplay((mintInfo?.degenPrice ?? 0n) * BigInt(mintAmount), TOKENS.DEGEN.decimals, 0)
        }
        splitInfo={splitInfo}
      />
      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-700">
        <LuckyMintTracker />
      </div>
    </div>
  );
}
