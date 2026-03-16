'use client';

import HintTooltip from './HintTooltip';

interface IndicatorToolbarProps {
  activeIndicators: Set<string>;
  onToggle: (indicator: string) => void;
}

const INDICATORS = [
  { id: 'sma', label: 'SMA (20)', color: '#a855f7', hint: 'Simple Moving Average: Smooths price data over 20 periods to show the trend direction. Price above SMA = bullish, below = bearish.' },
  { id: 'ema', label: 'EMA (20)', color: '#06b6d4', hint: 'Exponential Moving Average: Like SMA but reacts faster to recent price changes. Good for spotting trend shifts early.' },
  { id: 'bollinger', label: 'Bollinger', color: '#f59e0b', hint: 'Bollinger Bands: Shows volatility. When bands are wide, the market is volatile. Price touching the upper band may be overbought, lower band may be oversold.' },
  { id: 'rsi', label: 'RSI (14)', color: '#3b82f6', hint: 'Relative Strength Index: Measures momentum from 0-100. Above 70 = overbought (may drop), below 30 = oversold (may rise).' },
  { id: 'macd', label: 'MACD', color: '#10b981', hint: 'Moving Average Convergence Divergence: Shows trend momentum. When the MACD line crosses above the signal line, it\'s a bullish signal. Below = bearish.' },
];

export default function IndicatorToolbar({ activeIndicators, onToggle }: IndicatorToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-5 pb-3 flex-wrap">
      <div className="flex items-center gap-1.5 mr-1">
        <span className="text-xs text-gray-500">Indicators:</span>
        <HintTooltip text="Technical indicators help you analyze price patterns and predict future movements. Click any indicator to add it to your chart. Combine multiple for stronger signals." />
      </div>
      {INDICATORS.map((ind) => {
        const isActive = activeIndicators.has(ind.id);
        return (
          <div key={ind.id} className="flex items-center gap-1">
            <button
              onClick={() => onToggle(ind.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/[0.12]'
              }`}
              style={isActive ? { backgroundColor: ind.color + '33', borderColor: ind.color, color: ind.color } : {}}
            >
              {ind.label}
            </button>
            <HintTooltip text={ind.hint} />
          </div>
        );
      })}
    </div>
  );
}
