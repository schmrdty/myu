'use client';
import MintWidget from "@/components/MintWidget";

export default function MintPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-6">Mint Your Myutruvian</h1>
      <MintWidget />
    </section>
  );
}
