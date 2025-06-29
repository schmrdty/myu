// Location: /components/ConnectWalletButton.tsx

"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/DemoComponents";
import { useFrameContext } from "@/hooks/useFrameContext";

export function ConnectWalletButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, error, status } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWallets, setShowWallets] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Hide connect button in Farcaster frames for best UX
  const { isFrame } = useFrameContext?.() || { isFrame: false };
  if (isFrame) {
    return (
      <div className="text-muted text-center text-sm py-2">
	Wallet connection is handled by Farcaster in frames!
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <Button variant="secondary" onClick={disconnect}>
        {address.slice(0, 6)}...{address.slice(-4)} (Disconnect)
      </Button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <Button variant="primary" onClick={() => setShowWallets((v) => !v)}>
        Connect Wallet
      </Button>
      {showWallets && (
        <div className="wallet-modal bg-cyberglass border border-cyber-primary rounded-lg p-4 mt-2 z-10">
          {connectors.map((connector) => (
            <Button
              key={connector.id}
              className="w-full mb-2"
              onClick={() => {
                setPendingId(connector.id);
                connect({ connector });
                setShowWallets(false);
              }}
              disabled={!connector.ready}
              variant="outline"
            >
              {status === "pending" && pendingId === connector.id
                ? "Connecting..."
                : connector.name}
            </Button>
          ))}
          {error && (
            <div className="text-red-500 px-2 py-1 text-xs">
              {error.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
