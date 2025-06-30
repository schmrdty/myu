// Location: /components/FungalLeaderboard.tsx

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  score: number;
  achievements: string[];
}

export function FungalLeaderboard() {
  const { address } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch leaderboard data
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    // Find user's rank when address or leaderboard changes
    if (address && leaderboard.length > 0) {
      const userEntry = leaderboard.find(
        entry => entry.address.toLowerCase() === address.toLowerCase()
      );
      setUserRank(userEntry ? userEntry.rank : null);
    } else {
      setUserRank(null);
    }
  }, [address, leaderboard]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fungal-leaderboard">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        🍄 Fungal Network Leaderboard
      </h2>

      {userRank && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-600 dark:border-green-500 rounded-lg">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            Your Rank: <strong>#{userRank}</strong>
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.address}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                entry.address.toLowerCase() === address?.toLowerCase()
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  #{entry.rank}
                </span>
                <div>
                  <p className="font-mono text-sm text-blue-700 dark:text-blue-400">
                    {entry.displayName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {entry.achievements.join(' • ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {entry.score.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          No leaderboard data available yet.
        </div>
      )}
    </div>
  );
}
