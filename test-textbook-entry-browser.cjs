// After building: node test-textbook-entry-browser.cjs [path/to/dist]
// Use Chrome and Playwright (local installation or NODE_PATH). Serves the build on loopback.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const dist = path.resolve(process.argv[2] || path.join(__dirname, 'dist'));
const editions = ['en', 'zh'];
const book = edition => `#books a.book-link[data-edition="${edition}"]`;
const bookFile = edition => `book-${edition}.html`;
const publisher = 'https://www.openbookpublishers.com/books/10.11647/obp.0204';
const translation = 'https://cdn.openbookpublishers.com/Chinese_Translation_Models_in_Microeconomic_Theory_1ff1ebd516.pdf';
const mime = {html:'text/html', css:'text/css', js:'text/javascript', mjs:'text/javascript',
  json:'application/json', woff2:'font/woff2', svg:'image/svg+xml', webp:'image/webp', pdf:'application/pdf'};

function serve(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(dist, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
  if (!file.startsWith(dist + path.sep) || !fs.statSync(file, {throwIfNoEntry:false})?.isFile()) {
    res.writeHead(404).end(); return;
  }
  res.setHeader('Content-Type', mime[path.extname(file).slice(1)] || 'application/octet-stream');
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
}

async function fits(page) {
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  assert.ok(overflow <= 1, `${page.url()} overflows horizontally by ${overflow}px`);
}

async function tabTo(page, link) {
  // Start at the document and use real Tab order, including any skip link.
  const limit = await page.locator('a[href],button,input,summary,[tabindex]').count() + 2;
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab');
    if (await link.evaluate(el => el === document.activeElement)) return;
  }
  assert.fail('Tab never reached ' + await link.getAttribute('href'));
}

async function follow(page, link, target, input) {
  assert.equal(await link.evaluate(el => el.href), target, 'wrong destination');
  if (input === 'keyboard') await tabTo(page, link);
  else {
    await link.scrollIntoViewIfNeeded();
    // A cross-document transition temporarily owns pointer hits. Wait for its
    // actual end; the ensuing native click/tap must still pass Chrome's hit test.
    await page.waitForFunction(() => !CSS.supports('selector(:active-view-transition)') ||
      !document.documentElement.matches(':active-view-transition'), null, {polling:50, timeout:2500});
  }
  const arrived = page.waitForURL(target);
  const activate = input === 'keyboard' ? page.keyboard.press('Enter') :
    input === 'touch' ? link.tap() : link.click();
  await Promise.all([arrived, activate]);
}

async function back(page, target) {
  await page.goBack();
  await page.waitForURL(target);
}

// Sample the start, middle and end. PDF fragments are physical pages of the Chinese scan.
async function editionLinks(page, root, edition, input) {
  const en = edition === 'en', previous = page.url();
  assert.equal(await page.locator('html').getAttribute('lang'), en ? 'en' : 'zh-CN');
  const fullBook = en ? publisher : translation;
  await page.getByRole('link', {name:/\S/}).and(page.locator(`a[href="${fullBook}"]`)).first().waitFor();
  for (const [chapter, pdfPage, section] of [[1,13,'1-4'], [10,113,'10-2'], [20,252,'20-1']]) {
    const row = page.locator('#chapter-' + chapter);
    const source = en ? publisher + '/chapters/10.11647/obp.0204.' + String(chapter).padStart(2, '0') :
      translation + '#page=' + pdfPage;
    const model = 'learn-s' + section + '.html';
    const original = row.getByRole('link', {name:/\S/}).and(page.locator(`a[href="${source}"]`));
    const guide = row.getByRole('link', {name:/\S/}).and(page.locator(`a[href="${model}"]`));
    assert.equal(await original.count(), 1, `${edition} chapter ${chapter}: wrong original-text link`);
    assert.equal(await guide.count(), 1, `${edition} chapter ${chapter}: wrong teaching link`);
    if (chapter === 1) {
      // Exercise the native link while keeping publisher uptime and the 73 MB PDF out of local QA.
      await follow(page, original, source, input);
      await back(page, previous);
      await follow(page, guide, new URL(model, root).href, input);
      await page.locator('main .guided-flow').waitFor();
      await back(page, previous);
    }
  }
}

// Check the pixels inside all four screen edges. A fixed overlay surrounding
// a small central book also fills the viewport, but fails this colour test.
async function checkFullBleed(browser, root) {
  const page = await browser.newPage({viewport:{width:900,height:700}});
  try {
    await page.clock.install({time:new Date('2025-01-01T00:00:00Z')});
    await page.clock.pauseAt(new Date('2025-01-01T00:00:02Z'));
    await page.goto(new URL('index.html?intro=1',root).href);
    let previous=0;
    const samples=[];
    for(const time of [450,2150,3260,4230,5500]){
      await page.clock.runFor(time-previous);previous=time;
      samples.push(await page.locator('.reel-paper').evaluate(canvas=>{
        const c=canvas.getContext('2d'),box=canvas.getBoundingClientRect();
        if(box.width!==innerWidth||box.height!==innerHeight)throw Error('Opening is letterboxed');
        return [[.04,.18],[.96,.18],[.04,.91],[.96,.91]].map(([x,y])=>
          Array.from(c.getImageData(canvas.width*x,canvas.height*y,1,1).data));
      }));
    }
    const [night,en,morph,zh,leaves]=samples;
    for(const frame of samples)assert.ok(frame.every(pixel=>pixel[3]===255));
    const delta=(a,b)=>a.slice(0,3).reduce((sum,v,i)=>sum+Math.abs(v-b[i]),0);
    assert.ok(en.every((v,i)=>delta(v,night[i])>100),'English print does not reach an edge');
    assert.ok(zh.every((v,i)=>delta(v,en[i])>60),'Chinese print does not reach an edge');
    assert.ok(delta(morph[0],zh[0])<30 && delta(morph[1],en[1])<30,'edition change is not a travelling sweep');
    assert.ok(leaves.every((v,i)=>delta(v,night[i])>90),'dark margins around the turning page');
  } finally {
    await page.context().close();
  }
}

async function check(browser, root, {width, input, reducedMotion='no-preference', javaScriptEnabled=true}) {
  const page = await browser.newPage({viewport:{width, height:width === 1440 ? 900 : 800},
    hasTouch:input === 'touch', isMobile:input === 'touch', reducedMotion, javaScriptEnabled});
  page.setDefaultTimeout(4500);
  page.setDefaultNavigationTimeout(7000);
  await page.route(/^https:\/\/(?:www|cdn)\.openbookpublishers\.com\//, route =>
    route.fulfill({contentType:'text/html', body:'<!doctype html><title>Publisher link reached</title>'}));
  const errors = [];
  // With scripts disabled Chromium can emit its own ViewTransition cancellation on Back.
  if (javaScriptEnabled) page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => {if (r.status() >= 400 && r.url().startsWith(root.href)) errors.push(r.status() + ' ' + r.url());});
  try {
    const home = new URL('index.html', root).href;
    await page.goto(home);
    const film = page.locator('.market-film'), replay = page.locator('.reel-replay');
    if (javaScriptEnabled && reducedMotion !== 'reduce') {
      await page.keyboard.press('Escape');
      await replay.click();
      assert.ok(await film.isVisible(), 'replay starts the opening');
      await page.keyboard.press('Escape');
      assert.ok(await film.isHidden(), 'escape returns to the market');
    } else {
      assert.ok(await film.isHidden() && await replay.isHidden(), 'quiet or static market entrance');
    }
    assert.ok(await page.getByRole('heading',{level:1,name:'市场之中'}).isVisible());
    const quickURL = new URL('formula-4h.html', root).href;
    await follow(page,page.locator('.market-routes .formula-door'),quickURL,input);
    await fits(page);
    assert.equal(await page.locator('.sprint-hour').count(),4);
    assert.ok(await page.locator('.sprint-math math').count()>10);
    for (const d of await page.locator('.sprint-quiz details').all()) {
      assert.ok(!await d.evaluate(el=>el.open));
      await d.locator('summary').click();
      assert.ok(await d.evaluate(el=>el.open));
    }
    await back(page,home);
    assert.ok(await film.isHidden(),'back should return directly to market');
    await follow(page,page.locator('.market-routes .home-open'),new URL('learn.html',root).href,input);
    assert.equal(await page.locator('a[href="formula-4h.html"]').count(),1);
    await back(page,home);
    assert.equal(await page.locator('.sky-portrait,.constellation-canvas,.market-figure').count(),0);
    assert.match(await page.locator('.market-scene img').getAttribute('src'),/market-scene\.webp/);
    assert.ok(await page.locator('.market-scene img').evaluate(image=>image.complete&&image.naturalWidth>0));
    assert.equal(await page.locator('#catalog,.home-workbench,.market-figure,.footer').count(),0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));
    assert.equal((await page.locator('[data-atlas-cover]').boundingBox()).width,width);
    const directory = new URL('catalog.html',root).href;
    await follow(page,page.locator('.cover-directory'),directory,input);
    for (const edition of editions) {
      await page.goto(directory);
      await fits(page);
      assert.equal(await page.locator('#books .book-link').count(), 2, 'expected two books in directory');
      const cover = page.getByRole('link', {name:/\S/}).and(page.locator(book(edition)));
      assert.equal(await cover.count(), 1, 'missing accessible book link: ' + edition);
      await cover.scrollIntoViewIfNeeded();
      const rect = await cover.boundingBox();
      assert.ok(rect && rect.width > 0 && rect.x >= -1 && rect.x + rect.width <= width+1, 'book cover is clipped: ' + edition);
      const here = new URL(bookFile(edition), root).href;
      await follow(page, cover, here, input);
      await fits(page);
      await editionLinks(page, root, edition, input === 'touch' ? 'touch' : 'mouse');
      const other = bookFile(edition === 'en' ? 'zh' : 'en');
      const swap = page.getByRole('link', {name:/\S/}).and(page.locator(`a[href$="${other}"]`)).first();
      await follow(page, swap, new URL(other, root).href, input === 'touch' ? 'touch' : 'mouse');
      await back(page, here);
      await back(page, directory);
    }
    const catalog = new URL('#catalog', directory).href;
    await page.goto(catalog);
    await page.locator('#catalog').waitFor();
    assert.ok(await page.locator('#catalog').getByRole('link', {name:/\S/}).count(), 'catalog contains no course links');
    await back(page, directory);
    const market = page.locator('a#market-entry, #market-entry a[href$="market.html"]').first();
    await follow(page, market, new URL('market.html', root).href, input === 'touch' ? 'touch' : 'mouse');
    await page.getByRole('heading', {name:'市场之中', exact:true}).waitFor();
    await back(page, directory);
    if (javaScriptEnabled) {
      await page.goto(home+'#chapter-7');
      await page.waitForURL(directory+'#chapter-7');
      const deep = new URL('lesson-5-3.html?case=optimum&filmStep=2', root).href;
      await page.goto(deep);
      await page.locator('#film-next:enabled').waitFor();
      assert.equal(page.url(), deep);
      assert.match(await page.locator('#film-given').innerText(), /当前偏好：完全互补/);
      await page.locator('#film-next').click();
      assert.match(await page.locator('#film-given').innerText(), /当前偏好：完全替代/);
    }
    assert.deepEqual(errors, []);
  } finally {
    await page.context().close();
  }
}

(async () => {
  for (const filename of ['index.html', 'catalog.html', ...editions.map(bookFile), 'formula-4h.html', 'market.html', 'lesson-5-3.html']) {
    assert.ok(fs.existsSync(path.join(dist, filename)), '构建目录缺少 ' + filename + '：' + dist);
  }
  const server = http.createServer(serve);
  await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
  let browser;
  try {
    browser = await chromium.launch({channel:'chrome'});
    const root = new URL('http://127.0.0.1:' + server.address().port + '/');
    await checkFullBleed(browser, root);
    for (const mode of [{width:1440,input:'keyboard'}, {width:390,input:'touch'},
      {width:320,input:'touch',reducedMotion:'reduce'}, {width:320,input:'touch',javaScriptEnabled:false}]) {
      const label = JSON.stringify(mode);
      try { await check(browser, root, mode); console.log('PASS', label); }
      catch (e) { throw new Error(label + '\n' + e.message, {cause:e}); }
    }
  } finally {
    await browser?.close();
    server.close();
  }
})().catch(e => {console.error(e); process.exitCode = 1;});
