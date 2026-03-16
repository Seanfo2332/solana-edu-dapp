'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  TOKENS,
  STARTING_BALANCE,
  DEFAULT_SYMBOLS,
  createTokenFromSymbol,
  type Token,
} from '@/lib/trade/tokens';

const CUSTOM_TOKENS_KEY = 'solana-edu-custom-tokens';

export interface Transaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  price: number; // USD price of "from" token at time of swap
  timestamp: number;
}

interface TradeState {
  balances: Record<string, number>;
  transactions: Transaction[];
  prices: Record<string, number>;
  pricesLoading: boolean;
  activeTokens: Token[];
  executeSwap: (
    fromToken: string,
    toToken: string,
    fromAmount: number,
    prices: Record<string, number>
  ) => Promise<boolean>;
  refreshPrices: () => Promise<void>;
  resetPortfolio: () => void;
  addToken: (symbol: string) => Promise<void>;
  removeToken: (symbol: string) => void;
}

const TradeContext = createContext<TradeState | null>(null);

export function useTradeContext() {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTradeContext must be inside TradeProvider');
  return ctx;
}

function loadCustomTokens(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CUSTOM_TOKENS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomTokens(symbols: string[]) {
  try {
    localStorage.setItem(CUSTOM_TOKENS_KEY, JSON.stringify(symbols));
  } catch {
    // ignore storage errors
  }
}

export function TradeProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const walletKey = publicKey?.toBase58() ?? '';

  const [balances, setBalances] = useState<Record<string, number>>(STARTING_BALANCE);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const subscribedStreamsRef = useRef<Set<string>>(new Set());

  // Load custom tokens from localStorage on mount
  useEffect(() => {
    setCustomSymbols(loadCustomTokens());
  }, []);

  // Build activeTokens from defaults + custom
  const activeTokens: Token[] = [
    ...TOKENS,
    ...customSymbols.map(createTokenFromSymbol),
  ];

  // Get all non-USDC symbols that need WebSocket streams
  const activeSymbols = activeTokens
    .filter((t) => t.symbol !== 'USDC')
    .map((t) => t.symbol);

  // Load from database when wallet changes
  useEffect(() => {
    if (!walletKey) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/trades?wallet=${walletKey}`);
        if (!res.ok) throw new Error(`trades API ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setBalances(data.balances);
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Failed to load trades', err);
        if (!cancelled) {
          setBalances({ ...STARTING_BALANCE });
          setTransactions([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [walletKey]);

  const refreshPrices = useCallback(async () => {
    setPricesLoading(true);
    try {
      const res = await fetch('/api/prices');
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error('Failed to fetch prices', err);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // WebSocket management with dynamic subscribe/unsubscribe
  useEffect(() => {
    refreshPrices();

    const ws = new WebSocket('wss://stream.binance.com:9443/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      setPricesLoading(false);
      // Subscribe to all active streams
      const streams = activeSymbols.map((s) => `${s.toLowerCase()}usdt@trade`);
      if (streams.length > 0) {
        ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: streams, id: 1 }));
        subscribedStreamsRef.current = new Set(streams);
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        // Skip subscription confirmations
        if (msg.result === null || msg.id) return;

        const streamSymbol = (msg.s as string)?.toLowerCase();
        if (streamSymbol && msg.p) {
          const token = streamSymbol.replace('usdt', '').toUpperCase();
          const price = parseFloat(msg.p);
          setPrices((prev) => ({ ...prev, [token]: price, USDC: 1 }));
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      console.warn('Binance WebSocket failed, falling back to polling');
      const interval = setInterval(refreshPrices, 10_000);
      return () => clearInterval(interval);
    };

    return () => {
      ws.close();
      wsRef.current = null;
      subscribedStreamsRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPrices]);

  // When activeSymbols changes, subscribe/unsubscribe difference
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const desiredStreams = new Set(activeSymbols.map((s) => `${s.toLowerCase()}usdt@trade`));
    const currentStreams = subscribedStreamsRef.current;

    // Find new streams to subscribe
    const toSubscribe = [...desiredStreams].filter((s) => !currentStreams.has(s));
    // Find old streams to unsubscribe
    const toUnsubscribe = [...currentStreams].filter((s) => !desiredStreams.has(s));

    if (toSubscribe.length > 0) {
      ws.send(JSON.stringify({ method: 'SUBSCRIBE', params: toSubscribe, id: Date.now() }));
      toSubscribe.forEach((s) => currentStreams.add(s));
    }

    if (toUnsubscribe.length > 0) {
      ws.send(JSON.stringify({ method: 'UNSUBSCRIBE', params: toUnsubscribe, id: Date.now() }));
      toUnsubscribe.forEach((s) => currentStreams.delete(s));
    }
  }, [activeSymbols]);

  const addToken = useCallback(async (symbol: string) => {
    const upper = symbol.toUpperCase();
    if (DEFAULT_SYMBOLS.includes(upper) || customSymbols.includes(upper)) return;

    // Fetch current price from Binance
    try {
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${upper}USDT`
      );
      if (res.ok) {
        const data = await res.json();
        const price = parseFloat(data.price);
        setPrices((prev) => ({ ...prev, [upper]: price }));
      }
    } catch {
      // price will come from WebSocket soon
    }

    const updated = [...customSymbols, upper];
    setCustomSymbols(updated);
    saveCustomTokens(updated);

    // Ensure balance key exists
    setBalances((prev) => ({
      ...prev,
      [upper]: prev[upper] ?? 0,
    }));
  }, [customSymbols]);

  const removeToken = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase();
    if (DEFAULT_SYMBOLS.includes(upper)) return; // Can't remove defaults

    setCustomSymbols((prev) => {
      const updated = prev.filter((s) => s !== upper);
      saveCustomTokens(updated);
      return updated;
    });
  }, []);

  const executeSwap = useCallback(
    async (
      fromToken: string,
      toToken: string,
      fromAmount: number,
      currentPrices: Record<string, number>
    ): Promise<boolean> => {
      if (fromAmount <= 0) return false;
      if ((balances[fromToken] ?? 0) < fromAmount) return false;

      const fromPrice = currentPrices[fromToken];
      const toPrice = currentPrices[toToken];
      if (!fromPrice || !toPrice) return false;

      const usdValue = fromAmount * fromPrice;
      const toAmount = usdValue / toPrice;

      // Save to database
      try {
        const res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletKey,
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            price: fromPrice,
          }),
        });

        if (!res.ok) return false;

        const tx: Transaction = await res.json();

        // Update local state to match
        setBalances((prev) => ({
          ...prev,
          [fromToken]: (prev[fromToken] ?? 0) - fromAmount,
          [toToken]: (prev[toToken] ?? 0) + toAmount,
        }));

        setTransactions((prev) => [tx, ...prev]);
        return true;
      } catch (err) {
        console.error('Failed to save trade', err);
        return false;
      }
    },
    [balances, walletKey]
  );

  const resetPortfolio = useCallback(async () => {
    // Delete all trades for this wallet via API, then reset local state
    try {
      await fetch(`/api/trades?wallet=${walletKey}`, { method: 'DELETE' });
    } catch {
      // continue with local reset even if API fails
    }
    setBalances({ ...STARTING_BALANCE });
    setTransactions([]);
  }, [walletKey]);

  return (
    <TradeContext.Provider
      value={{
        balances,
        transactions,
        prices,
        pricesLoading,
        activeTokens,
        executeSwap,
        refreshPrices,
        resetPortfolio,
        addToken,
        removeToken,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}
