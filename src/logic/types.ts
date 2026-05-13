export type DishType =
  | 'plate'
  | 'soup'
  | 'salad'
  | 'snack'
  | 'dessert'
  | 'unknown';

export type UserGoal =
  | 'lose'
  | 'maintain'
  | 'understand'
  | 'idk';

export type Confidence = 'low' | 'medium' | 'high';

export type Satiety = 'низкая' | 'средняя' | 'высокая' | 'лёгкая' | 'хорошая';

export interface Answer {
  questionId: string;
  value: string;
}

export interface AnalysisInput {
  dishType: DishType;
  answers: Record<string, string>;
  goal: UserGoal;
  hasPhoto: boolean;
  consent: boolean;
}

export interface PlateMethodEval {
  protein: 'хорошо' | 'мало' | 'много' | 'нет данных';
  vegetables: 'хорошо' | 'можно добавить' | 'почти нет' | 'много' | 'нет данных';
  carbs: 'нормально' | 'мало' | 'много' | 'нет данных';
  fats: 'нормально' | 'мало' | 'многовато' | 'много' | 'нет данных';
}

export interface PalmMethodEval {
  protein: string;
  vegetables: string;
  carbs: string;
  fats: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: number;
  dish_type: DishType;
  dish_type_label: string;
  goal: UserGoal;
  goal_label: string;
  confidence: Confidence;
  detected_foods: string[];
  calories_range: string;
  protein_range: string;
  fat_range: string;
  carbs_range: string;
  balance_score: number;
  satiety: Satiety;
  satiety_level: 1 | 2 | 3;
  main_comment: string;
  what_is_good: string[];
  what_to_improve: string[];
  vision_note: string;
  plate_method?: PlateMethodEval;
  palm_method?: PalmMethodEval;
  show_plate_method: boolean;
  show_palm_method: boolean;
  extra_notes: string[];
  disclaimer: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  dish_type: DishType;
  dish_type_label: string;
  goal: UserGoal;
  goal_label: string;
  calories_range: string;
  balance_score: number;
  satiety: Satiety;
}
