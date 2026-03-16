'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTradeContext } from '@/contexts/TradeContext';
import HintTooltip from './HintTooltip';

interface TradingPanelProps {
  symbol: string;
}

export default function TradingPanel({ symbol }: TradingPanelProps) {
  const { balances, prices, executeSwap } = useTradeContext();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const tokenPrice = prices[symbol] ?? 0;
  const usdcBalance = balances['USDC'] ?? 0;
  const tokenBalance = balances[symbol] ?? 0;

  const total = useMemo(() => {
    const amt = parseFloat(amount);
    if (!amt || !tokenPrice) return 0;
    return amt * tokenPrice;
  }, [amount, tokenPrice]);

  const maxBuy = tokenPrice > 0 ? usdcBalance / tokenPrice : 0;

  async function handleTrade() {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Enter an amount');
      return;
    }

    let ok: boolean;
    if (side === 'buy') {
      // Buy: spend USDC to get token
      const usdCost = amt * tokenPrice;
      if (usdCost > usdcBalance) {
        setError('Insufficient USDC balance');
        return;
      }
      ok = await executeSwap('USDC', symbol, usdCost, prices);
    } else {
      // Sell: spend token to get USDC
      if (amt > tokenBalance) {
        setError(`Insufficient ${symbol} balance`);
        return;
      }
      ok = await executeSwap(symbol, 'USDC', amt, prices);
    }

    if (ok) {
      setSuccess(true);
      setAmount('');
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError('Trade failed');
    }
  }

  function handlePercentClick(pct: number) {
    if (side === 'buy') {
      setAmount((maxBuy * pct).toFixed(6).replace(/\.?0+$/, ''));
    } else {
      setAmount((tokenBalance * pct).toFixed(6).replace(/\.?0+$/, ''));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-5 space-y-4 bg-[var(--card)]"
    >
      {/* Buy/Sell tabs */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Order</span>
        <HintTooltip text="Buy to purchase tokens with your USDC balance. Sell to convert tokens back to USDC. Use the % buttons below to quickly set how much of your balance to trade." />
      </div>
      <div className="flex bg-white/[0.04] rounded-xl p-1">
        <button
          onClick={() => { setSide('buy'); setAmount(''); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            side === 'buy'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setSide('sell'); setAmount(''); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Price display */}
      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
          Market Price
        </p>
        <p className="text-lg font-bold text-white">
          ${tokenPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Amount input */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">
            Amount ({symbol})
          </span>
          <span className="text-gray-500">
            {side === 'buy'
              ? `Available: $${usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
              : `Available: ${formatNum(tokenBalance)} ${symbol}`}
          </span>
        </div>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-white font-semibold outline-none focus:border-sol-green/30 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />

        {/* Quick percent buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentClick(pct)}
              className="flex-1 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {pct === 1 ? 'MAX' : `${pct * 100}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">Total (USDC)</span>
          <span className="text-sm font-semibold text-white">
            ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {/* Trade button */}
      <button
        onClick={handleTrade}
        disabled={!amount || parseFloat(amount) <= 0}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
          success
            ? 'bg-sol-green text-black font-bold'
            : side === 'buy'
            ? 'bg-sol-green/90 hover:bg-sol-green text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed'
            : 'bg-red-500/90 hover:bg-red-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {success
          ? 'Order Filled!'
          : side === 'buy'
          ? `Buy ${symbol}`
          : `Sell ${symbol}`}
      </button>
    </motion.div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (n < 0.0001 && n > 0) return n.toExponential(2);
  return n.toFixed(4).replace(/\.?0+$/, '') || '0';
}
