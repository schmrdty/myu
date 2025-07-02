// Location: /app/api/split-info/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  // Return your payment split configuration
  // This should match what your smart contract uses
  return NextResponse.json({
    sendAddr: "0x7385e1a824a405cbb13b64829bf1509cd2a471f7",
    ethVault: "0x44459112088Ff8BbB6967bfCA7A8CD31980F3cF4",
    myuVault: "0x2d26B3Da95331e169ea9F31cA8CED9fa761deb26",
    degenVault: "0x2d26B3Da95331e169ea9F31cA8CED9fa761deb26",
    sendPct: 50,
    vaultPct: 50,
  });
}
