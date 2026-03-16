'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TradeProvider, useTradeContext } from '@/contexts/TradeContext';
import TransactionHistory from '@/components/trade/TransactionHistory';
import { motion } from 'framer-motion';
import Link from 'next/link';

function HistoryContent() {
  const { resetPortfolio, transactions } = useTradeContext();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/trade"
                className="text-gray-500 hover:text-sol-green transition-colors"
              >
                &larr; Back
              </Link>
              <h1 className="text-2xl font-bold">Transaction History</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {transactions.length} swap{transactions.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Reset portfolio to $10,000 USDC? This cannot be undone.')) {
                  resetPortfolio();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Portfolio
            </button>
          )}
        </motion.div>

        <TransactionHistory />
      </div>
    </main>
  );
}

export default function HistoryPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6 pt-28">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Connect wallet to view history</p>
          <WalletMultiButton className="!bg-sol-green/10 hover:!bg-sol-green/15 !text-sol-green !border !border-sol-green/20 !rounded-xl !h-10 !text-sm !font-semibold" />
        </div>
      </main>
    );
  }

  return (
    <TradeProvider>
      <HistoryContent />
    </TradeProvider>
  );
}
