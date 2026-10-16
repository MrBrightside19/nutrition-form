import { chromium } from "playwright";

const base = process.env.APP_URL ?? "http://localhost:4173";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(base, { waitUntil: "networkidle" });
await page.getByPlaceholder("Ej: Camila").fill("Gabriel");
await page.getByRole("button", { name: "Nueva encuesta" }).click();
await page.getByRole("heading", { name: "Datos de la persona" }).waitFor();

const nameInput = page.locator("input").nth(0);
const ageInput = page.locator("input").nth(1);
const weightInput = page.locator("input").nth(2);
await nameInput.fill("Ana Pérez");
await ageInput.fill("28");
await weightInput.fill("63");
await page.getByRole("button", { name: "Mujer" }).click();
await page.getByRole("button", { name: "Qué significa cada nivel" }).click();
const help = await page.locator("#actividad-ayuda").innerText();
if (!help.includes("sedentarias")) throw new Error("Falta la ayuda de actividad ligera");
if (!help.includes("30 min")) throw new Error("Falta la ayuda de actividad moderada");
if (!help.includes("todos los días")) throw new Error("Falta la ayuda de actividad alta");
await page.screenshot({ path: "scripts/e2e-activity-help.png", fullPage: true });
await page.getByRole("button", { name: "Ligera" }).click();
await page.getByRole("button", { name: "Registrar alimentos" }).click();
await page.getByRole("button", { name: "Agregar alimento" }).click();
await page.getByPlaceholder("Ej: pan marraqueta, palta, leche").fill("pan marraqueta");
await page.getByRole("button", { name: /Pan marraqueta/i }).first().click();
await page.getByRole("button", { name: "Colación AM" }).click();
await page.getByRole("button", { name: "Agregar alimento" }).click();
await page.getByPlaceholder("Ej: pan marraqueta, palta, leche").fill("pan marraqueta");
await page.getByRole("button", { name: /Pan marraqueta/i }).first().click();
await page.locator("input.num").first().fill("0.5");
await page.getByRole("button", { name: "Ver aporte total" }).click();
await page.getByRole("heading", { name: "Aporte total" }).waitFor();

const body = await page.locator("body").innerText();
if (!body.includes("Ana Pérez")) throw new Error("No aparece el nombre en el resumen");
if (!body.includes("72.5") && !body.includes("72,5")) {
  throw new Error(`Colación AM no muestra 72.5 kcal. Texto:\n${body}`);
}
if (!body.includes("217.5") && !body.includes("217,5")) {
  throw new Error(`Total esperado 217.5 kcal. Texto:\n${body}`);
}
if (!body.includes("1422,1") && !body.includes("1422.1") && !body.includes("1.422,1")) {
  throw new Error(`MB esperado 1422.1. Texto:\n${body}`);
}
if (!body.includes("2218,5") && !body.includes("2218.5") && !body.includes("2.218,5")) {
  throw new Error(`GET esperado 2218.5. Texto:\n${body}`);
}

await page.screenshot({ path: "scripts/e2e-summary.png", fullPage: true });
await page.getByRole("button", { name: "Ir al listado" }).click();
await page.getByRole("heading", { name: "Encuesta Nutricional" }).waitFor();
const home = await page.locator("body").innerText();
if (!home.includes("63 kg")) throw new Error(`El listado no muestra el peso. Texto:\n${home}`);
if (!home.includes("Ligera")) throw new Error(`El listado no muestra la actividad. Texto:\n${home}`);

await browser.close();
console.log("E2E OK: ficha, porciones, MB/GET y resumen coinciden con el Excel.");
