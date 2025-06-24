// Location: /lib/redis.ts

import { Redis } from "@upstash/redis";

// ✅ Create Redis client with proper error handling
export const redis = process.env.REDIS_URL && process.env.REDIS_TOKEN
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    })
  : null;

// ✅ Notification functions
export async function storeNotification(userId: string, data: {
  type: string;
  data: unknown;
  timestamp: number;
}) {
  if (!redis) {
    console.warn("Redis not configured - notification not stored");
    return;
  }
  
  const key = `notification:${userId}`;
  await redis.set(key, JSON.stringify(data), { ex: 86400 }); // 24 hour expiry
}

export async function getNotification(userId: string) {
  if (!redis) return null;
  
  const key = `notification:${userId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data as string) : null;
}

// ✅ Store user FID to address mapping
export async function mapFidToAddress(fid: number, address: string) {
  if (!redis) return;
  
  await redis.set(`fid:${fid}:address`, address, { ex: 2592000 }); // 30 days
  await redis.set(`address:${address}:fid`, fid, { ex: 2592000 });
}

export async function getFidByAddress(address: string): Promise<number | null> {
  if (!redis) return null;
  
  const fid = await redis.get(`address:${address}:fid`);
  return fid ? Number(fid) : null;
}

export async function getAddressByFid(fid: number): Promise<string | null> {
  if (!redis) return null;
  
  const address = await redis.get(`fid:${fid}:address`);
  return address as string | null;
}

// ✅ Store mint transaction with proper typing
export async function storeMintTransaction(txHash: string, data: {
  address: string;
  tokenId: string | number;
  method: string;
  timestamp: number;
  fid?: number;
}) {
  if (!redis) {
    console.warn("Redis not configured - transaction not stored");
    return;
  }
  
  const key = `tx:${txHash}`;
  await redis.set(key, JSON.stringify(data), { ex: 604800 }); // 7 day expiry
  
  // Also store in a list for the user
  if (data.address) {
    await redis.lpush(`user:${data.address}:txs`, txHash);
    await redis.ltrim(`user:${data.address}:txs`, 0, 99); // Keep last 100
  }
}

export async function getMintTransaction(txHash: string) {
  if (!redis) return null;
  
  const key = `tx:${txHash}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data as string) : null;
}

// ✅ Track user mints with FID support
export async function incrementUserMints(address: string, fid?: number) {
  if (!redis) return;
  
  const key = `mints:${address}`;
  await redis.incr(key);
  
  // Also track by FID if provided
  if (fid) {
    await redis.incr(`mints:fid:${fid}`);
  }
}

export async function getUserMintCount(addressOrFid: string | number) {
  if (!redis) return 0;
  
  const key = typeof addressOrFid === 'string' 
    ? `mints:${addressOrFid}`
    : `mints:fid:${addressOrFid}`;
    
  const count = await redis.get(key);
  return count ? parseInt(count as string) : 0;
}

// ✅ Get user's recent transactions
export async function getUserTransactions(address: string, limit = 10) {
  if (!redis) return [];
  
  const txHashes = await redis.lrange(`user:${address}:txs`, 0, limit - 1);
  
  const transactions = await Promise.all(
    txHashes.map(hash => getMintTransaction(hash as string))
  );
  
  return transactions.filter(Boolean);
}
