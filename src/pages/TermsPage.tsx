import { Link } from 'react-router-dom';
import { Card } from '../components/Card';

export function TermsPage() {
  return (
    <div>
      <h1>Пользовательское соглашение</h1>
      <Card variant="soft">
        <p className="mb-0">
          Здесь будет размещено пользовательское соглашение. Сервис предоставляет примерную
          информационно-образовательную оценку рациона по фото и не является медицинской консультацией,
          диагностикой, лечением или назначением питания.
        </p>
      </Card>
      <p className="small muted center mt-4">
        <Link to="/">Вернуться на главную</Link>
      </p>
    </div>
  );
}
