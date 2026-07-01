import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'report.html');
const outPath = path.join(__dirname, 'Prudentia-Q2-2026-Investor-Report.pdf');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2000);

await page.pdf({
  path: outPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: true,
});

await browser.close();
console.log(`Wrote ${outPath}`);