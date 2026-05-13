import type {
  AnalysisInput,
  AnalysisResult,
  DishType,
  PalmMethodEval,
  PlateMethodEval,
  Satiety,
  UserGoal,
} from './types';
import { dishLabel, goalLabel } from './dishTypes';

const DISCLAIMER =
  'Сервис предоставляет примерную информационно-образовательную оценку рациона по фото. Расчёты калорийности и КБЖУ являются ориентировочными и не могут считаться точными. Сервис не является медицинской консультацией, диагностикой, лечением, назначением питания, терапии, препаратов или БАДов и не заменяет очный приём врача. Решения по диагностике, лечению, обследованиям, препаратам, БАДам и индивидуальному питанию принимаются совместно с лечащим врачом.';

const VISION_NOTE =
  'Для разнообразия рациона можно чаще добавлять яркие овощи, зелень, ягоды, рыбу, орехи и растительные масла в умеренном количестве. Такие продукты часто обсуждают в контексте питания для глаз, сосудов и общего рациона.';

interface Range {
  min: number;
  max: number;
}

function fmtRange(r: Range, unit: string): string {
  return `${Math.round(r.min)}–${Math.round(r.max)} ${unit}`;
}

function clampBalance(n: number): number {
  return Math.max(35, Math.min(90, Math.round(n)));
}

function shift(r: Range, delta: number): Range {
  return { min: r.min + delta, max: r.max + delta };
}

function shiftRange(r: Range, minDelta: number, maxDelta: number): Range {
  return { min: r.min + minDelta, max: r.max + maxDelta };
}

function satietyLevel(s: Satiety): 1 | 2 | 3 {
  switch (s) {
    case 'лёгкая':
    case 'низкая':
      return 1;
    case 'средняя':
      return 2;
    case 'хорошая':
    case 'высокая':
      return 3;
  }
}

function genId(): string {
  return 'plate_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
}

function goodForGoal(goal: UserGoal): string[] {
  const base = [
    'Вы уже смотрите на состав еды, а не только на калории — это хороший шаг.',
  ];
  if (goal === 'lose') {
    base.push('Если в блюде есть белок, оно обычно лучше насыщает и помогает реже срываться на перекусы.');
  } else if (goal === 'maintain') {
    base.push('Регулярная и понятная структура еды помогает удерживать вес без жёстких ограничений.');
  } else {
    base.push('Внимание к балансу — мягкая и долгосрочная привычка, которая работает без диет.');
  }
  return base;
}

function improveForGoal(goal: UserGoal, extras: string[] = []): string[] {
  let head = '';
  if (goal === 'lose') {
    head =
      'Если цель — снижение веса, часто помогают простые шаги: добавить белок, увеличить овощи, уменьшить количество масла/соуса и следить за размером порции.';
  } else if (goal === 'maintain') {
    head =
      'Для удержания веса важно сохранять понятную структуру: белок + овощи/зелень + умеренная порция углеводов + немного жиров.';
  } else if (goal === 'understand') {
    head =
      'Посмотрите, какие группы продуктов есть в блюде. Чем понятнее состав, тем проще управлять питанием без крайностей.';
  } else {
    head =
      'Если непонятно, к чему стремиться, можно начать с простого: в каждом приёме пищи белок, овощи и умеренное количество жиров.';
  }
  return [head, ...extras];
}

// ============ PLATE ============
function analyzePlate(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 450, max: 600 };
  let prot: Range = { min: 25, max: 35 };
  let fat: Range = { min: 15, max: 25 };
  let carb: Range = { min: 45, max: 65 };
  let balance = 70;
  const extras: string[] = [];
  let satiety: Satiety = 'средняя';

  if (a.portion === 'small') {
    cal = { min: 300, max: 450 };
    prot = { min: 15, max: 25 };
    fat = { min: 10, max: 18 };
    carb = { min: 30, max: 45 };
    balance -= 5;
    extras.push(
      'Порция может быть маловата по объёму. Если после такой еды быстро появляется голод, стоит проверить количество белка и овощей.'
    );
  } else if (a.portion === 'large') {
    cal = { min: 650, max: 850 };
    prot = { min: 30, max: 45 };
    fat = { min: 25, max: 40 };
    carb = { min: 70, max: 100 };
    balance -= 10;
    extras.push(
      'Порция выглядит довольно объёмной. Если цель — снижение веса, стоит обратить внимание на количество углеводов, масла, соуса и размер добавки.'
    );
  } else if (a.portion === 'medium') {
    extras.push('По объёму порция похожа на обычный основной приём пищи.');
  }

  if (a.cooking === 'boiled') {
    extras.push('Такой способ приготовления обычно помогает легче контролировать количество жира.');
  } else if (a.cooking === 'baked') {
    fat = shift(fat, 3);
    extras.push('Запечённые блюда могут быть хорошим вариантом, но итог зависит от количества масла, сыра или соуса.');
  } else if (a.cooking === 'fried') {
    cal = shiftRange(cal, 100, 200);
    fat = shiftRange(fat, 10, 15);
    balance -= 10;
    extras.push(
      'При жарке калорийность часто становится выше из-за масла. Если цель — снижение веса, жареные блюда лучше чередовать с тушёными или запечёнными.'
    );
  }

  if (a.fats === 'none') {
    extras.push('Без дополнительного соуса и масла проще контролировать калорийность.');
  } else if (a.fats === 'some') {
    fat = shiftRange(fat, 5, 10);
    cal = shiftRange(cal, 50, 100);
    balance -= 5;
    extras.push('Небольшое количество масла или соуса допустимо, но его лучше учитывать визуально.');
  } else if (a.fats === 'lots') {
    fat = shiftRange(fat, 15, 25);
    cal = shiftRange(cal, 150, 250);
    balance -= 15;
    extras.push(
      'Соусы, масло, сыр и орехи могут незаметно сильно повышать калорийность. Для снижения веса часто достаточно уменьшить их количество, не меняя всю тарелку.'
    );
  }

  satiety = a.portion === 'small' ? 'лёгкая' : a.portion === 'large' ? 'высокая' : 'средняя';

  const plate: PlateMethodEval = {
    protein: 'хорошо',
    vegetables: 'можно добавить',
    carbs: a.portion === 'large' ? 'много' : 'нормально',
    fats: a.fats === 'lots' || a.cooking === 'fried' ? 'многовато' : 'нормально',
  };

  const palm: PalmMethodEval = {
    protein: 'примерно 1 ладонь',
    vegetables: '1–2 кулака',
    carbs: '1 горсть',
    fats: '1–2 больших пальца',
  };

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['основное блюдо', 'гарнир', 'возможно овощи'],
    main_comment:
      'Тарелка уже выглядит достаточно сытной, но её можно сделать более сбалансированной без жёстких диет.',
    plate_method: plate,
    palm_method: palm,
    show_plate_method: true,
    show_palm_method: true,
    extras,
    what_is_good_extras: [
      'В тарелке есть белок — это помогает дольше сохранять сытость.',
      'Есть углеводы — их не обязательно исключать для снижения веса.',
    ],
    what_to_improve_extras:
      input.goal === 'lose'
        ? [
            'Добавьте больше овощей, оставьте источник белка и посмотрите на количество масла/соуса. Часто именно эти небольшие изменения помогают снизить калорийность без ощущения диеты.',
          ]
        : [
            'Добавьте больше овощей до примерно половины тарелки и сохраните источник белка.',
          ],
  });
}

// ============ SOUP ============
function analyzeSoup(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 300, max: 500 };
  let prot: Range = { min: 10, max: 20 };
  let fat: Range = { min: 10, max: 20 };
  let carb: Range = { min: 25, max: 45 };
  let balance = 65;
  let satiety: Satiety = 'средняя';
  const extras: string[] = [];

  switch (a.soup_kind) {
    case 'vegetable':
      cal = { min: 150, max: 300 };
      prot = { min: 3, max: 10 };
      fat = { min: 5, max: 12 };
      carb = { min: 15, max: 30 };
      satiety = 'лёгкая';
      balance = 55;
      extras.push('Может быть маловато белка для длительной сытости.');
      break;
    case 'meat':
      cal = { min: 250, max: 450 };
      prot = { min: 15, max: 30 };
      fat = { min: 8, max: 20 };
      carb = { min: 15, max: 40 };
      satiety = 'средняя';
      balance = 70;
      break;
    case 'fish':
      cal = { min: 250, max: 450 };
      prot = { min: 15, max: 30 };
      fat = { min: 8, max: 20 };
      carb = { min: 15, max: 40 };
      satiety = 'средняя';
      balance = 72;
      break;
    case 'puree':
      cal = { min: 250, max: 500 };
      prot = { min: 5, max: 18 };
      fat = { min: 10, max: 25 };
      carb = { min: 25, max: 50 };
      extras.push('Суп-пюре может быть лёгким или плотным — многое зависит от сливок, масла и сыра.');
      break;
    case 'cream':
      cal = { min: 400, max: 700 };
      fat = { min: 25, max: 45 };
      satiety = 'высокая';
      balance = 55;
      extras.push('Крем-супы могут быть калорийнее из-за сливок, сыра или масла.');
      break;
    case 'borsch':
      cal = { min: 250, max: 500 };
      prot = { min: 10, max: 25 };
      fat = { min: 8, max: 25 };
      carb = { min: 25, max: 50 };
      extras.push('Итог сильно зависит от мяса, зажарки, сметаны и хлеба.');
      break;
    case 'starchy':
      carb = shiftRange(carb, 15, 30);
      cal = shiftRange(cal, 100, 200);
      extras.push('Такой суп может быть полноценнее, но важно учитывать объём порции.');
      break;
  }

  if (a.soup_portion === 'small') {
    cal = shiftRange(cal, -150, -100);
    if (satiety === 'высокая') satiety = 'средняя';
    else if (satiety === 'средняя') satiety = 'лёгкая';
  } else if (a.soup_portion === 'large') {
    cal = shiftRange(cal, 150, 250);
    if (satiety === 'лёгкая') satiety = 'средняя';
    else if (satiety === 'средняя') satiety = 'высокая';
  }

  if (['meat', 'fish', 'egg', 'beans'].includes(a.soup_protein)) {
    prot = shiftRange(prot, 10, 20);
    balance += 10;
    if (satiety === 'лёгкая') satiety = 'средняя';
  } else if (a.soup_protein === 'almost_none') {
    balance -= 10;
    extras.push('Если в супе мало белка, после него может быстрее вернуться голод.');
  }

  if (a.soup_fats === 'some') {
    cal = shiftRange(cal, 50, 100);
    fat = shiftRange(fat, 5, 10);
  } else if (a.soup_fats === 'lots') {
    cal = shiftRange(cal, 150, 300);
    fat = shiftRange(fat, 15, 30);
    balance -= 10;
  }

  if (a.soup_with === 'bread') {
    cal = shiftRange(cal, 80, 150);
    carb = shiftRange(carb, 15, 30);
    extras.push('Хлеб к супу добавляет углеводы и калории.');
  } else if (a.soup_with === 'second') {
    extras.push('Суп в этом случае лучше считать частью большого приёма пищи, а не отдельной лёгкой едой.');
  } else if (a.soup_with === 'dessert') {
    extras.push('Десерт может заметно увеличить общую калорийность приёма пищи.');
  }

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['жидкое блюдо', 'возможно овощи и крахмал'],
    main_comment:
      'Суп может быть хорошим вариантом приёма пищи. Его сытность зависит от белка, объёма, картофеля/крупы/лапши и жирных добавок.',
    show_plate_method: false,
    show_palm_method: false,
    extras,
    what_is_good_extras: [
      'Если в супе есть мясо, рыба, яйцо или бобовые — это повышает сытность.',
      'Жидкие блюда обычно помогают увеличить объём еды без сильного роста калорий.',
    ],
    what_to_improve_extras:
      input.goal === 'lose'
        ? [
            'Если цель — снижение веса, обратите внимание на хлеб, сметану, сливки, сыр, зажарку и второе блюдо после супа.',
          ]
        : ['Для большей сытости проверьте, есть ли в приёме пищи белок.'],
  });
}

// ============ SALAD ============
function analyzeSalad(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 250, max: 400 };
  let prot: Range = { min: 10, max: 20 };
  let fat: Range = { min: 15, max: 25 };
  let carb: Range = { min: 15, max: 35 };
  let balance = 70;
  let satiety: Satiety = 'средняя';
  const extras: string[] = [];

  if (a.salad_role === 'side') {
    cal = { min: 80, max: 250 };
    satiety = 'низкая';
    extras.push('Как добавка к еде салат может хорошо увеличить объём и добавить овощи.');
  }

  switch (a.salad_protein) {
    case 'meat':
      prot = shiftRange(prot, 15, 25);
      if (satiety === 'низкая') satiety = 'средняя';
      else satiety = 'высокая';
      break;
    case 'fish':
      prot = shiftRange(prot, 15, 25);
      fat = shiftRange(fat, 5, 15);
      satiety = 'высокая';
      break;
    case 'egg':
      prot = shiftRange(prot, 8, 15);
      fat = shiftRange(fat, 5, 12);
      break;
    case 'dairy':
      prot = shiftRange(prot, 10, 20);
      fat = shiftRange(fat, 10, 20);
      break;
    case 'beans':
      prot = shiftRange(prot, 8, 15);
      carb = shiftRange(carb, 15, 30);
      satiety = 'средняя';
      break;
    case 'almost_none':
      if (a.salad_role === 'main') {
        balance -= 15;
        extras.push('Для основного приёма пищи может быть маловато белка.');
      }
      break;
  }

  switch (a.salad_dressing) {
    case 'oil':
      fat = shiftRange(fat, 10, 20);
      cal = shiftRange(cal, 90, 180);
      break;
    case 'yogurt':
      fat = shiftRange(fat, 5, 15);
      cal = shiftRange(cal, 50, 150);
      break;
    case 'mayo':
      fat = shiftRange(fat, 15, 30);
      cal = shiftRange(cal, 150, 300);
      balance -= 10;
      break;
    case 'cream':
      fat = shiftRange(fat, 15, 30);
      cal = shiftRange(cal, 150, 300);
      balance -= 10;
      break;
  }

  switch (a.salad_extras) {
    case 'cheese':
      fat = shiftRange(fat, 10, 20);
      prot = shiftRange(prot, 5, 15);
      cal = shiftRange(cal, 100, 200);
      break;
    case 'nuts':
      fat = shiftRange(fat, 10, 25);
      cal = shiftRange(cal, 100, 250);
      break;
    case 'croutons':
      carb = shiftRange(carb, 15, 30);
      cal = shiftRange(cal, 80, 150);
      break;
    case 'avocado':
      fat = shiftRange(fat, 10, 25);
      cal = shiftRange(cal, 100, 250);
      break;
    case 'starch':
      carb = shiftRange(carb, 20, 40);
      cal = shiftRange(cal, 100, 250);
      break;
  }

  if (a.salad_portion === 'large') {
    cal = shiftRange(cal, 150, 250);
  } else if (a.salad_portion === 'small') {
    cal = shiftRange(cal, -80, -50);
  }

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['зелень / овощи', 'возможно белок', 'заправка'],
    main_comment:
      a.salad_role === 'side'
        ? 'Как добавка салат помогает увеличить объём еды и добавить овощи.'
        : 'Для основного приёма пищи салату важно иметь источник белка и не слишком много заправки.',
    show_plate_method: false,
    show_palm_method: false,
    extras,
    what_is_good_extras: [
      'Овощи и зелень — отличная база для приёма пищи.',
      a.salad_protein && a.salad_protein !== 'almost_none' ? 'В салате есть источник белка.' : 'Видно желание разнообразить рацион овощами.',
    ],
    what_to_improve_extras:
      input.goal === 'lose'
        ? [
            'Если цель — снижение веса, оставьте овощи и белок, но посмотрите на количество заправки, сыра, орехов и сухариков.',
          ]
        : ['Заправка часто сильнее влияет на калорийность салата, чем сами овощи.'],
  });
}

// ============ SNACK ============
function analyzeSnack(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 150, max: 300 };
  let prot: Range = { min: 5, max: 15 };
  let fat: Range = { min: 5, max: 15 };
  let carb: Range = { min: 15, max: 35 };
  let satiety: Satiety = 'средняя';
  let balance = 65;
  const extras: string[] = [];

  switch (a.snack_kind) {
    case 'dairy':
      prot = shiftRange(prot, 10, 20);
      cal = { min: 150, max: 300 };
      if (satiety === 'средняя') satiety = 'высокая';
      break;
    case 'fruit':
      cal = { min: 60, max: 150 };
      carb = shiftRange(carb, 15, 30);
      prot = { min: 0, max: 3 };
      satiety = 'низкая';
      extras.push('Фрукт — нормальный перекус, но без белка может ненадолго насыщать.');
      break;
    case 'nuts':
      fat = shiftRange(fat, 15, 30);
      cal = shiftRange(cal, 150, 300);
      extras.push('Орехи полезны как часть рациона, но небольшая горсть может быть довольно калорийной.');
      break;
    case 'sandwich':
      carb = shiftRange(carb, 20, 40);
      cal = { min: 200, max: 400 };
      break;
    case 'sweet':
      carb = shiftRange(carb, 25, 50);
      fat = shiftRange(fat, 5, 20);
      cal = { min: 200, max: 450 };
      balance -= 15;
      extras.push('Сладкий перекус может быстро повышать калорийность и не всегда даёт длительную сытость.');
      break;
    case 'drink':
      cal = { min: 0, max: 350 };
      extras.push('Напитки тоже могут добавлять калории, особенно если есть сахар, сиропы, сливки или большое количество молока.');
      break;
    case 'mixed':
      cal = { min: 250, max: 500 };
      break;
  }

  if (a.snack_protein === 'almost_none') {
    balance -= 10;
    extras.push('Если после перекуса быстро хочется есть, возможно, в нём мало белка.');
  } else if (a.snack_protein && a.snack_protein !== 'idk') {
    if (satiety === 'низкая') satiety = 'средняя';
  }

  if (a.snack_sweet === 'yes') {
    balance -= 10;
    extras.push('Для снижения веса сладкий перекус лучше не запрещать, а учитывать по частоте и объёму.');
  }

  if (a.snack_size === 'large') {
    cal = shiftRange(cal, 150, 250);
    extras.push('Большой перекус может быть почти как отдельный приём пищи.');
  } else if (a.snack_size === 'small') {
    cal = shiftRange(cal, -50, -30);
  }

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['перекус', 'возможно фрукт/молочный продукт'],
    main_comment:
      'Перекус не обязан быть идеальным. Его задача — помочь не прийти к следующему приёму пищи с сильным голодом.',
    show_plate_method: false,
    show_palm_method: false,
    extras,
    what_is_good_extras: [
      'Перекус помогает мягко распределять еду в течение дня.',
      'Если в перекусе есть белок, он лучше насыщает.',
    ],
    what_to_improve_extras: [
      'Чтобы перекус был сытнее, можно сочетать фрукт с белковым продуктом: йогуртом, творогом, кефиром, яйцом или сыром.',
    ],
  });
}

// ============ DESSERT ============
function analyzeDessert(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 250, max: 450 };
  let prot: Range = { min: 3, max: 8 };
  let fat: Range = { min: 10, max: 25 };
  let carb: Range = { min: 30, max: 60 };
  let satiety: Satiety = 'низкая';
  let balance = 45;
  const extras: string[] = [];

  switch (a.dessert_kind) {
    case 'cookies':
      cal = { min: 150, max: 350 };
      carb = { min: 20, max: 50 };
      fat = { min: 5, max: 20 };
      break;
    case 'chocolate':
      cal = { min: 150, max: 350 };
      fat = { min: 10, max: 25 };
      carb = { min: 15, max: 40 };
      break;
    case 'cake':
      cal = { min: 300, max: 700 };
      fat = { min: 15, max: 40 };
      carb = { min: 40, max: 80 };
      balance -= 10;
      break;
    case 'pastry':
      cal = { min: 300, max: 650 };
      carb = { min: 45, max: 90 };
      fat = { min: 10, max: 30 };
      break;
    case 'icecream':
      cal = { min: 150, max: 400 };
      carb = { min: 20, max: 50 };
      fat = { min: 5, max: 25 };
      break;
    case 'sweet_drink':
      cal = { min: 100, max: 350 };
      carb = { min: 25, max: 70 };
      prot = { min: 0, max: 4 };
      extras.push('Сладкие напитки могут добавлять калории, но почти не дают сытости.');
      break;
  }

  if (a.dessert_context === 'after_meal') {
    extras.push('После еды десерт может быть частью рациона, но важно смотреть на общую порцию за день.');
  } else if (a.dessert_context === 'alone') {
    extras.push('Если сладкое идёт отдельно, оно может не дать длительной сытости и через время снова усилить голод.');
  }

  if (a.dessert_portion === 'small') {
    cal = { min: Math.max(80, cal.min / 1.6), max: Math.max(180, cal.max / 1.6) };
  } else if (a.dessert_portion === 'large') {
    cal = shiftRange(cal, 100, 250);
    balance -= 10;
  }

  if (a.dessert_freq === 'daily') {
    extras.push(
      'Сладкое не нужно запрещать, но при снижении веса важно смотреть на частоту, порцию и то, заменяет ли оно нормальный приём пищи.'
    );
  } else if (a.dessert_freq === 'often') {
    extras.push(
      'Если сладкого хочется несколько раз в день, стоит обратить внимание на сытость основных приёмов пищи, сон, стресс и регулярность питания.'
    );
  }

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['сладкое'],
    main_comment:
      'Сладкое может быть частью рациона. Важно не запрещать его полностью, а понимать порцию, частоту и общий контекст питания.',
    show_plate_method: false,
    show_palm_method: false,
    extras,
    what_is_good_extras: [
      'Вы готовы спокойно посмотреть на сладкое, а не запрещать его, — это здоровое отношение к еде.',
    ],
    what_to_improve_extras:
      input.goal === 'lose'
        ? [
            'Не обязательно убирать сладкое полностью. Можно начать с уменьшения порции, выбора более сытных основных приёмов пищи и добавления белка в течение дня.',
          ]
        : [
            'Десерт лучше сочетать с сытным основным приёмом пищи — так меньше шансов на сильный голод и переедание позже.',
          ],
    soft_disclaimer:
      'Если сладкого хочется постоянно, это не всегда про слабую силу воли. Часто влияет недоедание, мало белка, нерегулярное питание, усталость и стресс.',
  });
}

// ============ UNKNOWN ============
function analyzeUnknown(input: AnalysisInput): AnalysisResult {
  const a = input.answers;
  let cal: Range = { min: 350, max: 650 };
  let prot: Range = { min: 10, max: 30 };
  let fat: Range = { min: 10, max: 30 };
  let carb: Range = { min: 30, max: 80 };
  let satiety: Satiety = 'средняя';
  let balance = 60;
  const extras: string[] = [];

  if (a.unknown_kind === 'main_heavy') {
    cal = shiftRange(cal, 150, 250);
    satiety = 'высокая';
  } else if (a.unknown_kind === 'main_light') {
    cal = shiftRange(cal, -200, -100);
    satiety = 'лёгкая';
  } else if (a.unknown_kind === 'liquid') {
    extras.push('Для жидкого блюда сытность зависит от белка, объёма и крахмалистых добавок.');
  } else if (a.unknown_kind === 'sweet') {
    extras.push('Сладкое может быть частью рациона, важно смотреть на порцию и контекст.');
    balance = 50;
  } else if (a.unknown_kind === 'snack') {
    extras.push('Перекус помогает не дойти до сильного голода между приёмами пищи.');
  }

  if (a.unknown_protein === 'yes') {
    prot = shiftRange(prot, 10, 20);
    balance += 10;
  } else if (a.unknown_protein === 'no') {
    balance -= 10;
    extras.push('Если в блюде мало белка, после него может быстрее вернуться голод.');
  }

  if (a.unknown_veggies === 'lots') {
    balance += 10;
  } else if (a.unknown_veggies === 'almost_none') {
    balance -= 10;
    extras.push('Для более сбалансированного приёма пищи можно добавить овощи или зелень.');
  }

  if (a.unknown_fats === 'lots') {
    fat = shiftRange(fat, 15, 30);
    cal = shiftRange(cal, 150, 300);
    balance -= 10;
  } else if (a.unknown_fats === 'some') {
    fat = shiftRange(fat, 5, 10);
    cal = shiftRange(cal, 50, 100);
  }

  if (a.unknown_portion === 'large') {
    cal = shiftRange(cal, 150, 250);
    balance -= 5;
  } else if (a.unknown_portion === 'small') {
    cal = shiftRange(cal, -100, -50);
  }

  return buildResult(input, {
    cal, prot, fat, carb,
    balance,
    satiety,
    detected_foods: ['не уверены — общий разбор'],
    main_comment:
      'Это примерный разбор, потому что тип блюда выбран как «не знаю». Для более точного результата в следующий раз можно выбрать категорию блюда.',
    show_plate_method: true,
    show_palm_method: false,
    extras,
    what_is_good_extras: ['Внимание к балансу — уже хороший шаг.'],
    what_to_improve_extras: [
      'Для более сытного и понятного приёма пищи проверьте, есть ли в блюде белок, овощи и умеренное количество соусов или масла.',
    ],
  });
}

// ============ COMMON BUILDER ============
interface InternalResult {
  cal: Range;
  prot: Range;
  fat: Range;
  carb: Range;
  balance: number;
  satiety: Satiety;
  detected_foods: string[];
  main_comment: string;
  plate_method?: PlateMethodEval;
  palm_method?: PalmMethodEval;
  show_plate_method: boolean;
  show_palm_method: boolean;
  extras: string[];
  what_is_good_extras?: string[];
  what_to_improve_extras?: string[];
  soft_disclaimer?: string;
}

function buildResult(input: AnalysisInput, r: InternalResult): AnalysisResult {
  const balance = clampBalance(r.balance);
  const what_is_good = [...goodForGoal(input.goal), ...(r.what_is_good_extras ?? [])];
  const what_to_improve = improveForGoal(input.goal, r.what_to_improve_extras ?? []);
  const extra_notes = [...r.extras];
  if (r.soft_disclaimer) extra_notes.push(r.soft_disclaimer);

  return {
    id: genId(),
    createdAt: Date.now(),
    dish_type: input.dishType,
    dish_type_label: dishLabel(input.dishType),
    goal: input.goal,
    goal_label: goalLabel(input.goal),
    confidence: 'medium',
    detected_foods: r.detected_foods,
    calories_range: fmtRange(r.cal, 'ккал'),
    protein_range: fmtRange(r.prot, 'г'),
    fat_range: fmtRange(r.fat, 'г'),
    carbs_range: fmtRange(r.carb, 'г'),
    balance_score: balance,
    satiety: r.satiety,
    satiety_level: satietyLevel(r.satiety),
    main_comment: r.main_comment,
    what_is_good,
    what_to_improve,
    vision_note: VISION_NOTE,
    plate_method: r.plate_method,
    palm_method: r.palm_method,
    show_plate_method: r.show_plate_method,
    show_palm_method: r.show_palm_method,
    extra_notes,
    disclaimer: DISCLAIMER,
  };
}

const ANALYZERS: Record<DishType, (i: AnalysisInput) => AnalysisResult> = {
  plate: analyzePlate,
  soup: analyzeSoup,
  salad: analyzeSalad,
  snack: analyzeSnack,
  dessert: analyzeDessert,
  unknown: analyzeUnknown,
};

export function runDemoAnalysis(input: AnalysisInput): AnalysisResult {
  const fn = ANALYZERS[input.dishType] ?? analyzeUnknown;
  // Default goal answer to user-provided goal field if not in answers
  const merged: AnalysisInput = {
    ...input,
    answers: { ...input.answers, goal: input.answers.goal ?? input.goal },
  };
  return fn(merged);
}
