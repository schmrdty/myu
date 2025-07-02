// Location: /hooks/useSplitInfo.ts

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { toast } from "react-hot-toast";

interface SplitInfo {
  sendAddr: string;
  ethVault: string;
  myuVault: string;
  degenVault: string;
  sendPct: number;
  vaultPct: number;
  currentTier: number | null;
  method: 'currentSplit' | 'tier' | 'fallback';
  isMaxTier: boolean;
  nextTierSplit: [number, number] | null;
}

// Cache outside component to persist between renders
let splitInfoCache: SplitInfo | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useSplitInfo() {
  const [data, setData] = useState<SplitInfo | null>(splitInfoCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isOnBase = chainId === base.id;

  useEffect(() => {
    // Skip during SSR/build
    if (typeof window === 'undefined') return;
    
    // Only fetch if connected and on Base
    if (!isConnected || !isOnBase) return;

    const fetchSplitInfo = async () => {
      // Check cache first
      const now = Date.now();
      if (splitInfoCache && now - lastFetchTime < CACHE_DURATION) {
        setData(splitInfoCache);
        return;
      }

      // Prevent multiple simultaneous fetches
      if (loading) return;

      console.log('🔍 DEBUG: useSplitInfo hook called');
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/split-info");
        if (!response.ok) throw new Error("Failed to fetch split info");
        
        const result = await response.json();
        splitInfoCache = result;
        lastFetchTime = now;
        setData(result);
        
        // Log how we got the data
        if (result.method === 'tier') {
          console.log(`📊 Split info calculated from tier ${result.currentTier}`);
        } else if (result.method === 'fallback') {
          console.log('⚠️ Using fallback split values');
        }
      } catch (err) {
        const error = err as Error;
        setError(error);
        toast.error("Failed to load payment split info");
      } finally {
        setLoading(false);
      }
    };

    fetchSplitInfo();
  }, [isConnected, isOnBase, address, loading]);

  // Manual refresh function for after mints
  const refreshSplitInfo = async () => {
    splitInfoCache = null; // Clear cache
    lastFetchTime = 0;
    
    if (!isConnected || !isOnBase) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/split-info");
      if (!response.ok) throw new Error("Failed to fetch split info");
      
      const result = await response.json();
      splitInfoCache = result;
      lastFetchTime = Date.now();
      setData(result);
      
      toast.success(`Split info updated! (Tier ${result.currentTier})`);
    } catch (err) {
      toast.error("Failed to refresh split info");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refreshSplitInfo };
}
