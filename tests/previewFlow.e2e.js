const fs = require('fs');
const http = require('http');
const path = require('path');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.css') return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function createStaticServer(rootDir) {
  return http.createServer((req, res) => {
    const urlPath = req.url === '/' ? '/index.html' : req.url;
    const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(data);
    });
  });
}

async function run() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (_error) {
    console.log('E2E skipped: playwright package is not available.');
    return;
  }

  const { chromium } = playwright;
  const server = createStaticServer(path.resolve(__dirname, '..'));

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (_error) {
    console.log('E2E skipped: Playwright browser runtime is not installed (run `npx playwright install chromium`).');
    await new Promise((resolve) => server.close(resolve));
    return;
  }

  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/index.html`);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('carbRatio', '10');
      localStorage.setItem('sensitivityFactor', '50');
      localStorage.setItem('targetBG', '100');
      localStorage.setItem('iobEnabled', 'false');
      localStorage.setItem('logData', JSON.stringify([]));
    });
    await page.reload();

    await page.fill('#currentBG', '150');
    await page.fill('#mealCarbs', '60');
    await page.click('#calculateButton');

    const previewText = (await page.textContent('#result')).trim();
    assert(previewText === 'Total Bolus: 7', `Expected preview dose of 7, received "${previewText}".`);

    const actionsVisible = await page.isVisible('#previewActions');
    assert(actionsVisible, 'Preview actions should be visible after calculating.');

    let logLength = await page.evaluate(() => JSON.parse(localStorage.getItem('logData') || '[]').length);
    assert(logLength === 0, 'Preview should not write to logData.');

    await page.click('#cancelPreviewButton');

    const resultAfterCancel = ((await page.textContent('#result')) || '').trim();
    assert(resultAfterCancel === '', 'Cancel should clear the preview result text.');

    const bgValueAfterCancel = await page.inputValue('#currentBG');
    const carbsValueAfterCancel = await page.inputValue('#mealCarbs');
    assert(bgValueAfterCancel === '150', 'Cancel should preserve BG input.');
    assert(carbsValueAfterCancel === '60', 'Cancel should preserve carbs input.');

    logLength = await page.evaluate(() => JSON.parse(localStorage.getItem('logData') || '[]').length);
    assert(logLength === 0, 'Cancel should not write to logData.');

    await page.click('#calculateButton');
    await page.click('#logBolusButton');

    const loggedEntry = await page.evaluate(() => {
      const logData = JSON.parse(localStorage.getItem('logData') || '[]');
      return logData[logData.length - 1];
    });
    assert(loggedEntry && Number(loggedEntry.totalBolus) === 7, 'Log Bolus should persist the previewed bolus.');

    const calculateButtonVisible = await page.isVisible('#calculateButton');
    const newCalculationVisible = await page.isVisible('#newCalculationButton');
    assert(!calculateButtonVisible && newCalculationVisible, 'After logging, calculator should switch to locked state.');

    await page.click('#newCalculationButton');
    const bgValueAfterReset = await page.inputValue('#currentBG');
    const carbsValueAfterReset = await page.inputValue('#mealCarbs');
    assert(bgValueAfterReset === '' && carbsValueAfterReset === '', 'New Calculation should clear inputs.');
    assert(await page.isVisible('#calculateButton'), 'Calculate should be visible after reset.');
    assert(!(await page.isVisible('#previewActions')), 'Preview actions should be hidden after reset.');

    console.log('✔ preview/log/cancel flow works in browser automation');
  } finally {
    await page.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
