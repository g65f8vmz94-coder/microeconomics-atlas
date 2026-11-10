const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const {insurancePage} = require('./build.cjs');
const {contracts, ledger, amount} = require('./model.js');

async function assertPanel(page, name) {
  const visible = page.locator('.lesson-panel:visible');
  assert.equal(await visible.count(), 1);
  assert.ok(await visible.evaluate((el, name) => el.classList.contains(name), name));
}

async function assertClosed(page) {
  for (const selector of ['.proof-section', '.practice-panel']) {
    const panel = page.locator(selector);
    assert.equal(await panel.boundingBox(), null, selector + ' occupies layout');
    assert.equal(await panel.locator('a:visible, input:visible, summary:visible').count(), 0);
  }
  const tree = await page.locator('body').ariaSnapshot();
  assert.doesNotMatch(tree, /heading .*完整书写答案|显示思路旁注|跳到书写答案|跳到迁移练习|换一份保单|核对我的账/);
}

async function checkFlow(browser, file, width, js) {
  const ctx = await browser.newContext({
    viewport: {width, height: width === 320 ? 720 : 900}, isMobile: width === 320,
    javaScriptEnabled: js, reducedMotion: 'reduce', offline: true
  });
  const page = await ctx.newPage();
  const errors = [], remoteRequests = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/^https?:/.test(r.url())) remoteRequests.push(r.url()); });
  try {
    await page.goto(file);
    await assertPanel(page, 'ledger-panel');
    await page.locator('#problem summary').click();
    assert.ok(await page.locator('.question-body').isVisible());
    await page.locator('#problem summary').click();

    // Scrolling to the end, moving through the tab order, or directly focusing
    // a non-current panel must not expose a future answer.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await assertClosed(page);
    await page.locator('#notes').evaluate(el => el.focus());
    for (let i = 0; i < 16; i++) {
      assert.ok(await page.evaluate(() => !document.activeElement.closest('.proof-section, .practice-panel, .proof-skip, .practice-skip')));
      await page.keyboard.press('Tab');
    }

    for (const name of ['fair', 'loaded']) {
      const contract = contracts[name];
      for (const [i, step] of contract.steps.entries()) {
        const sheet = page.locator('.ledger-step:visible');
        assert.equal(await sheet.count(), 1);
        assert.equal(await sheet.getAttribute('id'), name + '-' + (i + 1));
        assert.equal(await sheet.locator('h3').first().innerText(), step.title);
        const balance = ledger(contract, step.premium);
        for (const key of ['safe', 'accident', 'mean', 'payout', 'utility']) {
          const expected = key === 'utility' ? balance.utility.toFixed(5) : amount(balance[key]);
          assert.equal(await sheet.locator('[data-field="' + key + '"]').first().innerText(), expected);
        }
        const last = name === 'loaded' && i === contract.steps.length - 1;
        await assertClosed(page);
        assert.equal(await page.locator('a[href="#solution"]:visible').count(), last ? 1 : 0);
        assert.equal(await page.locator('a[href="#practice"]:visible').count(), 0);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (i === 1 && name === 'fair') {
          await page.goBack();
          assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), 'fair-1');
          await page.goForward();
          await page.reload();
          assert.equal(await sheet.getAttribute('id'), 'fair-2');
        }
        const next = sheet.locator('[data-forward]');
        await next.focus();
        await page.keyboard.press(js && i % 2 ? 'Space' : 'Enter');
        await page.waitForURL(url => url.hash === (last ? '#solution' : '#' + (
          i + 1 === contract.steps.length ? 'loaded-1' : name + '-' + (i + 2)
        )));
      }
    }
    await assertPanel(page, 'proof-section');
    assert.equal(await page.locator('.answer-line:visible').count(), 9);
    assert.equal(await page.locator('.aside:visible').count(), 9);
    assert.equal(await page.locator('.practice:visible').count(), 0);
    await page.locator('#notes').uncheck();
    assert.equal(await page.locator('.aside:visible').count(), 0);
    await page.locator('#notes').check();
    await page.reload();
    await assertPanel(page, 'proof-section');
    await page.goBack();
    assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), 'loaded-6');
    await assertClosed(page);
    await page.goForward();

    for (const [row, step] of [['states', 'loaded-3'], ['fair', 'fair-3'], ['slope', 'loaded-5']]) {
      await page.locator('#proof-' + row + ' a').click();
      await page.reload();
      await assertPanel(page, 'ledger-panel');
      assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), step);
      assert.equal(await page.locator('.return-to-proof:visible').count(), 1);
      await page.locator('.return-to-proof:visible').click();
      assert.equal(new URL(page.url()).hash, '#proof-' + row);
      await assertPanel(page, 'proof-section');
    }
    await page.locator('a[href="#practice"]:visible').click();
    await assertPanel(page, 'practice-panel');
    await page.reload();
    await assertPanel(page, 'practice-panel');
    await page.goBack();
    await assertPanel(page, 'proof-section');
    await page.goForward();
    if (js) {
      await page.locator('[name=safe]').fill('１０１');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.name), 'accident');
      await page.locator('[name=accident]').fill('99.8');
      await page.keyboard.press('Enter');
      await page.locator('[name=method]').selectOption('slope');
      await page.locator('[type=submit]').click();
      assert.match(await page.locator('#feedback').innerText(), /都对/);
    }
    await page.locator('#show-answer').click();
    assert.ok(await page.locator('#worked strong').isVisible());
    await page.locator('.practice-panel a[href="#solution"]').click();
    await assertPanel(page, 'proof-section');

    for (const [hash, expected] of [['#practice-title','practice-panel'], ['#solution','proof-section'], ['#proof-slope','proof-section'], ['#ledger','ledger-panel']]) {
      await page.goto(file + hash);
      await assertPanel(page, expected);
    }
    if (js) {
      await page.goto(file + '?step=3#ledger');
      await page.waitForURL('**#loaded-4');
      assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), 'loaded-4');
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(remoteRequests, []);
    console.log(width + 'px, JS ' + (js ? 'on' : 'off') + ': sequential flow, focus, accessibility tree, history, review and offline practice passed.');
  } finally {
    await ctx.close();
  }
}

(async () => {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'insurance-flow-'));
  try {
    const filename = path.join(folder, 'insurance-3-9.html');
    await fs.writeFile(filename, insurancePage());
    const browser = await chromium.launch({channel: process.env.PLAYWRIGHT_CHANNEL});
    try {
      for (const width of [1440, 320]) {
        for (const js of [true, false]) await checkFlow(browser, pathToFileURL(filename).href, width, js);
      }
    } finally {
      await browser.close();
    }
  } finally {
    await fs.rm(folder, {recursive:true, force:true});
  }
})().catch(e => {console.error(e); process.exitCode = 1;});
