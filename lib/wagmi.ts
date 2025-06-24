// Location: /lib/wagmi.ts

import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

// Create config once and reuse
let config: ReturnType<typeof createConfig> | undefined;

export function getConfig() {
  if (config) return config;
  
  // Get project ID
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  
  // Build connectors array with proper typing
  const connectors = [];
  
  // Add injected connector
  connectors.push(injected());
  
  // Add Coinbase Wallet
  connectors.push(
    coinbaseWallet({
      appName: "Myutruvian",
      preference: "smartWalletOnly",
    })
  );
  
  // Add WalletConnect only if we have a valid project ID
  if (projectId && projectId !== "your-reown-project-id") {
    connectors.push(
      walletConnect({
        projectId,
        showQrModal: true,
      })
    );
  }
  
  config = createConfig({
    chains: [base, mainnet],
    connectors,
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
      [mainnet.id]: http(),
    },
    ssr: true,
  });
  
  return config;
}
