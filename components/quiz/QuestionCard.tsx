'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/lib/quiz/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedIndex: number) => void;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === question.correctAnswer;

  function handleSelect(index: number) {
    if (answered) return;
    setSelected(index);
    onAnswer(index);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Question type badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="inline-flex items-center text-[10px] uppercase tracking-widest font-semibold text-sol-green/60 bg-sol-green/5 border border-sol-green/10 rounded-full px-3 py-1">
          {question.type === 'truefalse' ? 'True or False' : 'Multiple Choice'}
        </span>
      </motion.div>

      {/* Question text */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-xl font-semibold text-white leading-relaxed"
      >
        {question.question}
      </motion.h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isThisCorrect = i === question.correctAnswer;
          const isThisSelected = i === selected;

          let borderClass = 'border-white/[0.06] hover:border-sol-green/20';
          let bgClass = 'bg-white/[0.02]';
          let labelBg = 'bg-white/[0.06]';
          let labelText = 'text-gray-400';

          if (answered) {
            if (isThisCorrect) {
              borderClass = 'border-sol-green/40';
              bgClass = 'bg-sol-green/[0.04]';
              labelBg = 'bg-sol-green/15';
              labelText = 'text-sol-green';
            } else if (isThisSelected) {
              borderClass = 'border-red-500/40';
              bgClass = 'bg-red-500/[0.04]';
              labelBg = 'bg-red-500/15';
              labelText = 'text-red-400';
            } else {
              borderClass = 'border-white/[0.03]';
              bgClass = 'bg-white/[0.01]';
              labelBg = 'bg-white/[0.03]';
              labelText = 'text-gray-600';
            }
          }

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              whileHover={!answered ? { scale: 1.01, x: 4 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${borderClass} ${bgClass} ${
                !answered ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Option label */}
                <motion.span
                  animate={
                    answered && isThisCorrect
                      ? { scale: [1, 1.2, 1] }
                      : answered && isThisSelected && !isThisCorrect
                      ? { x: [0, -3, 3, -2, 2, 0] }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${labelBg} ${labelText} transition-colors duration-300`}
                >
                  {answered && isThisCorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : answered && isThisSelected && !isThisCorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    optionLabels[i]
                  )}
                </motion.span>

                {/* Option text */}
                <span className={`text-sm leading-relaxed pt-1 ${
                  answered
                    ? isThisCorrect
                      ? 'text-sol-green'
                      : isThisSelected
                      ? 'text-red-300'
                      : 'text-gray-600'
                    : 'text-gray-300'
                } transition-colors duration-300`}>
                  {option}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className={`rounded-xl border p-5 ${
                isCorrect
                  ? 'bg-sol-green/[0.04] border-sol-green/20'
                  : 'bg-amber-500/[0.04] border-amber-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                  className="text-base"
                >
                  {isCorrect ? '✅' : '💡'}
                </motion.span>
                <p className={`text-sm font-semibold ${isCorrect ? 'text-sol-green' : 'text-amber-400'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite — here\'s why:'}
                </p>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed pl-7">
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
