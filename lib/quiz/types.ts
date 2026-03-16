export type QuestionType = 'mcq' | 'truefalse';

export interface MCQQuestion {
  id: string;
  moduleId: string;
  type: 'mcq';
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}

export interface TrueFalseQuestion {
  id: string;
  moduleId: string;
  type: 'truefalse';
  question: string;
  options: ['True', 'False'];
  correctAnswer: number;
  explanation: string;
}

export type Question = MCQQuestion | TrueFalseQuestion;

export interface QuizModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: Question[];
  passingScore: number;
}

export interface ModuleResult {
  moduleId: string;
  score: number;
  passed: boolean;
  answers: number[];
  completedAt: string;
}

export interface QuizProgress {
  version: 1;
  walletPubkey: string;
  modules: Record<string, ModuleResult>;
  lastUpdated: string;
}
