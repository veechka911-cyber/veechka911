import { LinkButton } from '../components/Button';
import { Card } from '../components/Card';

export function HowItWorksPage() {
  const steps = [
    'Вы загружаете фото еды.',
    'Выбираете тип блюда.',
    'Отвечаете на короткие вопросы.',
    'Получаете примерный разбор: калорийность, КБЖУ, сытность и рекомендации по балансу.',
    'Видите, что уже хорошо и что можно улучшить без строгих диет.',
  ];
  return (
    <div>
      <h1>Как это работает</h1>
      <ol className="benefit-list">
        {steps.map((s, i) => (
          <li key={i}>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <Card variant="green" title="Важно">
        <p className="mb-0">
          Приложение не считает калории точно до грамма. Оно помогает увидеть примерный баланс блюда и
          сделать питание понятнее.
        </p>
      </Card>

      <Card variant="soft" title="Демо-режим">
        <p className="mb-0">
          Сейчас работает демо-разбор: результат строится на выбранном типе блюда и ваших ответах. В будущей
          версии можно будет подключить AI-анализ фото на российской инфраструктуре.
        </p>
      </Card>

      <div className="btn-row">
        <LinkButton variant="primary" to="/upload">
          Понятно, загрузить фото
        </LinkButton>
      </div>
    </div>
  );
}
