// Адаптер анализа фото.
// В MVP — возвращает demo-результат из локальной логики.
// В production-версии заменяется на запрос на backend в РФ:
//   POST /api/analyze-food-photo
// Структура AnalysisResult одинакова — фронтенд не зависит от источника.

import { runDemoAnalysis } from './demoAnalysisLogic';
import type { AnalysisInput, AnalysisResult } from './types';

const USE_REMOTE = false; // переключатель на будущий backend

export async function analyzeFoodPhoto(input: AnalysisInput): Promise<AnalysisResult> {
  if (USE_REMOTE) {
    // Будущая интеграция:
    // - сервер размещён на территории РФ;
    // - принимает фото, тип блюда, ответы, цель и статус согласия;
    // - возвращает JSON в той же структуре AnalysisResult.
    const res = await fetch('/api/analyze-food-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dishType: input.dishType,
        userAnswers: input.answers,
        userGoal: input.goal,
        consentStatus: input.consent,
        // uploadedImage передаётся отдельно multipart-запросом
      }),
    });
    if (!res.ok) throw new Error('analyze_failed');
    return (await res.json()) as AnalysisResult;
  }

  // Имитация небольшой задержки, чтобы UI ощущался естественно.
  await new Promise((r) => setTimeout(r, 600));
  return runDemoAnalysis(input);
}
