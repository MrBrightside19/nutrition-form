export type Sex = "mujer" | "hombre" | "otro";

export type Food = {
  id: number;
  name: string;
  portion: number;
  grams: number;
  household: string;
  kind: string;
  kcal: number;
  protein: number;
  carb: number;
  fiber: number;
  fat: number;
  sfa: number;
  mufa: number;
  pufa: number;
  cholesterol: number;
  vita: number;
  vitc: number;
  vite: number;
  calcium: number;
  phosphorus: number;
  potassium: number;
  sodium: number;
  iron: number;
};

export const NUTRIENT_KEYS = [
  "kcal",
  "carb",
  "fat",
  "protein",
  "fiber",
  "sfa",
  "mufa",
  "pufa",
  "cholesterol",
  "calcium",
  "phosphorus",
  "potassium",
  "sodium",
  "iron",
  "vita",
  "vitc",
  "vite",
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];
export type NutrientTotals = Record<NutrientKey, number>;

export type MealItem = {
  id: string;
  foodId: number;
  portions: number;
};

export type Meal = {
  id: string;
  name: string;
  time: string;
  items: MealItem[];
};

export type Survey = {
  id: string;
  createdAt: string;
  updatedAt: string;
  interviewer: string;
  personName: string;
  age: string;
  sex: Sex | "";
  meals: Meal[];
};

export const MEAL_OPTIONS = [
  { id: "desayuno", name: "Desayuno" },
  { id: "colacion_am", name: "Colación AM" },
  { id: "almuerzo", name: "Almuerzo" },
  { id: "once", name: "Once" },
  { id: "cena", name: "Cena" },
  { id: "colacion_pm", name: "Colación PM" },
] as const;

export const NUTRIENT_LABELS: Record<NutrientKey, string> = {
  kcal: "Kcals",
  carb: "HdeC g",
  fat: "Lípidos g",
  protein: "Proteínas g",
  fiber: "Fibra g",
  sfa: "AGS g",
  mufa: "AGM g",
  pufa: "AGP g",
  cholesterol: "Colesterol mg",
  calcium: "Calcio mg",
  phosphorus: "Fósforo mg",
  potassium: "Potasio mg",
  sodium: "Sodio mg",
  iron: "Hierro mg",
  vita: "Vit. A",
  vitc: "Vit. C mg",
  vite: "Vit. E mg",
};
