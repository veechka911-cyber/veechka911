import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Option } from '../components/Option';
import { Steps } from '../components/Steps';
import { analyzeFoodPhoto } from '../logic/analyzeFoodPhoto';
import { getQuestions } from '../logic/questions';
import type { UserGoal } from '../logic/types';
import { useAppState } from '../store/AppState';

export function QuestionsPage() {
  const navigate = useNavigate();
  const {
    dishType,
    answers,
    setAnswer,
    photoDataUrl,
    setResult,
    saveResultToHistory,
  } = useAppState();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Если тип блюда не выбран — вернуть на шаг назад.
  useEffect(() => {
    if (!dishType) navigate('/dish-type', { replace: true });
  }, [dishType, navigate]);

  const questions = useMemo(() => (dishType ? getQuestions(dishType) : []), [dishType]);
  const current = questions[index];

  if (!dishType || !current) return null;

  const selected = answers[current.id];

  const onNext = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    setLoading(true);
    try {
      const goalValue = (answers.goal ?? 'idk') as UserGoal;
      const result = await analyzeFoodPhoto({
        dishType,
        answers,
        goal: goalValue,
        hasPhoto: !!photoDataUrl,
        consent: false,
      });
      setResult(result);
      saveResultToHistory(result);
      navigate('/result');
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (index === 0) {
      navigate('/dish-type');
    } else {
      setIndex(index - 1);
    }
  };

  return (
    <div>
      <Steps total={5} current={2} />
      <h1>Уточняющие вопросы</h1>
      <p className="lead small muted">
        Вопрос {index + 1} из {questions.length}
      </p>

      <Card variant="default" title={current.title}>
        <div className="option-list">
          {current.options.map((o) => (
            <Option
              key={o.value}
              selected={selected === o.value}
              onClick={() => setAnswer(current.id, o.value)}
              label={o.label}
            />
          ))}
        </div>
      </Card>

      <div className="btn-row">
        <Button variant="primary" disabled={!selected || loading} onClick={onNext}>
          {loading
            ? 'Готовим разбор…'
            : index === questions.length - 1
            ? 'Получить разбор'
            : 'Дальше'}
        </Button>
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Назад
        </Button>
      </div>
    </div>
  );
}
