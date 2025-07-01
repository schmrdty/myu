// Location: /app/layout.tsx

import "@/lib/theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import ClientRoot from "./ClientRoot";
import { FrameProvider } from "@/hooks/useFrameContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const appUrl =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_HOST ||
    "http://localhost:6969";
    
  return {
    title: "Myutruvian - Web3 NFT Platform",
    description: "Mint your Myutruvian NFT on Base - A decentralized creative ecosystem",
    metadataBase: new URL(appUrl),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
      title: "Myutruvian - Web3 NFT Platform",
      description: "Mint your Myutruvian NFT on Base",
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Myutruvian - Web3 NFT Platform",
      description: "Mint your Myutruvian NFT on Base",
      images: ['/og-image.png'],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--cyber-bg)]">
        <FrameProvider>
          <ClientRoot>{children}</ClientRoot>
        </FrameProvider>
      </body>
    </html>
  );
}
