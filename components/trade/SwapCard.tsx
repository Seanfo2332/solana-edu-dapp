'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTradeContext } from '@/contexts/TradeContext';
import TokenSelector from './TokenSelector';

export default function SwapCard() {
  const { balances, prices, pricesLoading, executeSwap } = useTradeContext();

  const [fromToken, setFromToken] = useState('USDC');
  const [toToken, setToToken] = useState('SOL');
  const [fromAmount, setFromAmount] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [error, setError] = useState('');

  const fromBalance = balances[fromToken] ?? 0;
  const fromPrice = prices[fromToken] ?? 0;
  const toPrice = prices[toToken] ?? 0;

  const toAmount = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (!amt || !fromPrice || !toPrice) return 0;
    return (amt * fromPrice) / toPrice;
  }, [fromAmount, fromPrice, toPrice]);

  const usdValue = useMemo(() => {
    const amt = parseFloat(fromAmount);
    if (!amt || !fromPrice) return 0;
    return amt * fromPrice;
  }, [fromAmount, fromPrice]);

  const rate = fromPrice && toPrice ? fromPrice / toPrice : 0;

  async function handleSwap() {
    setError('');
    const amt = parseFloat(fromAmount);
    if (!amt || amt <= 0) {
      setError('Enter an amount');
      return;
    }
    if (amt > fromBalance) {
      setError('Insufficient balance');
      return;
    }

    const success = await executeSwap(fromToken, toToken, amt, prices);
    if (success) {
      setSwapSuccess(true);
      setFromAmount('');
      setTimeout(() => setSwapSuccess(false), 2000);
    } else {
      setError('Swap failed');
    }
  }

  function handleFlip() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
  }

  function handleMaxClick() {
    setFromAmount(fromBalance.toString());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-border p-6 space-y-4 max-w-md w-full bg-[var(--card)]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Swap</h2>
        {pricesLoading && (
          <span className="text-xs text-gray-500 animate-pulse">Updating prices...</span>
        )}
      </div>

      {/* From */}
      <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 border border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">From</span>
          <button
            onClick={handleMaxClick}
            className="text-xs text-sol-green hover:text-sol-green/80 transition-colors"
          >
            Balance: {formatNumber(fromBalance)} (MAX)
          </button>
        </div>
        <div className="flex items-center gap-3">
          <TokenSelector
            selected={fromToken}
            onChange={(s) => {
              setFromToken(s);
              if (s === toToken) setToToken(fromToken);
            }}
            exclude={toToken}
          />
          <input
            type="number"
            placeholder="0.00"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="bg-transparent text-right text-xl font-semibold text-white w-full outline-none placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        {usdValue > 0 && (
          <p className="text-xs text-gray-500 text-right">
            ~${formatNumber(usdValue, 2)}
          </p>
        )}
      </div>

      {/* Flip button */}
      <div className="flex justify-center -my-1">
        <button
          onClick={handleFlip}
          className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl p-2 transition-colors group"
        >
          <svg
            className="w-5 h-5 text-gray-400 group-hover:text-sol-green transition-colors rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>

      {/* To */}
      <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 border border-white/[0.06]">
        <span className="text-xs text-gray-500 font-medium">To (estimated)</span>
        <div className="flex items-center gap-3">
          <TokenSelector
            selected={toToken}
            onChange={(s) => {
              setToToken(s);
              if (s === fromToken) setFromToken(toToken);
            }}
            exclude={fromToken}
          />
          <p className="text-right text-xl font-semibold text-white w-full">
            {toAmount > 0 ? formatNumber(toAmount, 6) : '0.00'}
          </p>
        </div>
      </div>

      {/* Rate */}
      {rate > 0 && (
        <p className="text-xs text-gray-500 text-center">
          1 {fromToken} = {formatNumber(rate, 6)} {toToken}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 text-center">{error}</p>
      )}

      {/* Swap button */}
      <button
        onClick={handleSwap}
        disabled={!fromAmount || parseFloat(fromAmount) <= 0}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
          swapSuccess
            ? 'bg-sol-green text-black'
            : 'bg-sol-green/90 hover:bg-sol-green text-black font-bold shadow-lg shadow-sol-green/15 hover:shadow-sol-green/25 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {swapSuccess ? 'Swap Successful!' : 'Swap'}
      </button>
    </motion.div>
  );
}

function formatNumber(n: number, decimals = 4) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  if (n < 0.0001 && n > 0) return n.toExponential(2);
  return n.toFixed(decimals).replace(/\.?0+$/, '') || '0';
}
