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
await nameInput.fill("Ana Pérez");
await ageInput.fill("28");
await page.getByRole("button", { name: "Mujer" }).click();
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

await page.screenshot({ path: "scripts/e2e-summary.png", fullPage: true });
await browser.close();
console.log("E2E OK: ficha, porciones y resumen coinciden con el Excel.");
