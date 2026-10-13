import type { Workbook, Worksheet } from "exceljs";
import type { NutrientKey, Survey } from "../types";
import { NUTRIENT_KEYS, NUTRIENT_LABELS } from "../types";
import { emptyTotals, mealTotals, roundNutrient, surveyTotals } from "./calc";
import { displayName, getFood } from "./foods";

const BLACK = "FF000000";
const WHITE = "FFFFFFFF";
const GOLD = "FFFFCC00";

const EXCEL_MEALS = [
  { id: "desayuno", label: "DESAYUNO" },
  { id: "colacion_am", label: "COLACION AM" },
  { id: "almuerzo", label: "ALMUERZO" },
  { id: "once", label: "ONCE" },
  { id: "cena", label: "CENA" },
  { id: "colacion_pm", label: "COLACION PM" },
] as const;

const EXCEL_NUTRIENT_HEADERS = [
  "Kcals",
  "HdeC  g",
  "Lípidos   g",
  "Proteínas   g",
  "Fibra dietaria  g",
  "AGS   g",
  "AGM   g",
  "AGP   g",
  "Colesterol  mg",
  "Calcio  mg",
  "Fosforo   mg",
  "Potasio   mg",
  "Sodio   mg",
  "Hierro   mg",
  "VIT A   mg",
  "VIT C   mg",
  "VIT E   mg",
] as const;

const thinWhite = { style: "thin" as const, color: { argb: WHITE } };
const mediumWhite = { style: "medium" as const, color: { argb: WHITE } };

function nutrientNumFmt(key: NutrientKey): string {
  return key === "kcal" ? "0.00" : "0.000";
}

function fileSlug(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "encuesta"
  );
}

function sheetName(value: string, used: Set<string>): string {
  const base = value.replace(/[\\/*?:\[\]]/g, " ").trim().slice(0, 28) || "Ficha";
  let name = base;
  let i = 2;
  while (used.has(name)) {
    name = `${base.slice(0, 26)} ${i}`;
    i += 1;
  }
  used.add(name);
  return name;
}

async function excelLib() {
  const mod = await import("exceljs");
  return mod.default;
}

function paintBlack(cell: { fill: unknown; border: unknown }) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLACK } };
  cell.border = {
    top: thinWhite,
    left: thinWhite,
    bottom: thinWhite,
    right: thinWhite,
  };
}

function applyAporteColumns(sheet: Worksheet) {
  sheet.getColumn(1).width = 20;
  sheet.getColumn(2).width = 10.2;
  for (let col = 3; col <= 17; col += 1) sheet.getColumn(col).width = 6.7;
  sheet.getColumn(18).width = 9.5;
  sheet.views = [{ showGridLines: false, zoomScale: 120 }];
  sheet.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9,
  };
}

function writeAporteTable(sheet: Worksheet, survey: Survey, headerRow: number) {
  applyAporteColumns(sheet);

  const header = sheet.getRow(headerRow);
  header.height = 82;
  header.getCell(1).value = "COMIDAS";
  header.getCell(1).font = { name: "Arial", size: 14, bold: true, color: { argb: WHITE } };
  header.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  paintBlack(header.getCell(1));
  header.getCell(1).border = {
    top: mediumWhite,
    left: mediumWhite,
    bottom: mediumWhite,
    right: mediumWhite,
  };

  EXCEL_NUTRIENT_HEADERS.forEach((label, index) => {
    const cell = header.getCell(index + 2);
    cell.value = label;
    cell.font = { name: "Arial", size: index === 0 ? 11 : 10, bold: true, color: { argb: GOLD } };
    cell.alignment = { horizontal: "center", vertical: "middle", textRotation: 90, wrapText: true };
    paintBlack(cell);
    cell.border = {
      top: mediumWhite,
      left: thinWhite,
      bottom: mediumWhite,
      right: index === EXCEL_NUTRIENT_HEADERS.length - 1 ? mediumWhite : thinWhite,
    };
  });

  EXCEL_MEALS.forEach((mealDef, mealIndex) => {
    const meal = survey.meals.find((item) => item.id === mealDef.id);
    const totals = meal ? mealTotals(meal) : emptyTotals();
    const row = sheet.getRow(headerRow + 1 + mealIndex);
    row.height = 18;
    const nameCell = row.getCell(1);
    nameCell.value = mealDef.label;
    nameCell.font = { name: "Arial", size: 10, bold: true, color: { argb: WHITE } };
    nameCell.alignment = { horizontal: "left", vertical: "middle" };
    paintBlack(nameCell);
    nameCell.border = {
      top: thinWhite,
      left: mediumWhite,
      bottom: mealIndex === EXCEL_MEALS.length - 1 ? mediumWhite : thinWhite,
      right: mediumWhite,
    };

    NUTRIENT_KEYS.forEach((key, index) => {
      const cell = row.getCell(index + 2);
      cell.value = roundNutrient(key, totals[key]);
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: WHITE } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.numFmt = nutrientNumFmt(key);
      paintBlack(cell);
      cell.border = {
        top: thinWhite,
        left: thinWhite,
        bottom: mealIndex === EXCEL_MEALS.length - 1 ? mediumWhite : thinWhite,
        right: index === NUTRIENT_KEYS.length - 1 ? mediumWhite : thinWhite,
      };
    });
  });

  const total = surveyTotals(survey);
  const totalRow = sheet.getRow(headerRow + 7);
  totalRow.height = 18;
  const totalName = totalRow.getCell(1);
  totalName.value = "TOTAL minuta";
  totalName.font = { name: "Arial", size: 10, bold: true, color: { argb: GOLD } };
  totalName.alignment = { horizontal: "left", vertical: "middle" };
  paintBlack(totalName);
  totalName.border = {
    top: mediumWhite,
    left: mediumWhite,
    bottom: mediumWhite,
    right: mediumWhite,
  };

  NUTRIENT_KEYS.forEach((key, index) => {
    const cell = totalRow.getCell(index + 2);
    cell.value = roundNutrient(key, total[key]);
    cell.font = { name: "Arial", size: 11, bold: true, color: { argb: GOLD } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.numFmt = nutrientNumFmt(key);
    paintBlack(cell);
    cell.border = {
      top: mediumWhite,
      left: thinWhite,
      bottom: mediumWhite,
      right: index === NUTRIENT_KEYS.length - 1 ? mediumWhite : thinWhite,
    };
  });
}

function writePersonHeader(sheet: Worksheet, survey: Survey) {
  const lines = [
    ["Nombre", survey.personName || "Sin nombre"],
    ["Edad", survey.age],
    ["Sexo", survey.sex],
    ["Encuestador", survey.interviewer],
    ["Fecha", new Date(survey.createdAt).toLocaleString("es-CL")],
  ];
  lines.forEach((pair, index) => {
    const row = sheet.getRow(index + 1);
    row.getCell(1).value = pair[0];
    row.getCell(2).value = pair[1];
    row.getCell(1).font = { name: "Arial", size: 10, bold: true };
    row.getCell(2).font = { name: "Arial", size: 10 };
  });
}

function writeDetalle(sheet: Worksheet, survey: Survey) {
  const headers = [
    "Comida",
    "Alimento",
    "Tipo",
    "Porción pirámide",
    "gr/ml",
    "Cant. porciones",
    ...NUTRIENT_KEYS.map((key) => NUTRIENT_LABELS[key]),
  ];
  sheet.addRow(headers);
  const header = sheet.getRow(1);
  header.font = { name: "Arial", size: 10, bold: true };
  header.height = 22;

  for (const meal of survey.meals) {
    for (const item of meal.items) {
      const food = getFood(item.foodId);
      if (!food) continue;
      const dataRow = sheet.addRow([
        meal.name,
        displayName(food.name),
        food.kind,
        food.household || "",
        food.grams ?? 0,
        item.portions,
        ...NUTRIENT_KEYS.map((key) => roundNutrient(key, food[key] * item.portions)),
      ]);
      dataRow.getCell(5).numFmt = "0.00";
      dataRow.getCell(6).numFmt = "0.00";
      NUTRIENT_KEYS.forEach((key, index) => {
        dataRow.getCell(7 + index).numFmt = nutrientNumFmt(key);
      });
    }
  }

  sheet.columns.forEach((col, index) => {
    col.width = index === 1 ? 36 : 14;
  });
}

function writeResumen(sheet: Worksheet, surveys: Survey[]) {
  const headers = ["Nombre", "Edad", "Sexo", "Encuestador", "Fecha", ...EXCEL_NUTRIENT_HEADERS];
  const header = sheet.getRow(1);
  header.height = 36;
  headers.forEach((label, index) => {
    const cell = header.getCell(index + 1);
    cell.value = label;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: GOLD } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    paintBlack(cell);
  });

  surveys.forEach((survey, index) => {
    const total = surveyTotals(survey);
    const row = sheet.getRow(index + 2);
    const values = [
      survey.personName,
      survey.age,
      survey.sex,
      survey.interviewer,
      new Date(survey.createdAt).toLocaleString("es-CL"),
      ...NUTRIENT_KEYS.map((key) => roundNutrient(key, total[key])),
    ];
    values.forEach((value, col) => {
      const cell = row.getCell(col + 1);
      cell.value = value;
      cell.font = { name: "Arial", size: 10 };
      if (col >= 5) {
        cell.numFmt = nutrientNumFmt(NUTRIENT_KEYS[col - 5]);
        cell.alignment = { horizontal: "center" };
      }
    });
  });

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 8;
  sheet.getColumn(3).width = 10;
  sheet.getColumn(4).width = 16;
  sheet.getColumn(5).width = 20;
  for (let col = 6; col <= headers.length; col += 1) sheet.getColumn(col).width = 11;
}

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

async function workbookFile(workbook: Workbook, filename: string): Promise<File> {
  const buffer = await workbook.xlsx.writeBuffer();
  return new File([buffer], filename, { type: XLSX_TYPE });
}

function jsonFile(payload: unknown, filename: string): File {
  return new File([JSON.stringify(payload, null, 2)], filename, { type: "application/json" });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

async function shareFile(file: File, title: string): Promise<void> {
  try {
    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return;
    }
  } catch (error) {
    if (error instanceof DOMException && (error.name === "AbortError" || error.name === "NotAllowedError")) {
      return;
    }
  }
  downloadFile(file);
}

async function surveyWorkbook(survey: Survey): Promise<Workbook> {
  const ExcelJS = await excelLib();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Recordatorio 24 horas";
  const aporte = workbook.addWorksheet("APORTE_TOTAL");
  writePersonHeader(aporte, survey);
  writeAporteTable(aporte, survey, 10);
  writeDetalle(workbook.addWorksheet("DETALLE"), survey);
  return workbook;
}

async function allWorkbook(surveys: Survey[]): Promise<Workbook> {
  const ExcelJS = await excelLib();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Recordatorio 24 horas";
  writeResumen(workbook.addWorksheet("RESUMEN"), surveys);
  const used = new Set<string>(["RESUMEN"]);
  for (const survey of surveys) {
    const aporte = workbook.addWorksheet(sheetName(survey.personName || "Sin nombre", used));
    writePersonHeader(aporte, survey);
    writeAporteTable(aporte, survey, 10);
  }
  return workbook;
}

export async function exportSurveyExcel(survey: Survey): Promise<void> {
  downloadFile(await workbookFile(await surveyWorkbook(survey), `aporte-${fileSlug(survey.personName)}.xlsx`));
}

export async function exportAllExcel(surveys: Survey[]): Promise<void> {
  downloadFile(await workbookFile(await allWorkbook(surveys), "aportes-totales.xlsx"));
}

export function exportSurveyJson(survey: Survey): void {
  downloadFile(jsonFile(survey, `encuesta-${fileSlug(survey.personName)}.json`));
}

export function exportAllJson(surveys: Survey[]): void {
  downloadFile(jsonFile(surveys, "encuestas-recordatorio.json"));
}

export async function shareSurveyExcel(survey: Survey): Promise<void> {
  await shareFile(
    await workbookFile(await surveyWorkbook(survey), `aporte-${fileSlug(survey.personName)}.xlsx`),
    `Aporte ${survey.personName || "sin nombre"}`,
  );
}

export async function shareSurveyJson(survey: Survey): Promise<void> {
  await shareFile(jsonFile(survey, `encuesta-${fileSlug(survey.personName)}.json`), `Ficha ${survey.personName || "sin nombre"}`);
}

export async function shareAllExcel(surveys: Survey[]): Promise<void> {
  await shareFile(await workbookFile(await allWorkbook(surveys), "aportes-totales.xlsx"), "Aportes totales");
}

export async function shareAllJson(surveys: Survey[]): Promise<void> {
  await shareFile(jsonFile(surveys, "encuestas-recordatorio.json"), "Fichas recordatorio");
}
