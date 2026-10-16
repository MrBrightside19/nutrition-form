import type { NutrientKey, Survey } from "../types";
import { NUTRIENT_KEYS, NUTRIENT_LABELS } from "../types";
import { formatNutrient, mealTotals, surveyTotals } from "../lib/calc";
import { activityLabel, basalMetabolism, energyBalance, formatEnergy, totalEnergyExpenditure } from "../lib/energy";
import { exportSurveyExcel, exportSurveyJson, shareSurveyExcel, shareSurveyJson } from "../lib/export";

type Props = {
  survey: Survey;
  onBack: () => void;
  onHome: () => void;
};

const HIGHLIGHT: NutrientKey[] = ["carb", "fat", "protein", "fiber"];

export function Summary({ survey, onBack, onHome }: Props) {
  const total = surveyTotals(survey);
  const mb = basalMetabolism(survey);
  const get = totalEnergyExpenditure(survey);
  const balance = energyBalance(total.kcal, survey);

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onBack} className="text-sm font-semibold text-clay">
        Seguir editando
      </button>
      <h1 className="mt-4 font-serif text-3xl text-forest">Aporte total</h1>
      <p className="mt-2 text-sm text-muted">
        {survey.personName || "Sin nombre"}
        {survey.age ? ` · ${survey.age} años` : ""}
        {survey.weight ? ` · ${survey.weight} kg` : ""}
        {survey.sex ? ` · ${survey.sex}` : ""}
        {survey.activityLevel ? ` · ${activityLabel(survey.activityLevel)}` : ""}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-line bg-paper px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Ingesta</p>
          <p className="num mt-1 font-serif text-2xl text-forest">{formatNutrient("kcal", total.kcal)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">MB</p>
          <p className="num mt-1 font-serif text-2xl text-forest">{formatEnergy(mb)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">GET</p>
          <p className="num mt-1 font-serif text-2xl text-forest">{formatEnergy(get)}</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Balance</p>
          <p className="num mt-1 font-serif text-2xl text-forest">{formatEnergy(balance)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {HIGHLIGHT.map((key) => (
          <div key={key} className="rounded-2xl border border-line bg-paper px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">{NUTRIENT_LABELS[key]}</p>
            <p className="num mt-1 font-serif text-2xl text-forest">{formatNutrient(key, total[key])}</p>
          </div>
        ))}
      </div>

      <div className="-mx-4 mt-6 overflow-x-auto px-4">
        <table className="min-w-[720px] w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-forest text-cream">
              <th className="px-2 py-2 font-semibold">Comida</th>
              {NUTRIENT_KEYS.map((key) => (
                <th key={key} className="px-2 py-2 font-semibold">
                  {NUTRIENT_LABELS[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {survey.meals.map((meal) => {
              const totals = mealTotals(meal);
              return (
                <tr key={meal.id} className="border-b border-line bg-paper">
                  <td className="px-2 py-2 font-semibold">
                    {meal.name}
                    {meal.time ? ` · ${meal.time}` : ""}
                  </td>
                  {NUTRIENT_KEYS.map((key) => (
                    <td key={key} className="num px-2 py-2">
                      {formatNutrient(key, totals[key])}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr className="bg-clay-soft font-semibold">
              <td className="px-2 py-2">TOTAL minuta</td>
              {NUTRIENT_KEYS.map((key) => (
                <td key={key} className="num px-2 py-2">
                  {formatNutrient(key, total[key])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={() => exportSurveyExcel(survey)}
          className="w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream"
        >
          Descargar Excel de esta persona
        </button>
        <button
          type="button"
          onClick={() => shareSurveyExcel(survey)}
          className="w-full rounded-2xl border border-forest px-4 py-3 font-semibold text-forest"
        >
          Compartir Excel
        </button>
        <button
          type="button"
          onClick={() => exportSurveyJson(survey)}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold"
        >
          Descargar JSON
        </button>
        <button
          type="button"
          onClick={() => shareSurveyJson(survey)}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold"
        >
          Compartir JSON
        </button>
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold"
        >
          Ir al listado
        </button>
      </div>
    </div>
  );
}
