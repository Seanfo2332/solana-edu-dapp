# Trading Simulator Design

## Overview
Token swap simulator with real CoinGecko prices, localStorage persistence, and Next.js API route for price caching.

## Pages
- `/trade` — Main swap interface + portfolio overview
- `/trade/history` — Full transaction history

## Components
1. **SwapCard** — Token pair selector, amount input, price display, "Swap" button
2. **PortfolioPanel** — Current holdings with USD values
3. **TransactionHistory** — Table of past swaps with timestamps
4. **TokenSelector** — Dropdown with token icons

## API Routes
- `GET /api/prices` — Proxies CoinGecko, caches prices for 60s

## Tokens
SOL, USDC, BTC, ETH, BNB, XRP, DOGE

## Data Flow
1. Wallet connection required
2. Start with 10,000 simulated USDC
3. Pick From/To tokens, enter amount
4. Live prices via `/api/prices`
5. Swap updates localStorage balances
6. Portfolio panel shows holdings + total USD

## State
- TradeContext (React Context) for portfolio + history
- localStorage keyed by wallet public key

## Tech
- CoinGecko free API (`/api/v3/simple/price`)
- Next.js API route for caching
- Framer Motion animations
- Tailwind dark theme
