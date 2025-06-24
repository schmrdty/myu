// Location: /app/page.tsx

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";

import { Button, Icon, Main, Docs as Crocs } from "@/components/DemoComponents";
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="accent-action"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[var(--primary-accent)]">
          <Icon name="check" size="sm" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="container">
      <header className="flex justify-between items-center mb-6">
        <Wallet>
          <ConnectWallet>
            <Name className="cyberpunk" />
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

      <nav className="tabs">
        <div
          className={`tab ${activeTab === "Main" ? "active" : ""}`}
          onClick={() => setActiveTab("Main")}
        >
          Main
        </div>
        <div
	  className={`tab ${activeTab === "docs" ? "active" : ""}`}
	  onClick={() => setActiveTab("docs")}
	>
	  Docs & Socials
	</div>
	<div
          className={`tab ${activeTab === "crocs" ? "active" : ""}`}
          onClick={() => setActiveTab("crocs")}
        >
          Checklist
        </div>
        <div
          className={`tab ${activeTab === "mint" ? "active" : ""}`}
          onClick={() => setActiveTab("mint")}
        >
          <strong>Mint</strong>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === "Main" && <Main setActiveTab={setActiveTab} />}
        {activeTab === "docs" && <Docs setActiveTab={setActiveTab} />}
	{activeTab === "crocs" && <Crocs setActiveTab={setActiveTab} />}
        {activeTab === "mint" && (
          <div className="flex flex-col items-center gap-6">
            <h1 className="cyberpunk text-3xl">Myutruvian NFT</h1>
            <MintWidget />
            {address && (
              <p className="text-sm text-gray-400">
                Connected: {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            )}
            <FrameButton />
          </div>
        )}
      </main>

      <footer className="mt-10 text-center text-xs text-[var(--text-color)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openUrl("https://base.org/builders/minikit")}
        >
          Built on Base with MiniKit
        </Button>
      </footer>
    </div>
  );
}
