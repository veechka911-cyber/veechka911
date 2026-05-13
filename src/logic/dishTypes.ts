import type { DishType, UserGoal } from './types';

export const DISH_TYPES: {
  id: DishType;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: 'plate',
    label: 'Обычная тарелка',
    description: 'Белок + гарнир + овощи, завтрак, обед или ужин',
    emoji: '🍽️',
  },
  {
    id: 'soup',
    label: 'Суп / жидкое блюдо',
    description: 'Борщ, щи, куриный суп, крем-суп, окрошка, лагман',
    emoji: '🥣',
  },
  {
    id: 'salad',
    label: 'Салат',
    description: 'Овощной, белковый, цезарь, греческий, оливье, винегрет',
    emoji: '🥗',
  },
  {
    id: 'snack',
    label: 'Перекус',
    description: 'Йогурт, творог, фрукт, орехи, бутерброд, кофе с молоком',
    emoji: '🍎',
  },
  {
    id: 'dessert',
    label: 'Десерт / сладкое',
    description: 'Печенье, торт, конфеты, шоколад, булочка, сладкий напиток',
    emoji: '🍰',
  },
  {
    id: 'unknown',
    label: 'Не знаю',
    description: 'Приложение сделает универсальный примерный разбор',
    emoji: '🤔',
  },
];

export const GOAL_OPTIONS: { id: UserGoal; label: string }[] = [
  { id: 'lose', label: 'Хочу снизить вес' },
  { id: 'maintain', label: 'Хочу удерживать вес' },
  { id: 'understand', label: 'Хочу просто понять баланс' },
  { id: 'idk', label: 'Не знаю' },
];

export function dishLabel(id: DishType): string {
  return DISH_TYPES.find((d) => d.id === id)?.label ?? '—';
}

export function goalLabel(id: UserGoal): string {
  return GOAL_OPTIONS.find((g) => g.id === id)?.label ?? '—';
}
