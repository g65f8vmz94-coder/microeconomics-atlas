'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist'),shots=path.join(__dirname,'qa/experience-fixes');fs.mkdirSync(shots,{recursive:true});
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const f=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}const ext=path.extname(f);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp'})[ext]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
 const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const go=route=>page.goto(base+'/'+route);
 const submit=async choice=>{await page.locator('#transfer input[value="'+choice+'"]').check();await page.locator('#transfer [type="submit"]').click();};
 const record=key=>page.evaluate(key=>JSON.parse(localStorage.getItem('micro-atlas-study-v1')).practice[key],key);
 try{
  await go('learn-p19-3.html#answer');await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.foot').evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal(await page.locator('#answer .guided-controls').evaluate(e=>getComputedStyle(e).display),'none');
  await page.emulateMedia({media:'screen'});
  await page.keyboard.press('Tab');await page.locator('[data-copy-step]').focus();
  assert.equal(await page.locator('[data-copy-step]').evaluate(e=>getComputedStyle(e).outlineColor),'rgb(193, 124, 39)');
  console.log('PASS R01 CSS selector semantics, keyboard focus and print');
  await go('learn-s7-4.html#practice');await page.locator('#worked summary').click();await submit(0);
  assert.match(await page.locator('#feedback').innerText(),/看过做法后通过/);assert.equal((await record('s7.4')).firstIndependent,false);
  assert.equal(await page.locator('[data-study-status="done"]').getAttribute('aria-pressed'),'false');
  await go('learn-s10-2.html#practice');await submit(0);await page.reload();await submit(1);
  assert.match(await page.locator('#feedback').innerText(),/订正后通过/);assert.equal((await record('s10.2')).firstCorrect,false);
  await go('learn-s17-1.html#practice');await page.locator('#hint-btn').click();await submit(0);assert.match(await page.locator('#feedback').innerText(),/参考提示后通过/);
  console.log('PASS R02 answer exposure, hints, reload and first-attempt honesty');
  await go('formula-4h.html');await page.locator('[data-study-backup] summary').click();
  const check=page.locator('[data-sprint-chapter="1"] .sprint-check');
  for(let i=0;i<3;i++){await page.locator('[data-clear-study]').click();await check.click();assert.equal(await check.getAttribute('aria-pressed'),'true');await check.click();assert.equal(await check.getAttribute('aria-pressed'),'false');}
  let downloads=0;page.on('download',()=>downloads++);
  const download=page.waitForEvent('download');await page.locator('[data-export-study]').click();await download;await page.waitForTimeout(250);assert.equal(downloads,1);
  console.log('PASS R03 repeated clearing keeps one listener and one download');
  for(const js of [true,false]){
   const c=await browser.newContext({javaScriptEnabled:js});const p=await c.newPage();
   await p.goto(base+'/learn-s1-4.html#proof-5-2');
   const target=p.locator('[id="proof-5-2"]');
   const owner=target.locator('xpath=ancestor::section[contains(@class,"guided-step")]');
   assert.ok(await owner.isVisible());
   if(!js) for(const detail of await owner.locator('details').all()) if(!await detail.getAttribute('open')) await detail.locator('summary').click();
   assert.match(await owner.innerText(),/反设存在实数效用函数/);
   await c.close();
  }
  console.log('PASS R04 historical proof anchor identifies the original argument with and without JS');
  await go('learn-s15-1.html#proof-2');const cite=await page.locator('#condition-cite').innerText();assert.doesNotMatch(cite,/沿用原站示例/);assert.match(cite,/收益/);
  await go('learn-s3-2.html#proof-2');assert.ok(await page.locator('#condition-cite').isHidden());
  console.log('PASS R05 explicit premise and no-match fallback');
  await go('review-7.html#eq-7.3-2');const symbols=await page.locator('[id="eq-7.3-2"] .formula-symbols annotation').allTextContents();assert.ok(symbols.includes('y_i'));assert.ok(!symbols.includes('y_i^*'));
  console.log('PASS R06 exact formula symbol lookup');
  await go('formula-4h.html');assert.equal(await page.locator('[data-sprint-task]').count(),60);
  const links=await page.locator('[data-sprint-task] a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  for(const href of links){const [file,id]=href.split('#');assert.ok(fs.readFileSync(path.join(root,file),'utf8').includes('id="'+id+'"'),href);}
  const task=page.locator('[data-sprint-chapter="1"] [data-sprint-task="conditions"] [data-task-done]');await task.click();await page.reload();assert.equal(await task.getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#sprint-progress-summary .sprint-next-link').getAttribute('href'),/derivation-1.4/);
  console.log('PASS R07 60 exact tasks, existing self-checks, persistence and next action');
  await go('learn-s7-4.html#scene-2');await page.locator('.guide-pager [data-review-route]').click();
  await page.locator('[id="section-7.4"] .formal-crosslink').first().click();await page.waitForURL(/learn-s7-4.*#scene-2/);assert.ok(await page.locator('#scene-2').isVisible());
  await go('review-7.html#eq-7.4-1');await page.locator('[id="section-7.4"] .formal-crosslink').first().click();
  await page.locator('.guide-pager [data-review-route]').click();await page.waitForURL(/review-7.*#eq-7.4-1/);
  await go('learn-s7-4.html#scene-3');assert.ok(await page.locator('#scene-3').isVisible());
  console.log('PASS R08 bidirectional return preserves locations; explicit shared hash wins');
  await page.evaluate(()=>{localStorage.removeItem('micro-atlas-study-v1');localStorage.setItem('micro-atlas-progress-v1',JSON.stringify({'7.4':{opened:true,practiced:true},'7.1':{opened:true}}));localStorage.setItem('unrelated-setting','keep');});
  await go('learn-07.html');assert.match(await page.locator('[data-unit-key="s7.4"]').innerText(),/已独立做过/);assert.match(await page.locator('[data-unit-key="s7.1"]').innerText(),/已看过/);
  await go('learn-s7-4.html#scene-2');await page.locator('[data-study-status="confused"]').click();await go('learn-07.html');assert.match(await page.locator('[data-unit-key="s7.4"]').innerText(),/还没懂/);
  await go('learn.html');await page.locator('[data-study-backup] summary').click();await page.locator('[data-clear-study]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('unrelated-setting')),'keep');
  await go('learn-07.html');assert.equal(await page.locator('[data-unit-key="s7.4"] .unit-mastery').count(),0);
  console.log('PASS R09 legacy migration, explicit state priority and scoped clearing');
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:844});
   for(const route of ['learn-s7-4.html#scene-2','learn-s10-2.html#scene-1','learn-s18-2.html#scene-3','learn-p19-3.html#answer','formula-4h.html#sprint-chapter-7','review-7.html#eq-7.3-2']){
    await go(route);await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1),width+' '+route);
    await page.screenshot({path:path.join(shots,width+'-'+route.replace(/[.#]/g,'_')+'.png')});
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS 18 responsive states and zero page errors');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
