'use client';

import { useEffect, useState, useRef } from 'react';

const TOKENS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'XRP', name: 'XRP' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE', name: 'Doge' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI', name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'LTC', name: 'Litecoin' },
  { symbol: 'NEAR', name: 'NEAR' },
];

const WS_SYMBOLS = TOKENS.map((t) => `${t.symbol.toLowerCase()}usdt@trade`);

export default function LiveTicker() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial prices for all 15 tokens
    const symbols = TOKENS.map((t) => `${t.symbol}USDT`);
    Promise.all(
      symbols.map((s) =>
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s}`)
          .then((r) => r.json())
          .then((d) => ({ symbol: s.replace('USDT', ''), price: parseFloat(d.price) }))
          .catch(() => null)
      )
    ).then((results) => {
      const initial: Record<string, number> = {};
      results.forEach((r) => {
        if (r) initial[r.symbol] = r.price;
      });
      setPrices(initial);
    });

    // WebSocket for real-time updates
    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        method: 'SUBSCRIBE',
        params: WS_SYMBOLS,
        id: 1,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.s && msg.p) {
          const token = msg.s.replace('USDT', '');
          const newPrice = parseFloat(msg.p);
          setPrices((prev) => {
            if (prev[token] !== newPrice) {
              setPrevPrices((pp) => ({ ...pp, [token]: prev[token] ?? newPrice }));
            }
            return { ...prev, [token]: newPrice };
          });
        }
      } catch {}
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#08080d] border-b border-white/[0.04] overflow-hidden">
      <div className="flex items-center h-8">
        <div className="flex-shrink-0 px-3 border-r border-white/[0.06] h-full flex items-center">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sol-green opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sol-green" />
            </span>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Live</span>
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="flex animate-ticker-fast">
            {[...TOKENS, ...TOKENS].map((t, i) => {
              const price = prices[t.symbol] ?? 0;
              const prev = prevPrices[t.symbol] ?? price;
              const isUp = price >= prev;

              return (
                <div key={i} className="flex items-center gap-2 px-4 flex-shrink-0">
                  <span className="text-[11px] font-semibold text-white/70">{t.symbol}</span>
                  <span className={`text-[11px] font-mono transition-colors duration-300 ${
                    price === 0
                      ? 'text-gray-600'
                      : isUp
                      ? 'text-sol-green'
                      : 'text-red-400'
                  }`}>
                    {price > 0
                      ? `$${price.toLocaleString(undefined, { maximumFractionDigits: price < 1 ? 4 : 2 })}`
                      : '—'}
                  </span>
                  {price > 0 && (
                    <span className={`text-[9px] ${isUp ? 'text-sol-green' : 'text-red-400'}`}>
                      {isUp ? '▲' : '▼'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
