import { readFileSync } from "node:fs";

const foods = JSON.parse(readFileSync(new URL("../src/data/foods.json", import.meta.url), "utf8"));
const byId = new Map(foods.map((food) => [food.id, food]));

function scale(id, portions) {
  const food = byId.get(id);
  if (!food) throw new Error(`Missing food ${id}`);
  return {
    name: food.name,
    kcal: food.kcal * portions,
    carb: food.carb * portions,
    fat: food.fat * portions,
    protein: food.protein * portions,
  };
}

const checks = [
  { id: 323, portions: 0.5, kcal: 72.5, carb: 13.85 },
  { id: 68, portions: 2, kcal: 294, protein: 25.2 },
  { id: 73, portions: 4, kcal: 348, protein: 47.2 },
  { id: 85, portions: 1, kcal: 270 },
  { id: 316, portions: 1, kcal: 64 },
];

for (const check of checks) {
  const got = scale(check.id, check.portions);
  for (const key of ["kcal", "carb", "fat", "protein"]) {
    if (check[key] == null) continue;
    if (Math.abs(got[key] - check[key]) > 0.001) {
      throw new Error(`${got.name} ${key}: expected ${check[key]}, got ${got[key]}`);
    }
  }
}

const breakfast = [scale(85, 1), scale(323, 1), scale(316, 1)];
const breakfastKcal = breakfast.reduce((sum, item) => sum + item.kcal, 0);
if (breakfastKcal !== 479) {
  throw new Error(`Desayuno kcal: expected 479, got ${breakfastKcal}`);
}

function round1(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

const mbHombre = round1(15.3 * 63 + 679);
if (mbHombre !== 1642.9) throw new Error(`MB hombre 24a 63kg: expected 1642.9, got ${mbHombre}`);
const getHombre = round1(mbHombre * 1.55);
if (getHombre !== 2546.5) throw new Error(`GET hombre ligera: expected 2546.5, got ${getHombre}`);

const mbMujer30 = round1(14.7 * 80 + 496);
if (mbMujer30 !== 1672) throw new Error(`MB mujer 30a 80kg: expected 1672, got ${mbMujer30}`);

const mbAna = round1(14.7 * 63 + 496);
if (mbAna !== 1422.1) throw new Error(`MB Ana 28a 63kg: expected 1422.1, got ${mbAna}`);
const getAna = round1(mbAna * 1.56);
if (getAna !== 2218.5) throw new Error(`GET Ana ligera: expected 2218.5, got ${getAna}`);

console.log("OK", foods.length, "alimentos. Cálculos iguales al Excel de ejemplo.");
