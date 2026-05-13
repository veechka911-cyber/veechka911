interface Props {
  level: 1 | 2 | 3;
}

const LABELS = ['Лёгкая', 'Средняя', 'Сытная'] as const;

export function SatietyScale({ level }: Props) {
  return (
    <div className="satiety" role="group" aria-label="Сытность">
      {LABELS.map((label, i) => {
        const idx = (i + 1) as 1 | 2 | 3;
        const active = idx === level;
        return (
          <div key={label} className={`satiety__pill ${active ? 'satiety__pill--active' : ''}`}>
            {label}
          </div>
        );
      })}
    </div>
  );
}
