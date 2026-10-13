import { useRef } from "react";
import type { Survey } from "../types";
import { formatNutrient, surveyTotals } from "../lib/calc";
import { exportAllExcel, exportAllJson, shareAllExcel, shareAllJson } from "../lib/export";

type Props = {
  interviewer: string;
  surveys: Survey[];
  onInterviewerChange: (value: string) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onImport: (file: File) => void;
  onOpenFoods: () => void;
};

export function Home({
  interviewer,
  surveys,
  onInterviewerChange,
  onCreate,
  onOpen,
  onDelete,
  onImport,
  onOpenFoods,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="font-serif text-4xl leading-tight text-forest">Encuesta Nutricional</h1>

      <label className="mt-6 block text-sm font-semibold">Encuestador</label>
      <input
        value={interviewer}
        onChange={(event) => onInterviewerChange(event.target.value)}
        placeholder="Ej: Camila"
        className="mt-2 w-full rounded-2xl border border-line bg-paper px-4 py-3 outline-none ring-forest focus:ring-2"
      />

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 w-full rounded-2xl bg-forest px-4 py-3.5 font-semibold text-cream"
      >
        Nueva encuesta
      </button>

      <div className="mt-8 flex items-end justify-between">
        <h2 className="font-serif text-2xl text-forest">Fichas</h2>
        <span className="text-sm text-muted">{surveys.length}</span>
      </div>

      {surveys.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-line bg-paper px-5 py-10 text-center text-sm text-muted">
          Sin fichas
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {surveys.map((survey) => {
            const total = surveyTotals(survey);
            const filled = survey.meals.filter((meal) => meal.items.length > 0).length;
            return (
              <li key={survey.id} className="rounded-3xl border border-line bg-paper p-4">
                <button type="button" onClick={() => onOpen(survey.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{survey.personName || "Sin nombre"}</p>
                      <p className="mt-1 text-sm text-muted">
                        {survey.age ? `${survey.age} años` : "Edad s/n"}
                        {survey.sex ? ` · ${survey.sex}` : ""}
                        {survey.interviewer ? ` · ${survey.interviewer}` : ""}
                      </p>
                    </div>
                    <p className="num text-sm font-semibold text-forest">
                      {formatNutrient("kcal", total.kcal)} kcal
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {filled} comidas · {new Date(survey.updatedAt).toLocaleString("es-CL")}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(survey.id)}
                  className="mt-3 text-xs font-semibold text-clay"
                >
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 font-serif text-2xl text-forest">Alimentos</h2>
      <button
        type="button"
        onClick={onOpenFoods}
        className="mt-3 w-full rounded-2xl border border-forest px-4 py-3 font-semibold text-forest"
      >
        Tabla de alimentos
      </button>

      <h2 className="mt-10 font-serif text-2xl text-forest">Salidas</h2>
      <div className="mt-3 space-y-2">
        <button
          type="button"
          disabled={surveys.length === 0}
          onClick={() => exportAllExcel(surveys)}
          className="w-full rounded-2xl border border-forest px-4 py-3 font-semibold text-forest disabled:opacity-40"
        >
          Exportar todas a Excel
        </button>
        <button
          type="button"
          disabled={surveys.length === 0}
          onClick={() => shareAllExcel(surveys)}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold disabled:opacity-40"
        >
          Compartir Excel
        </button>
        <button
          type="button"
          disabled={surveys.length === 0}
          onClick={() => exportAllJson(surveys)}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold disabled:opacity-40"
        >
          Descargar respaldo JSON
        </button>
        <button
          type="button"
          disabled={surveys.length === 0}
          onClick={() => shareAllJson(surveys)}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold disabled:opacity-40"
        >
          Compartir JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-semibold"
        >
          Importar fichas de otro celular
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
