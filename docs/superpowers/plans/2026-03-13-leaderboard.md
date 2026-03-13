# Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time trading leaderboard ranked by P&L, displayed on homepage (top 5), trade page (top 10), and a dedicated `/leaderboard` page (top 50).

**Architecture:** Compute rankings on-the-fly from the existing `Trade` table with a 30-second server-side in-memory cache. One reusable `LeaderboardWidget` component renders in all 3 locations with different props. Clients poll every 30 seconds.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Prisma (PostgreSQL), Tailwind CSS 4, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-13-leaderboard-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `app/api/leaderboard/route.ts` | **NEW** — GET endpoint: fetch all trades, compute per-wallet balances & P&L, cache 30s, return ranked top 50 + optional user rank |
| `components/LeaderboardWidget.tsx` | **NEW** — Reusable client component: fetches `/api/leaderboard`, renders ranked table, polls every 30s |
| `app/leaderboard/page.tsx` | **NEW** — Dedicated page wrapping `LeaderboardWidget` with limit=50 |
| `components/Navbar.tsx` | **MODIFY** — Add "Leaderboard" nav link |
| `app/page.tsx` | **MODIFY** — Add top 5 leaderboard section after StatsSection |
| `app/trade/page.tsx` | **MODIFY** — Add top 10 widget below PortfolioPanel |

---

## Chunk 1: API Endpoint

### Task 1: Create the leaderboard API route

**Files:**
- Create: `app/api/leaderboard/route.ts`

- [ ] **Step 1: Create the API route file**

Create `app/api/leaderboard/route.ts` with the full implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── In-memory cache ───
let cachedRankings: RankedTrader[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

interface RankedTrader {
  rank: number;
  wallet: string;       // full wallet key (truncated in response)
  pnl: number;
  portfolioValue: number;
  tradeCount: number;
}

// Default token CoinGecko IDs
const DEFAULT_TOKENS = ['SOL', 'USDC', 'BTC', 'ETH', 'BNB', 'XRP', 'DOGE'];

function truncateWallet(wallet: string): string {
  if (wallet.length <= 8) return wallet;
  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

async function fetchDefaultPrices(): Promise<Record<string, number>> {
  // Call our own /api/prices internally by reusing the same logic
  const COINGECKO_IDS = 'solana,usd-coin,bitcoin,ethereum,binancecoin,ripple,dogecoin';
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('CoinGecko error');
    const data = await res.json();
    return {
      SOL: data.solana?.usd ?? 0,
      USDC: data['usd-coin']?.usd ?? 1,
      BTC: data.bitcoin?.usd ?? 0,
      ETH: data.ethereum?.usd ?? 0,
      BNB: data.binancecoin?.usd ?? 0,
      XRP: data.ripple?.usd ?? 0,
      DOGE: data.dogecoin?.usd ?? 0,
    };
  } catch {
    // Fallback prices
    return { SOL: 150, USDC: 1, BTC: 95000, ETH: 3500, BNB: 600, XRP: 2.5, DOGE: 0.35 };
  }
}

async function fetchCustomTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  for (const sym of symbols) {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}USDT`);
      if (res.ok) {
        const data = await res.json();
        prices[sym] = parseFloat(data.price);
      }
    } catch {
      // Skip — will use fallback from trade data
    }
  }
  return prices;
}

async function computeRankings(): Promise<RankedTrader[]> {
  // Step 1: Single query for ALL trades
  const allTrades = await prisma.trade.findMany({
    orderBy: { createdAt: 'asc' },
  });

  // Step 2: Group by wallet, compute balances
  const walletData = new Map<string, { balances: Record<string, number>; tradeCount: number; lastPrices: Record<string, number> }>();

  for (const trade of allTrades) {
    if (!walletData.has(trade.walletKey)) {
      walletData.set(trade.walletKey, { balances: { USDC: 10000 }, tradeCount: 0, lastPrices: {} });
    }
    const data = walletData.get(trade.walletKey)!;
    data.balances[trade.fromToken] = (data.balances[trade.fromToken] ?? 0) - trade.fromAmount;
    data.balances[trade.toToken] = (data.balances[trade.toToken] ?? 0) + trade.toAmount;
    data.tradeCount++;
    // Track last known prices for fallback (both from and to tokens)
    data.lastPrices[trade.fromToken] = trade.price;
    if (trade.fromAmount > 0 && trade.toAmount > 0) {
      data.lastPrices[trade.toToken] = (trade.fromAmount * trade.price) / trade.toAmount;
    }
  }

  // Step 3: Fetch prices
  const prices = await fetchDefaultPrices();

  // Find any non-default tokens across all wallets
  const customSymbols = new Set<string>();
  for (const data of walletData.values()) {
    for (const sym of Object.keys(data.balances)) {
      if (!DEFAULT_TOKENS.includes(sym) && (data.balances[sym] ?? 0) > 0.000001) {
        customSymbols.add(sym);
      }
    }
  }

  if (customSymbols.size > 0) {
    const customPrices = await fetchCustomTokenPrices([...customSymbols]);
    Object.assign(prices, customPrices);
  }

  // Step 4: Calculate portfolio values & P&L
  const rankings: RankedTrader[] = [];

  for (const [wallet, data] of walletData) {
    let portfolioValue = 0;
    for (const [sym, bal] of Object.entries(data.balances)) {
      if (bal <= 0.000001) continue;
      const price = prices[sym] ?? data.lastPrices[sym] ?? 0;
      portfolioValue += bal * price;
    }

    rankings.push({
      rank: 0, // assigned after sort
      wallet,
      pnl: Math.round((portfolioValue - 10000) * 100) / 100,
      portfolioValue: Math.round(portfolioValue * 100) / 100,
      tradeCount: data.tradeCount,
    });
  }

  // Step 5: Sort by P&L desc, then by fewer trades (tiebreaker)
  rankings.sort((a, b) => {
    if (b.pnl !== a.pnl) return b.pnl - a.pnl;
    return a.tradeCount - b.tradeCount;
  });

  // Assign ranks
  rankings.forEach((r, i) => { r.rank = i + 1; });

  return rankings;
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const walletParam = req.nextUrl.searchParams.get('wallet');

  // Check cache
  if (!cachedRankings || now - cacheTimestamp >= CACHE_TTL) {
    cachedRankings = await computeRankings();
    cacheTimestamp = now;
  }

  // Top 50 for response
  const leaderboard = cachedRankings.slice(0, 50).map((r) => ({
    rank: r.rank,
    wallet: truncateWallet(r.wallet),
    pnl: r.pnl,
    portfolioValue: r.portfolioValue,
    tradeCount: r.tradeCount,
  }));

  // User rank if requested
  let userRank = null;
  if (walletParam) {
    const found = cachedRankings.find((r) => r.wallet === walletParam);
    if (found) {
      userRank = {
        rank: found.rank,
        wallet: walletParam,
        pnl: found.pnl,
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
```

- [ ] **Step 2: Verify the API endpoint works**

Run: `curl http://localhost:3001/api/leaderboard`
Expected: JSON response with `leaderboard` array, `userRank: null`, `updatedAt`, `totalTraders`

- [ ] **Step 3: Commit**

```bash
git add app/api/leaderboard/route.ts
git commit -m "feat: add leaderboard API endpoint with 30s cache"
```

---

## Chunk 2: LeaderboardWidget Component

### Task 2: Create the reusable LeaderboardWidget

**Files:**
- Create: `components/LeaderboardWidget.tsx`

- [ ] **Step 1: Create the LeaderboardWidget component**

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  pnl: number;
  portfolioValue: number;
  tradeCount: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
  updatedAt: string;
  totalTraders: number;
}

interface LeaderboardWidgetProps {
  limit: number;
  compact: boolean;
  showUserRank: boolean;
}

export default function LeaderboardWidget({ limit, compact, showUserRank }: LeaderboardWidgetProps) {
  const { publicKey } = useWallet();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const walletParam = publicKey ? `?wallet=${publicKey.toBase58()}` : '';
      const res = await fetch(`/api/leaderboard${walletParam}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setSecondsAgo(0);
      }
    } catch {
      // Silently fail — keep showing last data
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  // Fetch on mount + poll every 30s
  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  // Tick the "updated X seconds ago" counter
  useEffect(() => {
    const ticker = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(ticker);
  }, []);

  const walletBase58 = publicKey?.toBase58() ?? '';

  // Truncate to match API format for comparison
  function truncateWallet(w: string): string {
    if (w.length <= 8) return w;
    return `${w.slice(0, 4)}...${w.slice(-4)}`;
  }

  const userWalletTruncated = walletBase58 ? truncateWallet(walletBase58) : '';

  if (loading) {
    return (
      <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)]`}>
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-sol-green/30 border-t-sol-green rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!data || data.totalTraders === 0) {
    return (
      <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)]`}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Top Traders</p>
        <p className="text-sm text-gray-600 text-center py-4">No trades yet. Be the first!</p>
      </div>
    );
  }

  const entries = data.leaderboard.slice(0, limit);
  const userOutsideList = showUserRank && data.userRank && data.userRank.rank > limit;

  return (
    <div className={`gradient-border ${compact ? 'p-4' : 'p-6'} bg-[var(--card)] space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className={`text-gray-500 font-semibold uppercase tracking-wider ${compact ? 'text-[10px]' : 'text-xs'}`}>
            Top Traders
          </p>
          <span className="text-[10px] text-sol-purple bg-sol-purple/10 px-2 py-0.5 rounded-full font-medium">
            {data.totalTraders}
          </span>
        </div>
        <span className="text-[10px] text-gray-600">
          {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
        </span>
      </div>

      {/* User rank banner (if outside visible list) */}
      {userOutsideList && data.userRank && (
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-sol-green/[0.06] border border-sol-green/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sol-green">#{data.userRank.rank}</span>
            <span className="text-xs text-gray-400">Your Rank</span>
          </div>
          <span className={`text-xs font-semibold ${data.userRank.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
            {data.userRank.pnl >= 0 ? '+' : ''}${data.userRank.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="space-y-0.5">
        {/* Header row */}
        <div className={`grid ${compact ? 'grid-cols-[2rem_1fr_5rem]' : 'grid-cols-[2.5rem_1fr_6rem_4rem]'} gap-2 px-2 py-1`}>
          <span className="text-[10px] text-gray-600 font-medium">#</span>
          <span className="text-[10px] text-gray-600 font-medium">Wallet</span>
          <span className="text-[10px] text-gray-600 font-medium text-right">P&L</span>
          {!compact && <span className="text-[10px] text-gray-600 font-medium text-right">Trades</span>}
        </div>

        {/* Entries */}
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const isUser = userWalletTruncated && entry.wallet === userWalletTruncated;
            return (
              <motion.div
                key={entry.wallet}
                layout
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`grid ${compact ? 'grid-cols-[2rem_1fr_5rem]' : 'grid-cols-[2.5rem_1fr_6rem_4rem]'} gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                  isUser
                    ? 'bg-sol-green/[0.08] border border-sol-green/10'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-xs font-bold ${entry.rank <= 3 ? 'text-sol-green' : 'text-gray-500'}`}>
                  {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                </span>
                <span className={`text-xs font-mono ${isUser ? 'text-sol-green font-semibold' : 'text-gray-400'}`}>
                  {entry.wallet} {isUser && '(you)'}
                </span>
                <span className={`text-xs font-semibold text-right ${entry.pnl >= 0 ? 'text-sol-green' : 'text-red-400'}`}>
                  {entry.pnl >= 0 ? '+' : ''}${entry.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                {!compact && (
                  <span className="text-xs text-gray-500 text-right">{entry.tradeCount}</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify component renders (will test when integrated)**

No standalone test — this gets verified in Tasks 3-5.

- [ ] **Step 3: Commit**

```bash
git add components/LeaderboardWidget.tsx
git commit -m "feat: add reusable LeaderboardWidget component"
```

---

## Chunk 3: Pages & Integration

### Task 3: Create the dedicated /leaderboard page

**Files:**
- Create: `app/leaderboard/page.tsx`

- [ ] **Step 1: Create the leaderboard page**

```typescript
'use client';

import { motion } from 'framer-motion';
import LeaderboardWidget from '@/components/LeaderboardWidget';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sol-purple/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">Top traders ranked by profit & loss</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LeaderboardWidget limit={50} compact={false} showUserRank={true} />
        </motion.div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page loads**

Open: `http://localhost:3001/leaderboard`
Expected: Page renders with "Leaderboard" heading and the widget showing data (or "No trades yet" empty state)

- [ ] **Step 3: Commit**

```bash
git add app/leaderboard/page.tsx
git commit -m "feat: add dedicated /leaderboard page"
```

### Task 4: Add Leaderboard link to Navbar

**Files:**
- Modify: `components/Navbar.tsx:23-31`

- [ ] **Step 1: Add the Leaderboard link**

In `components/Navbar.tsx`, add a new entry to the `links` array at line 23. Insert `{ href: '/leaderboard', label: 'Leaderboard' }` after the Trade link:

```typescript
  const links = [
    { href: '/trade', label: 'Trade' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/learn', label: 'Learn' },
    {
      href: 'https://explorer.solana.com/?cluster=devnet',
      label: 'Explorer',
      external: true,
    },
  ];
```

- [ ] **Step 2: Verify nav link appears**

Open: `http://localhost:3001`
Expected: "Leaderboard" link visible in navbar between Trade and Learn, navigates to `/leaderboard`

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: add Leaderboard link to navbar"
```

### Task 5: Add top 5 widget to homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the LeaderboardWidget import and section**

In `app/page.tsx`, add the import at the top:
```typescript
import LeaderboardWidget from '../components/LeaderboardWidget';
```

Then add a new section after `<StatsSection />` (line 139) and before the closing `</main>`:

```typescript
      {/* Top Traders */}
      <LeaderboardSection />
```

Add the `LeaderboardSection` component function after `StatsSection` (before the SVG icon functions):

```typescript
// ─── Leaderboard Section ───
function LeaderboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative max-w-6xl mx-auto px-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Top Traders</h2>
          <a href="/leaderboard" className="text-xs text-sol-green hover:text-sol-green/80 transition-colors">
            View All &rarr;
          </a>
        </div>
        <LeaderboardWidget limit={5} compact={true} showUserRank={false} />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Verify homepage widget**

Open: `http://localhost:3001`
Expected: "Top Traders" section visible below Stats section with top 5 entries and "View All" link

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add top 5 leaderboard widget to homepage"
```

### Task 6: Add top 10 widget to trade page

**Files:**
- Modify: `app/trade/page.tsx:97-101`

- [ ] **Step 1: Add the LeaderboardWidget import and section**

In `app/trade/page.tsx`, add the import at the top:
```typescript
import LeaderboardWidget from '@/components/LeaderboardWidget';
```

Then replace the `<div className="mt-4">` block (lines 98-100) with a two-column layout. The leaderboard column is collapsible:

```typescript
        {/* Portfolio + Leaderboard */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioPanel />
          <CollapsibleLeaderboard />
        </div>
```

Add the `CollapsibleLeaderboard` component inside the same file (after `TradeContent`):

```typescript
function CollapsibleLeaderboard() {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mb-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {open ? 'Hide' : 'Show'} Leaderboard
      </button>
      {open && <LeaderboardWidget limit={10} compact={true} showUserRank={true} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify trade page widget**

Open: `http://localhost:3001/trade` (with wallet connected)
Expected: PortfolioPanel on the left, LeaderboardWidget (top 10) on the right, side by side on desktop

- [ ] **Step 3: Commit**

```bash
git add app/trade/page.tsx
git commit -m "feat: add top 10 leaderboard widget to trade page"
```

---

## Chunk 4: Final Verification

### Task 7: End-to-end verification

- [ ] **Step 1: Test all 3 leaderboard placements**

1. Homepage (`/`) — top 5 widget below stats
2. Trade page (`/trade`) — top 10 widget next to portfolio
3. Leaderboard page (`/leaderboard`) — full top 50

- [ ] **Step 2: Test API with wallet param**

Run: `curl "http://localhost:3001/api/leaderboard?wallet=YOUR_WALLET_KEY"`
Expected: `userRank` field populated with rank, pnl, etc.

- [ ] **Step 3: Test empty state (no traders)**

If no trades exist in DB, all placements should show "No trades yet. Be the first!"

- [ ] **Step 4: Test real-time polling**

Leave the leaderboard page open, make a trade on the trade page, wait 30 seconds. The leaderboard should update automatically.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete leaderboard feature — API, widget, 3 placements"
```
