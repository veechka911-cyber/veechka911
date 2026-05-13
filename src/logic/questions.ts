import type { DishType } from './types';

export interface Question {
  id: string;
  title: string;
  options: { value: string; label: string }[];
}

const GOAL_QUESTION: Question = {
  id: 'goal',
  title: 'Какая у вас сейчас цель?',
  options: [
    { value: 'lose', label: 'Хочу снизить вес' },
    { value: 'maintain', label: 'Хочу удерживать вес' },
    { value: 'understand', label: 'Хочу просто понять баланс' },
    { value: 'idk', label: 'Не знаю' },
  ],
};

const PLATE_QUESTIONS: Question[] = [
  {
    id: 'portion',
    title: 'Какой размер порции?',
    options: [
      { value: 'small', label: 'Маленькая' },
      { value: 'medium', label: 'Средняя' },
      { value: 'large', label: 'Большая' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'cooking',
    title: 'Как приготовлено блюдо?',
    options: [
      { value: 'boiled', label: 'Варёное / тушёное' },
      { value: 'baked', label: 'Запечённое' },
      { value: 'fried', label: 'Жареное' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'fats',
    title: 'Есть ли масло, соус, майонез, сыр или орехи?',
    options: [
      { value: 'none', label: 'Нет' },
      { value: 'some', label: 'Немного' },
      { value: 'lots', label: 'Много' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

const SOUP_QUESTIONS: Question[] = [
  {
    id: 'soup_kind',
    title: 'Какой это суп?',
    options: [
      { value: 'vegetable', label: 'Овощной' },
      { value: 'meat', label: 'Куриный / мясной' },
      { value: 'fish', label: 'Рыбный' },
      { value: 'puree', label: 'Суп-пюре' },
      { value: 'cream', label: 'Крем-суп' },
      { value: 'borsch', label: 'Борщ / щи' },
      { value: 'starchy', label: 'С крупой / лапшой / картофелем' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'soup_portion',
    title: 'Примерный объём порции?',
    options: [
      { value: 'small', label: 'Маленькая миска 250–300 мл' },
      { value: 'medium', label: 'Средняя тарелка 350–450 мл' },
      { value: 'large', label: 'Большая тарелка 500–600 мл' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'soup_protein',
    title: 'Есть ли в супе заметный белок?',
    options: [
      { value: 'meat', label: 'Мясо / курица' },
      { value: 'fish', label: 'Рыба' },
      { value: 'egg', label: 'Яйцо' },
      { value: 'beans', label: 'Бобовые' },
      { value: 'almost_none', label: 'Почти нет белка' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'soup_fats',
    title: 'Есть ли сливки, сыр, зажарка, масло или сметана?',
    options: [
      { value: 'none', label: 'Нет' },
      { value: 'some', label: 'Немного' },
      { value: 'lots', label: 'Много' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'soup_with',
    title: 'Ели ли вы что-то вместе с супом?',
    options: [
      { value: 'soup_only', label: 'Только суп' },
      { value: 'bread', label: 'Хлеб' },
      { value: 'salad', label: 'Салат' },
      { value: 'second', label: 'Второе блюдо' },
      { value: 'dessert', label: 'Десерт' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

const SALAD_QUESTIONS: Question[] = [
  {
    id: 'salad_role',
    title: 'Это салат как основной приём пищи или как добавка?',
    options: [
      { value: 'main', label: 'Основной приём пищи' },
      { value: 'side', label: 'Добавка к еде' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'salad_protein',
    title: 'Есть ли в салате белок?',
    options: [
      { value: 'meat', label: 'Курица / мясо' },
      { value: 'fish', label: 'Рыба / морепродукты' },
      { value: 'egg', label: 'Яйца' },
      { value: 'dairy', label: 'Творог / сыр' },
      { value: 'beans', label: 'Бобовые' },
      { value: 'almost_none', label: 'Почти нет белка' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'salad_dressing',
    title: 'Какая заправка?',
    options: [
      { value: 'none', label: 'Без заправки' },
      { value: 'oil', label: 'Масло' },
      { value: 'yogurt', label: 'Сметана / йогурт' },
      { value: 'mayo', label: 'Майонез' },
      { value: 'cream', label: 'Сливочный соус' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'salad_extras',
    title: 'Есть ли калорийные добавки?',
    options: [
      { value: 'cheese', label: 'Сыр' },
      { value: 'nuts', label: 'Орехи / семечки' },
      { value: 'croutons', label: 'Сухарики' },
      { value: 'avocado', label: 'Авокадо' },
      { value: 'starch', label: 'Картофель / крупа / макароны' },
      { value: 'none', label: 'Нет' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'salad_portion',
    title: 'Размер порции?',
    options: [
      { value: 'small', label: 'Маленькая' },
      { value: 'medium', label: 'Средняя' },
      { value: 'large', label: 'Большая' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

const SNACK_QUESTIONS: Question[] = [
  {
    id: 'snack_kind',
    title: 'Что больше всего похоже на ваш перекус?',
    options: [
      { value: 'dairy', label: 'Молочный продукт / творог / йогурт' },
      { value: 'fruit', label: 'Фрукт / ягоды' },
      { value: 'nuts', label: 'Орехи / семечки' },
      { value: 'sandwich', label: 'Бутерброд / хлебцы' },
      { value: 'sweet', label: 'Сладкое / печенье / батончик' },
      { value: 'drink', label: 'Кофе / напиток' },
      { value: 'mixed', label: 'Смешанный перекус' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'snack_protein',
    title: 'Есть ли в перекусе белок?',
    options: [
      { value: 'dairy', label: 'Да, творог / йогурт / кефир' },
      { value: 'animal', label: 'Да, яйцо / сыр / мясо / рыба' },
      { value: 'protein_product', label: 'Да, протеиновый продукт' },
      { value: 'almost_none', label: 'Почти нет' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'snack_sweet',
    title: 'Перекус сладкий?',
    options: [
      { value: 'no', label: 'Нет' },
      { value: 'little', label: 'Немного' },
      { value: 'yes', label: 'Да, сладкий' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'snack_size',
    title: 'Размер перекуса?',
    options: [
      { value: 'small', label: 'Маленький' },
      { value: 'medium', label: 'Средний' },
      { value: 'large', label: 'Большой' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

const DESSERT_QUESTIONS: Question[] = [
  {
    id: 'dessert_kind',
    title: 'Что это за сладкое?',
    options: [
      { value: 'cookies', label: 'Печенье / конфеты' },
      { value: 'chocolate', label: 'Шоколад' },
      { value: 'cake', label: 'Торт / пирожное' },
      { value: 'pastry', label: 'Булочка / выпечка' },
      { value: 'icecream', label: 'Мороженое' },
      { value: 'sweet_drink', label: 'Сладкий напиток' },
      { value: 'other', label: 'Другое' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'dessert_context',
    title: 'Это было отдельно или после еды?',
    options: [
      { value: 'alone', label: 'Отдельно' },
      { value: 'after_meal', label: 'После основного приёма пищи' },
      { value: 'with_drink', label: 'Вместе с кофе / чаем' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'dessert_portion',
    title: 'Размер порции?',
    options: [
      { value: 'small', label: 'Маленькая' },
      { value: 'medium', label: 'Средняя' },
      { value: 'large', label: 'Большая' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'dessert_freq',
    title: 'Как часто хочется такого сладкого?',
    options: [
      { value: 'rare', label: 'Редко' },
      { value: 'sometimes', label: 'Иногда' },
      { value: 'daily', label: 'Почти каждый день' },
      { value: 'often', label: 'Несколько раз в день' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

const UNKNOWN_QUESTIONS: Question[] = [
  {
    id: 'unknown_kind',
    title: 'Блюдо больше похоже на…',
    options: [
      { value: 'main_heavy', label: 'Плотный основной приём пищи' },
      { value: 'main_light', label: 'Лёгкий приём пищи' },
      { value: 'liquid', label: 'Жидкое блюдо' },
      { value: 'sweet', label: 'Сладкое' },
      { value: 'snack', label: 'Перекус' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'unknown_protein',
    title: 'В блюде есть заметный белок?',
    options: [
      { value: 'yes', label: 'Да' },
      { value: 'no', label: 'Нет' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'unknown_veggies',
    title: 'В блюде есть овощи или зелень?',
    options: [
      { value: 'lots', label: 'Много' },
      { value: 'some', label: 'Немного' },
      { value: 'almost_none', label: 'Почти нет' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'unknown_fats',
    title: 'Есть ли масло, соус, сыр, орехи, майонез или сливки?',
    options: [
      { value: 'none', label: 'Нет' },
      { value: 'some', label: 'Немного' },
      { value: 'lots', label: 'Много' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  {
    id: 'unknown_portion',
    title: 'Размер порции?',
    options: [
      { value: 'small', label: 'Маленькая' },
      { value: 'medium', label: 'Средняя' },
      { value: 'large', label: 'Большая' },
      { value: 'idk', label: 'Не знаю' },
    ],
  },
  GOAL_QUESTION,
];

export const QUESTIONS_BY_DISH: Record<DishType, Question[]> = {
  plate: PLATE_QUESTIONS,
  soup: SOUP_QUESTIONS,
  salad: SALAD_QUESTIONS,
  snack: SNACK_QUESTIONS,
  dessert: DESSERT_QUESTIONS,
  unknown: UNKNOWN_QUESTIONS,
};

export function getQuestions(dish: DishType): Question[] {
  return QUESTIONS_BY_DISH[dish];
}
