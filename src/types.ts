export type Sex = "mujer" | "hombre" | "otro";
export type ActivityLevel = "ligera" | "moderada" | "alta";

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
  weight: string;
  activityLevel: ActivityLevel | "";
  meals: Meal[];
};

export const ACTIVITY_OPTIONS: { id: ActivityLevel; label: string; help: string }[] = [
  {
    id: "ligera",
    label: "Ligera",
    help: "Varias horas al día sedentarias, sin deporte regular y con auto para desplazarse. Ocio: TV, leer, computador o videojuegos. Ej.: sentado o de pie, pasear en llano, hogar ligero, oficina, estudiar, conducir. Actividad ligera o moderada 2 o 3 veces por semana.",
  },
  {
    id: "moderada",
    label: "Moderada",
    help: "Ej.: pasear a 5 km/h, casa pesada (cristales, barrer), carpinteros, construcción (excepto trabajos duros), industria química o eléctrica, agrícola mecanizada, golf, cuidado de niños. Más de 30 min/día de actividad moderada y 20 min/semana de vigorosa.",
  },
  {
    id: "alta",
    label: "Alta",
    help: "Andan largas distancias a diario, usan bicicleta, actividades vigorosas o deportes de alto esfuerzo varias horas. Ej.: agrícola no mecanizada, mineros, forestales, cavar, cortar leña, fútbol, tenis, jogging, bailar, esquiar. Actividad moderada o vigorosa todos los días.",
  },
];

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
