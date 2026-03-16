'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { QuizModule } from '@/lib/quiz/types';
import { MODULES } from '@/lib/quiz/data';

interface QuizResultsProps {
  module: QuizModule;
  score: number;
  passed: boolean;
  onRetry: () => void;
}

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#14F195', '#9945FF', '#00D1FF', '#facc15', '#f472b6'][
          Math.floor(Math.random() * 5)
        ],
        size: Math.random() * 6 + 4,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-particle"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function AnimatedScore({ target, total }: { target: number; total: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    let current = 0;
    const step = () => {
      current++;
      setCount(current);
      if (current < target) {
        setTimeout(step, 200);
      }
    };
    const timeout = setTimeout(step, 600);
    return () => clearTimeout(timeout);
  }, [target]);

  const circumference = 2 * Math.PI * 45;
  const strokeOffset = circumference - (count / total) * circumference;

  return (
    <div className="relative mx-auto w-40 h-40 flex items-center justify-center">
      {/* Background ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="rgba(75, 85, 99, 0.2)"
          strokeWidth="6"
        />
        <motion.circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14F195" />
            <stop offset="100%" stopColor="#00D1FF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Score number */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
        className="text-center"
      >
        <span className="text-5xl font-bold text-white">{count}</span>
        <span className="text-xl text-gray-500">/{total}</span>
      </motion.div>
    </div>
  );
}

export default function QuizResults({
  module,
  score,
  passed,
  onRetry,
}: QuizResultsProps) {
  const moduleIndex = MODULES.findIndex((m) => m.id === module.id);
  const nextModule = MODULES[moduleIndex + 1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative max-w-lg mx-auto text-center space-y-8 py-8"
    >
      {/* Confetti for passing */}
      {passed && <Confetti />}

      {/* Background glow */}
      <div
        className={`absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] opacity-30 ${
          passed ? 'bg-sol-green' : 'bg-red-500'
        }`}
      />

      {/* Animated score ring */}
      <div className="relative">
        <AnimatedScore target={score} total={module.questions.length} />
      </div>

      {/* Result message */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative space-y-3"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.8 }}
          className="text-4xl"
        >
          {passed ? '🎉' : '📚'}
        </motion.div>

        <h2 className="text-3xl font-bold text-white">
          {passed ? 'Module Passed!' : 'Keep Learning!'}
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
          {passed
            ? `Excellent work! You mastered "${module.title}" with a score of ${score}/${module.questions.length}.`
            : `You need ${module.passingScore}/${module.questions.length} to pass. Review the material and give it another shot!`}
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="relative space-y-3 pt-2"
      >
        {passed && nextModule ? (
          <Link
            href={`/quiz/${nextModule.id}`}
            className="group block w-full relative overflow-hidden bg-sol-green/90 hover:bg-sol-green text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-sol-green/15 hover:shadow-sol-green/25"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Continue to: {nextModule.title}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </span>
          </Link>
        ) : passed ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="gradient-border p-6 bg-[var(--card)]"
          >
            <p className="text-sol-green font-bold text-lg mb-1">
              All Modules Complete!
            </p>
            <p className="text-gray-400 text-sm">
              You&apos;ve mastered the fundamentals. Congratulations!
            </p>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRetry}
            className="w-full bg-sol-green/90 hover:bg-sol-green text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-sol-green/15"
          >
            Retry Module
          </motion.button>
        )}

        <Link
          href="/quiz"
          className="block w-full text-center bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-gray-400 hover:text-gray-300 font-medium py-3.5 px-6 rounded-xl transition-all duration-300"
        >
          Back to Module Selection
        </Link>
      </motion.div>
    </motion.div>
  );
}
