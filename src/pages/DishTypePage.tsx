import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Option } from '../components/Option';
import { Steps } from '../components/Steps';
import { DISH_TYPES } from '../logic/dishTypes';
import { useAppState } from '../store/AppState';

export function DishTypePage() {
  const navigate = useNavigate();
  const { dishType, setDishType, resetAnswers } = useAppState();

  return (
    <div>
      <Steps total={5} current={1} />
      <h1>Что вы хотите разобрать?</h1>
      <p className="lead">Выберите, что больше всего похоже на ваше блюдо. Так разбор будет точнее.</p>

      <div className="option-list">
        {DISH_TYPES.map((d) => (
          <Option
            key={d.id}
            selected={dishType === d.id}
            onClick={() => {
              if (dishType !== d.id) resetAnswers();
              setDishType(d.id);
            }}
            label={d.label}
            description={d.description}
            icon={<span style={{ fontSize: 22 }}>{d.emoji}</span>}
          />
        ))}
      </div>

      <div className="btn-row">
        <Button variant="primary" disabled={!dishType} onClick={() => navigate('/questions')}>
          Продолжить
        </Button>
        <Button variant="ghost" onClick={() => navigate('/upload')}>
          Назад
        </Button>
      </div>
    </div>
  );
}
