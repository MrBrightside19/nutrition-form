import { useMemo, useState, useSyncExternalStore } from "react";
import { NUTRIENT_KEYS, NUTRIENT_LABELS, type Food, type NutrientKey } from "../types";
import {
  displayName,
  emptyFood,
  getFoods,
  isCatalogDirty,
  removeFood,
  resetFoods,
  saveFood,
  subscribeFoods,
} from "../lib/foods";
import { formatNutrient } from "../lib/calc";
import { searchFoods } from "../lib/search";

type Props = {
  onBack: () => void;
};

const PAGE_SIZE = 20;

const KIND_OPTIONS = [
  { id: "alimento", label: "Alimento" },
  { id: "preparación", label: "Preparación" },
] as const;

export function FoodTable({ onBack }: Props) {
  const foods = useSyncExternalStore(subscribeFoods, getFoods);
  const dirty = useSyncExternalStore(subscribeFoods, isCatalogDirty);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState<Food | null>(null);

  const rows = useMemo(() => {
    const q = query.trim();
    if (q.length === 0) return foods;
    return searchFoods(q, foods.length);
  }, [foods, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);
  const from = rows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const to = currentPage * PAGE_SIZE + visible.length;

  if (draft) {
    return (
      <FoodEditor
        food={draft}
        onChange={setDraft}
        onCancel={() => setDraft(null)}
        onSave={() => {
          if (draft.name.trim().length < 2) return;
          saveFood(draft);
          setDraft(null);
        }}
        onDelete={() => {
          if (draft.id === 0) {
            setDraft(null);
            return;
          }
          if (!confirm("¿Eliminar este alimento?")) return;
          removeFood(draft.id);
          setDraft(null);
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-clay">
        Volver
      </button>
      <div className="mt-4 flex items-end justify-between">
        <h1 className="font-serif text-3xl text-forest">Alimentos</h1>
        <span className="text-sm text-muted">
          {rows.length === 0 ? 0 : `${from}–${to}`} / {rows.length}
        </span>
      </div>

      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(0);
        }}
        placeholder="Buscar"
        className="mt-5 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
      />

      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={() => setDraft(emptyFood())}
          className="w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream"
        >
          Nuevo alimento
        </button>
        {dirty ? (
          <button
            type="button"
            onClick={() => {
              if (!confirm("¿Volver al catálogo original?")) return;
              resetFoods();
            }}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold"
          >
            Restaurar catálogo
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-paper px-5 py-10 text-center text-sm text-muted">
          Sin coincidencias
        </div>
      ) : (
        <div className="-mx-4 mt-6 overflow-x-auto px-4">
          <table className="min-w-[920px] w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-forest text-cream">
                <th className="sticky left-0 z-10 bg-forest px-2 py-2 font-semibold">Alimento</th>
                <th className="px-2 py-2 font-semibold">Medida</th>
                <th className="px-2 py-2 font-semibold">g/ml</th>
                {NUTRIENT_KEYS.map((key) => (
                  <th key={key} className="px-2 py-2 font-semibold">
                    {NUTRIENT_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((food) => (
                <tr
                  key={food.id}
                  className="cursor-pointer border-b border-line bg-paper"
                  onClick={() => setDraft({ ...food })}
                >
                  <td className="sticky left-0 bg-paper px-2 py-2 font-semibold">{displayName(food.name)}</td>
                  <td className="px-2 py-2 text-muted">{food.household || "—"}</td>
                  <td className="num px-2 py-2">{food.grams || "—"}</td>
                  {NUTRIENT_KEYS.map((key) => (
                    <td key={key} className="num px-2 py-2">
                      {formatNutrient(key, food[key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > PAGE_SIZE ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="flex-1 rounded-2xl border border-line bg-paper px-4 py-3 font-semibold disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="num shrink-0 text-sm text-muted">
            {currentPage + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
            className="flex-1 rounded-2xl border border-line bg-paper px-4 py-3 font-semibold disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      ) : null}
    </div>
  );
}

function parseNum(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function FoodEditor({
  food,
  onChange,
  onCancel,
  onSave,
  onDelete,
}: {
  food: Food;
  onChange: (food: Food) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const canSave = food.name.trim().length > 1;

  function setNum<K extends NutrientKey | "grams" | "portion">(key: K, value: string) {
    onChange({ ...food, [key]: parseNum(value) });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onCancel} className="text-sm font-semibold text-clay">
        Volver
      </button>
      <h1 className="mt-4 font-serif text-3xl text-forest">
        {food.id === 0 ? "Nuevo alimento" : displayName(food.name) || "Alimento"}
      </h1>

      <label className="mt-6 block">
        <span className="text-sm font-semibold">Nombre</span>
        <input
          value={food.name}
          onChange={(event) => onChange({ ...food, name: event.target.value })}
          className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-semibold">Medida</span>
        <input
          value={food.household}
          onChange={(event) => onChange({ ...food, household: event.target.value })}
          className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
        />
      </label>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-sm font-semibold">g/ml</span>
          <input
            inputMode="decimal"
            value={food.grams}
            onChange={(event) => setNum("grams", event.target.value)}
            className="num mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Porción</span>
          <input
            inputMode="decimal"
            value={food.portion}
            onChange={(event) => setNum("portion", event.target.value)}
            className="num mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
          />
        </label>
      </div>

      <p className="mt-4 text-sm font-semibold">Tipo</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {KIND_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ ...food, kind: option.id })}
            className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold ${
              food.kind === option.id ? "border-forest bg-forest text-cream" : "border-line bg-paper"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {NUTRIENT_KEYS.map((key) => (
          <label key={key} className="block">
            <span className="text-sm font-semibold">{NUTRIENT_LABELS[key]}</span>
            <input
              inputMode="decimal"
              value={food[key]}
              onChange={(event) => setNum(key, event.target.value)}
              className="num mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={onSave}
        className="mt-8 w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream disabled:opacity-40"
      >
        Guardar
      </button>
      {food.id !== 0 ? (
        <button
          type="button"
          onClick={onDelete}
          className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold text-clay"
        >
          Eliminar
        </button>
      ) : null}
    </div>
  );
}
