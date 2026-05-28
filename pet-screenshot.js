const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1000, height: 600 });
  await page.goto('file://' + path.resolve(__dirname, 'pet-preview.html'));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.resolve(__dirname, 'pet-preview.png'), fullPage: false });
  await browser.close();
  console.log('Screenshot saved: pet-preview.png');
})();
