import { NextResponse } from 'next/server';

function toBinanceSymbol(symbol: string): string {
  return `${symbol.toUpperCase()}USDT`;
}

// Map days to Binance kline intervals for good candle density
function getInterval(days: string): { interval: string; limit: number } {
  switch (days) {
    case '1':
      return { interval: '5m', limit: 288 };   // 5min candles, ~24h
    case '7':
      return { interval: '1h', limit: 168 };   // 1h candles, 7 days
    case '30':
      return { interval: '4h', limit: 180 };   // 4h candles, 30 days
    case '90':
      return { interval: '1d', limit: 90 };    // daily candles
    case '365':
      return { interval: '1d', limit: 365 };   // daily candles
    default:
      return { interval: '1h', limit: 168 };
  }
}

// Cache per symbol+days
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 2 * 60_000; // 2 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') ?? 'SOL';
  const days = searchParams.get('days') ?? '7';

  const binanceSymbol = toBinanceSymbol(symbol);

  const cacheKey = `${binanceSymbol}-${days}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const { interval, limit } = getInterval(days);
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
    );

    if (!res.ok) {
      if (cached) return NextResponse.json(cached.data);
      throw new Error(`Binance error: ${res.status}`);
    }

    const raw: unknown[][] = await res.json();

    // Binance klines: [openTime, open, high, low, close, volume, closeTime, ...]
    const candles = raw.map((k) => ({
      time: Math.floor((k[0] as number) / 1000),
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
    }));

    cache.set(cacheKey, { data: candles, timestamp: Date.now() });

    return NextResponse.json(candles);
  } catch (error) {
    console.error('Kline fetch error:', error);
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json([], { status: 500 });
  }
}
