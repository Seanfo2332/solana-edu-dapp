'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import WalletGate from '@/components/quiz/WalletGate';
import ProgressIndicator from '@/components/quiz/ProgressIndicator';
import QuestionCard from '@/components/quiz/QuestionCard';
import QuizResults from '@/components/quiz/QuizResults';
import { useQuizProgress } from '@/contexts/QuizProgressContext';
import { getModuleById } from '@/lib/quiz/data';

export default function QuizModulePage() {
  return (
    <WalletGate>
      <QuizModuleContent />
    </WalletGate>
  );
}

function QuizModuleContent() {
  const params = useParams<{ moduleId: string }>();
  const module = getModuleById(params.moduleId);
  const { saveModuleResult, isModuleUnlocked } = useQuizProgress();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [key, setKey] = useState(0);

  // Module not found
  if (!module) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-5xl">🔍</div>
          <h2 className="text-xl font-bold text-white">Module not found</h2>
          <Link
            href="/quiz"
            className="inline-block text-sol-green hover:text-sol-green/80 text-sm transition-colors"
          >
            ← Back to Module Selection
          </Link>
        </motion.div>
      </main>
    );
  }

  // Module locked
  if (!isModuleUnlocked(module.id)) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-sol-purple/[0.06] rounded-full blur-[80px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center space-y-5 gradient-border p-10 max-w-sm bg-[var(--card)]"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl"
          >
            🔒
          </motion.div>
          <h2 className="text-xl font-bold text-white">Module Locked</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Complete the previous module to unlock this one.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-sol-green hover:text-sol-green/80 text-sm transition-colors"
          >
            ← Back to Module Selection
          </Link>
        </motion.div>
      </main>
    );
  }

  const question = module.questions[currentQuestion];
  const totalQuestions = module.questions.length;

  function handleAnswer(selectedIndex: number) {
    setAnswers((prev) => [...prev, selectedIndex]);
    setAnswered(true);
  }

  function handleNext() {
    if (!module) return;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setAnswered(false);
      setKey((k) => k + 1);
    } else {
      const finalAnswers = answers;
      const score = finalAnswers.filter(
        (ans, i) => ans === module.questions[i].correctAnswer
      ).length;
      const passed = score >= module.passingScore;

      saveModuleResult({
        moduleId: module.id,
        score,
        passed,
        answers: finalAnswers,
        completedAt: new Date().toISOString(),
      });

      setShowResults(true);
    }
  }

  function handleRetry() {
    setCurrentQuestion(0);
    setAnswers([]);
    setAnswered(false);
    setShowResults(false);
    setKey((k) => k + 1);
  }

  // Results screen
  if (showResults && module) {
    const score = answers.filter(
      (ans, i) => ans === module.questions[i].correctAnswer
    ).length;
    const passed = score >= module.passingScore;

    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] opacity-20 ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 pt-12 pb-20">
          <QuizResults
            module={module}
            score={score}
            passed={passed}
            onRetry={handleRetry}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="dot-grid absolute inset-0" />
        <div className="absolute top-20 -right-32 w-72 h-72 bg-sol-green/[0.03] rounded-full blur-[80px] animate-pulse-glow" />
        <div className="absolute bottom-20 -left-32 w-80 h-80 bg-sol-purple/[0.04] rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 pt-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/quiz"
            className="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            Back to Modules
          </Link>
        </motion.div>

        {/* Module info card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-border p-5 mb-8 bg-[var(--card)]"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-sol-green/10 border border-sol-green/20 flex items-center justify-center text-2xl text-sol-green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{module.title}</h1>
              <p className="text-xs text-gray-500">
                Score {module.passingScore}/{totalQuestions} or higher to pass
              </p>
            </div>
          </div>

          {/* Progress */}
          <ProgressIndicator current={currentQuestion} total={totalQuestions} />
        </motion.div>

        {/* Question area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="gradient-border-purple p-6 sm:p-8 bg-[var(--card)]"
        >
          <AnimatePresence mode="wait">
            <QuestionCard
              key={key}
              question={question}
              onAnswer={handleAnswer}
            />
          </AnimatePresence>

          {/* Next button */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="group w-full relative overflow-hidden bg-sol-green/90 hover:bg-sol-green text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-sol-green/15 hover:shadow-sol-green/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {currentQuestion < totalQuestions - 1
                      ? 'Next Question'
                      : 'See Results'}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
