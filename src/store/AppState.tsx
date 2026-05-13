import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AnalysisResult, DishType, UserGoal } from '../logic/types';
import { dishLabel, goalLabel } from '../logic/dishTypes';
import { addHistoryEntry } from './history';

interface AppStateValue {
  photoDataUrl: string | null;
  setPhotoDataUrl: (url: string | null) => void;

  dishType: DishType | null;
  setDishType: (d: DishType | null) => void;

  answers: Record<string, string>;
  setAnswer: (id: string, value: string) => void;
  resetAnswers: () => void;

  goal: UserGoal;
  setGoal: (g: UserGoal) => void;

  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;

  saveResultToHistory: (r: AnalysisResult) => void;

  resetFlow: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [dishType, setDishType] = useState<DishType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [goal, setGoal] = useState<UserGoal>('idk');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (id === 'goal') setGoal(value as UserGoal);
  }, []);

  const resetAnswers = useCallback(() => setAnswers({}), []);

  const resetFlow = useCallback(() => {
    setPhotoDataUrl(null);
    setDishType(null);
    setAnswers({});
    setGoal('idk');
    setResult(null);
  }, []);

  const saveResultToHistory = useCallback((r: AnalysisResult) => {
    addHistoryEntry({
      id: r.id,
      createdAt: r.createdAt,
      dish_type: r.dish_type,
      dish_type_label: dishLabel(r.dish_type),
      goal: r.goal,
      goal_label: goalLabel(r.goal),
      calories_range: r.calories_range,
      balance_score: r.balance_score,
      satiety: r.satiety,
    });
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      photoDataUrl,
      setPhotoDataUrl,
      dishType,
      setDishType,
      answers,
      setAnswer,
      resetAnswers,
      goal,
      setGoal,
      result,
      setResult,
      saveResultToHistory,
      resetFlow,
    }),
    [photoDataUrl, dishType, answers, goal, result, setAnswer, resetAnswers, saveResultToHistory, resetFlow]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const v = useContext(AppStateContext);
  if (!v) throw new Error('AppStateProvider не подключён');
  return v;
}
