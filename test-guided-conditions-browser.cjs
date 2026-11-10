// Run with node test-guided-conditions-browser.cjs [--require-browser] [--screenshots DIR].
// Playwright is optional. Use NODE_PATH for an external installation; Chrome is the default channel.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {setTimeout: delay} = require('node:timers/promises');
const {pathToFileURL} = require('node:url');
const {catalog, loadChapters, urlFor} = require('./src/guided/catalog.cjs');
const {renderUnit} = require('./src/guided/build.cjs');
const {givenPoints} = require('./src/guided/unit-flow.cjs');
const {inline} = require('./src/guided/format.cjs');

async function renderPages() {
  const chapters = catalog(require('./coverage.json'));
  const content = Object.assign({}, ...await loadChapters(chapters));
  const pages = new Map();
  for (const chapter of chapters) {
    const siblings = [...chapter.sections, ...chapter.problems];
    for (const meta of siblings) {
      if (meta.key === 'p3.9') continue; // Separate insurance lesson and browser suite.
      const unit = content[meta.key];
      pages.set(urlFor(meta.key), {
        unit, key: meta.key, html: renderUnit(meta, unit, chapter, siblings),
        items: givenPoints(unit.given).points.map(inline)
      });
    }
  }
  assert.equal(pages.size, 240);
  return pages;
}

async function serve(pages) {
  const server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1);
    const entry = pages.get(name);
    res.writeHead(entry ? 200 : 404, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(entry?.html);
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return server;
}

const active = page => page.locator('.guided-flow > .guided-step:visible');
async function at(page, id) {
  await page.locator('#' + id).waitFor({state: 'visible'});
  assert.deepEqual(await active(page).evaluateAll(els => els.map(el => el.id)), [id]);
}
async function next(page, id) {
  await active(page).locator('[data-direction="next"]').click();
  await at(page, id);
}
async function settled(page) {
  await page.locator('.condition-card').evaluate(async el => {
    await Promise.allSettled(el.getAnimations().map(a => a.finished));
  });
}

// Compare actual DOM nodes (including MathML) with the authored rows. Normalize both
// through the browser's HTML parser, stripping only deliberately empty legacy anchors.
async function checkCard(page, entry) {
  const actual = await page.evaluate(items => {
    const card = document.querySelector('.condition-card');
    const template = document.createElement('template');
    function normalize(html) {
      template.innerHTML = html;
      return template.innerHTML;
    }
    const rows = [...card.querySelectorAll('.condition-text li')].map(li => {
      const copy = li.cloneNode(true);
      for (const anchor of copy.querySelectorAll('span[id^="given-"]:empty')) anchor.remove();
      return copy.innerHTML;
    });
    const strip = document.body.cloneNode(true);
    strip.querySelector('.condition-card').remove();
    for (const el of strip.querySelectorAll('script,style')) el.remove();
    const contents = items.map(html => {
      template.innerHTML = html;
      return template.content.textContent;
    }).join('');
    return {
      containers: document.querySelectorAll('.study-desk > .condition-card').length,
      groups: document.querySelectorAll('.condition-text').length,
      duplicate: strip.textContent.replace(/\s+/g, '').includes(contents.replace(/\s+/g, '')),
      expected: items.map(normalize), rows
    };
  }, entry.items);
  assert.equal(actual.containers, 1, entry.key);
  assert.equal(actual.groups, 1, entry.key);
  assert.deepEqual(actual.rows, actual.expected, entry.key + ' condition order or math');
  assert.equal(actual.duplicate, false, entry.key + ' second copy outside condition card');
}

async function layout(page, mobile, reading = false) {
  await settled(page);
  const pos = await page.locator('.condition-card').evaluate(el => {
    const card = el.getBoundingClientRect();
    const step = [...document.querySelectorAll('.guided-step')].find(s => s.getClientRects().length);
    const panel = step.getBoundingClientRect(), body = el.querySelector('.condition-text');
    return {sticky: getComputedStyle(el).position === 'sticky', top: card.top, bottom: card.bottom,
      left: card.left, panelRight: panel.right, panelTop: panel.top,
      height: card.height, viewport: innerHeight, reachable: body.scrollHeight <= body.clientHeight + 1,
      horizontal: document.documentElement.scrollWidth - innerWidth};
  });
  assert.ok(pos.horizontal <= 1, 'page overflows horizontally: ' + JSON.stringify(pos));
  assert.equal(pos.sticky, !reading, 'condition card placement');
  if (reading) {
    assert.ok(pos.reachable, 'all opening conditions should be presented together');
    assert.ok(pos.bottom <= pos.panelTop + 2, 'start control should follow all conditions');
  } else {
    assert.ok(pos.bottom > 0 && pos.top < pos.viewport, 'card outside viewport');
    if (mobile) assert.ok(pos.bottom <= pos.panelTop + 2, 'top card obscures step start: ' + JSON.stringify(pos));
    else assert.ok(pos.left >= pos.panelRight - 1, 'card should be to the right of the work area');
  }
}

async function pinnedWhileScrolling(page) {
  // Scroll *within* the desk: the footer is intentionally outside its sticky boundary.
  const result = await page.evaluate(() => {
    const card = document.querySelector('.condition-card'), desk = card.parentElement;
    const styleTop = parseFloat(getComputedStyle(card).top);
    const end = desk.getBoundingClientRect().bottom + scrollY - card.offsetHeight - styleTop;
    const start = desk.getBoundingClientRect().top + scrollY;
    const limit = Math.min(end, document.documentElement.scrollHeight - innerHeight);
    const positions = [];
    for (const y of [start + 12, Math.min(start + 130, limit - 2)]) {
      scrollTo({top:y, behavior:'instant'});
      const r = card.getBoundingClientRect();
      positions.push({y:scrollY, top:r.top, hit:card.contains(document.elementFromPoint(r.left + 8, r.top + 8))});
    }
    return {styleTop, positions};
  });
  const [a,b] = result.positions;
  assert.ok(b.y > a.y + 16, 'fixture must allow real document scrolling');
  for (const pos of result.positions) {
    assert.ok(pos.hit && Math.abs(pos.top - result.styleTop) <= 2, 'card scrolled away: ' + JSON.stringify(result));
  }
}

async function shot(page, folder, name) {
  if (folder) await page.screenshot({path:path.join(folder, name + '.png'), animations:'disabled'});
}
const compact = text => text.normalize('NFKC').replace(/\s/g, '');
const aOrder = /\(4,2\)/;
const bOrder = /\(5,2\.5\)|5斤米[、,和及与]*2\.5斤豆/;
async function checkOrders(page) {
  await at(page, 'scene');
  const values = await active(page).locator('.state-cell .value').allInnerTexts();
  assert.deepEqual(values.map(compact), ['0.5', '(4,2)', '(5,2.5)', '3']);
}

async function sectionJourney(page, url, mobile, folder, js) {
  await page.goto(url);
  await at(page, 'given-start');
  await layout(page, mobile, true);
  const card = page.locator('.condition-card');
  assert.equal(await card.locator('li:visible').count(), 3);
  const original = await card.elementHandle();
  const opening = compact(await page.locator('main').innerText());
  assert.doesNotMatch(opening, aOrder);
  assert.doesNotMatch(opening, bOrder);
  const ledgers = [
    ['4\\times0.5+2\\times1=4','2\\times0.5+4\\times1=5'],
    ['2\\times3=6','4\\times2=8'],
    ['2\\div0.5=4','2\\div1=2'],
    ['2.5\\div0.5=5','2.5\\div1=2.5']
  ];
  for (const [i, equations] of ledgers.entries()) {
    await next(page, 'account-' + (i+1));
    const ledger = active(page).locator('.guided-ledger dd');
    assert.equal(await ledger.count(), 2);
    for (const [row, tex] of equations.entries()) {
      const printed = await ledger.nth(row).locator('annotation').allTextContents();
      assert.ok(printed.some(value => value.replace(/\s/g,'') === tex), 'missing calculation ' + tex);
    }
    const text = compact(await page.locator('main').innerText());
    if (i < 2) assert.doesNotMatch(text, aOrder);
    if (i < 3) assert.doesNotMatch(text, bOrder);
    if (i === 2) assert.match(text, aOrder);
    if (i === 3) assert.match(text, bOrder);
    if (js && folder && i >= 2 && !mobile) await shot(page, folder, 'section-10-2-account-' + (i+1));
  }
  await next(page, 'scene');
  await checkOrders(page);
  assert.ok(await original.evaluate(el => el === document.querySelector('.condition-card')));
  await layout(page, mobile);
  if (js) await shot(page, folder, 'section-10-2-' + (mobile ? 'mobile' : 'desktop'));
  await page.goBack();
  await at(page, 'account-4');
  await page.goForward();
  await checkOrders(page);
  for (const hash of ['#given-2', '#given-3']) {
    await page.goto(url + hash);
    await at(page, 'given-start');
    assert.equal(await card.locator('li:visible').count(), 3);
    await next(page, 'account-1');
    await page.goBack();
    await at(page, 'given-start');
    assert.equal(new URL(page.url()).hash, hash);
  }
  for (const suffix of ['#scene', '?step=1#scene']) {
    await page.goto(url + suffix);
    await checkOrders(page);
  }
  if (js) {
    await page.goto(url + '?step=1');
    await checkOrders(page);
  }
}

async function homeworkJourney(page, url, unit, mobile, folder, js) {
  // An unread paper link in an enhanced page must open the first deduction.
  if (js) {
    await page.goto(url + '#answer');
    await at(page, 'proof-1');
    assert.equal(await page.locator('#answer').isVisible(), false);
  }
  await page.goto(url + '#solution');
  await at(page, 'proof-1');
  const stages = await page.locator('.guided-reasoning').evaluateAll(rows => rows.map(row => row.id));
  assert.ok(stages.length >= unit.proof.length);
  for (const id of stages.slice(1)) await next(page, id);
  await next(page, 'answer');
  await layout(page, mobile);
  const rows = page.locator('#answer .guided-answer-row');
  assert.equal(await rows.count(), unit.proof.length);
  assert.equal(await rows.locator('.guided-answer-note:visible').count(), unit.proof.length);
  if (js) await shot(page, folder, 'exercise-10-2-' + (mobile ? 'mobile' : 'desktop'));
  await pinnedWhileScrolling(page);
  if (js) {
    const row = rows.last(), compare = row.locator('[data-compare-from]');
    const sceneHash = await compare.getAttribute('href');
    await compare.click();
    await at(page, sceneHash.slice(1));
    await active(page).locator('[data-return]').click();
    await at(page, 'answer');
    assert.equal(new URL(page.url()).hash, '#' + await row.getAttribute('id'));
  }
  await next(page, 'practice');
  await layout(page, mobile);
  const [,choices, correct] = unit.practice;
  if (js) {
    const submit = page.locator('#transfer [type=submit]');
    for (const choice of [(correct + 1) % choices.length, correct]) {
      await page.locator('#transfer input').nth(choice).check();
      await submit.click();
      assert.match(await page.locator('#feedback').innerText(), choice === correct ? /判断对了/ : /再核对/);
    }
  }
  await page.locator('#worked summary').click();
  assert.equal(compact(await page.locator('#worked strong').innerText()), compact(choices[correct]));
}

async function longQuestion(page, url, js) {
  await page.goto(url);
  await layout(page, true, true);
  await next(page, 'scene');
  await layout(page, true);
  const area = page.locator('.condition-text');
  const height = await area.evaluate(el => el.clientHeight);
  assert.ok(await area.evaluate(el => el.scrollHeight > el.clientHeight + 5), 'long question needs internal scroll');
  if (js) {
    const button = page.locator('.condition-size');
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'true');
    assert.ok(await area.evaluate(el => el.clientHeight) > height + 5, 'expand should show more text');
    await button.click();
    assert.equal(await button.getAttribute('aria-expanded'), 'false');
    assert.ok(Math.abs(await area.evaluate(el => el.clientHeight) - height) < 2);
  }
  // Keyboard input targets the card's own scroll port, not the surrounding lesson.
  await area.focus();
  const scrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('End');
  // Poll from Node: with page scripts disabled Chrome need not dispatch JS timers there.
  const deadline = Date.now() + 3000;
  let state;
  do {
    state = await area.evaluate(el => ({
      focused:document.activeElement === el, scroll:el.scrollTop,
      remaining:el.querySelector('li:last-child').getBoundingClientRect().bottom - el.getBoundingClientRect().bottom
    }));
    if (state.scroll > 0 && state.remaining <= 2) break;
    await delay(40);
  } while (Date.now() < deadline);
  assert.ok(state.scroll > 0 && state.remaining <= 2, 'End did not reach last condition: ' + JSON.stringify(state));
  assert.ok(Math.abs(await page.evaluate(() => window.scrollY) - scrollY) <= 2, 'outer page jumped with condition text');
}

async function rapidMotion(page, url, reduced) {
  await page.goto(url);
  // Send actual link activations in one frame, before a previous transition can finish.
  const movement = await page.evaluate(() => {
    const card = document.querySelector('.condition-card');
    const observed = [];
    for (let i = 0; i < 9; i++) {
      const step = document.querySelector('.guided-step.is-current');
      step.querySelector(i % 2 ? '[data-direction=previous]' : '[data-direction=next]').click();
      observed.push(card.getAnimations().length);
    }
    const panel = document.querySelector('.guided-step.is-current');
    return {observed, bodyAnimations:panel.querySelector('.guided-step-body').getAnimations().length};
  });
  await at(page, 'account-1');
  assert.equal(new URL(page.url()).hash, '#account-1');
  if (reduced) {
    assert.ok(movement.observed.every(n => n === 0), 'card movement under reduced motion');
    assert.equal(movement.bodyAnimations, 0, 'panel movement under reduced motion');
  }
  await settled(page);
  assert.equal(await page.locator('.condition-card').evaluate(el => getComputedStyle(el).transform), 'none');
  await page.goBack();
  await at(page, 'given-start');
}

async function paperMotion(page, url) {
  await page.goto(url);
  const result = await page.evaluate(() => {
    const card = document.querySelector('.condition-card');
    const start = card.getBoundingClientRect();
    document.querySelector('.guided-given [data-direction=next]').click();
    const motion = card.getAnimations().find(a => a.effect.target === card);
    if (!motion) return null;
    motion.pause();
    const duration = motion.effect.getComputedTiming().activeDuration;
    const range = document.createRange();
    range.setStart(card.querySelector('li').firstChild, 0);
    range.setEnd(card.querySelector('li').firstChild, 1);
    function sample() {
      const rect = card.getBoundingClientRect();
      const transform = getComputedStyle(card).transform;
      const matrix = transform === 'none' ? new DOMMatrix() : new DOMMatrix(transform);
      return {width:rect.width, left:rect.left, glyph:range.getBoundingClientRect().width,
        scaleX:Math.hypot(matrix.a,matrix.b), scaleY:Math.hypot(matrix.c,matrix.d)};
    }
    const samples = [0,duration/2,duration].map(time => { motion.currentTime = time; return sample(); });
    motion.finish();
    return {startWidth:start.width,startLeft:start.left,samples,same:card === document.querySelector('.condition-card')};
  });
  assert.ok(result?.same, 'the same DOM card should travel to the right');
  const [a,m,b] = result.samples;
  assert.ok(Math.abs(a.width-result.startWidth)<2 && Math.abs(a.left-result.startLeft)<2, JSON.stringify(result));
  assert.ok(a.width > m.width && m.width > b.width && a.left < m.left && m.left < b.left, JSON.stringify(result));
  for (const sample of result.samples) {
    assert.ok(Math.abs(sample.scaleX-1)<.01 && Math.abs(sample.scaleY-1)<.01, 'text container was scaled');
    assert.ok(b.glyph > 0 && Math.abs(sample.glyph-b.glyph)<1, 'glyph width changed during travel');
  }
}

async function main() {
  const strict = process.argv.includes('--require-browser');
  const option = process.argv.indexOf('--screenshots');
  if (option >= 0) assert.ok(process.argv[option+1] && !process.argv[option+1].startsWith('--'), 'expected screenshot directory');
  const folder = option >= 0 ? path.resolve(process.argv[option+1]) : null;
  let playwright;
  try { playwright = require.resolve('playwright'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND' || strict) throw error;
    console.log('SKIP browser regression: install Playwright or provide NODE_PATH. Use --require-browser in CI.');
    return;
  }
  const pages = await renderPages();
  const server = await serve(pages);
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const temp = await fs.mkdtemp(path.join(os.tmpdir(),'guided-conditions-'));
  const failures = [];
  let browser;
  try {
    if (folder) await fs.mkdir(folder,{recursive:true});
    const launch = process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH}
      : {channel:process.env.PLAYWRIGHT_CHANNEL || 'chrome'};
    browser = await require(playwright).chromium.launch(launch);
    async function run(name, options, test) {
      const ctx = await browser.newContext(options);
      let timer;
      try {
        const page = await ctx.newPage();
        page.setDefaultTimeout(5000);
        const errors = [], remote = [];
        page.on('pageerror', err => errors.push(err.message));
        page.on('request', req => {
          if (/^https?:/.test(req.url()) && (options.offline || !req.url().startsWith(base))) remote.push(req.url());
        });
        // Also bound evaluations inside script-free documents, where frame callbacks may never fire.
        const deadline = new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(name + ' timed out')), name.startsWith('240 ') ? 120000 : 45000);
        });
        await Promise.race([test(page), deadline]);
        assert.deepEqual(errors, [], 'uncaught page errors');
        assert.deepEqual(remote, [], 'unexpected network dependency');
        console.log('PASS ' + name);
      } catch (error) {
        failures.push(name + '\n' + error.stack);
        console.error('FAIL ' + name + ': ' + error.message);
      } finally { clearTimeout(timer); await ctx.close(); }
    }
    const desktop = {viewport:{width:1280,height:800}};
    const mobile = {viewport:{width:390,height:740},isMobile:true,hasTouch:true};
    const section = urlFor('s10.2'), exercise = urlFor('p10.2'), long = urlFor('p10.1');
    await run('240 condition lists match authored content once', desktop, async page => {
      for (const [name,entry] of pages) {
        await page.goto(base + name,{waitUntil:'domcontentloaded'});
        await checkCard(page, entry);
      }
    });
    for (const [label, viewport] of [['desktop',desktop], ['mobile',mobile]]) {
      await run(label + ' section 10.2 order calculations, history and deep links', viewport,
        page => sectionJourney(page, base + section, label === 'mobile', folder, true));
      await run(label + ' exercise 10.2 answer, persistent card and transfer', viewport,
        page => homeworkJourney(page, base + exercise, pages.get(exercise).unit, label === 'mobile', folder, true));
    }
    await run('long mobile question: expand, collapse, scroll to last condition',mobile,
      page => longQuestion(page,base + long,true));
    await run('desktop paper width and undistorted text',desktop,page => paperMotion(page,base + section));
    for (const reduced of [false,true]) {
      await run('rapid navigation; reduced motion = ' + reduced,
        {...mobile,reducedMotion:reduced ? 'reduce' : 'no-preference'},page => rapidMotion(page,base + section,reduced));
    }

    // Test the actual downloadable response in a fresh offline context and a renamed file.
    const file = name => path.join(temp,'downloaded-' + name);
    await run('download standalone pages',desktop, async page => {
      for (const name of [section,exercise,long]) {
        await page.goto(base + name);
        const pending = page.waitForEvent('download');
        await page.locator('a[download]').click();
        const download = await pending;
        assert.equal(download.suggestedFilename(),name);
        await download.saveAs(file(name));
      }
    });
    const offline = name => pathToFileURL(file(name)).href;
    for (const js of [false,true]) {
      const options = {...mobile, offline:true, javaScriptEnabled:js, reducedMotion:'reduce'};
      await run('offline section journey; JS = ' + js,options,
        page => sectionJourney(page,offline(section),true,null,js));
      await run('offline exercise and transfer; JS = ' + js,options,
        page => homeworkJourney(page,offline(exercise),pages.get(exercise).unit,true,null,js));
      await run('offline long question; JS = ' + js,options,page => longQuestion(page,offline(long),js));
    }
    if (failures.length) throw new Error(failures.join('\n\n'));
  } finally {
    try { await browser?.close(); }
    finally {
      await new Promise(resolve => server.close(resolve));
      await fs.rm(temp,{recursive:true,force:true});
    }
  }
}
main().catch(error => {console.error(error);process.exitCode = 1;});
