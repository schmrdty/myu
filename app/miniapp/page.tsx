// Location: /app/miniapp/page.tsx

"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { MiniAppWagmiProvider } from "@/components/MiniAppWagmiProvider";
import { MintMiniAppButton } from "@/components/MintMiniAppButton";
import { MiniApp } from "@/components/MiniApp";
import { FungalLeaderboard } from "@/components/FungalLeaderboard";

const FRAME_URL = process.env.NEXT_PUBLIC_FRAME_URL || "/api/minidapp";

export default function MiniAppLandingPage() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [fid, setFid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://auth.farcaster.xyz";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const mini = await sdk.isInMiniApp();
      setIsMiniApp(mini);
      setLoading(false);

      if (!mini) {
        try {
          const { token } = await sdk.quickAuth.getToken();
          if (token) {
            const res = await fetch("/api/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const user = await res.json();
              setFid(user.fid || null);
            }
          }
        } catch {
          setFid(null);
        }
      }
    })();
  }, []);

  if (loading) {
    return (
      <MiniApp>
        <div className="flex flex-col items-center py-12">
          <div className="cyberpunk text-xl mb-4">Loading Farcaster...</div>
        </div>
      </MiniApp>
    );
  }

  // Mini App (Farcaster/MiniApp) UI
  if (isMiniApp) {
    return (
      <MiniAppWagmiProvider>
        <MiniApp>
          <h1 className="cyberpunk text-3xl mb-6">Mint via Farcaster Frame</h1>
          <p className="mb-4 text-lg text-muted">
            You are in the Mini-App. Mint below!
          </p>
          <MintMiniAppButton />
          
          {/* Add toggle for leaderboard */}
          <button
            className="btn-cyber mt-4"
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? "Hide" : "Show"} Leaderboard
          </button>
          
          {showLeaderboard && (
            <div className="mt-6 card">
              <FungalLeaderboard />
            </div>
          )}
        </MiniApp>
      </MiniAppWagmiProvider>
    );
  }

  // Web UI (desktop/mobile browser)
  return (
    <MiniApp>
      <h1 className="cyberpunk text-3xl mb-6">Mint via Farcaster MiniApp</h1>
      <p className="mb-3 text-lg text-muted">
        Sign in with Farcaster to mint!
      </p>
      <div className="mb-6 flex flex-col items-center gap-4">
        {fid ? (
          <div className="text-cyber text-lg mb-2">
            ✅ Signed in! Your Farcaster FID: {fid}
          </div>
        ) : (
          <button
            className="btn-cyber mb-2"
            onClick={async () => {
              try {
                const { token } = await sdk.quickAuth.getToken();
                if (token) {
                  const res = await fetch("/api/me", {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const user = await res.json();
                    setFid(user.fid || null);
                  }
                }
              } catch {
                alert("Failed to sign in with Farcaster.");
              }
            }}
          >
            Sign in with Farcaster
          </button>
        )}
      </div>
      <a
        href={FRAME_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cyber"
      >
        Mint in Farcaster
      </a>
      <MintMiniAppButton />
      
      {/* Add toggle for leaderboard */}
      <button
        className="btn-cyber mt-4"
        onClick={() => setShowLeaderboard(!showLeaderboard)}
      >
        {showLeaderboard ? "Hide" : "Show"} Leaderboard
      </button>
      
      {showLeaderboard && (
        <div className="mt-6 card">
          <FungalLeaderboard />
        </div>
      )}
    </MiniApp>
  );
}
