// Location: /lib/constants.ts

// ⏺️ EVM addresses and token metadata
export const CONTRACT_ADDRESS = "0xC80577C2C0e860fC2935c809609Fa46456cECC51";
export const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org";

// ERC20 tokens (add decimals if different than 18)
export const TOKENS = {
  ETH: { symbol: "ETH", decimals: 18 },
  MYU: { address: "0x24c91E5E9eb13E72Db41EBC5816Af7f259647B07", symbol: "MYU", decimals: 18 },
  DEGEN: { address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", symbol: "DEGEN", decimals: 18 },
};

// ⏺️ NFT ABI and ERC20 ABI abbreviated
export const NFT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
    "name": "mintWithEth",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
    "name": "mintWithMyu",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
    "name": "mintWithDegen",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Error for better decoding
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "uint256", "name": "allowance", "type": "uint256" },
      { "internalType": "uint256", "name": "needed", "type": "uint256" }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  }
];

export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
];
