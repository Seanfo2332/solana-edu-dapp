'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { QuizModule } from '@/lib/quiz/types';

interface ModuleCardProps {
  module: QuizModule;
  index: number;
  unlocked: boolean;
  passed: boolean;
  score: number | null;
}

const MODULE_ICONS = [
  // Module 1-5: SVG line icons instead of emojis
  <svg key="1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>,
  <svg key="2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>,
  <svg key="3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  <svg key="4" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  <svg key="5" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
];

export default function ModuleCard({
  module,
  index,
  unlocked,
  passed,
  score,
}: ModuleCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={unlocked ? { y: -4, scale: 1.01 } : {}}
      whileTap={unlocked ? { scale: 0.98 } : {}}
      className={`group relative transition-shadow duration-500 ${
        unlocked
          ? passed
            ? 'glow-green'
            : 'hover:glow-purple'
          : ''
      } ${passed ? 'gradient-border' : unlocked ? 'gradient-border-purple' : ''}`}
    >
      <div
        className={`relative rounded-2xl p-6 h-full transition-all duration-300 ${
          !passed && !unlocked
            ? 'bg-[var(--card)] border border-white/[0.04] opacity-50'
            : passed
            ? 'bg-[var(--card)]'
            : 'bg-[var(--card)]'
        }`}
      >
        {/* Status badge */}
        <div className="absolute top-5 right-5">
          {passed ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: index * 0.1 + 0.3 }}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-sol-green/10 text-sol-green px-2.5 py-1 rounded-full border border-sol-green/20"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Passed
            </motion.span>
          ) : !unlocked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/[0.03] text-gray-500 px-2.5 py-1 rounded-full border border-white/[0.04]">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-sol-green/60 px-2.5 py-1">
              Ready
            </span>
          )}
        </div>

        {/* Module icon */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
              passed
                ? 'bg-sol-green/10 text-sol-green border border-sol-green/20'
                : unlocked
                ? 'bg-sol-purple/10 text-sol-purple border border-sol-purple/20 group-hover:bg-sol-purple/15'
                : 'bg-white/[0.04] text-gray-600 border border-white/[0.04]'
            } transition-colors duration-300`}
          >
            {MODULE_ICONS[index] ?? MODULE_ICONS[0]}
          </div>
          <span className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
            Module {index + 1}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="text-lg font-bold text-white mb-2 leading-snug">
          {module.title}
        </h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          {module.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    score !== null && i < score
                      ? passed
                        ? 'bg-sol-green'
                        : 'bg-yellow-400'
                      : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>
            <span>5 questions</span>
          </div>

          {score !== null && (
            <span className={`text-xs font-semibold ${passed ? 'text-sol-green' : 'text-yellow-400'}`}>
              Best: {score}/5
            </span>
          )}

          {!unlocked && (
            <span className="text-[11px] text-gray-600">
              Pass Module {index} first
            </span>
          )}

          {unlocked && !passed && score === null && (
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-sol-green text-xs font-medium"
            >
              Start &rarr;
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (!unlocked) return card;

  return <Link href={`/quiz/${module.id}`}>{card}</Link>;
}
