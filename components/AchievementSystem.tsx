import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, NFT_ABI, TOKENS, ERC20_ABI } from "@/lib/constants";
import { formatUnits } from "viem";

interface Achievement {
  id: string;
  title: string;
  description: string;
  requirements: {
    nfts?: number;
    myu?: bigint;
    lpBalance?: bigint;
  };
  unlocked?: boolean;
  progress?: {
    nfts: number;
    myu: string;
    lpBalance?: string;
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "armillaria",
    title: "Armillaria ostoyae",
    description: "The Humongous Fungus",
    requirements: {
      nfts: 500,
      myu: BigInt("1000000000000"), // 1M MYU
    },
  },
  {
    id: "laccaria",
    title: "Laccaria amethystina",
    description: "The Amethyst Deceiver",
    requirements: {
      nfts: 5,
      myu: BigInt("100000000000000"), // 100M MYU
    },
  },
  {
    id: "clathrus",
    title: "Clathrus archeri",
    description: "Devil's Fingers",
    requirements: {
      nfts: 5,
      myu: BigInt("10000000000000"), // 10M MYU
      lpBalance: BigInt("20000000000000000"), // $20 in LP
    },
  },
  {
    id: "chorioactis",
    title: "Chorioactis geaster",
    description: "Devil's Cigar",
    requirements: {
      nfts: 100,
      myu: BigInt("100000000000000"), // 100M MYU
    },
  },
  {
    id: "hydnellum",
    title: "Hydnellum peckii",
    description: "Bleeding Tooth Fungus",
    requirements: {
      nfts: 50,
      myu: BigInt("50000000000000"), // 50M MYU
    },
  },
  {
    id: "entoloma",
    title: "Entoloma hochstetteri",
    description: "Sky Blue Mushroom",
    requirements: {
      nfts: 20,
      myu: BigInt("20000000000000"), // 20M MYU
    },
  },
  {
    id: "phallus",
    title: "Phallus indusiatus",
    description: "Veiled Lady",
    requirements: {
      nfts: 10,
      myu: BigInt("10000000000000"), // 10M MYU
    },
  },
  {
    id: "amanita",
    title: "Amanita muscaria",
    description: "Fly Agaric",
    requirements: {
      nfts: 5,
      myu: BigInt("5000000000000"), // 5M MYU
    },
  },
  {
    id: "agaricus",
    title: "Agaricus bisporus",
    description: "Common Mushroom",
    requirements: {
      nfts: 2,
      myu: BigInt("1000000000000"), // 1M MYU
    },
  },
];

export function AchievementSystem() {
  const { address } = useAccount();
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);

  const { data: nftBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: myuBalance } = useReadContract({
    address: TOKENS.MYU.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (!address || !nftBalance || !myuBalance) return;

    const updatedAchievements = ACHIEVEMENTS.map((achievement) => {
      const nfts = Number(nftBalance);
      const myu = myuBalance as bigint;

      const unlocked =
        nfts >= (achievement.requirements.nfts || 0) &&
        myu >= (achievement.requirements.myu || 0n);

      return {
        ...achievement,
        unlocked,
        progress: {
          nfts,
          myu: formatUnits(myu, TOKENS.MYU.decimals),
        },
      };
    });

    setAchievements(updatedAchievements);
  }, [address, nftBalance, myuBalance]);

  return (
    <div className="achievement-system">
      <h2 className="text-2xl font-bold mb-4">Fungal Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <div className="mb-2">
              <h3 className="font-bold text-lg">{achievement.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.description}
              </p>
            </div>

            <div className="mt-3 space-y-1">
              {achievement.requirements.nfts && (
                <div className="text-sm">
                  <span className="font-medium">NFTs:</span>{" "}
                  <span className={achievement.unlocked ? "text-green-600" : ""}>
                    {achievement.progress?.nfts || 0} / {achievement.requirements.nfts}
                  </span>
                </div>
              )}
              {achievement.requirements.myu && (
                <div className="text-sm">
                  <span className="font-medium">$MYU:</span>{" "}
                  <span className={achievement.unlocked ? "text-green-600" : ""}>
                    {Number(achievement.progress?.myu || 0).toLocaleString()} /{" "}
                    {Number(
                      formatUnits(achievement.requirements.myu, TOKENS.MYU.decimals)
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {achievement.unlocked && (
              <div className="mt-3 text-green-600 font-bold text-sm">
                ✓ UNLOCKED
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
