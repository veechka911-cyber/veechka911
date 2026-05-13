import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, LinkButton } from '../components/Button';
import { Card } from '../components/Card';
import { clearHistory, getHistory } from '../store/history';
import type { HistoryEntry } from '../logic/types';

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
}

export function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const onClear = () => {
    if (confirm('Очистить всю историю разборов?')) {
      clearHistory();
      setItems([]);
    }
  };

  return (
    <div>
      <h1>Последние разборы</h1>
      <p className="lead small muted">
        История хранится локально в браузере. В рабочей версии сервер и база данных будут на территории
        Российской Федерации.
      </p>

      {items.length === 0 ? (
        <Card variant="soft">
          <p className="mb-2">Здесь пока нет разборов.</p>
          <p className="small muted mb-3">Загрузите фото — и первый разбор появится в этом списке.</p>
          <LinkButton variant="primary" to="/upload">
            Сделать первый разбор
          </LinkButton>
        </Card>
      ) : (
        <div>
          {items.map((h) => (
            <Link key={h.id} to="/result" className="history-item" style={{ borderBottom: 0, color: 'inherit' }}>
              <div className="history-item__title">
                {formatDate(h.createdAt)} — {h.dish_type_label}
              </div>
              <div className="history-item__meta">
                <span>{h.calories_range}</span>
                <span>баланс {h.balance_score}%</span>
                <span>сытность {h.satiety}</span>
                <span className="muted">{h.goal_label}</span>
              </div>
            </Link>
          ))}
          <div className="btn-row">
            <LinkButton variant="primary" to="/upload">
              Разобрать ещё одно блюдо
            </LinkButton>
            <Button variant="ghost" onClick={onClear}>
              Очистить историю
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
