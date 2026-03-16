'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
} from 'lightweight-charts';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
} from '@/lib/trade/indicators';
import IndicatorToolbar from './IndicatorToolbar';
import HintTooltip from './HintTooltip';

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceChartProps {
  symbol: string;
}

const TIME_RANGES = [
  { label: '1D', days: '1' },
  { label: '7D', days: '7' },
  { label: '1M', days: '30' },
  { label: '3M', days: '90' },
  { label: '1Y', days: '365' },
];

export default function PriceChart({ symbol }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const candlesRef = useRef<CandleData[]>([]);

  // Indicator overlay series refs
  const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleRef = useRef<ISeriesApi<'Line'> | null>(null);

  // RSI sub-chart refs
  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiLowerRef = useRef<ISeriesApi<'Line'> | null>(null);

  // MACD sub-chart refs
  const macdChartRef = useRef<IChartApi | null>(null);
  const macdLineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdSignalRef = useRef<ISeriesApi<'Line'> | null>(null);
  const macdHistRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [days, setDays] = useState('7');
  const [loading, setLoading] = useState(true);
  const [lastPrice, setLastPrice] = useState<CandleData | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLivePrice(null);
  }, [symbol]);

  const updateIndicators = useCallback(
    (candles: CandleData[]) => {
      // SMA overlay
      if (smaSeriesRef.current) {
        if (activeIndicators.has('sma')) {
          const data = calculateSMA(candles, 20);
          smaSeriesRef.current.setData(data as any);
        } else {
          smaSeriesRef.current.setData([]);
        }
      }

      // EMA overlay
      if (emaSeriesRef.current) {
        if (activeIndicators.has('ema')) {
          const data = calculateEMA(candles, 20);
          emaSeriesRef.current.setData(data as any);
        } else {
          emaSeriesRef.current.setData([]);
        }
      }

      // Bollinger Bands overlay
      if (bbUpperRef.current && bbLowerRef.current && bbMiddleRef.current) {
        if (activeIndicators.has('bollinger')) {
          const bb = calculateBollingerBands(candles, 20, 2);
          bbUpperRef.current.setData(bb.map((b) => ({ time: b.time, value: b.upper })) as any);
          bbMiddleRef.current.setData(bb.map((b) => ({ time: b.time, value: b.middle })) as any);
          bbLowerRef.current.setData(bb.map((b) => ({ time: b.time, value: b.lower })) as any);
        } else {
          bbUpperRef.current.setData([]);
          bbMiddleRef.current.setData([]);
          bbLowerRef.current.setData([]);
        }
      }

      // RSI sub-chart
      if (rsiSeriesRef.current && rsiUpperRef.current && rsiLowerRef.current) {
        if (activeIndicators.has('rsi')) {
          const rsi = calculateRSI(candles, 14);
          rsiSeriesRef.current.setData(rsi as any);
          // Reference lines at 70 and 30
          if (rsi.length > 0) {
            const refLineData = [
              { time: rsi[0].time, value: 0 },
              ...rsi.map((r) => ({ time: r.time, value: 0 })),
            ];
            rsiUpperRef.current.setData(
              rsi.map((r) => ({ time: r.time, value: 70 })) as any
            );
            rsiLowerRef.current.setData(
              rsi.map((r) => ({ time: r.time, value: 30 })) as any
            );
          }
        } else {
          rsiSeriesRef.current.setData([]);
          rsiUpperRef.current.setData([]);
          rsiLowerRef.current.setData([]);
        }
      }

      // MACD sub-chart
      if (macdLineRef.current && macdSignalRef.current && macdHistRef.current) {
        if (activeIndicators.has('macd')) {
          const macd = calculateMACD(candles);
          macdLineRef.current.setData(macd.map((m) => ({ time: m.time, value: m.macd })) as any);
          macdSignalRef.current.setData(
            macd.map((m) => ({ time: m.time, value: m.signal })) as any
          );
          macdHistRef.current.setData(
            macd.map((m) => ({
              time: m.time,
              value: m.histogram,
              color: m.histogram >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
            })) as any
          );
        } else {
          macdLineRef.current.setData([]);
          macdSignalRef.current.setData([]);
          macdHistRef.current.setData([]);
        }
      }
    },
    [activeIndicators]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prices/history?symbol=${symbol}&days=${days}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const candles: CandleData[] = await res.json();

      if (seriesRef.current && candles.length > 0) {
        candlesRef.current = candles;
        seriesRef.current.setData(candles as any);
        setLastPrice(candles[candles.length - 1]);
        updateIndicators(candles);
        chartRef.current?.timeScale().fitContent();
        rsiChartRef.current?.timeScale().fitContent();
        macdChartRef.current?.timeScale().fitContent();
      }
    } catch (err) {
      console.error('Chart data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, days, updateIndicators]);

  // Shared chart options for sub-panels
  const subChartOptions = {
    layout: {
      background: { type: ColorType.Solid as const, color: 'transparent' },
      textColor: '#6b7280',
      fontFamily: 'inherit',
    },
    grid: {
      vertLines: { color: 'rgba(107, 114, 128, 0.1)' },
      horzLines: { color: 'rgba(107, 114, 128, 0.1)' },
    },
    crosshair: {
      vertLine: { color: 'rgba(147, 51, 234, 0.3)', labelBackgroundColor: '#7c3aed' },
      horzLine: { color: 'rgba(147, 51, 234, 0.3)', labelBackgroundColor: '#7c3aed' },
    },
    timeScale: {
      borderColor: 'rgba(107, 114, 128, 0.2)',
      timeVisible: true,
      visible: false,
    },
    rightPriceScale: {
      borderColor: 'rgba(107, 114, 128, 0.2)',
    },
  };

  // Create main chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
        fontFamily: 'inherit',
      },
      grid: {
        vertLines: { color: 'rgba(107, 114, 128, 0.1)' },
        horzLines: { color: 'rgba(107, 114, 128, 0.1)' },
      },
      crosshair: {
        vertLine: { color: 'rgba(147, 51, 234, 0.3)', labelBackgroundColor: '#7c3aed' },
        horzLine: { color: 'rgba(147, 51, 234, 0.3)', labelBackgroundColor: '#7c3aed' },
      },
      timeScale: {
        borderColor: 'rgba(107, 114, 128, 0.2)',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(107, 114, 128, 0.2)',
      },
      width: containerRef.current.clientWidth,
      height: 400,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Add indicator overlay series to main chart
    const smaSeries = chart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const emaSeries = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const bbUpper = chart.addSeries(LineSeries, {
      color: 'rgba(245, 158, 11, 0.6)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const bbMiddle = chart.addSeries(LineSeries, {
      color: 'rgba(245, 158, 11, 0.3)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const bbLower = chart.addSeries(LineSeries, {
      color: 'rgba(245, 158, 11, 0.6)',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;
    smaSeriesRef.current = smaSeries;
    emaSeriesRef.current = emaSeries;
    bbUpperRef.current = bbUpper;
    bbMiddleRef.current = bbMiddle;
    bbLowerRef.current = bbLower;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      smaSeriesRef.current = null;
      emaSeriesRef.current = null;
      bbUpperRef.current = null;
      bbMiddleRef.current = null;
      bbLowerRef.current = null;
    };
  }, []);

  // Create RSI sub-chart
  useEffect(() => {
    if (!rsiContainerRef.current || !activeIndicators.has('rsi')) return;

    const chart = createChart(rsiContainerRef.current, {
      ...subChartOptions,
      width: rsiContainerRef.current.clientWidth,
      height: 100,
    });

    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const upperLine = chart.addSeries(LineSeries, {
      color: 'rgba(239, 68, 68, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const lowerLine = chart.addSeries(LineSeries, {
      color: 'rgba(34, 197, 94, 0.4)',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    rsiChartRef.current = chart;
    rsiSeriesRef.current = rsiSeries;
    rsiUpperRef.current = upperLine;
    rsiLowerRef.current = lowerLine;

    // Sync time scale with main chart
    const mainChart = chartRef.current;
    if (mainChart) {
      mainChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) chart.timeScale().setVisibleLogicalRange(range);
      });
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) mainChart.timeScale().setVisibleLogicalRange(range);
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(rsiContainerRef.current);

    // Populate with current data
    if (candlesRef.current.length > 0) {
      const rsi = calculateRSI(candlesRef.current, 14);
      rsiSeries.setData(rsi as any);
      if (rsi.length > 0) {
        upperLine.setData(rsi.map((r) => ({ time: r.time, value: 70 })) as any);
        lowerLine.setData(rsi.map((r) => ({ time: r.time, value: 30 })) as any);
      }
      chart.timeScale().fitContent();
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      rsiChartRef.current = null;
      rsiSeriesRef.current = null;
      rsiUpperRef.current = null;
      rsiLowerRef.current = null;
    };
  }, [activeIndicators.has('rsi')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Create MACD sub-chart
  useEffect(() => {
    if (!macdContainerRef.current || !activeIndicators.has('macd')) return;

    const chart = createChart(macdContainerRef.current, {
      ...subChartOptions,
      width: macdContainerRef.current.clientWidth,
      height: 120,
    });

    const macdLine = chart.addSeries(LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const signalLine = chart.addSeries(LineSeries, {
      color: '#ef4444',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const histSeries = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    });

    macdChartRef.current = chart;
    macdLineRef.current = macdLine;
    macdSignalRef.current = signalLine;
    macdHistRef.current = histSeries;

    // Sync time scale with main chart
    const mainChart = chartRef.current;
    if (mainChart) {
      mainChart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) chart.timeScale().setVisibleLogicalRange(range);
      });
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range) mainChart.timeScale().setVisibleLogicalRange(range);
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(macdContainerRef.current);

    // Populate with current data
    if (candlesRef.current.length > 0) {
      const macd = calculateMACD(candlesRef.current);
      macdLine.setData(macd.map((m) => ({ time: m.time, value: m.macd })) as any);
      signalLine.setData(macd.map((m) => ({ time: m.time, value: m.signal })) as any);
      histSeries.setData(
        macd.map((m) => ({
          time: m.time,
          value: m.histogram,
          color: m.histogram >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
        })) as any
      );
      chart.timeScale().fitContent();
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      macdChartRef.current = null;
      macdLineRef.current = null;
      macdSignalRef.current = null;
      macdHistRef.current = null;
    };
  }, [activeIndicators.has('macd')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data when symbol or timeframe changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Recalculate overlays when indicators toggle (for main chart overlays only)
  useEffect(() => {
    if (candlesRef.current.length > 0) {
      updateIndicators(candlesRef.current);
    }
  }, [activeIndicators, updateIndicators]);

  // Binance WebSocket for real-time chart updates
  useEffect(() => {
    const binanceSymbol = `${symbol.toLowerCase()}usdt`;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_1s`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const k = msg.k;
        if (!k) return;

        const price = parseFloat(k.c);
        setLivePrice(price);

        if (seriesRef.current) {
          const now = Math.floor(Date.now() / 1000);
          seriesRef.current.update({
            time: now as any,
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: price,
          });
        }
      } catch {
        // ignore
      }
    };

    return () => ws.close();
  }, [symbol]);

  const handleToggle = useCallback((id: string) => {
    setActiveIndicators((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const displayPrice = livePrice ?? lastPrice?.close ?? 0;
  const openPrice = lastPrice?.open ?? displayPrice;
  const priceChange = openPrice ? ((displayPrice - openPrice) / openPrice) * 100 : 0;

  const showRSI = activeIndicators.has('rsi');
  const showMACD = activeIndicators.has('macd');

  return (
    <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
      {/* Chart header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{symbol}/USD</h3>
              <HintTooltip text="This candlestick chart shows price movement over time. Green candles mean the price went up, red means it went down. The body shows the open and close price, while the thin wicks show the high and low." />
              {livePrice && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sol-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sol-green"></span>
                </span>
              )}
            </div>
            {displayPrice > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  ${displayPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-sm font-medium ${
                    priceChange >= 0 ? 'text-sol-green' : 'text-red-400'
                  }`}
                >
                  {priceChange >= 0 ? '+' : ''}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2">
        <HintTooltip text="Switch between timeframes: 1D for day trading, 7D for swing trades, 1M-1Y for longer trends. Shorter timeframes show more detail, longer ones reveal the bigger picture." />
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setDays(range.days)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                days === range.days
                  ? 'bg-sol-green/20 text-sol-green'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Indicator toolbar */}
      <IndicatorToolbar activeIndicators={activeIndicators} onToggle={handleToggle} />

      {/* Main chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/60 z-10">
            <div className="text-sm text-gray-400 animate-pulse">Loading chart...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* RSI sub-panel */}
      {showRSI && (
        <div className="border-t border-white/[0.06]">
          <div className="flex items-center px-3 py-1">
            <span className="text-[10px] text-gray-500">RSI (14)</span>
          </div>
          <div ref={rsiContainerRef} className="w-full" />
        </div>
      )}

      {/* MACD sub-panel */}
      {showMACD && (
        <div className="border-t border-white/[0.06]">
          <div className="flex items-center px-3 py-1">
            <span className="text-[10px] text-gray-500">MACD (12, 26, 9)</span>
          </div>
          <div ref={macdContainerRef} className="w-full" />
        </div>
      )}
    </div>
  );
}
