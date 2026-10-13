import { useMemo, useState } from "react";
import { FoodTable } from "./components/FoodTable";
import { Home } from "./components/Home";
import { MealEditor } from "./components/MealEditor";
import { PersonForm } from "./components/PersonForm";
import { Summary } from "./components/Summary";
import {
  createSurvey,
  deleteSurvey,
  importSurveys,
  loadInterviewer,
  loadSurveys,
  saveInterviewer,
  saveSurvey,
} from "./lib/storage";
import type { Survey } from "./types";

type Screen = "home" | "person" | "meals" | "summary" | "foods";

export default function App() {
  const [interviewer, setInterviewer] = useState(loadInterviewer);
  const [surveys, setSurveys] = useState(loadSurveys);
  const [screen, setScreen] = useState<Screen>("home");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [mealId, setMealId] = useState("desayuno");

  const current = useMemo(
    () => surveys.find((survey) => survey.id === currentId) ?? null,
    [surveys, currentId],
  );

  function persist(survey: Survey) {
    const saved = saveSurvey(survey);
    setSurveys(loadSurveys());
    setCurrentId(saved.id);
    return saved;
  }

  function handleInterviewer(value: string) {
    setInterviewer(value);
    saveInterviewer(value);
  }

  function handleCreate() {
    const survey = persist(createSurvey(interviewer));
    setMealId(survey.meals[0]?.id ?? "desayuno");
    setScreen("person");
  }

  function handleOpen(id: string) {
    const survey = surveys.find((item) => item.id === id);
    setCurrentId(id);
    setMealId(survey?.meals[0]?.id ?? "desayuno");
    setScreen("person");
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta encuesta de este celular?")) return;
    deleteSurvey(id);
    setSurveys(loadSurveys());
    if (currentId === id) {
      setCurrentId(null);
      setScreen("home");
    }
  }

  async function handleImport(file: File) {
    try {
      const payload = JSON.parse(await file.text()) as unknown;
      const added = importSurveys(payload);
      setSurveys(loadSurveys());
      alert(added > 0 ? `Se importaron ${added} fichas nuevas.` : "No había fichas nuevas para importar.");
    } catch {
      alert("No se pudo leer ese archivo. Usa un JSON exportado desde esta app.");
    }
  }

  if (screen === "foods") {
    return <FoodTable onBack={() => setScreen("home")} />;
  }

  if (screen === "home" || !current) {
    return (
      <Home
        interviewer={interviewer}
        surveys={surveys}
        onInterviewerChange={handleInterviewer}
        onCreate={handleCreate}
        onOpen={handleOpen}
        onDelete={handleDelete}
        onImport={handleImport}
        onOpenFoods={() => setScreen("foods")}
      />
    );
  }

  if (screen === "person") {
    return (
      <PersonForm
        survey={current}
        onChange={persist}
        onContinue={() => {
          setMealId(current.meals[0]?.id ?? "desayuno");
          setScreen("meals");
        }}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "summary") {
    return (
      <Summary survey={current} onBack={() => setScreen("meals")} onHome={() => setScreen("home")} />
    );
  }

  return (
    <MealEditor
      survey={current}
      mealId={current.meals.some((meal) => meal.id === mealId) ? mealId : current.meals[0].id}
      onMealId={setMealId}
      onChange={persist}
      onSummary={() => setScreen("summary")}
      onBack={() => setScreen("person")}
    />
  );
}
