# Leaderboard Feature Design

## Overview

Add a real-time trading leaderboard that ranks users by total P&L (profit & loss) computed from their $10,000 USDC starting balance. The leaderboard appears in 3 places: homepage (top 5), trade page sidebar (top 10), and a dedicated `/leaderboard` page (top 50).

## Approach

Compute rankings on-the-fly from the existing `Trade` table — no schema changes needed. Cache results server-side for 30 seconds. Clients poll every 30 seconds for real-time feel.

## API

### `GET /api/leaderboard`

**Logic:**
1. Fetch all unique wallets from the `Trade` table
2. For each wallet, replay trades to compute current token balances (same algorithm as existing `GET /api/trades`)
3. Fetch current prices from existing `/api/prices` endpoint (CoinGecko, cached 60s)
4. Calculate: `portfolioValue = sum(balance[token] * price[token])` per wallet
5. Calculate: `pnl = portfolioValue - 10000`
6. Sort by P&L descending, return top 50
7. Cache result in-memory for 30 seconds

**Query params:**
- `?wallet=xxx` — also return the requesting user's rank even if outside top 50

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "wallet": "7xKp...3mNq",
      "pnl": 2450.32,
      "portfolioValue": 12450.32,
      "tradeCount": 47
    }
  ],
  "userRank": {
    "rank": 67,
    "wallet": "full-wallet-key",
    "pnl": -230.50,
    "portfolioValue": 9769.50,
    "tradeCount": 12
  },
  "updatedAt": "2026-03-13T10:30:00Z",
  "totalTraders": 128
}
```

**Cache:** In-memory Map with 30-second TTL. All concurrent requests within the window share the same cached result. The `?wallet` param for user rank is computed per-request from the cached full ranking.

## Components

### `LeaderboardWidget`

Reusable component with props:
- `limit: number` — how many rows to show (5, 10, or 50)
- `compact: boolean` — compact mode for homepage/sidebar vs full mode for page
- `showUserRank: boolean` — whether to show connected user's rank banner

**Table columns:** Rank | Wallet (truncated) | P&L ($) | Trade Count

**Behavior:**
- Green text for positive P&L, red for negative
- Highlights connected user's row if they appear in the list
- Auto-polls every 30 seconds
- Shows "Updated X seconds ago" timestamp
- Pulse animation on rank changes (full page only)

### `/leaderboard` page

- Full-width layout consistent with existing dark theme (purple/cyan accents)
- Header: "Top Traders" with total trader count badge
- `LeaderboardWidget limit={50} compact={false} showUserRank={true}`
- If connected wallet is outside top 50, show "Your Rank" banner at top

### Homepage placement

- New section after existing features/stats area
- Title: "Top Traders" with "View All →" link to `/leaderboard`
- `LeaderboardWidget limit={5} compact={true} showUserRank={false}`

### Trade page placement

- Sidebar widget alongside existing panels
- `LeaderboardWidget limit={10} compact={true} showUserRank={true}`
- Collapsible to avoid crowding the trading UI

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No traders yet | Show "No trades yet. Be the first!" empty state |
| Wallet not connected | Leaderboard visible (public), no "Your Rank" highlight |
| User has 0 trades | Not listed on leaderboard |
| Tied P&L | Secondary sort by fewer trades (better efficiency wins) |

## Performance

- Server cache ensures DB query runs at most once per 30 seconds regardless of concurrent users
- Price data reuses existing `/api/prices` cache (60s TTL)
- No new Prisma models or migrations required
- Scales comfortably to hundreds of traders

## Files to Create/Modify

**New files:**
- `app/api/leaderboard/route.ts` — API endpoint
- `components/LeaderboardWidget.tsx` — reusable component
- `app/leaderboard/page.tsx` — dedicated leaderboard page

**Modified files:**
- `app/page.tsx` — add top 5 widget to homepage
- `app/trade/page.tsx` — add top 10 sidebar widget
- `components/Navbar.tsx` — add "Leaderboard" nav link
