import type { PalmMethodEval } from '../logic/types';

interface Props {
  evaluation: PalmMethodEval;
}

export function PalmMethod({ evaluation }: Props) {
  const rows: { icon: string; label: string; value: string }[] = [
    { icon: '🖐️', label: 'Белок', value: evaluation.protein },
    { icon: '✊', label: 'Овощи', value: evaluation.vegetables },
    { icon: '🤏', label: 'Углеводы', value: evaluation.carbs },
    { icon: '👍', label: 'Жиры', value: evaluation.fats },
  ];
  return (
    <ul className="benefit-list" style={{ margin: 0 }}>
      {rows.map((r) => (
        <li key={r.label}>
          <span style={{ marginRight: 6 }}>{r.icon}</span>
          <span>
            <strong>{r.label}:</strong> {r.value}
          </span>
        </li>
      ))}
    </ul>
  );
}
