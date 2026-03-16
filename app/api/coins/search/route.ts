import { NextResponse } from 'next/server';

interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

let cachedSymbols: { symbol: string; binanceSymbol: string }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getSymbols() {
  if (cachedSymbols && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedSymbols;
  }

  const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);

  const data = await res.json();
  const symbols = (data.symbols as SymbolInfo[])
    .filter((s) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
    .map((s) => ({
      symbol: s.baseAsset,
      binanceSymbol: s.symbol,
    }));

  cachedSymbols = symbols;
  cacheTimestamp = Date.now();
  return symbols;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toUpperCase().trim();

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const symbols = await getSymbols();
    const matches = symbols
      .filter((s) => s.symbol.includes(query))
      .sort((a, b) => {
        // Exact match first, then starts-with, then contains
        if (a.symbol === query) return -1;
        if (b.symbol === query) return 1;
        if (a.symbol.startsWith(query) && !b.symbol.startsWith(query)) return -1;
        if (b.symbol.startsWith(query) && !a.symbol.startsWith(query)) return 1;
        return a.symbol.localeCompare(b.symbol);
      })
      .slice(0, 20);

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Coin search error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
