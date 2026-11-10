// Run after a build, with Playwright available on NODE_PATH.
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

async function check(browser, width) {
  const page = await browser.newPage({viewport: {width, height: 740}});
  try {
    const file = pathToFileURL(path.join(__dirname, 'dist/downloads/lesson-5-3.html'));
    await page.context().setOffline(true);
    await page.goto(file.href + '?case=optimum&filmStep=2');
    const rail = page.locator('#film-conditions');
    await page.locator('#film-next:enabled').waitFor();
    assert.match(await rail.innerText(), /当前偏好：完全互补/);
    await page.locator('#film-next').click();
    assert.match(await rail.innerText(), /当前偏好：完全替代/);

    for (const mode of ['existence', 'optimum']) {
      await page.locator('#experiment').evaluate((el, value) => {
        el.value = value;
        el.dispatchEvent(new Event('change', {bubbles: true}));
      }, mode);
      assert.deepEqual(await rail.locator('#film-brief > section').evaluateAll(
        nodes => nodes.map(node => node.id)), [mode + '-situation']);
    }
    await page.locator('#film-play').click();
    await page.evaluate(() => window.scrollBy(0, 230));
    const panel = await rail.boundingBox();
    const plot = await page.locator('#plot').boundingBox();
    assert.ok(panel.y >= 0 && panel.y <= 13);
    assert.ok(width < 760 ? panel.y + panel.height <= plot.y : panel.x + panel.width <= plot.x);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({channel: 'chrome'});
  try {
    for (const width of [390, 1280]) await check(browser, width);
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
