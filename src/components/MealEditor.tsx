import { useState } from "react";
import type { Food, Survey } from "../types";
import { formatNutrient, mealTotals, surveyTotals } from "../lib/calc";
import { displayName, getFood } from "../lib/foods";
import { FoodSearch } from "./FoodSearch";

type Props = {
  survey: Survey;
  mealId: string;
  onMealId: (id: string) => void;
  onChange: (survey: Survey) => void;
  onSummary: () => void;
  onBack: () => void;
};

function clampPortions(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value * 100) / 100;
}

export function MealEditor({ survey, mealId, onMealId, onChange, onSummary, onBack }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const meal = survey.meals.find((item) => item.id === mealId) ?? survey.meals[0];
  const totals = meal ? mealTotals(meal) : undefined;
  const day = surveyTotals(survey);

  function addFood(food: Food) {
    if (!meal) return;
    const item = { id: crypto.randomUUID(), foodId: food.id, portions: 1 };
    onChange({
      ...survey,
      meals: survey.meals.map((entry) =>
        entry.id === meal.id ? { ...entry, items: [...entry.items, item] } : entry,
      ),
    });
    setSearchOpen(false);
  }

  function setPortions(itemId: string, portions: number) {
    if (!meal) return;
    onChange({
      ...survey,
      meals: survey.meals.map((entry) =>
        entry.id === meal.id
          ? {
              ...entry,
              items: entry.items.map((item) =>
                item.id === itemId ? { ...item, portions: clampPortions(portions) } : item,
              ),
            }
          : entry,
      ),
    });
  }

  function removeItem(itemId: string) {
    if (!meal) return;
    onChange({
      ...survey,
      meals: survey.meals.map((entry) =>
        entry.id === meal.id ? { ...entry, items: entry.items.filter((item) => item.id !== itemId) } : entry,
      ),
    });
  }

  if (!meal || !totals) return null;

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-36 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-clay">
        Datos de la persona
      </button>
      <h1 className="mt-4 font-serif text-3xl text-forest">{survey.personName || "Sin nombre"}</h1>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {survey.meals.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onMealId(entry.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              entry.id === meal.id ? "bg-forest text-cream" : "bg-paper text-ink"
            }`}
          >
            {entry.name}
            {entry.items.length > 0 ? ` · ${entry.items.length}` : ""}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Subtotal</p>
          <p className="num font-serif text-3xl text-forest">{formatNutrient("kcal", totals.kcal)} kcal</p>
        </div>
        <p className="text-sm text-muted">
          P {formatNutrient("protein", totals.protein)} · C {formatNutrient("carb", totals.carb)} · G{" "}
          {formatNutrient("fat", totals.fat)}
        </p>
      </div>

      {meal.items.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-paper px-5 py-10 text-center text-sm text-muted">
          Sin alimentos
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {meal.items.map((item) => {
            const food = getFood(item.foodId);
            if (!food) return null;
            return (
              <li key={item.id} className="rounded-3xl border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold leading-snug">{displayName(food.name)}</p>
                    <p className="mt-1 text-sm text-muted">
                      {food.household || "Porción de la ficha"}
                      {food.grams ? ` · ${food.grams} g/ml` : ""}
                    </p>
                  </div>
                  <p className="num text-sm font-semibold text-forest">
                    {formatNutrient("kcal", food.kcal * item.portions)} kcal
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPortions(item.id, item.portions - 0.25)}
                      className="h-10 w-10 rounded-full bg-cream text-lg font-semibold"
                    >
                      −
                    </button>
                    <input
                      inputMode="decimal"
                      value={item.portions}
                      onChange={(event) => setPortions(item.id, Number(event.target.value.replace(",", ".")))}
                      className="num w-16 rounded-xl border border-line bg-cream px-2 py-2 text-center font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setPortions(item.id, item.portions + 0.25)}
                      className="h-10 w-10 rounded-full bg-cream text-lg font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-semibold text-clay">
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="mt-5 w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream"
      >
        Agregar alimento
      </button>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Total del día</p>
            <p className="num font-semibold">{formatNutrient("kcal", day.kcal)} kcal</p>
          </div>
          <button
            type="button"
            onClick={onSummary}
            className="rounded-2xl bg-clay px-4 py-3 font-semibold text-cream"
          >
            Ver aporte total
          </button>
        </div>
      </div>

      {searchOpen ? <FoodSearch onSelect={addFood} onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}
