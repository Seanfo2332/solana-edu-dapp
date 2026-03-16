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

  // Load progress when wallet changes
  useEffect(() => {
    if (pubkeyStr) {
      setProgress(loadProgress(pubkeyStr));
    } else {
      setProgress(null);
    }
  }, [pubkeyStr]);

  const saveModuleResult = useCallback(
    (result: ModuleResult) => {
      if (!pubkeyStr) return;
      const updated = saveResult(pubkeyStr, result);
      setProgress(updated);
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
