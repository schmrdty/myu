// Location: /lib/wagmi.ts

import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { base } from "wagmi/chains";
// ✅ Change this import
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

let config: ReturnType<typeof createConfig> | undefined;

function isFrame() {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return false;
  }
}

export function getConfig() {
  if (config) return config;

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

  const appMetadata = {
    name: "Myutruvian",
    description: "Mint your Myutruvian NFT on Base - A decentralized creative ecosystem",
    url: process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz",
    icons: [`${process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz"}/icon.png`]
  };

  const connectors = isFrame()
    ? [
        // ✅ Change from farcasterFrame() to farcasterMiniApp()
        farcasterMiniApp(),
        injected({
          shimDisconnect: true,
        }),
        coinbaseWallet({
          appName: appMetadata.name,
          appLogoUrl: appMetadata.icons[0],
        })
      ]
    : [
        injected({
          shimDisconnect: true,
        }),
        coinbaseWallet({
          appName: appMetadata.name,
          appLogoUrl: appMetadata.icons[0],
        }),
        ...(projectId ? [walletConnect({
          projectId,
          showQrModal: true,
          metadata: appMetadata,
          qrModalOptions: {
            themeMode: 'dark',
          }
        })] : [])
      ];

  config = createConfig({
    chains: [base],
    connectors,
    transports: {
      [base.id]: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL ||
        process.env.NEXT_PUBLIC_RU2 ||
        "https://base.llamarpc.com",
        {
          batch: true,
          retryCount: 4,
          retryDelay: 1111,
        }
      ),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    syncConnectedChain: true,
  });

  return config;
}
