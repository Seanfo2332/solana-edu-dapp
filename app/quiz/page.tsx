'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import WalletGate from '@/components/quiz/WalletGate';
import ModuleCard from '@/components/quiz/ModuleCard';
import { useQuizProgress } from '@/contexts/QuizProgressContext';
import { MODULES } from '@/lib/quiz/data';

export default function QuizPage() {
  return (
    <WalletGate>
      <QuizContent />
    </WalletGate>
  );
}

function QuizContent() {
  const { completedCount, isModuleUnlocked, isModulePassed, getModuleScore } =
    useQuizProgress();

  const progressPercent = (completedCount / 5) * 100;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden pt-28">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-20 -left-40 w-80 h-80 bg-sol-green/[0.03] rounded-full blur-[100px] animate-pulse-glow" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sol-purple/[0.04] rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-24">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sol-green transition-colors"
          >
            <motion.span className="inline-block" whileHover={{ x: -3 }}>
              &larr;
            </motion.span>
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-10 h-10 rounded-xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sol-green">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </motion.div>
            <p className="text-[10px] uppercase tracking-widest text-sol-green/60 font-semibold">
              Learning Path
            </p>
          </div>

          <h1 className="text-4xl font-bold mb-3 text-white">
            Beginner Quiz Modules
          </h1>
          <p className="text-gray-500 max-w-xl leading-relaxed">
            Complete all 5 modules to master the basics of blockchain and Solana.
            Each module requires 4/5 correct answers to pass.
          </p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 gradient-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Overall Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-sol-green">{completedCount}</span>
                <span className="text-sm text-gray-600">/</span>
                <span className="text-sm text-gray-500">5 Modules</span>
              </div>
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-sol-green to-sol-blue relative"
              >
                {progressPercent > 0 && (
                  <div className="absolute inset-0 animate-shimmer rounded-full" />
                )}
              </motion.div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {MODULES.map((mod, i) => (
                <div key={mod.id} className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                      isModulePassed(mod.id)
                        ? 'bg-sol-green'
                        : isModuleUnlocked(mod.id)
                        ? 'bg-sol-purple/60'
                        : 'bg-white/[0.08]'
                    }`}
                  />
                  <span className="text-[10px] text-gray-600">{i + 1}</span>
                  {i < MODULES.length - 1 && (
                    <div className={`w-4 h-px ${isModulePassed(mod.id) ? 'bg-sol-green/30' : 'bg-white/[0.06]'}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Module Grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              index={i}
              unlocked={isModuleUnlocked(mod.id)}
              passed={isModulePassed(mod.id)}
              score={getModuleScore(mod.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
