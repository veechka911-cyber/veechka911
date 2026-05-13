import type { PlateMethodEval } from '../logic/types';

interface Props {
  evaluation: PlateMethodEval;
}

export function PlateMethod({ evaluation }: Props) {
  return (
    <div>
      <div className="plate" aria-hidden>
        <div className="plate__half">овощи 1/2</div>
        <div className="plate__q1">белок 1/4</div>
        <div className="plate__q2">углеводы 1/4</div>
      </div>
      <ul className="benefit-list" style={{ marginTop: 8 }}>
        <li>
          <span>
            <strong>Белок:</strong> {evaluation.protein}
          </span>
        </li>
        <li>
          <span>
            <strong>Овощи:</strong> {evaluation.vegetables}
          </span>
        </li>
        <li>
          <span>
            <strong>Углеводы:</strong> {evaluation.carbs}
          </span>
        </li>
        <li>
          <span>
            <strong>Жиры:</strong> {evaluation.fats}
          </span>
        </li>
      </ul>
    </div>
  );
}
