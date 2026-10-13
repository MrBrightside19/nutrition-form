import rawFoods from "../data/foods.json";
import { NUTRIENT_KEYS, type Food } from "../types";

const PATCH_KEY = "r24:foods";

type FoodPatch = {
  overrides: Record<string, Food>;
  added: Food[];
  deleted: number[];
};

const BASE: Food[] = (rawFoods as Food[]).map((food) => ({
  ...food,
  kind: food.kind === "preparación" ? "preparación" : "alimento",
}));

const BASE_IDS = new Set(BASE.map((food) => food.id));
const listeners = new Set<() => void>();

function emptyPatch(): FoodPatch {
  return { overrides: {}, added: [], deleted: [] };
}

function loadPatch(): FoodPatch {
  try {
    if (typeof localStorage === "undefined") return emptyPatch();
    const raw = localStorage.getItem(PATCH_KEY);
    if (!raw) return emptyPatch();
    const parsed = JSON.parse(raw) as FoodPatch;
    return {
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
      added: Array.isArray(parsed.added) ? parsed.added : [],
      deleted: Array.isArray(parsed.deleted) ? parsed.deleted : [],
    };
  } catch {
    return emptyPatch();
  }
}

let patch = loadPatch();
let catalog: Food[] = [];
let foodById = new Map<number, Food>();

function rebuild(): void {
  const deleted = new Set(patch.deleted);
  const next: Food[] = [];
  for (const food of BASE) {
    if (deleted.has(food.id)) continue;
    next.push(patch.overrides[String(food.id)] ?? food);
  }
  for (const food of patch.added) {
    if (deleted.has(food.id)) continue;
    next.push(food);
  }
  catalog = next;
  foodById = new Map(next.map((food) => [food.id, food]));
}

function persist(): void {
  if (typeof localStorage !== "undefined") {
    const empty =
      patch.added.length === 0 &&
      patch.deleted.length === 0 &&
      Object.keys(patch.overrides).length === 0;
    if (empty) localStorage.removeItem(PATCH_KEY);
    else localStorage.setItem(PATCH_KEY, JSON.stringify(patch));
  }
  listeners.forEach((listener) => listener());
}

function nextId(): number {
  let max = 0;
  for (const food of BASE) max = Math.max(max, food.id);
  for (const food of patch.added) max = Math.max(max, food.id);
  return max + 1;
}

rebuild();

export function getFoods(): Food[] {
  return catalog;
}

export function getFood(id: number): Food | undefined {
  return foodById.get(id);
}

export function subscribeFoods(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isCatalogDirty(): boolean {
  return (
    patch.added.length > 0 ||
    patch.deleted.length > 0 ||
    Object.keys(patch.overrides).length > 0
  );
}

export function emptyFood(): Food {
  const nutrients = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, 0])) as Record<
    (typeof NUTRIENT_KEYS)[number],
    number
  >;
  return {
    id: 0,
    name: "",
    portion: 1,
    grams: 0,
    household: "",
    kind: "alimento",
    ...nutrients,
  };
}

export function saveFood(food: Food): Food {
  const next = { ...food, name: food.name.trim(), kind: food.kind === "preparación" ? "preparación" : "alimento" };
  if (next.id === 0 || (!BASE_IDS.has(next.id) && !foodById.has(next.id))) {
    next.id = nextId();
    patch.added.push(next);
  } else if (BASE_IDS.has(next.id)) {
    patch.overrides[String(next.id)] = next;
    patch.deleted = patch.deleted.filter((id) => id !== next.id);
  } else {
    const index = patch.added.findIndex((item) => item.id === next.id);
    if (index >= 0) patch.added[index] = next;
    else patch.added.push(next);
  }
  rebuild();
  persist();
  return next;
}

export function removeFood(id: number): void {
  if (BASE_IDS.has(id)) {
    if (!patch.deleted.includes(id)) patch.deleted.push(id);
    delete patch.overrides[String(id)];
  } else {
    patch.added = patch.added.filter((food) => food.id !== id);
  }
  rebuild();
  persist();
}

export function resetFoods(): void {
  patch = emptyPatch();
  rebuild();
  persist();
}

export function displayName(name: string): string {
  if (name !== name.toUpperCase()) return name;
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index > 0 && ["de", "del", "la", "las", "el", "los", "y", "en", "con"].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
