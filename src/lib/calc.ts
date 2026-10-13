import type { Food, Meal, MealItem, NutrientKey, NutrientTotals, Survey } from "../types";
import { NUTRIENT_KEYS } from "../types";
import { getFood } from "./foods";

export function emptyTotals(): NutrientTotals {
  return Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, 0])) as NutrientTotals;
}

export function scaleFood(food: Food, portions: number): NutrientTotals {
  const totals = emptyTotals();
  for (const key of NUTRIENT_KEYS) {
    totals[key] = food[key] * portions;
  }
  return totals;
}

export function addTotals(a: NutrientTotals, b: NutrientTotals): NutrientTotals {
  const totals = emptyTotals();
  for (const key of NUTRIENT_KEYS) {
    totals[key] = a[key] + b[key];
  }
  return totals;
}

export function itemTotals(item: MealItem): NutrientTotals {
  const food = getFood(item.foodId);
  if (!food || item.portions <= 0) return emptyTotals();
  return scaleFood(food, item.portions);
}

export function mealTotals(meal: Meal): NutrientTotals {
  return meal.items.reduce((acc, item) => addTotals(acc, itemTotals(item)), emptyTotals());
}

export function surveyTotals(survey: Survey): NutrientTotals {
  return survey.meals.reduce((acc, meal) => addTotals(acc, mealTotals(meal)), emptyTotals());
}

export function roundNutrient(key: NutrientKey, value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const decimals = key === "kcal" ? 2 : 3;
  const factor = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * factor) / factor;
}

export function formatNutrient(key: NutrientKey, value: number): string {
  const rounded = roundNutrient(key, value);
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
}
