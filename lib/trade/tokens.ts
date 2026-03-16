export interface Token {
  symbol: string;
  name: string;
  color: string;
  icon: string; // emoji fallback
}

export const TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', color: '#9945FF', icon: '\u25CE' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA', icon: '$' },
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', icon: '\u20BF' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', icon: '\u039E' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', icon: '\u25C6' },
  { symbol: 'XRP', name: 'XRP', color: '#23292F', icon: '\u2718' },
  { symbol: 'DOGE', name: 'Dogecoin', color: '#C2A633', icon: '\u00D0' },
];

export const TOKEN_MAP = Object.fromEntries(TOKENS.map((t) => [t.symbol, t]));

export const STARTING_BALANCE: Record<string, number> = {
  SOL: 0,
  USDC: 10000,
  BTC: 0,
  ETH: 0,
  BNB: 0,
  XRP: 0,
  DOGE: 0,
};

export const DEFAULT_SYMBOLS = TOKENS.map((t) => t.symbol);

export function symbolToColor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export function createTokenFromSymbol(symbol: string): Token {
  const existing = TOKEN_MAP[symbol];
  if (existing) return existing;
  return {
    symbol,
    name: symbol,
    color: symbolToColor(symbol),
    icon: symbol.charAt(0),
  };
}
