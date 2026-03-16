'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pt-28">
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sol-green/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-sol-purple/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-sol-green/[0.08] border border-sol-green/20 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sol-green animate-breathe" />
            <span className="text-sol-green text-xs font-semibold tracking-wide uppercase">
              Education Hub
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Learn <span className="text-sol-green text-glow-green">DeFi</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            Master blockchain fundamentals through quizzes, and learn professional trading skills with our interactive guide.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {/* Quiz Modules Card */}
          <motion.div variants={fadeUp}>
            <Link href="/quiz" className="group block">
              <div className="gradient-border p-6 bg-[var(--card)] space-y-4 h-full transition-shadow duration-500 group-hover:shadow-[0_0_30px_rgba(153,69,255,0.08)]">
                <div className="w-12 h-12 rounded-xl bg-sol-purple/10 border border-sol-purple/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-purple" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <path d="M9 10l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-sol-purple transition-colors">
                    Quiz Modules
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    5 progressive modules covering blockchain basics, wallets, keys, and DeFi concepts. Test your knowledge and earn mastery.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-gray-600">5 modules</span>
                  <span className="text-xs text-gray-700">&bull;</span>
                  <span className="text-xs text-gray-600">25 questions</span>
                  <span className="text-xs text-gray-700">&bull;</span>
                  <span className="text-xs text-gray-600">Progressive unlock</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-sol-purple font-semibold group-hover:gap-2 transition-all">
                  Start Learning
                  <span>&rarr;</span>
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Trading Guide Card */}
          <motion.div variants={fadeUp}>
            <Link href="/learn/trading" className="group block">
              <div className="gradient-border p-6 bg-[var(--card)] space-y-4 h-full transition-shadow duration-500 group-hover:shadow-[0_0_30px_rgba(20,241,149,0.08)]">
                <div className="w-12 h-12 rounded-xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-green" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-8 4 4 5-9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-sol-green transition-colors">
                    Trading Guide
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Learn to read candlestick charts, use technical indicators, understand timeframes, and build a trading strategy.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-gray-600">Charts</span>
                  <span className="text-xs text-gray-700">&bull;</span>
                  <span className="text-xs text-gray-600">5 indicators</span>
                  <span className="text-xs text-gray-700">&bull;</span>
                  <span className="text-xs text-gray-600">7 pro tips</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-sol-green font-semibold group-hover:gap-2 transition-all">
                  Read Guide
                  <span>&rarr;</span>
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
