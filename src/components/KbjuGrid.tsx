interface Props {
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

export function KbjuGrid({ calories, protein, fat, carbs }: Props) {
  const items = [
    { label: 'Калории', value: calories },
    { label: 'Белки', value: protein },
    { label: 'Жиры', value: fat },
    { label: 'Углеводы', value: carbs },
  ];
  return (
    <div className="kbju">
      {items.map((i) => (
        <div className="kbju__item" key={i.label}>
          <div className="kbju__label">{i.label}</div>
          <div className="kbju__value">{i.value}</div>
        </div>
      ))}
    </div>
  );
}
