import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── In-memory cache ───
let cachedRankings: RankedTrader[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

interface RankedTrader {
  rank: number;
  wallet: string;
  pnl: number;
  portfolioValue: number;
  tradeCount: number;
}


function truncateWallet(wallet: string): string {
  if (wallet.length <= 8) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

const FALLBACK_PRICES: Record<string, number> = {
  SOL: 150, USDC: 1, BTC: 95000, ETH: 3500, BNB: 600, XRP: 2.5, DOGE: 0.35,
};

async function fetchPricesFromBinance(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = { USDC: 1 };
  const nonUSDC = symbols.filter((s) => s !== 'USDC');
  if (nonUSDC.length === 0) return prices;

  try {
    // Batch fetch all symbols in one request
    const symbolsParam = JSON.stringify(nonUSDC.map((s) => `${s}USDT`));
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error(`Binance error ${res.status}`);
    const data: { symbol: string; price: string }[] = await res.json();
    for (const item of data) {
      const token = item.symbol.replace('USDT', '');
      prices[token] = parseFloat(item.price);
    }
  } catch {
    // Return fallback prices for any missing symbols
    for (const sym of nonUSDC) {
      if (!prices[sym]) prices[sym] = FALLBACK_PRICES[sym] ?? 0;
    }
  }
  return prices;
}

async function computeRankings(): Promise<RankedTrader[]> {
  const allTrades = await prisma.trade.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const walletData = new Map<string, { balances: Record<string, number>; tradeCount: number; lastPrices: Record<string, number> }>();

  for (const trade of allTrades) {
    if (!walletData.has(trade.walletKey)) {
      walletData.set(trade.walletKey, { balances: { USDC: 10000 }, tradeCount: 0, lastPrices: {} });
    }
    const data = walletData.get(trade.walletKey)!;
    data.balances[trade.fromToken] = (data.balances[trade.fromToken] ?? 0) - trade.fromAmount;
    data.balances[trade.toToken] = (data.balances[trade.toToken] ?? 0) + trade.toAmount;
    data.tradeCount++;
    data.lastPrices[trade.fromToken] = trade.price;
    if (trade.fromAmount > 0 && trade.toAmount > 0) {
      data.lastPrices[trade.toToken] = (trade.fromAmount * trade.price) / trade.toAmount;
    }
  }

  // Collect every token symbol across all wallets and fetch prices in one batch
  const allSymbols = new Set<string>();
  for (const data of walletData.values()) {
    for (const sym of Object.keys(data.balances)) {
      allSymbols.add(sym);
    }
  }
  const prices = await fetchPricesFromBinance([...allSymbols]);

  const rankings: RankedTrader[] = [];

  for (const [wallet, data] of walletData) {
    let portfolioValue = 0;
    for (const [sym, bal] of Object.entries(data.balances)) {
      if (bal <= 0.000001) continue;
      const price = prices[sym] ?? data.lastPrices[sym] ?? 0;
      portfolioValue += bal * price;
    }

    rankings.push({
      rank: 0,
      wallet,
      pnl: Math.round((portfolioValue - 10000) * 100) / 100,
      portfolioValue: Math.round(portfolioValue * 100) / 100,
      tradeCount: data.tradeCount,
    });
  }

  rankings.sort((a, b) => {
    if (b.pnl !== a.pnl) return b.pnl - a.pnl;
    return a.tradeCount - b.tradeCount;
  });

  rankings.forEach((r, i) => { r.rank = i + 1; });

  return rankings;
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const walletParam = req.nextUrl.searchParams.get('wallet');

  const forceRefresh = req.nextUrl.searchParams.get('refresh') === 'true';
  if (forceRefresh || !cachedRankings || now - cacheTimestamp >= CACHE_TTL) {
    try {
      cachedRankings = await computeRankings();
      cacheTimestamp = now;
    } catch (err) {
      console.error('Leaderboard compute failed:', err);
      // Return empty leaderboard with error flag instead of crashing
      return NextResponse.json({
        leaderboard: [],
        userRank: null,
        updatedAt: new Date().toISOString(),
        totalTraders: 0,
        error: 'Failed to load leaderboard',
      }, { status: 500 });
    }
  }

  const leaderboard = cachedRankings.slice(0, 50).map((r) => ({
    rank: r.rank,
    wallet: truncateWallet(r.wallet),
    pnl: r.pnl,
    pnlPercent: Math.round((r.pnl / 10000) * 10000) / 100,
    portfolioValue: r.portfolioValue,
    tradeCount: r.tradeCount,
  }));

  let userRank = null;
  if (walletParam) {
    const found = cachedRankings.find((r) => r.wallet === walletParam);
    if (found) {
      userRank = {
        rank: found.rank,
        wallet: walletParam,
        pnl: found.pnl,
        pnlPercent: Math.round((found.pnl / 10000) * 10000) / 100,
        portfolioValue: found.portfolioValue,
        tradeCount: found.tradeCount,
      };
    }
  }

  return NextResponse.json({
    leaderboard,
    userRank,
    updatedAt: new Date(cacheTimestamp).toISOString(),
    totalTraders: cachedRankings.length,
  });
}
