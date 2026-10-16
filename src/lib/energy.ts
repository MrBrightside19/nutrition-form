import type { ActivityLevel, Sex, Survey } from "../types";

const PAL: Record<Exclude<Sex, "otro">, Record<ActivityLevel, number>> = {
  hombre: { ligera: 1.55, moderada: 1.78, alta: 2.1 },
  mujer: { ligera: 1.56, moderada: 1.64, alta: 1.82 },
};

function equationSex(sex: Sex): Exclude<Sex, "otro"> {
  return sex === "hombre" ? "hombre" : "mujer";
}

export function parseWeight(value: string): number {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function round1(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function bmrKcal(sex: Sex, age: number, weight: number): number {
  const male = equationSex(sex) === "hombre";
  if (age < 3) return male ? 60.9 * weight - 54 : 61.0 * weight - 51;
  if (age < 10) return male ? 22.7 * weight + 495 : 22.5 * weight + 499;
  if (age < 18) return male ? 17.5 * weight + 651 : 12.2 * weight + 746;
  if (age <= 30) return male ? 15.3 * weight + 679 : 14.7 * weight + 496;
  if (age <= 60) return male ? 11.6 * weight + 879 : 8.7 * weight + 829;
  return male ? 13.5 * weight + 487 : 10.5 * weight + 596;
}

export function basalMetabolism(survey: Survey): number | null {
  const age = Number(survey.age);
  const weight = parseWeight(survey.weight);
  if (!survey.sex || !Number.isFinite(age) || age < 0 || weight <= 0) return null;
  return round1(bmrKcal(survey.sex, age, weight));
}

export function activityFactor(survey: Survey): number | null {
  if (!survey.sex || !survey.activityLevel) return null;
  return PAL[equationSex(survey.sex)][survey.activityLevel];
}

export function totalEnergyExpenditure(survey: Survey): number | null {
  const mb = basalMetabolism(survey);
  const pal = activityFactor(survey);
  if (mb == null || pal == null) return null;
  return round1(mb * pal);
}

export function energyBalance(intakeKcal: number, survey: Survey): number | null {
  const get = totalEnergyExpenditure(survey);
  if (get == null) return null;
  return round1(intakeKcal - get);
}

export function activityLabel(level: ActivityLevel | ""): string {
  if (level === "ligera") return "Ligera";
  if (level === "moderada") return "Moderada";
  if (level === "alta") return "Alta";
  return "";
}

export function formatEnergy(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("es-CL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatFactor(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
