import type { Food } from "../types";
import { getFoods } from "./foods";

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function searchFoods(query: string, limit = 30): Food[] {
  const q = normalize(query);
  if (q.length < 1) return [];

  const scored = getFoods()
    .map((food) => {
      const name = normalize(food.name);
      const household = normalize(food.household);
      let score = 0;
      if (name === q) score = 100;
      else if (name.startsWith(q)) score = 80;
      else if (name.includes(q)) score = 60;
      else if (household.includes(q)) score = 30;
      else if (q.split(/\s+/).every((part) => name.includes(part))) score = 50;
      return { food, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, "es"));

  return scored.slice(0, limit).map((row) => row.food);
}
