'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import LeaderboardWidget from '@/components/LeaderboardWidget';

export default function LeaderboardPage() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<{ totalTraders: number; topPnl: number; userRank: number | null }>({
    totalTraders: 0,
    topPnl: 0,
    userRank: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      const walletParam = publicKey ? `?wallet=${publicKey.toBase58()}` : '';
      const res = await fetch(`/api/leaderboard${walletParam}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalTraders: data.totalTraders,
          topPnl: data.leaderboard[0]?.pnl ?? 0,
          userRank: data.userRank?.rank ?? null,
        });
      }
    } catch {
      // ignore
    }
  }, [publicKey]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sol-purple/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sol-green/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-sol-green to-sol-purple bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Top traders ranked by profit & loss</p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-4 mb-8"
        >
          <div className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-5 py-3">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Total Traders</div>
            <div className="text-xl font-bold text-white mt-0.5">{stats.totalTraders}</div>
          </div>
          <div className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-5 py-3">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Top P&L</div>
            <div className="text-xl font-bold text-sol-green mt-0.5">
              {stats.topPnl >= 0 ? '+' : ''}${stats.topPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          {stats.userRank !== null && (
            <div className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl px-5 py-3">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Your Rank</div>
              <div className="text-xl font-bold text-white mt-0.5">#{stats.userRank}</div>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LeaderboardWidget limit={50} compact={false} showUserRank={true} />
        </motion.div>
      </div>
    </main>
  );
}
