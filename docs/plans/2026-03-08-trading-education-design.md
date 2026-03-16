# Trading Education System Design

## Overview
Add contextual trading education to the platform: tooltips on the trade page explaining each component, plus a dedicated `/learn/trading` page with visual lessons on chart reading, indicators, and trading fundamentals.

## Part 1: Trade Page Tooltips

Reusable `<HintTooltip text="..." />` component — renders a `?` icon with a popover on hover/click.

| Component | Hint |
|-----------|------|
| Price Chart | Candlestick chart basics: green = up, red = down, body = open/close, wicks = high/low |
| Indicator Toolbar | Per-indicator: SMA, EMA, Bollinger, RSI, MACD explanations |
| Trading Panel | How to enter amounts, use % buttons, execute trades |
| Market Pairs | Token selection, live prices from Binance |
| Portfolio | Holdings, P&L, total value explanation |

## Part 2: Learn Trading Page (`/learn/trading`)

Scrollable visual education page with sections:

1. **Reading Candlestick Charts** — SVG diagram of candle anatomy
2. **Understanding Timeframes** — When to use 1D/7D/1M/3M/1Y
3. **Technical Indicators Guide** — Cards for SMA, EMA, Bollinger, RSI, MACD
4. **Trading Basics** — Buy/sell, position sizing, risk management
5. **Tips & Strategies** — Common mistakes, support/resistance, trend following
6. **CTA** — Link to `/trade`

## Part 3: Navigation Update

Add `/learn` hub page with cards linking to Quiz Modules (`/quiz`) and Trading Guide (`/learn/trading`). Update navbar "Learn" link to point to `/learn`.

## Design System
Uses existing: gradient-border cards, sol-green/purple/blue accents, framer-motion scroll animations, dot-grid backgrounds, dark theme (#0a0a0f).
