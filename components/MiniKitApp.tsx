// Location: /components/MiniKitApp.tsx

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useMiniKit, useAddFrame as useAddMiniApp, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { Icon, Main, Docs as Crocs } from "@/components/DemoComponents";
import { MinidAppButton } from "@/components/MinidAppButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import MintWidget from "@/components/MintWidget";
import { Docs } from "@/components/Docs";
import { useChainGuard } from "@/hooks/useChainGuard";
import { useMiniAppContext } from "@/hooks/useMiniAppContext";
import { AchievementSystem } from "@/components/AchievementSystem";
import { FungalLeaderboard } from "@/components/FungalLeaderboard";
import { LuckyMintTracker } from "@/components/LuckyMintTracker";
import { RarityRewardsInfo } from "@/components/RarityRewardsInfo";
import { NotificationManager } from "@/components/NotificationManager";

export function MiniKitApp() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const { address } = useAccount();
  const [miniAppAdded, setMiniAppAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("Main");

  const addMiniApp = useAddMiniApp();
  const openUrl = useOpenUrl();
  const { isMiniApp } = useMiniAppContext();
  const { error: chainError } = useChainGuard();

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [setFrameReady, isFrameReady]);

  const handleAddMiniApp = useCallback(async () => {
    const miniAppAdded = await addMiniApp();
    setMiniAppAdded(Boolean(miniAppAdded));
  }, [addMiniApp]);

  const saveMiniAppButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <button
          className="btn-cyber"
          onClick={handleAddMiniApp}
        >
          <Icon name="plus" size="sm" />
          Save miniApp
        </button>
      );
    }

    if (miniAppAdded) {
      return (
        <div className="flex items-center space-x-1 text-base font-medium text-cyber">
          <Icon name="check" size="sm" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, miniAppAdded, handleAddMiniApp]);

  return (
    <div className="container mx-auto px-2">
      <header className="flex justify-between items-center mb-10 mt-4">
        <div className="flex items-center gap-2">
          {/* Show notification status if in miniApp */}
          {isMiniApp && <NotificationManager />}
        </div>
        <div className="flex items-center gap-2">
          {saveMiniAppButton}
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
        <button
          className={`tab-btn${activeTab === "Spore Board+" ? " active" : ""}`}
          onClick={() => setActiveTab("Spore Board+")}
          role="tab"
          aria-selected={activeTab === "Spore Board+"}
          tabIndex={activeTab === "Spore Board+" ? 0 : -1}
        >
          Spore Board+
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
            <MinidAppButton />
            {chainError && (
              <div className="mt-4 text-red-600">{chainError}</div>
            )}
          </div>
        )}
        {activeTab === "Spore Board+" && (
          <div className="w-full max-w-6xl">
            <div className="space-y-8">
              <div className="card">
                <AchievementSystem />
              </div>
              <div className="card">
                <FungalLeaderboard />
              </div>
              <div className="card">
                <LuckyMintTracker />
              </div>
              <div className="card">
                <RarityRewardsInfo />
              </div>
            </div>
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
