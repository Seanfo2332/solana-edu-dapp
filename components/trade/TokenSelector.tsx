'use client';

import { useState, useRef, useEffect } from 'react';
import { type Token, createTokenFromSymbol } from '@/lib/trade/tokens';
import { useTradeContext } from '@/contexts/TradeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenSelectorProps {
  selected: string;
  onChange: (symbol: string) => void;
  exclude?: string;
}

export default function TokenSelector({
  selected,
  onChange,
  exclude,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { activeTokens } = useTradeContext();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const token = activeTokens.find((t) => t.symbol === selected) ?? createTokenFromSymbol(selected);
  const options = activeTokens.filter((t) => t.symbol !== exclude);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl px-3 py-2 transition-colors min-w-[120px]"
      >
        <TokenIcon token={token} size={20} />
        <span className="font-semibold text-white text-sm">{token.symbol}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 bg-[var(--card-elevated)] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl min-w-[160px]"
          >
            {options.map((t) => (
              <button
                key={t.symbol}
                onClick={() => {
                  onChange(t.symbol);
                  setOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/[0.06] transition-colors text-left ${
                  t.symbol === selected ? 'bg-white/[0.04]' : ''
                }`}
              >
                <TokenIcon token={t} size={20} />
                <div>
                  <p className="text-sm font-semibold text-white">{t.symbol}</p>
                  <p className="text-xs text-gray-400">{t.name}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TokenIcon({ token, size = 24 }: { token: Token; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: token.color,
        fontSize: size * 0.5,
      }}
    >
      {token.icon}
    </div>
  );
}
