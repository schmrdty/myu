// Location: /lib/constants.ts

export const CONTRACT_ADDRESS = "0xC80577C2C0e860fC2935c809609Fa46456cECC51" as const;

export const CONTRACT_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getMintInfo",
    outputs: [
      { name: "userMints", type: "uint256" },
      { name: "remainingMints", type: "uint256" },
      { name: "currentTierNum", type: "uint256" },
      { name: "ethPrice", type: "uint256" },
      { name: "myuPrice", type: "uint256" },
      { name: "degenPrice", type: "uint256" },
      { name: "totalMinted", type: "uint256" },
      { name: "maxSupply", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "count", type: "uint256" }],
    name: "mintWithEth",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "count", type: "uint256" }],
    name: "mintWithMyu",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "count", type: "uint256" }],
    name: "mintWithDegen",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export const TOKENS = {
  ETH: "native",
  MYU: "0x24c91E5E9eb13E72Db41EBC5816Af7f259647B07",
  DEGEN: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"
} as const;

export const BASE_RPC_URL = "https://mainnet.base.org";
