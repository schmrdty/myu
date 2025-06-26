// Location: /app/page.tsx

"use client";
export const dynamic = "force-dynamic";

// ...other imports...
import { useEffect, useMemo, useState, useCallback } from "react";
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { Icon, Main, Docs as Crocs } from "@/components/DemoComponents";
import { FrameButton } from "@/components/FrameButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import MintWidget from "@/components/MintWidget";
import { Docs } from "@/components/Docs";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { address } = useAccount();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("Main");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          className="btn-cyber"
          onClick={handleAddFrame}
        >
          <Icon name="plus" size="sm" />
          Save Frame
        </button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-base font-medium text-cyber">
          <Icon name="check" size="sm" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
        <div className="container mx-auto px-2">
          <header className="flex justify-between items-center mb-10 mt-4">
            <Wallet>
              <ConnectWallet>
                <Name className="cyberpunk text-xl" />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
            <div className="flex items-center gap-2">
              {saveFrameButton}
              <ThemeToggle />
            </div>
          </header>

          <nav className="tabs" role="tablist" aria-label="Site Navigation">
            <button
              className={`tab-btn${activeTab === "Main" ? " active" : ""}`}
              onClick={() => setActiveTab("Main")}
              role="tab"
              aria-selected={activeTab === "Main"}
              tabIndex={activeTab === "Main" ? 0 : -1}
            >
              Main
            </button>
            <button
              className={`tab-btn${activeTab === "docs" ? " active" : ""}`}
              onClick={() => setActiveTab("docs")}
              role="tab"
              aria-selected={activeTab === "docs"}
              tabIndex={activeTab === "docs" ? 0 : -1}
            >
              Docs & Socials
            </button>
            <button
              className={`tab-btn${activeTab === "crocs" ? " active" : ""}`}
              onClick={() => setActiveTab("crocs")}
              role="tab"
              aria-selected={activeTab === "crocs"}
              tabIndex={activeTab === "crocs" ? 0 : -1}
            >
              Checklist
            </button>
            <button
              className={`tab-btn${activeTab === "mint" ? " active" : ""}`}
              onClick={() => setActiveTab("mint")}
              role="tab"
              aria-selected={activeTab === "mint"}
              tabIndex={activeTab === "mint" ? 0 : -1}
            >
              <strong>Mint</strong>
            </button>
          </nav>

          <main className="flex flex-col items-center justify-center min-h-[60vh]">
            {activeTab === "Main" && (
              <div className="card w-full max-w-2xl">
                <Main setActiveTab={setActiveTab} />
              </div>
            )}
            {activeTab === "docs" && (
              <div className="card w-full max-w-lg">
                <Docs setActiveTab={setActiveTab} />
              </div>
            )}
            {activeTab === "crocs" && (
              <div className="card w-full max-w-2xl">
                <Crocs setActiveTab={setActiveTab} />
              </div>
            )}
            {activeTab === "mint" && (
              <div className="card flex flex-col items-center w-full max-w-xl gap-6">
                <h1 className="cyberpunk text-3xl mb-2">Myutruvian NFT</h1>
                <MintWidget />
                {address && (
                  <p className="text-sm text-cyber">
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
                <FrameButton />
              </div>
            )}
          </main>

          <footer className="mt-10 text-center text-xs text-cyber">
            <button
              className="btn-cyber"
              onClick={() => openUrl("https://base.org/builders/minikit")}
            >
              Built on Base with MiniKit
            </button>
          </footer>
        </div>
  );
}
