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

async function assertConditions(page, docked) {
  const card = page.locator('#problem');
  assert.equal(await page.getByRole('heading', {level: 1}).count(), 1);
  const body = card.getByRole('region', {name: '原题条件与两问'});
  const text = await body.innerText();
  for (const term of ['事故以概率', '造成损失', '赔付系数', '期望利润为零', '严格风险厌恶者']) {
    assert.ok(text.includes(term), term + ' missing from problem');
  }
  assert.ok(await body.locator('math').count() > 0);
  assert.equal(await body.locator('math:visible').count(), await body.locator('math').count());
  const geometry = await card.evaluate(el => {
    const rect = el.getBoundingClientRect(), body = el.querySelector('.question-body');
    return {
      position: getComputedStyle(el).position, left: rect.left, right: rect.right, top: rect.top,
      bottom: rect.bottom, height: rect.height, viewport: innerHeight, scrollable: body.scrollHeight > body.clientHeight,
      width: innerWidth, strip: body.getBoundingClientRect().height,
      touchesViewport: rect.bottom > 0 && rect.top < innerHeight
    };
  });
  assert.equal(geometry.position, docked ? 'sticky' : 'static');
  if (!docked) {
    assert.equal(geometry.scrollable, false, 'reading should use the full page');
    return;
  }
  assert.ok(geometry.touchesViewport && geometry.strip > 0);
  assert.equal(await card.locator('.problem-start a:visible').count(), 0);
  const panel = await page.locator('.lesson-panel:visible').boundingBox();
  if (geometry.width > 900) {
    assert.ok(geometry.right <= panel.x, 'card overlaps the desktop work area');
  } else {
    assert.ok(geometry.height < geometry.viewport * .4 && geometry.scrollable, 'top card leaves work area and scrolls');
  }
}

async function assertStickyScroll(page) {
  const card = page.locator('#problem');
  await page.evaluate(() => scrollTo(0, Math.min(document.documentElement.scrollHeight - innerHeight, 620)));
  const rect = await card.boundingBox();
  const narrow = page.viewportSize().width <= 900;
  assert.ok(Math.abs(rect.y - (narrow ? 0 : 12)) < 2, 'sticky top: ' + rect.y);
  assert.ok(await card.evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.left + 15, r.top + 15));
  }));
  const body = card.locator('.question-body');
  const outerScroll = await page.evaluate(() => scrollY);
  await body.evaluate(el => {el.scrollTop = el.scrollHeight;});
  const lastLineVisible = await body.evaluate(el => el.querySelector('.source').getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom + 1);
  assert.ok(lastLineVisible, 'source and last condition must be reachable');
  assert.equal(await page.evaluate(() => scrollY), outerScroll);
  await body.evaluate(el => {el.scrollTop = 0;});
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
    await assertConditions(page, false);
    assert.equal(await page.locator('.lesson-panel:visible').count(), 0);
    assert.ok(await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      return ids.length === new Set(ids).size;
    }));
    await assertClosed(page);
    const originalCard = await page.locator('#problem').elementHandle();
    await page.getByRole('link', {name: '进入保险账本'}).click();
    await assertPanel(page, 'ledger-panel');
    assert.ok(await originalCard.evaluate(el => el === document.getElementById('problem')));
    await assertConditions(page, true);
    await page.goBack();
    await assertConditions(page, false);
    await page.goForward();

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
        await assertConditions(page, true);
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
    await assertConditions(page, true);
    await assertStickyScroll(page);
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
      const sameCard = await page.locator('#problem').elementHandle();
      await page.locator('#proof-' + row + ' a').click();
      assert.ok(await sameCard.evaluate(el => el === document.getElementById('problem')));
      await assertConditions(page, true);
      await page.reload();
      await assertPanel(page, 'ledger-panel');
      assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), step);
      assert.equal(await page.locator('.return-to-proof:visible').count(), 1);
      await page.locator('.return-to-proof:visible').click();
      assert.equal(new URL(page.url()).hash, '#proof-' + row);
      await assertPanel(page, 'proof-section');
    }
    const answerCard = await page.locator('#problem').elementHandle();
    await page.locator('a[href="#practice"]:visible').click();
    assert.ok(await answerCard.evaluate(el => el === document.getElementById('problem')));
    await assertConditions(page, true);
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
      await assertConditions(page, true);
    }
    if (js) {
      await page.goto(file + '?step=3#ledger');
      await page.waitForURL('**#loaded-4');
      assert.equal(await page.locator('.ledger-step:visible').getAttribute('id'), 'loaded-4');
    }
    await page.goto(file + '#problem');
    await assertConditions(page, false);
    assert.equal(await page.locator('.lesson-panel:visible').count(), 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(remoteRequests, []);
    console.log(width + 'px, JS ' + (js ? 'on' : 'off') + ': full question, sticky placement, step sequence, focus, history and offline practice passed.');
  } finally {
    await ctx.close();
  }
}

async function checkResponsiveCard(browser, file) {
  const page = await browser.newPage({viewport:{width:1440, height:900}, reducedMotion:'no-preference', offline:true});
  try {
    await page.goto(file);
    const card = page.locator('#problem');
    const identity = await card.elementHandle();
    const animation = () => card.evaluate(el => getComputedStyle(el).animationName);
    assert.equal(await animation(), 'none');
    await page.getByRole('link', {name:'进入保险账本'}).click();
    assert.equal(await animation(), 'insurance-dock');
    await card.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
    await page.locator('[data-forward]:visible').click();
    assert.equal(await card.evaluate(el => el.getAnimations().length), 0);
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await animation(), 'none');

    for (const [width, height] of [[1024,768], [768,1024], [390,844], [320,720], [667,375]]) {
      await page.setViewportSize({width, height});
      for (const id of ['proof-slope', 'check-slope', 'practice-title']) {
        await page.goto(file + '#' + id);
        assert.ok(await identity.evaluate(el => el === document.getElementById('problem')));
        await assertConditions(page, true);
        const target = await page.locator('#' + id).boundingBox();
        assert.ok(target.y < height && target.y + target.height > 0, id + ' outside viewport');
        if (width <= 900) {
          const rect = await card.boundingBox();
          assert.ok(target.y >= rect.y + rect.height - 1, id + ' under pinned card');
        }
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    }
    console.log('Responsive placement, unobstructed fragment targets and live reduced motion passed.');
  } finally {
    await page.close();
  }
}

(async () => {
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'insurance-flow-'));
  try {
    const filename = path.join(folder, 'insurance-3-9.html');
    await fs.writeFile(filename, insurancePage());
    const browser = await chromium.launch({channel: process.env.PLAYWRIGHT_CHANNEL});
    try {
      await checkResponsiveCard(browser, pathToFileURL(filename).href);
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
