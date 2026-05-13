import { useNavigate } from 'react-router-dom';
import { Button, LinkButton } from '../components/Button';
import { HeroPlate } from '../components/HeroPlate';
import { useAppState } from '../store/AppState';

export function HomePage() {
  const navigate = useNavigate();
  const { resetFlow } = useAppState();

  const start = () => {
    resetFlow();
    navigate('/upload');
  };

  return (
    <div>
      <section className="hero">
        <span className="hero__eyebrow">Информационно-образовательный сервис</span>
        <h1>Умная тарелка</h1>
        <p className="lead">Фото-разбор еды без жёсткого подсчёта калорий.</p>
        <HeroPlate />
        <p>
          Загрузите фото своей еды, и приложение поможет примерно оценить баланс: белки, овощи, углеводы,
          жиры, калорийность и сытность блюда.
        </p>
      </section>

      <section className="card card--soft">
        <h3 className="card__title">Подходит, если вы хотите:</h3>
        <ul className="benefit-list">
          <li>есть обычную еду;</li>
          <li>не считать каждую калорию;</li>
          <li>понимать, чего не хватает в тарелке;</li>
          <li>снижать вес без жёстких диет;</li>
          <li>собирать более сытные и сбалансированные приёмы пищи.</li>
        </ul>
      </section>

      <div className="btn-row">
        <Button variant="primary" onClick={start}>
          Разобрать мою еду
        </Button>
        <LinkButton variant="secondary" to="/how">
          Как это работает
        </LinkButton>
      </div>

      <p className="small muted center mt-4">
        Разбор носит примерный информационно-образовательный характер и не является медицинской консультацией.
      </p>
    </div>
  );
}
