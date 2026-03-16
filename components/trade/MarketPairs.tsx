'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SYMBOLS } from '@/lib/trade/tokens';
import { useTradeContext } from '@/contexts/TradeContext';
import { TokenIcon } from './TokenSelector';
import HintTooltip from './HintTooltip';

interface MarketPairsProps {
  selected: string;
  onSelect: (symbol: string) => void;
}

interface SearchResult {
  symbol: string;
  binanceSymbol: string;
}

export default function MarketPairs({ selected, onSelect }: MarketPairsProps) {
  const { prices, activeTokens, addToken, removeToken } = useTradeContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Exclude USDC from tradable pairs (it's the quote currency)
  const tradableTokens = activeTokens.filter((t) => t.symbol !== 'USDC');
  const activeSymbols = new Set(activeTokens.map((t) => t.symbol));

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/coins/search?q=${encodeURIComponent(value)}`);
        const data: SearchResult[] = await res.json();
        setResults(data);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleAdd = useCallback(async (symbol: string) => {
    await addToken(symbol);
    setQuery('');
    setResults([]);
    setShowResults(false);
  }, [addToken]);

  return (
    <div className="gradient-border overflow-hidden">
      <div className="bg-[var(--card)] px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-500">Markets</h3>
          <HintTooltip text="Select a token to view its live chart and trade it. Prices update in real-time from Binance. Use the search bar to find and add any coin available on Binance." />
        </div>
        {/* Search input */}
        <div ref={searchRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search coins..."
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sol-green/30 transition-colors"
          />
          {searching && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-sol-green rounded-full animate-spin" />
            </div>
          )}
          {/* Search results dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[var(--card-elevated)] border border-white/[0.08] rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto">
              {results
                .filter((r) => !activeSymbols.has(r.symbol))
                .map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => handleAdd(r.symbol)}
                    className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/[0.04] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{r.symbol}</span>
                      <span className="text-xs text-gray-500">/USDT</span>
                    </div>
                    <span className="text-xs text-sol-green font-medium">+ Add</span>
                  </button>
                ))}
              {results.filter((r) => !activeSymbols.has(r.symbol)).length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">All results already added</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="bg-[var(--card)] divide-y divide-white/[0.04] overflow-y-auto max-h-[392px]">
        {tradableTokens.map((token) => {
          const price = prices[token.symbol] ?? 0;
          const isSelected = token.symbol === selected;
          const isCustom = !DEFAULT_SYMBOLS.includes(token.symbol);

          return (
            <div
              key={token.symbol}
              className={`flex items-center justify-between w-full px-4 py-3 hover:bg-white/[0.03] transition-colors ${
                isSelected ? 'bg-sol-green/[0.06] border-l-2 border-l-sol-green' : ''
              }`}
            >
              <button
                onClick={() => onSelect(token.symbol)}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <TokenIcon token={token} size={24} />
                <div className="text-left">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-sol-green' : 'text-white'}`}>
                    {token.symbol}
                  </p>
                  <p className="text-[10px] text-gray-500">{token.name}</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-300 font-mono">
                  ${price.toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 4 : 2 })}
                </p>
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeToken(token.symbol);
                    }}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs ml-1"
                    title="Remove token"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
