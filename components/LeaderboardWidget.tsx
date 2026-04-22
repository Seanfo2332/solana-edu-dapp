'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  pnl: number;
  pnlPercent: number;
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

// ─── Rank styling helpers ───
function getRankColor(rank: number): string {
  if (rank === 1) return '#FFD700';
  if (rank === 2) return '#C0C0C0';
  if (rank === 3) return '#CD7F32';
  return '#333';
}

function getAvatarGradient(rank: number): string {
  if (rank === 1) return 'linear-gradient(135deg, #14F195, #9945FF)';
  if (rank === 2) return 'linear-gradient(135deg, #C0C0C0, #808080)';
  if (rank === 3) return 'linear-gradient(135deg, #CD7F32, #8B4513)';
  return 'linear-gradient(135deg, #4a5568, #2d3748)';
}

function getRowBorder(rank: number, isUser: boolean): string {
  if (isUser) return 'border-[rgba(20,241,149,0.2)] bg-[linear-gradient(135deg,rgba(20,241,149,0.06),rgba(20,241,149,0.01))] shadow-[0_0_20px_rgba(20,241,149,0.05)]';
  if (rank === 1) return 'border-[rgba(255,215,0,0.15)] bg-[linear-gradient(135deg,rgba(255,215,0,0.06),rgba(255,215,0,0.01))] shadow-[0_0_30px_rgba(255,215,0,0.04)]';
  if (rank === 2) return 'border-[rgba(192,192,192,0.1)] bg-[linear-gradient(135deg,rgba(192,192,192,0.04),rgba(192,192,192,0.01))]';
  if (rank === 3) return 'border-[rgba(205,127,50,0.1)] bg-[linear-gradient(135deg,rgba(205,127,50,0.04),rgba(205,127,50,0.01))]';
  return 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]';
}

function formatPnl(pnl: number): string {
  const prefix = pnl >= 0 ? '+' : '';
  return `${prefix}$${pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPnlCompact(pnl: number): string {
  const prefix = pnl >= 0 ? '+' : '';
  if (Math.abs(pnl) >= 1000) return `${prefix}$${(pnl / 1000).toFixed(1)}k`;
  return `${prefix}$${Math.round(pnl)}`;
}

function formatPercent(pct: number): string {
  const prefix = pct >= 0 ? '+' : '';
  return `${prefix}${pct.toFixed(2)}%`;
}

export default function LeaderboardWidget({ limit, compact, showUserRank }: LeaderboardWidgetProps) {
  const { publicKey } = useWallet();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchLeaderboard = useCallback(async (force = false) => {
    try {
      const params = new URLSearchParams();
      if (publicKey) params.set('wallet', publicKey.toBase58());
      if (force) params.set('refresh', 'true');
      const res = await fetch(`/api/leaderboard?${params.toString()}`);
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
    // Refresh immediately (bypassing cache) whenever a trade is executed
    const onTradeExecuted = () => fetchLeaderboard(true);
    window.addEventListener('trade-executed', onTradeExecuted);
    return () => {
      clearInterval(interval);
      window.removeEventListener('trade-executed', onTradeExecuted);
    };
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

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[rgba(255,255,255,0.06)] p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-sol-green/30 border-t-sol-green rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ─── Empty state ───
  if (!data || data.totalTraders === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] border border-[rgba(255,255,255,0.06)] p-6">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Top Traders</p>
        <p className="text-sm text-gray-600 text-center py-8">No trades yet. Be the first!</p>
      </div>
    );
  }

  const entries = data.leaderboard.slice(0, limit);
  const userOutsideList = showUserRank && data.userRank && data.userRank.rank > limit;

  // ─── Compact mode (homepage & trade page) ───
  if (compact) {
    return (
      <div className="rounded-2xl bg-[rgba(17,17,24,0.6)] border border-[rgba(255,255,255,0.06)] p-5 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">&#x1F3C6;</span>
            <span className="text-sm font-bold text-white">Top Traders</span>
            <span className="text-[10px] bg-sol-purple/15 text-sol-purple px-2 py-0.5 rounded-md font-semibold">
              {data.totalTraders}
            </span>
          </div>
          <span className="text-[10px] text-gray-600">
            {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[2.2rem_1fr_6rem_5rem_4rem] gap-2 px-3 pb-2 border-b border-[rgba(255,255,255,0.04)] mb-1">
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">#</span>
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">Wallet</span>
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider text-right">Profit</span>
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider text-right">P&L %</span>
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider text-right">Trades</span>
        </div>

        {/* User rank banner */}
        {userOutsideList && data.userRank && (
          <div className="flex items-center justify-between py-2 px-3 mb-1 rounded-lg bg-sol-green/[0.06] border border-sol-green/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sol-green">#{data.userRank.rank}</span>
              <span className="text-xs text-gray-400">Your Rank</span>
            </div>
            <span className={`text-xs font-semibold ${data.userRank.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
              {formatPnlCompact(data.userRank.pnl)}
            </span>
          </div>
        )}

        {/* Rows */}
        <div className="space-y-0.5">
          {entries.map((entry) => {
            const isUser = !!(userWalletTruncated && entry.wallet === userWalletTruncated);
            return (
              <div
                key={entry.wallet}
                className={`grid grid-cols-[2.2rem_1fr_6rem_5rem_4rem] gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isUser ? 'bg-sol-green/[0.06]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className="text-sm font-extrabold" style={{ color: getRankColor(entry.rank) }}>
                  {entry.rank}
                </span>
                <span className={`text-xs font-mono truncate ${isUser ? 'text-sol-green font-semibold' : 'text-gray-400'}`}>
                  {entry.wallet}
                </span>
                <span className={`text-xs font-bold text-right ${entry.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {formatPnlCompact(entry.pnl)}
                </span>
                <span className={`text-xs font-semibold text-right ${entry.pnlPercent >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {formatPercent(entry.pnlPercent)}
                </span>
                <span className="text-xs text-gray-500 text-right">{entry.tradeCount}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Full mode (leaderboard page) ───
  return (
    <div className="space-y-2">
      {/* User rank banner (if outside visible list) */}
      {userOutsideList && data.userRank && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-3 px-5 rounded-xl bg-[linear-gradient(135deg,rgba(20,241,149,0.06),rgba(20,241,149,0.01))] border border-[rgba(20,241,149,0.2)]"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-sol-green">#{data.userRank.rank}</span>
            <span className="text-sm text-gray-400">Your Rank</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className={`text-sm font-bold ${data.userRank.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                {formatPnl(data.userRank.pnl)}
              </div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">Profit</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${data.userRank.pnlPercent >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                {formatPercent(data.userRank.pnlPercent)}
              </div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider">P&L %</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard rows */}
      <AnimatePresence mode="popLayout">
        {entries.map((entry, i) => {
          const isUser = !!(userWalletTruncated && entry.wallet === userWalletTruncated);
          return (
            <motion.div
              key={entry.wallet}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-[3.5rem_1fr_9rem_7rem_5.5rem] items-center gap-3 px-5 py-4 rounded-xl border transition-all duration-300 hover:border-[rgba(255,255,255,0.08)] ${getRowBorder(entry.rank, isUser)}`}
            >
              {/* Rank */}
              <span
                className="text-2xl font-extrabold text-center"
                style={{
                  color: getRankColor(entry.rank),
                  textShadow: entry.rank === 1 ? '0 0 12px rgba(255,215,0,0.3)' : 'none',
                }}
              >
                {entry.rank}
              </span>

              {/* Wallet info */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: isUser ? 'linear-gradient(135deg, #14F195, #9945FF)' : getAvatarGradient(entry.rank),
                    color: '#0a0a0f',
                  }}
                >
                  {entry.wallet.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold font-mono ${isUser ? 'text-sol-green' : 'text-white'}`}>
                      {entry.wallet}
                    </span>
                    {isUser && (
                      <span className="text-[9px] bg-sol-green/15 text-sol-green px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {entry.tradeCount} trades
                  </div>
                </div>
              </div>

              {/* Profit */}
              <div className="text-right">
                <div className={`text-base font-bold ${entry.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {formatPnl(entry.pnl)}
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Profit</div>
              </div>

              {/* P&L % */}
              <div className="text-right">
                <div className={`text-base font-bold ${entry.pnlPercent >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {formatPercent(entry.pnlPercent)}
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">P&L %</div>
              </div>

              {/* Trades */}
              <div className="text-right">
                <div className="text-base font-bold text-white">{entry.tradeCount}</div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider">Trades</div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Footer */}
      <div className="text-center pt-2">
        <span className="text-[10px] text-gray-600">
          Updated {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`} &middot; {data.totalTraders} traders
        </span>
      </div>
    </div>
  );
}
