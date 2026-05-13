import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Disclaimer } from '../components/Disclaimer';
import { saveLeadLocal } from '../store/history';

export function LeadPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentInfo, setConsentInfo] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = name.trim().length > 0 && contact.trim().length > 0 && consentData && consentInfo;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // В демо-версии данные сохраняются только локально.
    // В production отправка пойдёт на backend в РФ.
    saveLeadLocal({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || undefined,
      consentData,
      consentInfo,
      createdAt: Date.now(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <div>
        <h1>Готово!</h1>
        <Card variant="green">
          <p className="mb-2">
            А пока можете посмотреть мини-курс или написать мне напрямую.
          </p>
          <p className="small muted mb-0">
            В демо-версии контакт сохраняется только локально в браузере и не отправляется на внешние
            сервисы.
          </p>
        </Card>
        <div className="btn-row">
          <Button variant="primary" onClick={() => navigate('/offer')}>
            Посмотреть мини-курс
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Хотите получить памятку и подсказки в личные сообщения?</h1>
      <p className="lead">
        Оставьте контакт, и я пришлю вам памятку «Как собрать сытную тарелку без подсчёта калорий».
      </p>

      <Card variant="default">
        <form onSubmit={submit} noValidate>
          <div className="form-field">
            <label htmlFor="name">Имя</label>
            <input
              id="name"
              type="text"
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="contact">Telegram или телефон</label>
            <input
              id="contact"
              type="text"
              autoComplete="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="@username или +7 000 000-00-00"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email (необязательно)</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.ru"
            />
            <div className="hint">Можно оставить пустым.</div>
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={consentData}
              onChange={(e) => setConsentData(e.target.checked)}
            />
            <span>
              Я согласна на обработку персональных данных.{' '}
              <Link to="/policy">Политика обработки персональных данных</Link>.
            </span>
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={consentInfo}
              onChange={(e) => setConsentInfo(e.target.checked)}
            />
            <span>
              Я согласна получить информационные материалы и понимаю, что сервис не является медицинской
              консультацией.
            </span>
          </label>

          <Disclaimer variant="soft">
            В демо-версии форма не отправляет данные на внешние сервисы. В рабочей версии данные будут
            храниться и обрабатываться на территории Российской Федерации.
          </Disclaimer>

          <div className="btn-row">
            <Button variant="primary" type="submit" disabled={!canSubmit}>
              Получить памятку
            </Button>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Назад
            </Button>
          </div>

          <p className="legal-links small">
            <Link to="/policy">Политика обработки персональных данных</Link>
            <Link to="/terms">Пользовательское соглашение</Link>
            <a
              href="#delete-my-data"
              onClick={(e) => {
                e.preventDefault();
                if (confirm('Удалить локально сохранённые данные (контакт и историю)?')) {
                  localStorage.removeItem('smartplate.lead.v1');
                  localStorage.removeItem('smartplate.history.v1');
                  alert('Локальные данные удалены.');
                }
              }}
            >
              Удалить мои данные
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
}
