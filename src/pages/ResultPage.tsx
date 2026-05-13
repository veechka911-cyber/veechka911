import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, LinkButton } from '../components/Button';
import { Card } from '../components/Card';
import { Disclaimer } from '../components/Disclaimer';
import { KbjuGrid } from '../components/KbjuGrid';
import { PalmMethod } from '../components/PalmMethod';
import { PlateMethod } from '../components/PlateMethod';
import { ProgressBar } from '../components/ProgressBar';
import { SatietyScale } from '../components/SatietyScale';
import { Steps } from '../components/Steps';
import { useAppState } from '../store/AppState';

export function ResultPage() {
  const navigate = useNavigate();
  const { result, photoDataUrl, resetFlow } = useAppState();

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const startNew = () => {
    resetFlow();
    navigate('/upload');
  };

  const botStart = `plate_${result.id}`;
  // Заглушки. В production должна быть только ссылка с ID, фото и контакты — на backend в РФ.
  const telegramLink = `#bot-start=${botStart}`;

  return (
    <div>
      <Steps total={5} current={3} />
      <h1>Ваш примерный разбор</h1>
      <p className="lead">
        Оценка ориентировочная: фото не всегда показывает точный вес продуктов, состав блюда, масло, соусы и
        способ приготовления.
      </p>

      {photoDataUrl && (
        <div className="photo-preview">
          <img src={photoDataUrl} alt="Загруженное фото блюда" />
        </div>
      )}

      <div className="row mb-4" style={{ flexWrap: 'wrap', gap: 6 }}>
        <span className="tag tag--green">{result.dish_type_label}</span>
        <span className="tag">Цель: {result.goal_label}</span>
        <span className="tag tag--berry">Уверенность: средняя</span>
      </div>

      {/* Баланс */}
      <Card variant="accent" title="Баланс тарелки">
        <ProgressBar value={result.balance_score} label="Баланс" />
        <p className="mt-3 mb-0">{result.main_comment}</p>
      </Card>

      {/* Сытность */}
      <Card title="Сытность">
        <SatietyScale level={result.satiety_level} />
        <p className="small muted mt-3 mb-0">Оценка: {result.satiety}</p>
      </Card>

      {/* Калорийность и КБЖУ */}
      <Card title="Примерная калорийность и КБЖУ">
        <KbjuGrid
          calories={result.calories_range}
          protein={result.protein_range}
          fat={result.fat_range}
          carbs={result.carbs_range}
        />
        <p className="small muted mt-3 mb-0">
          Диапазоны — ориентир, а не точный расчёт. Реальные значения зависят от веса продуктов, масла,
          соусов и способа приготовления.
        </p>
      </Card>

      {/* Метод тарелки */}
      {result.show_plate_method && result.plate_method && (
        <Card variant="green" title="Метод тарелки">
          <PlateMethod evaluation={result.plate_method} />
        </Card>
      )}

      {/* Метод ладони */}
      {result.show_palm_method && result.palm_method && (
        <Card variant="soft" title="Метод ладони">
          <PalmMethod evaluation={result.palm_method} />
        </Card>
      )}

      {/* Что уже хорошо */}
      <Card variant="green" title="Что уже хорошо">
        <ul className="benefit-list">
          {result.what_is_good.map((t, i) => (
            <li key={i}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Что улучшить */}
      <Card variant="berry" title="Что можно улучшить">
        <ul className="benefit-list">
          {result.what_to_improve.map((t, i) => (
            <li key={i}>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Дополнительные подсказки */}
      {result.extra_notes.length > 0 && (
        <Card title="Дополнительные подсказки">
          <ul className="benefit-list">
            {result.extra_notes.map((t, i) => (
              <li key={i}>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Питание, глаза и сосуды */}
      <Card variant="accent" title="Питание, глаза и сосуды">
        <p className="mb-0">{result.vision_note}</p>
      </Card>

      {/* Действия */}
      <Card variant="soft" title="Что дальше?">
        <div className="btn-row">
          <Button variant="primary" onClick={startNew}>
            Разобрать другое блюдо
          </Button>
          <LinkButton variant="olive" to="/lead">
            Получить памятку
          </LinkButton>
          <LinkButton variant="secondary" to="/offer">
            Посмотреть мини-курс
          </LinkButton>
          <LinkButton variant="ghost" to={telegramLink} external>
            Сохранить разбор в бот
          </LinkButton>
        </div>
        <p className="small muted mt-3 mb-0">
          Ссылка на бот — заглушка. В рабочей версии бот будет получать только ID разбора, а полные данные
          будут храниться на backend в РФ.
        </p>
      </Card>

      <Disclaimer>
        <strong>Важно.</strong> {result.disclaimer}
      </Disclaimer>

      <p className="small muted center mt-4">
        <Link to="/history">Открыть историю разборов</Link>
      </p>
    </div>
  );
}
