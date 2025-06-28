// Type definitions for mint-related data
export interface MintInfo {
  userMints: number;      // Can stay as number since it's max 500
  remainingMints: number; // Can stay as number for display
  currentTierNum: number; // Tier number 0-8
  ethPrice: bigint;       // Must be bigint for Wei values
  myuPrice: bigint;       // Must be bigint for token amounts
  degenPrice: bigint;     // Must be bigint for token amounts
  totalMinted: number;    // Can be number for display
  maxSupply: number;      // Can be number (20,000)
}
