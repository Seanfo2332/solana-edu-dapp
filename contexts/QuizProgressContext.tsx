'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { ModuleResult, QuizProgress } from '@/lib/quiz/types';
import {
  loadProgress,
  saveModuleResult as saveResult,
  getCompletedCount as getCount,
  isModuleUnlocked as checkUnlocked,
  isModulePassed as checkPassed,
} from '@/lib/quiz/progress';

interface QuizProgressContextValue {
  progress: QuizProgress | null;
  completedCount: number;
  saveModuleResult: (result: ModuleResult) => void;
  isModuleUnlocked: (moduleId: string) => boolean;
  isModulePassed: (moduleId: string) => boolean;
  getModuleScore: (moduleId: string) => number | null;
}

const QuizProgressContext = createContext<QuizProgressContextValue>({
  progress: null,
  completedCount: 0,
  saveModuleResult: () => {},
  isModuleUnlocked: () => false,
  isModulePassed: () => false,
  getModuleScore: () => null,
});

export function QuizProgressProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [progress, setProgress] = useState<QuizProgress | null>(null);

  const pubkeyStr = publicKey?.toBase58() ?? null;

  // Load progress from DB (with localStorage fallback) when wallet changes
  useEffect(() => {
    if (!pubkeyStr) {
      setProgress(null);
      return;
    }

    // Start with localStorage so the UI is instant
    const local = loadProgress(pubkeyStr);
    setProgress(local);

    // Then merge in DB scores (best score per module wins)
    fetch(`/api/quiz?wallet=${pubkeyStr}`)
      .then((res) => res.json())
      .then((data: { modules: Record<string, { moduleId: string; score: number; passed: boolean; completedAt: string }> }) => {
        setProgress((prev) => {
          const merged = prev ? { ...prev } : loadProgress(pubkeyStr);
          for (const [moduleId, dbResult] of Object.entries(data.modules)) {
            const existing = merged.modules[moduleId];
            if (!existing || dbResult.score > existing.score) {
              merged.modules[moduleId] = {
                moduleId: dbResult.moduleId,
                score: dbResult.score,
                passed: dbResult.passed,
                answers: existing?.answers ?? [],
                completedAt: dbResult.completedAt,
              };
            }
          }
          return { ...merged };
        });
      })
      .catch(() => {
        // DB unavailable — localStorage fallback is already set
      });
  }, [pubkeyStr]);

  const saveModuleResult = useCallback(
    (result: ModuleResult) => {
      if (!pubkeyStr) return;

      // Save to localStorage immediately
      const updated = saveResult(pubkeyStr, result);
      setProgress(updated);

      // Also save to database (fire and forget)
      fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletKey: pubkeyStr,
          moduleId: result.moduleId,
          score: result.score,
          passed: result.passed,
        }),
      }).catch(() => {
        // DB save failed — localStorage already updated, so progress is not lost
      });
    },
    [pubkeyStr]
  );

  const isModuleUnlocked = useCallback(
    (moduleId: string) => {
      if (!progress) return moduleId === 'module-1';
      return checkUnlocked(progress, moduleId);
    },
    [progress]
  );

  const isModulePassed = useCallback(
    (moduleId: string) => {
      if (!progress) return false;
      return checkPassed(progress, moduleId);
    },
    [progress]
  );

  const getModuleScore = useCallback(
    (moduleId: string) => {
      if (!progress) return null;
      return progress.modules[moduleId]?.score ?? null;
    },
    [progress]
  );

  const completedCount = progress ? getCount(progress) : 0;

  return (
    <QuizProgressContext.Provider
      value={{
        progress,
        completedCount,
        saveModuleResult,
        isModuleUnlocked,
        isModulePassed,
        getModuleScore,
      }}
    >
      {children}
    </QuizProgressContext.Provider>
  );
}

export function useQuizProgress() {
  return useContext(QuizProgressContext);
}
