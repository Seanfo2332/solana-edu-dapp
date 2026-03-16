'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTradeContext } from '@/contexts/TradeContext';
import { createTokenFromSymbol } from '@/lib/trade/tokens';
import { TokenIcon } from './TokenSelector';
import HintTooltip from './HintTooltip';

export default function PortfolioPanel() {
  const { balances, prices, transactions, activeTokens } = useTradeContext();

  const totalUsd = useMemo(() => {
    return activeTokens.reduce((sum, t) => {
      const bal = balances[t.symbol] ?? 0;
      const price = prices[t.symbol] ?? 0;
      return sum + bal * price;
    }, 0);
  }, [balances, prices, activeTokens]);

  const pnl = totalUsd - 10_000; // Starting was 10k USDC
  const pnlPercent = (pnl / 10_000) * 100;

  const holdings = activeTokens.filter((t) => (balances[t.symbol] ?? 0) > 0.000001);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="gradient-border p-6 space-y-5 w-full bg-[var(--card)]"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Portfolio Value
          </p>
          <HintTooltip text="Your total portfolio value in USD. P&L (Profit & Loss) shows how much you've gained or lost from your $10,000 starting balance. Green means profit, red means loss." />
        </div>
        <p className="text-3xl font-bold text-white">
          ${totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
        <p
          className={`text-sm font-medium mt-1 ${
            pnl >= 0 ? 'text-sol-green' : 'text-red-400'
          }`}
        >
          {pnl >= 0 ? '+' : ''}
          ${pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}
          {pnlPercent.toFixed(2)}%)
        </p>
      </div>

      {/* Holdings */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Holdings
        </p>
        {holdings.length === 0 ? (
          <p className="text-sm text-gray-600">No tokens yet</p>
        ) : (
          <div className="space-y-1">
            {holdings.map((token) => {
              const bal = balances[token.symbol] ?? 0;
              const price = prices[token.symbol] ?? 0;
              const value = bal * price;

              return (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon token={token} size={28} />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {token.symbol}
                      </p>
                      <p className="text-xs text-gray-500">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {formatBalance(bal)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
              Recent Swaps
            </p>
            <a
              href="/trade/history"
              className="text-xs text-sol-green hover:text-sol-green/80 transition-colors"
            >
              View all
            </a>
          </div>
          <div className="space-y-1">
            {transactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  <TokenIcon token={createTokenFromSymbol(tx.fromToken)} size={18} />
                  <span className="text-xs text-gray-400">
                    {formatBalance(tx.fromAmount)} {tx.fromToken}
                  </span>
                  <span className="text-gray-600 text-xs">&rarr;</span>
                  <TokenIcon token={createTokenFromSymbol(tx.toToken)} size={18} />
                  <span className="text-xs text-gray-400">
                    {formatBalance(tx.toAmount)} {tx.toToken}
                  </span>
                </div>
                <span className="text-[10px] text-gray-600">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function formatBalance(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n < 0.0001 && n > 0) return n.toExponential(2);
  return n.toFixed(4).replace(/\.?0+$/, '') || '0';
}
