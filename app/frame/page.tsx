// Location: /app/frame/page.tsx

"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { MiniAppWagmiProvider } from "@/components/MiniAppWagmiProvider";
import { MintFrameButton } from "@/components/MintFrameButton";
import { Frame } from "@/components/Frame";

// This is the Frame endpoint you want to deep link/QR for mobile usage
const FRAME_URL = "https://myu.schmidtiest.xyz/api/frame";

export default function FrameLandingPage() {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [fid, setFid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Preconnect for Quick Auth performance (web)
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://auth.farcaster.xyz";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Detect Farcaster Mini App and try Quick Auth if not in-app
  useEffect(() => {
    (async () => {
      const mini = await sdk.isInMiniApp();
      setIsMiniApp(mini);
      setLoading(false);

      if (!mini) {
        try {
          // Try to get a Quick Auth token and FID
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
      <Frame>
        <div className="flex flex-col items-center py-12">
          <div className="cyberpunk text-xl mb-4">Loading Farcaster...</div>
        </div>
      </Frame>
    );
  }

  // Mini App (Warpcast/Frame) UI
  if (isMiniApp) {
    return (
      <MiniAppWagmiProvider>
        <Frame>
          <h1 className="cyberpunk text-3xl mb-6">Mint via Farcaster Frame</h1>
          <p className="mb-4 text-lg text-muted">
            You are in the Farcaster app. Mint below!
          </p>
          {/* You can now use wagmi hooks and render your mint UI here */}
          <MintFrameButton />
        </Frame>
      </MiniAppWagmiProvider>
    );
  }

  // Web UI (desktop/mobile browser)
  return (
    <Frame>
      <h1 className="cyberpunk text-3xl mb-6">Mint via Farcaster Frame</h1>
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
      {/* Optional: Deep link or info for the Frame endpoint */}
      <MintFrameButton />
    </Frame>
  );
}
