// Automated browser acceptance suite for UX01-UX11 (2026-11-15 experience pass).
// Run after `node build.cjs`:
// NODE_PATH=/Users/mingzegao/.npm/_npx/31e32ef8478fbf80/node_modules node test-experience-ux-browser.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('playwright');

const dist = path.join(__dirname, 'dist');
const shotDir = path.join(__dirname, 'qa/experience-pass');
fs.mkdirSync(shotDir, {recursive: true});

const mime = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  woff2: 'font/woff2',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  png: 'image/png'
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      const rel = decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname);
      const file = path.resolve(dist, '.' + rel);
      if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404).end('Not found');
        return;
      }
      const ext = path.extname(file).slice(1);
      res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({server, base: `http://127.0.0.1:${server.address().port}`});
    });
  });
}

async function assertNoOverflow(page, label) {
  await page.evaluate(() => document.fonts?.ready);
  const info = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    diff: document.documentElement.scrollWidth - window.innerWidth
  }));
  assert.ok(info.diff <= 1, `${label}: horizontal overflow ${info.diff}px (${info.scrollW} > ${info.innerW})`);
}

(async () => {
  const {server, base} = await startServer();
  const browser = await chromium.launch({channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', headless: true});
  try {
    // 1. UX01 + UX03 + UX04: Exemplars across 1440x900, 390x844, 320x844, and 667x375 short landscape
    for (const vp of [
      {width: 1440, height: 900, tag: '1440'},
      {width: 390, height: 844, tag: '390'},
      {width: 320, height: 844, tag: '320'},
      {width: 667, height: 375, tag: 'landscape'}
    ]) {
      const context = await browser.newContext({viewport: {width: vp.width, height: vp.height}});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));

      // Task 1: 7.4 半杯豆浆 (#scene-2)
      await page.goto(`${base}/learn-s7-4.html#scene-2`, {waitUntil: 'networkidle'});
      await assertNoOverflow(page, `s7.4 ${vp.tag}`);
      assert.ok(await page.locator('#scene-2 .step-task').isVisible(), 's7.4 step task visible');
      assert.ok(await page.locator('#scene-2 .figure-screen').isVisible(), 's7.4 screening figure visible');
      assert.ok(await page.locator('#condition-cite').isVisible(), 's7.4 condition cite banner visible');
      const s74Text = await page.locator('#scene-2 .figure-screen').innerText();
      for (const token of ['1.5', '2.5', '1', '3']) {
        assert.ok(s74Text.includes(token), `s7.4 figure includes ${token}`);
      }
      const detail74 = page.locator('#scene-2 details.guided-detail');
      assert.equal(await detail74.evaluate(el => el.open), false, 's7.4 detail initially collapsed');
      if (vp.tag !== 'landscape') {
        await page.screenshot({path: path.join(shotDir, `_learn-s7-4_scene-2-${vp.tag}.png`)});
      }
      await detail74.locator('summary').click();
      assert.equal(await detail74.evaluate(el => el.open), true, 's7.4 detail expands on click');

      // Task 2: 10.2 米豆交换 (#scene-1 is rice=0.5, #scene-2 is rice=2)
      await page.goto(`${base}/learn-s10-2.html#scene-1`, {waitUntil: 'networkidle'});
      await assertNoOverflow(page, `s10.2 ${vp.tag}`);
      assert.ok(await page.locator('#scene .figure-exchange').isVisible(), 's10.2 exchange figure visible');
      assert.ok(await page.locator('#scene .state-cell .value').first().isVisible(), 's10.2 state-cell value visible');
      const s102Text = await page.locator('#scene').innerText();
      for (const token of ['4 斤米', '2 斤豆', '5 斤米', '2.5 斤豆', '3']) {
        assert.ok(s102Text.includes(token), `s10.2 scene-1 includes ${token}`);
      }
      const cite102 = await page.locator('#condition-cite').innerText();
      assert.match(cite102, /各花一半|x_1|x₁/, 's10.2 cites 50/50 utility premise');

      // Task 3: 18.2 暂留匹配 (initial 8 rows + #scene-2 / #scene-3)
      await page.goto(`${base}/learn-s18-2.html`, {waitUntil: 'networkidle'});
      assert.equal(await page.locator('.condition-table tbody tr').count(), 8, 's18.2 has 8 preference table rows');
      await page.goto(`${base}/learn-s18-2.html#scene-3`, {waitUntil: 'networkidle'});
      await assertNoOverflow(page, `s18.2 scene-3 ${vp.tag}`);
      assert.ok(await page.locator('#scene-3 .figure-matching').isVisible(), 's18.2 matching figure visible');
      assert.equal(await page.locator('#scene-3 .state-grid').count(), 0, 's18.2 does not duplicate state-grid next to matching-fig');
      assert.ok(await page.locator('.condition-table tr[data-row-key="岗B"].is-cited').count() === 1, 's18.2 scene-3 highlights row 岗B');
      const s182Text = await page.locator('#scene-3 .figure-matching').innerText();
      assert.ok(s182Text.includes('丙') && s182Text.includes('乙'), 's18.2 scene-3 shows 丙 and 乙 at B');
      if (vp.tag !== 'landscape') {
        await page.screenshot({path: path.join(shotDir, `_learn-s18-2_scene-3-${vp.tag}.png`)});
      }

      // Authored condition reference on non-exemplar unit (s15.1#scene-2)
      await page.goto(`${base}/learn-s15-1.html#scene-2`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#condition-cite').isVisible(), 'non-exemplar s15.1 shows its authored payoff condition');
      assert.ok(await page.locator('.condition-text li.is-cited').count() >= 1, 'non-exemplar s15.1 highlights cited li');

      assert.deepEqual(errors, [], `zero page errors at ${vp.tag}`);
      await context.close();
    }
    console.log('PASS UX01, UX03, UX04 responsive exemplars and non-exemplar condition citation');

    // 2. UX04: Rapid navigation (10x next/prev) and live reduced-motion toggle
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      await page.goto(`${base}/learn-s18-2.html#scene-1`, {waitUntil: 'networkidle'});
      for (let i = 0; i < 5; i++) {
        await page.locator('#scene a[href="#scene-2"]').click();
        await page.locator('#scene-2 a[href="#scene"]').click();
      }
      await page.locator('#scene a[href="#scene-2"]').click();
      assert.ok(await page.locator('#scene-2').isVisible(), 's18.2 lands cleanly on #scene-2 after rapid clicks');
      const activeTokens = await page.locator('#scene-2 [data-token]').evaluateAll(els => els.map(e => e.dataset.token));
      assert.equal(new Set(activeTokens).size, activeTokens.length, 'no duplicate data-token identities in active scene');

      // Live reduced motion switch
      await page.emulateMedia({reducedMotion: 'reduce'});
      await page.locator('#scene-2 a[href="#scene-3"]').click();
      const runningAnims = await page.evaluate(() =>
        document.getAnimations().filter(a => a.playState === 'running' && a.effect?.getTiming?.().duration > 0).length
      );
      assert.equal(runningAnims, 0, 'zero running animations when reducedMotion is reduce');
      assert.ok(await page.locator('#scene-3 .figure-matching').isVisible(), 'conclusion & figure intact in reduced motion');
      await context.close();
    }
    console.log('PASS UX04 rapid navigation & live reduced-motion toggle');

    // 3. UX02 & Task 4: Fresh session #answer deep link on p19.3 + legacy anchors
    for (const width of [1440, 390]) {
      const context = await browser.newContext({viewport: {width, height: 844}});
      const page = await context.newPage();
      await page.goto(`${base}/learn-p19-3.html#answer`, {waitUntil: 'networkidle'});
      await assertNoOverflow(page, `p19.3 #answer ${width}`);
      assert.ok(await page.locator('#answer').isVisible(), `p19.3 #answer directly visible at ${width}`);
      const rows = await page.locator('#answer .guided-answer-row').count();
      assert.ok(rows >= 4, 'p19.3 full answer rows visible immediately');
      const answerText = await page.locator('#answer').innerText();
      assert.ok(answerText.includes('（b）') && answerText.includes('弱读'), 'p19.3 distinguishes （b） and weak-reading note');
      await page.screenshot({path: path.join(shotDir, `_learn-p19-3_answer-${width}.png`)});

      // Jump back to a specific step from the answer paper
      await page.locator('#answer .guided-answer-row a[href^="#proof-"]').first().click();
      assert.ok(await page.locator('#proof-1').isVisible(), 'jumping from #answer to #proof-1 works');

      // Legacy anchors
      await page.goto(`${base}/learn-p19-3.html#given-2`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#given-start').isVisible(), '#given-2 lands on reading conditions');
      await page.goto(`${base}/learn-p19-3.html?step=2`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#scene-2').isVisible(), '?step=2 lands on scene-2');
      await context.close();
    }
    console.log('PASS UX02 fresh-session #answer deep link & legacy anchors');

    // 4. UX05: Bidirectional links between learn and review routes
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      await page.goto(`${base}/learn-s7-4.html#scene-2`, {waitUntil: 'networkidle'});
      const toReview74 = page.locator('a[data-review-route]').first();
      assert.equal(await toReview74.count(), 1);
      const reviewURL=new URL(await toReview74.getAttribute('href'));
      assert.equal(reviewURL.hash,'#section-7.4');
      assert.equal(reviewURL.searchParams.get('returnTo'),'learn-s7-4.html#scene-2');
      await page.goto(`${base}/review-7.html#section-7.4`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#section-7\\.4 a[href="learn-s7-4.html"]').first().isVisible(), 'review-7.4 links back to learn-s7-4.html');

      await page.goto(`${base}/learn-p19-3.html#answer`, {waitUntil: 'networkidle'});
      const p19Link=new URL(await page.locator('a[data-review-route]').first().getAttribute('href'));
      assert.equal(p19Link.hash,'#p19.3');
      assert.equal(p19Link.searchParams.get('returnTo'),'learn-p19-3.html#answer');
      await page.goto(`${base}/review-19.html#p19.3`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#p19\\.3 a[href="learn-p19-3.html#answer"]').isVisible(), 'review-19#p19.3 links to learn-p19-3.html#answer');

      await page.goto(`${base}/insurance-3-9.html`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('a[href="review-3.html#p3.9"]').count() >= 1, 'insurance-3-9 links to review-3.html#p3.9');
      await page.goto(`${base}/lesson-7-4.html`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('a[href="review-7.html#section-7.4"]').count() >= 1, 'lesson-7-4 links to review-7.html#section-7.4');
      await context.close();
    }
    console.log('PASS UX05 bidirectional links across learn, review, insurance, and classic lessons');

    // 5. UX06 + Task 5: Unified search & cross-route proposition study flow
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      for (const pagePath of ['learn.html', 'formula-4h.html', 'catalog.html', 'exercises.html']) {
        await page.goto(`${base}/${pagePath}`, {waitUntil: 'networkidle'});
        const input = page.locator('input[type="search"]').first();
        const box = page.locator('[data-search-results], #unified-search-box').first();
        for (const [query, expectedHref] of [
          ['命题17.1', 'review-17.html#proposition-17.1'],
          ['17.1', 'learn-s17-1.html'],
          ['习题7.8', 'learn-p7-8.html'],
          ['信息租金', 'learn-s7-4.html'],
          ['WARP', 'learn-s5-5.html'],
          ['VCG', 'learn-s17-3.html'],
          ['HW3', 'review-hw3-1.html']
        ]) {
          await input.fill(query);
          await box.waitFor({state: 'visible'});
          const hrefs = await box.locator('a').evaluateAll(as => as.map(a => a.getAttribute('href')));
          assert.ok(hrefs.some(h => h && h.includes(expectedHref)), `${pagePath} search "${query}" includes ${expectedHref} (got ${hrefs.slice(0, 5).join(', ')})`);
        }
        if (pagePath === 'learn.html') {
          await input.fill('命题17.1');
          await page.screenshot({path: path.join(shotDir, 'learn-search-ux06-1440.png')});
        }
        await input.fill('');
        assert.ok(await box.isHidden(), `${pagePath} clearing search hides unified results`);
      }

      // Cross-route flow: search 命题17.1 -> review-17.html#proposition-17.1 -> learn-s17-3.html
      await page.goto(`${base}/learn.html`, {waitUntil: 'networkidle'});
      await page.locator('input[type="search"]').first().fill('命题17.1');
      await page.locator('[data-search-results] a[href*="review-17.html#proposition-17.1"]').first().click();
      await page.waitForURL(/review-17\.html#proposition-17\.1/);
      const claimCard = page.locator('#proposition-17\\.1');
      assert.ok(await claimCard.isVisible(), 'arrived at Proposition 17.1 on review-17.html');
      await claimCard.locator('a[href^="learn-s17-3.html"]').first().click();
      await page.waitForURL(/learn-s17-3\.html/);
      assert.match(await page.locator('main').textContent(), /打平|弱占优|常数/, 's17.3 explains VCG zero boundary and payoff comparison');
      await context.close();
    }
    console.log('PASS UX06 unified search & cross-route Proposition 17.1 flow');

    // 6. UX07 + UX08: Local study progress, resume banner, explicit hash priority, storage resilience, 4h checklist
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      await page.goto(`${base}/learn-s7-4.html#scene-2`, {waitUntil: 'networkidle'});
      await page.locator('.study-status-btn[data-study-status="confused"]').click();
      assert.equal(await page.locator('.study-status-btn[data-study-status="confused"]').getAttribute('aria-pressed'), 'true');

      // Explicit URL hash priority over stored #scene-2
      await page.goto(`${base}/learn-s7-4.html#scene-3`, {waitUntil: 'networkidle'});
      assert.ok(await page.locator('#scene-3').isVisible(), 'explicit URL hash #scene-3 overrides stored #scene-2');

      // Check resume banner and filter on learn.html
      await page.goto(`${base}/learn.html`, {waitUntil: 'networkidle'});
      const resume = page.locator('#study-resume');
      assert.ok(await resume.isVisible(), 'study-resume banner visible on learn.html');
      assert.match(await resume.innerText(), /7\.4/, 'study-resume points to 7.4');
      await page.goto(`${base}/learn-07.html`, {waitUntil: 'networkidle'});
      assert.match(await page.locator('.unit-row[data-unit-key="s7.4"]').innerText(), /还没懂/, 's7.4 row shows 还没懂 badge');
      await page.locator('[data-study-filter] button[data-filter="confused"]').click();
      assert.ok(await page.locator('.unit-row[data-unit-key="s7.4"]').isVisible(), 's7.4 visible under confused filter');
      assert.ok(await page.locator('.unit-row[data-unit-key="s7.1"]').isHidden(), 'unmarked s7.1 hidden under confused filter');
      await page.locator('[data-study-filter] button[data-filter="all"]').click();

      // UX08: 4h checklist & minute tracker
      await page.goto(`${base}/formula-4h.html`, {waitUntil: 'networkidle'});
      await assertNoOverflow(page, 'formula-4h 1440');
      await page.locator('.sprint-item[data-sprint-chapter="1"] .sprint-check').click();
      await page.locator('.sprint-item[data-sprint-chapter="7"] .sprint-check').click();
      const summaryText = await page.locator('#sprint-progress-summary').innerText();
      assert.match(summaryText, /2 \/ 20 章 · 45 \/ 240 分钟/, '4h sprint progress updates chapter and minute counts (10 + 35)');
      await page.screenshot({path: path.join(shotDir, '_formula-4h-1440.png')});

      await page.setViewportSize({width: 390, height: 844});
      await assertNoOverflow(page, 'formula-4h 390');
      await page.screenshot({path: path.join(shotDir, '_formula-4h-390.png')});
      await page.setViewportSize({width: 1440, height: 900});

      await page.locator('[data-sprint-filter="todo"]').click();
      assert.ok(await page.locator('.sprint-item[data-sprint-chapter="7"]').isHidden(), 'completed ch7 hidden under todo filter');
      assert.ok(await page.locator('.sprint-item[data-sprint-chapter="2"]').isVisible(), 'unfinished ch2 visible under todo filter');
      await page.locator('[data-sprint-filter="all"]').click();

      // Check review-7.html chapter toggle sync
      await page.goto(`${base}/review-7.html`, {waitUntil: 'networkidle'});
      assert.equal(await page.locator('#review-chapter-toggle').getAttribute('aria-pressed'), 'true', 'review-7 reflects completed status');
      await context.close();

      // Storage blocked resilience check
      const blockedCtx = await browser.newContext({viewport: {width: 1440, height: 900}});
      await blockedCtx.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          get() { throw new DOMException('Blocked', 'SecurityError'); }
        });
      });
      const blockedPage = await blockedCtx.newPage();
      const blockedErrors = [];
      blockedPage.on('pageerror', e => blockedErrors.push(e.message));
      await blockedPage.goto(`${base}/learn-s7-4.html#scene-2`, {waitUntil: 'networkidle'});
      assert.ok(await blockedPage.locator('#scene-2 .figure-screen').isVisible(), 's7.4 works when localStorage throws');
      assert.deepEqual(blockedErrors, [], 'zero uncaught errors when localStorage throws');
      await blockedCtx.close();
    }
    console.log('PASS UX07 & UX08 local study progress, explicit hash priority, storage resilience, and 4h sprint checklist');

    // 7. UX09: Option-specific wrong-answer diagnostics, non-spoiling hint, retry, and first-attempt tracking
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      for (const [file, wrongIdx, rightIdx, expectedDiagKeyword] of [
        ['learn-s7-4.html', 1, 0, '0.8'],
        ['learn-s10-2.html', 0, 1, '18 元家底'],
        ['learn-s18-2.html', 0, 1, '门槛只会更高'],
        ['learn-s17-1.html', 1, 0, '填平'],
        ['learn-s17-3.html', 0, 1, '外部影响'],
        ['learn-p17-1.html', 0, 1, '预算平衡'],
        ['learn-p19-3.html', 1, 0, '生产率是 0']
      ]) {
        await page.goto(`${base}/${file}#practice`, {waitUntil: 'networkidle'});
        const hintBtn = page.locator('#hint-btn');
        assert.ok(await hintBtn.isVisible(), `${file} hint button visible`);
        await hintBtn.click();
        assert.ok(await page.locator('#practice-hint').isVisible(), `${file} hint box opens`);
        assert.equal(await page.locator('#worked').evaluate(el => el.open), false, `${file} #worked stays closed on hint`);

        // Submit wrong option
        await page.locator(`#transfer input[name="choice"][value="${wrongIdx}"]`).check();
        await page.locator('#transfer [type="submit"]').click();
        const fbWrong = await page.locator('#feedback').innerText();
        assert.match(fbWrong, /再核对/, `${file} wrong feedback starts with 再核对`);
        assert.ok(fbWrong.includes(expectedDiagKeyword), `${file} wrong feedback includes diagnostic "${expectedDiagKeyword}"`);
        assert.equal(await page.locator('#worked').evaluate(el => el.open), false, `${file} #worked not auto-opened on wrong answer`);
        if (file === 'learn-s7-4.html') {
          await page.screenshot({path: path.join(shotDir, 's7-4-practice-ux09-1440.png')});
        }

        // Retry with right option
        await page.locator(`#transfer input[name="choice"][value="${rightIdx}"]`).check();
        await page.locator('#transfer [type="submit"]').click();
        const fbRight = await page.locator('#feedback').innerText();
        assert.match(fbRight, /判断对了（订正后通过/, `${file} retry feedback distinguishes corrected pass`);
      }
      const storedPractice = await page.evaluate(() => JSON.parse(localStorage.getItem('micro-atlas-study-v1')).practice['p19.3']);
      assert.equal(storedPractice.firstCorrect, false, 'firstCorrect remains false after initial wrong attempt');
      assert.equal(storedPractice.resolved, true, 'resolved is true after retry');
      assert.equal(storedPractice.attempts, 2, 'attempts count is 2');
      await context.close();
    }
    console.log('PASS UX09 diagnostic wrong-answer feedback, hint, retry, and first-attempt honesty');

    // 8. UX10: Copy step link & structured Markdown bug feedback template (desktop + mobile)
    {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({
          viewport: {width, height: 844},
          permissions: ['clipboard-read', 'clipboard-write']
        });
        const page = await context.newPage();
        await page.goto(`${base}/learn-s7-4.html#scene-2`, {waitUntil: 'networkidle'});
        await page.locator('[data-copy-step]').click();
        await page.waitForFunction(() => document.getElementById('share-status')?.textContent?.includes('已复制'));
        assert.match(await page.locator('#share-status').innerText(), /已复制本步直达链接/);
        const stepClip = await page.evaluate(() => navigator.clipboard.readText());
        assert.match(stepClip, /learn-s7-4\.html#scene-2$/);

        await page.locator('[data-copy-issue]').click();
        await page.waitForFunction(() => document.getElementById('share-status')?.textContent?.includes('纠错模板'));
        assert.match(await page.locator('#share-status').innerText(), /已复制纠错模板/);
        assert.ok(await page.locator('[data-issue-link]').isVisible(), 'manual GitHub issue link visible after copying template');
        const issueClip = await page.evaluate(() => navigator.clipboard.readText());
        assert.ok(issueClip.includes('7.4') && issueClip.includes('scene-2'), 'template includes unit and step ID');
        assert.ok(!issueClip.includes('/Users/'), 'template contains zero local filesystem paths');
        await context.close();
      }
    }
    console.log('PASS UX10 step link & privacy-clean Markdown feedback template copy');

    // 9. UX11: Formula-adjacent scoped symbol lookup & premise anchor jump on 4h review pages
    {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({viewport: {width, height: 844}});
        const page = await context.newPage();
        for (const rev of ['review-7.html', 'review-10.html', 'review-17.html', 'review-18.html', 'review-19.html']) {
          await page.goto(`${base}/${rev}`, {waitUntil: 'networkidle'});
          await assertNoOverflow(page, `${rev} ${width}`);
          const symDetails = page.locator('details.formula-symbols').first();
          assert.ok(await symDetails.count() === 1, `${rev} has formula-adjacent scoped symbols`);
          await symDetails.locator('summary').click();
          assert.equal(await symDetails.evaluate(el => el.open), true, `${rev} formula-symbols opens`);
          if (rev === 'review-7.html' && width === 1440) {
            await page.screenshot({path: path.join(shotDir, 'review-7-ux11-1440.png')});
          }
          const premiseLink = page.locator('a.premise-back').first();
          assert.ok(await premiseLink.count() === 1, `${rev} has premise jump link`);
          const targetId = (await premiseLink.getAttribute('href')).slice(1);
          await premiseLink.click();
          assert.ok(await page.locator(`[id="${targetId}"]`).isVisible(), `${rev} premise target #${targetId} is visible`);
        }
        await context.close();
      }
    }
    console.log('PASS UX11 formula-adjacent symbol lookup & premise jump');

    // 10. Print media & no-JS checks
    {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}});
      const page = await context.newPage();
      await page.goto(`${base}/learn-p19-3.html`, {waitUntil: 'networkidle'});
      await page.emulateMedia({media: 'print'});
      assert.ok(await page.locator('#answer').isVisible(), 'print mode shows full answer');
      assert.ok(await page.locator('#study-status-bar').isHidden(), 'print mode hides study-status-bar');
      assert.ok(await page.locator('#step-share-bar').isHidden(), 'print mode hides step-share-bar');
      await context.close();
    }
    console.log('PASS print mode visibility & chrome hiding');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
