import { NextResponse } from 'next/server';

const COINGECKO_IDS = [
  'solana',
  'usd-coin',
  'bitcoin',
  'ethereum',
  'binancecoin',
  'ripple',
  'dogecoin',
];

let cachedPrices: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

export async function GET() {
  const now = Date.now();

  if (cachedPrices && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedPrices);
  }

  try {
    const ids = COINGECKO_IDS.join(',');
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      // Return cached data if available, even if stale
      if (cachedPrices) {
        return NextResponse.json(cachedPrices);
      }
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();

    // Map CoinGecko IDs to our token symbols
    const prices: Record<string, number> = {
      SOL: data.solana?.usd ?? 0,
      USDC: data['usd-coin']?.usd ?? 1,
      BTC: data.bitcoin?.usd ?? 0,
      ETH: data.ethereum?.usd ?? 0,
      BNB: data.binancecoin?.usd ?? 0,
      XRP: data.ripple?.usd ?? 0,
      DOGE: data.dogecoin?.usd ?? 0,
    };

    cachedPrices = prices;
    cacheTimestamp = now;

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Price fetch error:', error);

    // Fallback prices if API fails completely
    const fallback: Record<string, number> = {
      SOL: 150,
      USDC: 1,
      BTC: 95000,
      ETH: 3500,
      BNB: 600,
      XRP: 2.5,
      DOGE: 0.35,
    };

    return NextResponse.json(cachedPrices ?? fallback);
  }
}
