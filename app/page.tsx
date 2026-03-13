'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import NarrativeSidebar from '../components/NarrativeSidebar';
import LeaderboardWidget from '../components/LeaderboardWidget';

// ─── Stagger animation variants ───
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const wordReveal = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sol-green/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sol-purple/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-8">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                {/* Tag */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="inline-flex items-center gap-2 bg-sol-green/[0.08] border border-sol-green/20 rounded-full px-4 py-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sol-green animate-breathe" />
                  <span className="text-sol-green text-xs font-semibold tracking-wide uppercase">
                    Live on Solana Devnet
                  </span>
                </motion.div>

                {/* Headline — word-by-word reveal */}
                <motion.h1
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight"
                >
                  {['Learn.', 'Trade.', 'Master', 'DeFi.'].map((word, i) => (
                    <motion.span
                      key={i}
                      variants={wordReveal}
                      className={`inline-block mr-3 ${
                        i === 0
                          ? 'text-sol-green text-glow-green'
                          : i === 1
                          ? 'text-sol-purple text-glow-purple'
                          : 'text-white'
                      }`}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h1>

                {/* Sub-headline */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-lg text-gray-400 max-w-xl leading-relaxed"
                >
                  A risk-free trading simulator and education platform built on Solana.
                  Connect your wallet, complete quizzes, and trade with $10k in simulated funds.
                </motion.p>
              </div>

              {/* Feature Cards */}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-3 gap-4"
                style={{ '--stagger-delay': '0.6s' } as React.CSSProperties}
              >
                <FeatureCard
                  title="Zero Risk"
                  description="Free Devnet SOL. No real money. Practice without consequences."
                  icon={<ShieldIcon />}
                  accent="green"
                  delay={0.6}
                />
                <FeatureCard
                  title="Real Markets"
                  description="Live Binance prices. Real charts. Professional trading tools."
                  icon={<ChartIcon />}
                  accent="purple"
                  delay={0.7}
                />
                <FeatureCard
                  title="Earn Knowledge"
                  description="5 progressive modules. Quiz your way to blockchain mastery."
                  icon={<BoltIcon />}
                  accent="blue"
                  delay={0.8}
                />
              </motion.div>

            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              <NarrativeSidebar />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Top Traders */}
      <LeaderboardSection />
    </main>
  );
}

// ─── Feature Card ───
function FeatureCard({
  title,
  description,
  icon,
  accent,
  delay,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: 'green' | 'purple' | 'blue';
  delay: number;
}) {
  const colors = {
    green: { bg: 'bg-sol-green/[0.08]', border: 'border-sol-green/10', text: 'text-sol-green', glow: 'group-hover:shadow-[0_0_24px_rgba(20,241,149,0.08)]' },
    purple: { bg: 'bg-sol-purple/[0.08]', border: 'border-sol-purple/10', text: 'text-sol-purple', glow: 'group-hover:shadow-[0_0_24px_rgba(153,69,255,0.08)]' },
    blue: { bg: 'bg-sol-blue/[0.08]', border: 'border-sol-blue/10', text: 'text-sol-blue', glow: 'group-hover:shadow-[0_0_24px_rgba(0,209,255,0.08)]' },
  };
  const c = colors[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group gradient-border p-5 cursor-default transition-shadow duration-500 ${c.glow}`}
    >
      <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 ${c.text}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-1.5 text-sm">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Stats Section ───
function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const stats = [
    { value: '$10,000', label: 'Starting Balance', sub: 'Simulated USDC' },
    { value: '5', label: 'Quiz Modules', sub: 'Progressive Learning' },
    { value: 'Real-time', label: 'Market Data', sub: 'Binance Price Feed' },
    { value: 'Free', label: 'Devnet SOL', sub: 'Zero Cost to Learn' },
  ];

  return (
    <section ref={ref} className="relative max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-2"
          >
            <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm font-medium text-sol-green">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

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

// ─── SVG Icons ───
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 5-9" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
