// Location: /components/ConnectWalletButton.tsx

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

interface EthereumProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isBraveWallet?: boolean;
  isRainbow?: boolean;
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

  useEffect(() => {
    if (isConnected && chainId !== base.id && switchChain) {
      switchChain({ chainId: base.id });
    }
  }, [isConnected, chainId, switchChain]);

  if (!mounted) return null;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletName = (connector: typeof connectors[0]) => {
    if (connector.id === 'injected') {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = window.ethereum as EthereumProvider;
        if (provider.isRabby) return 'Rabby';
        if (provider.isMetaMask) return 'MetaMask';
        if (provider.isBraveWallet) return 'Brave';
        if (provider.isRainbow) return 'Rainbow';
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
          <div className="absolute top-full mt-2 right-0 bg-cyber-bg border border-cyber-border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-cyber-text-main hover:bg-cyber-bg-light rounded"
            >
              Disconnect
            </button>
            {chainId !== base.id && switchChain && (
              <button
                onClick={() => switchChain({ chainId: base.id })}
                className="w-full text-left px-4 py-2 text-accent hover:bg-cyber-bg-light rounded"
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
        <div className="absolute top-full mt-2 right-0 bg-cyber-bg border border-cyber-border rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector, chainId: base.id });
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-cyber-text-main hover:bg-cyber-bg-light rounded flex items-center justify-between"
            >
              <span>{getWalletName(connector)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
