"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/DemoComponents";

export function ConnectWalletButton() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, error, status } = useConnect();
  const { disconnect } = useDisconnect();
  const [showWallets, setShowWallets] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  // Filter for visible connectors (MetaMask, Coinbase)
  const visibleConnectors = connectors.filter(
    (c) =>
      c.id === "injected" ||
      c.id === "coinbaseWallet" ||
      c.name.toLowerCase().includes("metamask")
  );

  if (isConnected && address) {
    return (
      <Button variant="secondary" onClick={() => disconnect()}>
        {address.slice(0, 6)}...{address.slice(-4)} (Disconnect)
      </Button>
    );
  }
  if (isConnected && !address) {
    return (
      <Button variant="secondary" onClick={() => disconnect()}>
        Disconnect
      </Button>
    );
  }

  return (
    <div>
      <Button variant="primary" onClick={() => setShowWallets((v) => !v)}>
        Connect Wallet
      </Button>
      {showWallets && (
        <div className="wallet-modal bg-cyberglass border border-cyber-primary rounded-lg p-4 mt-2 z-10">
          {visibleConnectors.map((connector) => (
            <Button
              key={connector.id}
              className="w-full mb-2"
              onClick={() => {
                setPending(connector.id);
                connect({ connector });
                setShowWallets(false);
              }}
              disabled={!connector.ready}
              variant="outline"
            >
              {status === "pending" && pending === connector.id
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
