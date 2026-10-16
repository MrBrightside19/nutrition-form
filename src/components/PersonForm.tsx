import { useState } from "react";
import { ACTIVITY_OPTIONS, MEAL_OPTIONS, type Sex, type Survey } from "../types";
import { parseWeight } from "../lib/energy";

type Props = {
  survey: Survey;
  onChange: (survey: Survey) => void;
  onContinue: () => void;
  onBack: () => void;
};

const SEX_OPTIONS: { id: Sex; label: string }[] = [
  { id: "mujer", label: "Mujer" },
  { id: "hombre", label: "Hombre" },
  { id: "otro", label: "Otro" },
];

export function PersonForm({ survey, onChange, onContinue, onBack }: Props) {
  const [showActivityHelp, setShowActivityHelp] = useState(false);
  const selected = new Set(survey.meals.map((meal) => meal.id));
  const canContinue =
    survey.personName.trim().length > 1 &&
    survey.age.trim().length > 0 &&
    survey.sex !== "" &&
    parseWeight(survey.weight) > 0 &&
    survey.activityLevel !== "" &&
    survey.meals.length > 0;

  function toggleMeal(id: string, name: string) {
    const exists = survey.meals.some((meal) => meal.id === id);
    const meals = exists
      ? survey.meals.filter((meal) => meal.id !== id)
      : [...survey.meals, { id, name, time: "", items: [] }].sort(
          (a, b) => MEAL_OPTIONS.findIndex((m) => m.id === a.id) - MEAL_OPTIONS.findIndex((m) => m.id === b.id),
        );
    onChange({ ...survey, meals });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-clay">
        Volver
      </button>
      <h1 className="mt-4 font-serif text-3xl text-forest">Datos de la persona</h1>

      <label className="mt-6 block text-sm font-semibold">Nombre</label>
      <input
        value={survey.personName}
        onChange={(event) => onChange({ ...survey, personName: event.target.value })}
        className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
      />

      <label className="mt-4 block text-sm font-semibold">Edad</label>
      <input
        inputMode="numeric"
        value={survey.age}
        onChange={(event) => onChange({ ...survey, age: event.target.value.replace(/[^\d]/g, "") })}
        className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
      />

      <label className="mt-4 block text-sm font-semibold">Peso (kg)</label>
      <input
        inputMode="decimal"
        value={survey.weight}
        onChange={(event) => onChange({ ...survey, weight: event.target.value.replace(/[^\d.,]/g, "") })}
        className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
      />

      <p className="mt-4 text-sm font-semibold">Sexo</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SEX_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ ...survey, sex: option.id })}
            className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold ${
              survey.sex === option.id ? "border-forest bg-forest text-cream" : "border-line bg-paper"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <p className="text-sm font-semibold">Actividad física</p>
        <button
          type="button"
          aria-label="Qué significa cada nivel"
          aria-expanded={showActivityHelp}
          aria-controls="actividad-ayuda"
          onClick={() => setShowActivityHelp((open) => !open)}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
            showActivityHelp ? "border-forest bg-forest text-cream" : "border-forest text-forest"
          }`}
        >
          ?
        </button>
      </div>
      {showActivityHelp ? (
        <div
          id="actividad-ayuda"
          role="note"
          className="mt-2 space-y-3 rounded-2xl border border-line bg-paper px-4 py-3 text-sm text-muted"
        >
          {ACTIVITY_OPTIONS.map((option) => (
            <p key={option.id}>
              <span className="font-semibold text-ink">{option.label}. </span>
              {option.help}
            </p>
          ))}
        </div>
      ) : null}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {ACTIVITY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange({ ...survey, activityLevel: option.id })}
            className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold ${
              survey.activityLevel === option.id ? "border-forest bg-forest text-cream" : "border-line bg-paper"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-semibold">Comidas</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {MEAL_OPTIONS.map((meal) => (
          <button
            key={meal.id}
            type="button"
            onClick={() => toggleMeal(meal.id, meal.name)}
            className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
              selected.has(meal.id)
                ? "border-forest bg-forest text-cream"
                : "border-dashed border-line bg-paper text-muted"
            }`}
          >
            {selected.has(meal.id) ? `✓ ${meal.name}` : meal.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="mt-8 w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream disabled:opacity-40"
      >
        Registrar alimentos
      </button>
    </div>
  );
}
