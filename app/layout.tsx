// Location: /app/layout.tsx

import "@/lib/theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import ClientRoot from "./ClientRoot";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_HOST ||
    "http://localhost:6969";
  return {
    title: "Myutruvian - Web3 NFT Platform",
    description: "Mint your Myutruvian NFT on Base - A decentralized creative ecosystem",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/og-image.png`,
        button: {
          title: "Launch Myutruvian",
          action: {
            type: "launch_frame",
            name: "Myutruvian",
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE || `${URL}/splash.png`,
            splashBackgroundColor: "#121212",
          },
        },
      }),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--bg-color)]">
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
