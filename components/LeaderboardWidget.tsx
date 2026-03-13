'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  pnl: number;
  portfolioValue: number;
  tradeCount: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  updatedAt: string;
  totalTraders: number;
}

interface LeaderboardWidgetProps {
  limit: number;
  compact: boolean;
  showUserRank: boolean;
}

export default function LeaderboardWidget({ limit, compact, showUserRank }: LeaderboardWidgetProps) {
  const { publicKey } = useWallet();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const walletParam = publicKey ? `?wallet=${publicKey.toBase58()}` : '';
      const res = await fetch(`/api/leaderboard${walletParam}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setSecondsAgo(0);
      }
    } catch {
      // Silently fail — keep showing last data
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  useEffect(() => {
    const ticker = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(ticker);
  }, []);

  const walletBase58 = publicKey?.toBase58() ?? '';

  function truncateWallet(w: string): string {
    if (w.length <= 8) return w;
    return `${w.slice(0, 4)}...${w.slice(-4)}`;
  }

  const userWalletTruncated = walletBase58 ? truncateWallet(walletBase58) : '';

  if (loading) {
    return (
      <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)]`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-sol-green/30 border-t-sol-green rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.totalTraders === 0) {
    return (
      <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)]`}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Top Traders</p>
        <p className="text-sm text-gray-600 text-center py-4">No trades yet. Be the first!</p>
      </div>
    );
  }

  const entries = data.leaderboard.slice(0, limit);
  const userOutsideList = showUserRank && data.userRank && data.userRank.rank > limit;

  return (
    <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)] space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className={`text-gray-500 font-semibold uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-xs'}`}>
            Top Traders
          </p>
          <span className="text-[10px] text-sol-purple bg-sol-purple/10 px-2 py-0.5 rounded-full font-medium">
            {data.totalTraders}
          </span>
        </div>
        <span className="text-[10px] text-gray-600">
          {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
        </span>
      </div>

      {/* User rank banner (if outside visible list) */}
      {userOutsideList && data.userRank && (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-sol-green/[0.06] border border-sol-green/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sol-green">#{data.userRank.rank}</span>
            <span className="text-xs text-gray-400">Your Rank</span>
          </div>
          <span className={`text-xs font-semibold ${data.userRank.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
            {data.userRank.pnl >= 0 ? '+' : ''}${data.userRank.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-0.5">
        {/* Header row */}
        <div className={`grid ${compact ? 'grid-cols-[2rem_1fr_5rem]' : 'grid-cols-[2.5rem_1fr_6rem_4rem]'} gap-2 px-2 py-1`}>
          <span className="text-[10px] text-gray-600 font-medium">#</span>
          <span className="text-[10px] text-gray-600 font-medium">Wallet</span>
          <span className="text-[10px] text-gray-600 font-medium text-right">P&L</span>
          {!compact && <span className="text-[10px] text-gray-600 font-medium text-right">Trades</span>}
        </div>

        {/* Entries */}
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const isUser = userWalletTruncated && entry.wallet === userWalletTruncated;
            return (
              <motion.div
                key={entry.wallet}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`grid ${compact ? 'grid-cols-[2rem_1fr_5rem]' : 'grid-cols-[2.5rem_1fr_6rem_4rem]'} gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  isUser
                    ? 'bg-sol-green/[0.08] border border-sol-green/10'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-xs font-bold ${entry.rank <= 3 ? 'text-sol-green' : 'text-gray-500'}`}>
                  {entry.rank <= 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][entry.rank - 1] : entry.rank}
                </span>
                <span className={`text-xs font-mono ${isUser ? 'text-sol-green font-semibold' : 'text-gray-400'}`}>
                  {entry.wallet} {isUser && '(you)'}
                </span>
                <span className={`text-xs font-semibold text-right ${entry.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                {!compact && (
                  <span className="text-xs text-gray-500 text-right">{entry.tradeCount}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
