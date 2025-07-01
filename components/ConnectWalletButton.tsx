// Location: /components/ConnectWalletButton.tsx

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

// ✅ Define proper types for window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isBraveWallet?: boolean;
  isRainbow?: boolean;
  isZerion?: boolean;
  isFarcaster: boolean;
}

export function ConnectWalletButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Auto-switch to Base if on wrong chain
  useEffect(() => {
    if (isConnected && chainId !== base.id && switchChain) {
      switchChain({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain]);

  // Don't render until mounted (avoids hydration issues)
  if (!mounted) return null;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // ✅ Better wallet name detection with proper typing
  const getWalletName = (connector: typeof connectors[0]) => {
    if (connector.id === 'farcasterFrame' || connector.name === 'Farcaster') {
      return 'Farcaster';
    }
    // Special handling for injected wallets
    if (connector.id === 'injected') {
      if (typeof window !== 'undefined' && window.ethereum) {
        // ✅ Cast to our interface instead of using any
        const provider = window.ethereum as EthereumProvider;
	if (provider.isFarcaster) return 'Farcaster';
        if (provider.isRabby) return 'Rabby';
        if (provider.isMetaMask) return 'MetaMask';
        if (provider.isBraveWallet) return 'Brave';
        if (provider.isRainbow) return 'Rainbow';
	if (provider.isZerion) return 'Zerion';
      }
      return 'Browser Wallet';
    }
    return connector.name;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-cyber text-sm"
        >
          {formatAddress(address)}
          {connector && ` (${getWalletName(connector)})`}
        </button>
        
        {showDropdown && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Disconnect
            </button>
            {chainId !== base.id && switchChain && (
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-yellow-600"
              >
                Switch to Base
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="btn-cyber text-sm"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg p-2 text-xs max-w-xs">
          {error.message}
        </div>
      )}
      
      {showDropdown && !isPending && (
        <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector, chainId: base.id });
                setShowDropdown(false);
              }}
              disabled={!connector.ready}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{getWalletName(connector)}</span>
              {connector.ready === false && (
                <span className="text-xs text-gray-500">Not installed</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
