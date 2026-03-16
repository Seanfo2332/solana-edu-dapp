'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function TradingGuidePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-sol-green/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-sol-purple/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 space-y-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Link
            href="/learn"
            className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sol-green transition-colors"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            Back to Learn
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-green" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 5-9" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trading Guide</h1>
              <p className="text-gray-500 text-sm">Learn to read charts and trade like a pro</p>
            </div>
          </div>
        </motion.div>

        {/* Section 1: Candlestick Charts */}
        <Section className="space-y-6">
          <motion.div variants={fadeUp} className="space-y-2">
            <SectionBadge color="green">Fundamentals</SectionBadge>
            <h2 className="text-2xl font-bold">Reading Candlestick Charts</h2>
            <p className="text-gray-400 leading-relaxed">
              Candlestick charts are the most popular way to visualize price data. Each candle represents a specific time period and tells you four things about the price.
            </p>
          </motion.div>

          {/* Candle Anatomy Diagram */}
          <motion.div variants={fadeUp} className="gradient-border p-6 sm:p-8 bg-[var(--card)]">
            <div className="grid sm:grid-cols-2 gap-8 items-center">
              {/* Visual Candle */}
              <div className="flex justify-center gap-12">
                {/* Bullish candle */}
                <div className="flex flex-col items-center gap-2">
                  <svg width="60" height="160" viewBox="0 0 60 160">
                    {/* Upper wick */}
                    <line x1="30" y1="10" x2="30" y2="45" stroke="#22c55e" strokeWidth="2" />
                    {/* Body */}
                    <rect x="10" y="45" width="40" height="60" rx="3" fill="#22c55e" fillOpacity="0.3" stroke="#22c55e" strokeWidth="2" />
                    {/* Lower wick */}
                    <line x1="30" y1="105" x2="30" y2="145" stroke="#22c55e" strokeWidth="2" />
                    {/* Labels */}
                    <text x="55" y="14" fill="#6b7280" fontSize="8" textAnchor="start">High</text>
                    <text x="55" y="50" fill="#22c55e" fontSize="8" textAnchor="start">Close</text>
                    <text x="55" y="108" fill="#22c55e" fontSize="8" textAnchor="start">Open</text>
                    <text x="55" y="148" fill="#6b7280" fontSize="8" textAnchor="start">Low</text>
                  </svg>
                  <span className="text-xs font-semibold text-green-400">Bullish (Up)</span>
                </div>
                {/* Bearish candle */}
                <div className="flex flex-col items-center gap-2">
                  <svg width="60" height="160" viewBox="0 0 60 160">
                    <line x1="30" y1="10" x2="30" y2="45" stroke="#ef4444" strokeWidth="2" />
                    <rect x="10" y="45" width="40" height="60" rx="3" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="2" />
                    <line x1="30" y1="105" x2="30" y2="145" stroke="#ef4444" strokeWidth="2" />
                    <text x="55" y="14" fill="#6b7280" fontSize="8" textAnchor="start">High</text>
                    <text x="55" y="50" fill="#ef4444" fontSize="8" textAnchor="start">Open</text>
                    <text x="55" y="108" fill="#ef4444" fontSize="8" textAnchor="start">Close</text>
                    <text x="55" y="148" fill="#6b7280" fontSize="8" textAnchor="start">Low</text>
                  </svg>
                  <span className="text-xs font-semibold text-red-400">Bearish (Down)</span>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-3">
                <InfoRow icon="🟩" title="Green Candle (Bullish)" text="Price closed higher than it opened. Buyers were in control." />
                <InfoRow icon="🟥" title="Red Candle (Bearish)" text="Price closed lower than it opened. Sellers dominated." />
                <InfoRow icon="📊" title="The Body" text="The thick part shows the range between open and close. A big body means strong momentum." />
                <InfoRow icon="📏" title="The Wicks" text="The thin lines (wicks) show the highest and lowest prices reached. Long wicks mean price was rejected at those levels." />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="gradient-border p-5 bg-[var(--card)]">
            <h3 className="text-sm font-semibold text-sol-green mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              A candle with a very small body and long wicks (called a &quot;doji&quot;) signals indecision in the market. It often appears before a reversal. Watch for these at the top or bottom of trends.
            </p>
          </motion.div>
        </Section>

        {/* Section 2: Timeframes */}
        <Section className="space-y-6">
          <motion.div variants={fadeUp} className="space-y-2">
            <SectionBadge color="purple">Strategy</SectionBadge>
            <h2 className="text-2xl font-bold">Understanding Timeframes</h2>
            <p className="text-gray-400 leading-relaxed">
              The timeframe you choose changes how you see the market. Each candle represents a different period depending on your selection.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
            <TimeframeCard
              range="1D"
              title="1 Day"
              description="See minute-by-minute price action. Best for active day traders watching short-term moves."
              use="Quick entries and exits"
            />
            <TimeframeCard
              range="7D"
              title="7 Days"
              description="Hourly candles over a week. Great for spotting swing trade setups and short-term trends."
              use="Swing trading"
            />
            <TimeframeCard
              range="1M"
              title="1 Month"
              description="Daily candles over a month. Shows medium-term trends and support/resistance levels."
              use="Position trading"
            />
            <TimeframeCard
              range="1Y"
              title="1 Year"
              description="Daily candles over a full year. Reveals major trends, cycles, and the big picture."
              use="Long-term investing"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="gradient-border p-5 bg-[var(--card)]">
            <h3 className="text-sm font-semibold text-sol-green mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Always check the bigger timeframe first. If the 1Y chart shows a downtrend, even a bullish signal on the 1D chart might be just a temporary bounce. Trade with the bigger trend, not against it.
            </p>
          </motion.div>
        </Section>

        {/* Section 3: Technical Indicators */}
        <Section className="space-y-6">
          <motion.div variants={fadeUp} className="space-y-2">
            <SectionBadge color="blue">Analysis</SectionBadge>
            <h2 className="text-2xl font-bold">Technical Indicators</h2>
            <p className="text-gray-400 leading-relaxed">
              Indicators are mathematical calculations overlaid on your chart. They help you confirm trends, spot reversals, and time your entries.
            </p>
          </motion.div>

          <div className="space-y-4">
            <motion.div variants={fadeUp}>
              <IndicatorCard
                name="SMA (Simple Moving Average)"
                color="#a855f7"
                what="Averages the closing price over 20 periods to smooth out noise."
                how="When price is above the SMA, the trend is up. Below = trend is down. The SMA line acts as dynamic support or resistance."
                signal="Price crossing above the SMA can be a buy signal. Crossing below can be a sell signal."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <IndicatorCard
                name="EMA (Exponential Moving Average)"
                color="#06b6d4"
                what="Like SMA but gives more weight to recent prices, making it faster to react."
                how="When EMA turns upward, momentum is building. A fast EMA crossing above a slow EMA is a classic buy signal."
                signal="EMA reacts faster than SMA to price changes — good for catching trend shifts early."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <IndicatorCard
                name="Bollinger Bands"
                color="#f59e0b"
                what="Three lines: a middle SMA with upper and lower bands 2 standard deviations away."
                how="Bands widen when volatility increases, narrow when it decreases. Price tends to stay within the bands."
                signal="Price touching the upper band may be overbought. Touching the lower band may be oversold. A 'squeeze' (narrow bands) often precedes a big move."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <IndicatorCard
                name="RSI (Relative Strength Index)"
                color="#3b82f6"
                what="Measures speed and magnitude of price changes on a 0-100 scale."
                how="Shown in a separate panel below the chart. Oscillates between overbought and oversold zones."
                signal="Above 70 = overbought (price may drop). Below 30 = oversold (price may rise). Divergence between RSI and price is a strong reversal signal."
              />
            </motion.div>
            <motion.div variants={fadeUp}>
              <IndicatorCard
                name="MACD"
                color="#10b981"
                what="Shows the relationship between two moving averages of price."
                how="Has a MACD line, signal line, and histogram. Shown in a panel below the chart."
                signal="MACD crossing above the signal line = bullish. Crossing below = bearish. The histogram shows the strength of the signal."
              />
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="gradient-border p-5 bg-[var(--card)]">
            <h3 className="text-sm font-semibold text-sol-green mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Never rely on a single indicator. Use 2-3 indicators together for confirmation. For example: if RSI shows oversold AND price is bouncing off the lower Bollinger Band AND MACD is crossing bullish — that&apos;s a much stronger signal than any one alone.
            </p>
          </motion.div>
        </Section>

        {/* Section 4: Trading Basics */}
        <Section className="space-y-6">
          <motion.div variants={fadeUp} className="space-y-2">
            <SectionBadge color="green">Essentials</SectionBadge>
            <h2 className="text-2xl font-bold">Trading Basics</h2>
            <p className="text-gray-400 leading-relaxed">
              Before you start placing trades, understand these core concepts.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
            <BasicCard
              icon={<BuyIcon />}
              title="Buying (Going Long)"
              text="You buy a token expecting its price to rise. You profit when you sell it later at a higher price. On our simulator, you spend USDC to buy tokens."
            />
            <BasicCard
              icon={<SellIcon />}
              title="Selling"
              text="Convert your tokens back to USDC. Sell when you've hit your profit target, or to cut losses. Don't hold onto losing positions hoping they'll recover."
            />
            <BasicCard
              icon={<PercentIcon />}
              title="Position Sizing"
              text="Use the 25%, 50%, 75%, MAX buttons to control how much you trade. Never go all-in on one trade. Start with small positions (10-25%) until you're confident."
            />
            <BasicCard
              icon={<ShieldIcon />}
              title="Risk Management"
              text="The #1 rule: protect your capital. Never risk more than you can afford to lose. In our simulator, you start with $10,000 — treat it like real money to build good habits."
            />
          </motion.div>
        </Section>

        {/* Section 5: Tips & Strategies */}
        <Section className="space-y-6">
          <motion.div variants={fadeUp} className="space-y-2">
            <SectionBadge color="purple">Wisdom</SectionBadge>
            <h2 className="text-2xl font-bold">Tips for Better Trading</h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { num: '01', title: 'Have a plan before you trade', text: 'Decide your entry price, target profit, and maximum loss BEFORE you click buy. Trading on impulse is gambling.' },
              { num: '02', title: 'Don\'t chase green candles', text: 'When you see a token pumping, resist the urge to FOMO in. The best entries are when price pulls back to a support level, not when it\'s already up 20%.' },
              { num: '03', title: 'Check the bigger timeframe', text: 'Always zoom out. A coin might look bullish on the 1D chart but bearish on the 1M chart. Trade in the direction of the bigger trend.' },
              { num: '04', title: 'Use multiple indicators', text: 'One indicator saying "buy" isn\'t enough. Wait for 2-3 confirmations. RSI oversold + MACD crossing + bouncing off support = strong signal.' },
              { num: '05', title: 'Keep a trading journal', text: 'Track every trade: what you bought, why, and the result. Review your wins and losses weekly. Patterns in your behavior will emerge.' },
              { num: '06', title: 'Manage your emotions', text: 'Fear and greed are your biggest enemies. If you just took a big loss, step away. Don\'t "revenge trade" to make it back immediately.' },
              { num: '07', title: 'Start small, learn big', text: 'That\'s exactly why you\'re here. Use this simulator to make mistakes, learn from them, and build your strategy without risking real money.' },
            ].map((tip) => (
              <motion.div
                key={tip.num}
                variants={fadeUp}
                className="gradient-border p-5 bg-[var(--card)] flex gap-4"
              >
                <span className="text-2xl font-extrabold text-white/[0.06] shrink-0 w-8">{tip.num}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section className="space-y-6">
          <motion.div
            variants={fadeUp}
            className="gradient-border p-8 sm:p-10 bg-[var(--card)] text-center space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-green" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Ready to Practice?</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Apply what you&apos;ve learned with $10,000 in simulated funds. Real prices, real charts, zero risk.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-sol-green/90 hover:bg-sol-green text-black font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-sol-green/15 hover:shadow-sol-green/25"
            >
              Open Trading Simulator
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                &rarr;
              </motion.span>
            </Link>
          </motion.div>
        </Section>
      </div>
    </main>
  );
}

// ─── Sub-components ───

function SectionBadge({ children, color }: { children: React.ReactNode; color: 'green' | 'purple' | 'blue' }) {
  const colors = {
    green: 'text-sol-green bg-sol-green/10 border-sol-green/20',
    purple: 'text-sol-purple bg-sol-purple/10 border-sol-purple/20',
    blue: 'text-sol-blue bg-sol-blue/10 border-sol-blue/20',
  };
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}

function InfoRow({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TimeframeCard({ range, title, description, use }: { range: string; title: string; description: string; use: string }) {
  return (
    <div className="gradient-border p-5 bg-[var(--card)] space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-sol-green bg-sol-green/10 px-2.5 py-1 rounded-lg border border-sol-green/20">
          {range}
        </span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
      <p className="text-[11px] text-gray-600">Best for: {use}</p>
    </div>
  );
}

function IndicatorCard({ name, color, what, how, signal }: { name: string; color: string; what: string; how: string; signal: string }) {
  return (
    <div className="gradient-border p-5 bg-[var(--card)] space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-bold text-white">{name}</h3>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">What it does</p>
          <p className="text-xs text-gray-400 leading-relaxed">{what}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">How to read it</p>
          <p className="text-xs text-gray-400 leading-relaxed">{how}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Trading signal</p>
          <p className="text-xs text-gray-400 leading-relaxed">{signal}</p>
        </div>
      </div>
    </div>
  );
}

function BasicCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="gradient-border p-5 bg-[var(--card)] space-y-3">
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sol-green">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
    </div>
  );
}

function BuyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function SellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
