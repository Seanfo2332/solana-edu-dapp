'use client';

import { motion } from 'framer-motion';
import { useTradeContext } from '@/contexts/TradeContext';
import { createTokenFromSymbol } from '@/lib/trade/tokens';
import { TokenIcon } from './TokenSelector';

export default function TransactionHistory() {
  const { transactions } = useTradeContext();

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No transactions yet</p>
        <p className="text-gray-600 text-sm mt-1">
          Start swapping tokens to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, i) => {
        const fromToken = createTokenFromSymbol(tx.fromToken);
        const toToken = createTokenFromSymbol(tx.toToken);
        const usdValue = tx.fromAmount * tx.price;

        return (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between bg-[var(--card)] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* From */}
              <div className="flex items-center gap-2">
                <TokenIcon token={fromToken} size={24} />
                <div>
                  <p className="text-sm font-semibold text-white">
                    -{formatNum(tx.fromAmount)} {tx.fromToken}
                  </p>
                  <p className="text-xs text-gray-500">
                    @ ${tx.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <span className="text-gray-600">&rarr;</span>

              {/* To */}
              <div className="flex items-center gap-2">
                <TokenIcon token={toToken} size={24} />
                <div>
                  <p className="text-sm font-semibold text-sol-green">
                    +{formatNum(tx.toAmount)} {tx.toToken}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">
                ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-600">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n < 0.0001 && n > 0) return n.toExponential(2);
  return n.toFixed(4).replace(/\.?0+$/, '') || '0';
}
