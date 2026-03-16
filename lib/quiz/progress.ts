import { ModuleResult, QuizProgress } from './types';

const STORAGE_PREFIX = 'solanaedu_quiz_';

function getKey(walletPubkey: string): string {
  return `${STORAGE_PREFIX}${walletPubkey}`;
}

export function loadProgress(walletPubkey: string): QuizProgress {
  if (typeof window === 'undefined') {
    return createEmpty(walletPubkey);
  }
  try {
    const raw = localStorage.getItem(getKey(walletPubkey));
    if (!raw) return createEmpty(walletPubkey);
    const parsed: QuizProgress = JSON.parse(raw);
    if (parsed.version !== 1) return createEmpty(walletPubkey);
    return parsed;
  } catch {
    return createEmpty(walletPubkey);
  }
}

export function saveModuleResult(
  walletPubkey: string,
  result: ModuleResult
): QuizProgress {
  const progress = loadProgress(walletPubkey);

  const existing = progress.modules[result.moduleId];
  // Only overwrite if new score is higher (best-score preservation)
  if (!existing || result.score > existing.score) {
    progress.modules[result.moduleId] = result;
  }

  progress.lastUpdated = new Date().toISOString();

  if (typeof window !== 'undefined') {
    localStorage.setItem(getKey(walletPubkey), JSON.stringify(progress));
  }

  return progress;
}

export function getCompletedCount(progress: QuizProgress): number {
  return Object.values(progress.modules).filter((r) => r.passed).length;
}

export function isModulePassed(
  progress: QuizProgress,
  moduleId: string
): boolean {
  return progress.modules[moduleId]?.passed ?? false;
}

export function isModuleUnlocked(
  progress: QuizProgress,
  moduleId: string
): boolean {
  // Module 1 is always unlocked
  if (moduleId === 'module-1') return true;

  // Module N requires module N-1 passed
  const moduleNum = parseInt(moduleId.split('-')[1], 10);
  if (isNaN(moduleNum) || moduleNum <= 1) return true;

  const prevModuleId = `module-${moduleNum - 1}`;
  return isModulePassed(progress, prevModuleId);
}

function createEmpty(walletPubkey: string): QuizProgress {
  return {
    version: 1,
    walletPubkey,
    modules: {},
    lastUpdated: new Date().toISOString(),
  };
}
