// Location: /app/api/frame/og/route.tsx

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // ✅ Get dynamic data from query params
  const searchParams = request.nextUrl.searchParams;
  const totalMinted = searchParams.get("totalMinted") || "0";
  const maxSupply = searchParams.get("maxSupply") || "500";
  const userMints = searchParams.get("userMints") || "0";
  const tier = searchParams.get("tier") || "0";
  const ethPrice = searchParams.get("ethPrice") || "0.00069";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, #0a0a0a, #1a1a1a)",
          color: "#fff",
          padding: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 72, fontWeight: 900, marginBottom: 20, background: "linear-gradient(to right, #60a5fa, #a78bfa)", backgroundClip: "text", color: "transparent" }}>
          Myutruvian NFT
        </h1>
        
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 40 }}>
          {totalMinted}/{maxSupply} Minted
        </div>

        <div style={{ display: "flex", gap: 60, fontSize: 28 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ opacity: 0.7 }}>Current Tier</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{tier}</div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ opacity: 0.7 }}>ETH Price</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{ethPrice} ETH</div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ opacity: 0.7 }}>Your Mints</div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{userMints}/501</div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 20, fontSize: 18, opacity: 0.6 }}>
          🍄 Powered by Base
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
