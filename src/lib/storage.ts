import { MEAL_OPTIONS, type Meal, type Survey } from "../types";

function normalizeMeal(meal: Meal): Meal {
  return {
    ...meal,
    time: typeof meal.time === "string" ? meal.time : "",
    items: Array.isArray(meal.items) ? meal.items : [],
  };
}

function normalizeSurvey(survey: Survey): Survey {
  return {
    ...survey,
    meals: Array.isArray(survey.meals) ? survey.meals.map(normalizeMeal) : [],
  };
}

const SURVEYS_KEY = "r24:surveys";
const INTERVIEWER_KEY = "r24:interviewer";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadInterviewer(): string {
  if (!canUseStorage()) return "";
  return localStorage.getItem(INTERVIEWER_KEY) ?? "";
}

export function saveInterviewer(name: string): void {
  if (!canUseStorage()) return;
  localStorage.setItem(INTERVIEWER_KEY, name);
}

export function loadSurveys(): Survey[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(SURVEYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Survey[];
    return parsed.map(normalizeSurvey).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

export function saveSurvey(survey: Survey): Survey {
  const next = { ...survey, updatedAt: new Date().toISOString() };
  const surveys = loadSurveys().filter((item) => item.id !== next.id);
  surveys.unshift(next);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  return next;
}

export function deleteSurvey(id: string): void {
  const surveys = loadSurveys().filter((item) => item.id !== id);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
}

export function createSurvey(interviewer: string): Survey {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    interviewer,
    personName: "",
    age: "",
    sex: "",
    meals: MEAL_OPTIONS.map((meal) => ({ id: meal.id, name: meal.name, time: "", items: [] })),
  };
}

export function importSurveys(payload: unknown): number {
  const incoming = Array.isArray(payload) ? payload : [payload];
  const current = loadSurveys();
  const byId = new Map(current.map((survey) => [survey.id, survey]));
  let added = 0;

  for (const item of incoming) {
    if (!item || typeof item !== "object" || !("id" in item) || !("meals" in item)) continue;
    const survey = normalizeSurvey(item as Survey);
    if (!byId.has(survey.id)) added += 1;
    byId.set(survey.id, survey);
  }

  const merged = [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(merged));
  return added;
}
