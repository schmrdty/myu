// Location: /app/api/frame/og/success/route.tsx

import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#22c55e",
          color: "#fff",
          padding: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>Success! 🍄</h1>
        <div style={{ fontSize: 36 }}>Your Myutruvian NFT has been minted!</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
