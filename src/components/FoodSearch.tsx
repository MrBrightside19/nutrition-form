import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Food } from "../types";
import { displayName, getFoods, subscribeFoods } from "../lib/foods";
import { searchFoods } from "../lib/search";

type Props = {
  onSelect: (food: Food) => void;
  onClose: () => void;
};

export function FoodSearch({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const foods = useSyncExternalStore(subscribeFoods, getFoods);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchFoods(query), [query, foods]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-cream">
      <div className="border-b border-line bg-paper px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h2 className="font-serif text-xl text-forest">Buscar alimento</h2>
          <button type="button" className="text-sm font-semibold text-clay" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="mx-auto mt-3 max-w-lg">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej: pan marraqueta, palta, leche"
            className="w-full rounded-2xl border border-line bg-cream px-4 py-3 outline-none ring-forest focus:ring-2"
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 py-3">
        {query.trim().length === 0 ? null : results.length === 0 ? (
          <p className="px-1 pt-6 text-center text-sm text-muted">No hay coincidencias para “{query}”.</p>
        ) : (
          <ul className="space-y-2">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => onSelect(food)}
                  className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold leading-snug">{displayName(food.name)}</p>
                      <p className="mt-1 text-sm text-muted">
                        {food.household || "Sin medida casera"}
                        {food.grams ? ` · ${food.grams} g/ml` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-sm font-semibold text-forest">{food.kcal} kcal</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">{food.kind}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
