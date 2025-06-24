// Location: /lib/contract.ts
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Public client for view calls
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});
