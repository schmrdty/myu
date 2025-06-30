'use client';
import { Providers } from "../providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import MintWidget from "@/components/MintWidget";
import { LuckyMintTracker } from "@/components/LuckyMintTracker";
import { AchievementSystem } from "@/components/AchievementSystem";

export default function MintPage() {
  return (
    <Providers>
      <ThemeProvider>
        <section className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="cyberpunk text-4xl mb-6">Mint Your Myutruvian</h1>
          <div className="card w-full max-w-xl mb-8">
            <MintWidget />
          </div>
          
          {/* Add gamification elements below the mint widget */}
          <div className="w-full max-w-4xl space-y-6">
            <div className="card">
              <LuckyMintTracker />
            </div>
            <div className="card">
              <AchievementSystem />
            </div>
          </div>
        </section>
      </ThemeProvider>
    </Providers>
  );
}
