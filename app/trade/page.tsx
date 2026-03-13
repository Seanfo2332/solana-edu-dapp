'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TradeProvider } from '@/contexts/TradeContext';
import PriceChart from '@/components/trade/PriceChart';
import TradingPanel from '@/components/trade/TradingPanel';
import MarketPairs from '@/components/trade/MarketPairs';
import PortfolioPanel from '@/components/trade/PortfolioPanel';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { motion } from 'framer-motion';

export default function TradePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6 pt-28">
        <div className="fixed inset-0 pointer-events-none">
          <div className="dot-grid absolute inset-0" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center space-y-6 max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-green">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16l4-8 4 4 5-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Connect to Trade</h1>
          <p className="text-gray-500">
            Connect your Phantom wallet on Devnet to access the trading
            simulator with $10,000 in simulated USDC.
          </p>
          <WalletMultiButton className="!bg-sol-green/10 hover:!bg-sol-green/15 !text-sol-green !border !border-sol-green/20 !rounded-xl !h-12 !text-sm !mx-auto !font-semibold" />
        </motion.div>
      </main>
    );
  }

  return (
    <TradeProvider>
      <TradeContent />
    </TradeProvider>
  );
}

function TradeContent() {
  const [selectedToken, setSelectedToken] = useState('SOL');

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
      </div>
      <div className="relative max-w-[1400px] mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Trading Simulator</h1>
            <span className="text-[10px] text-sol-green bg-sol-green/10 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-sol-green/20">
              Simulated
            </span>
          </div>
          <a
            href="/trade/history"
            className="text-xs text-gray-500 hover:text-sol-green transition-colors"
          >
            View History &rarr;
          </a>
        </motion.div>

        {/* Exchange Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-2">
            <MarketPairs
              selected={selectedToken}
              onSelect={setSelectedToken}
            />
          </div>
          <div className="lg:col-span-7">
            <div className="gradient-border-purple">
              <PriceChart symbol={selectedToken} />
            </div>
          </div>
          <div className="lg:col-span-3">
            <TradingPanel symbol={selectedToken} />
          </div>
        </div>

        {/* Portfolio + Leaderboard */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioPanel />
          <CollapsibleLeaderboard />
        </div>
      </div>
    </main>
  );
}

function CollapsibleLeaderboard() {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {open ? 'Hide' : 'Show'} Leaderboard
      </button>
      {open && <LeaderboardWidget limit={10} compact={true} showUserRank={true} />}
    </div>
  );
}
