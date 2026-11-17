'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const unit=require('./src/guided/ch10.cjs')['s10.6'];
const {members,outsider,allocations}=unit.coalition;
const sum=baskets=>[0,1].map(k=>baskets.reduce((s,b)=>s+b[k],0));
const utility=(m,b)=>m.rule==='pairs'?Math.min(...b):b[0]+b[1];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
assert.equal(members.length,3);
assert.equal(new Set([...members,outsider].map(m=>m.name)).size,4);
assert.deepEqual(sum([...members,outsider].map(m=>m.endowment)),[2,2]);
assert.deepEqual(sum([...members,outsider].map(m=>m.original)),[2,2]);
assert.deepEqual(members.map(m=>utility(m,m.original)),[.25,.25,1.5]);
assert.equal(allocations[0],null,'the old proposal is not the coalition resource pool');
assert.equal(allocations[1][2],null,'the bean merchant is unassigned at the intermediate step');
const pool=sum(members.map(m=>m.endowment));assert.deepEqual(pool,[2,1]);
const final=sum(allocations[2]);final.forEach((v,k)=>near(v,pool[k]));
members.forEach((m,i)=>assert.ok(utility(m,allocations[2][i])>utility(m,m.original)));
assert.ok(utility(outsider,outsider.endowment)<utility(outsider,outsider.original));
for(const t of [.25,.3,.375]){
  const improves=t>.25 && 3-4*t>1.5;
  assert.equal(improves,t===.3,'strict improvement excludes the two endpoints');
}
const before=execFileSync('git',['show','HEAD:src/guided/ch10.cjs'],{encoding:'utf8'});
const Module=require('node:module');const old=new Module('baseline');old._compile(before,'baseline.cjs');
const current=require('./src/guided/ch10.cjs');
for(const [id,u] of Object.entries(current))if(id!=='s10.6')assert.deepEqual(u,old.exports[id],id+' remains unchanged');
assert.deepEqual(unit.frames.map(f=>f[1]),old.exports['s10.6'].frames.map(f=>f[1]),'original model values remain unchanged');
console.log('PASS conservation, individual improvements, outsider loss, strict boundaries and unchanged neighbouring units');

async function browserCheck(){
 const {chromium}=require('playwright'),http=require('node:http');
 const root=path.join(__dirname,'dist'),shots=path.join(__dirname,'qa/coalition-teaching');fs.mkdirSync(shots,{recursive:true});
 const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');fs.createReadStream(f).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 const base='http://127.0.0.1:'+server.address().port, errors=[];
 try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  for(const width of [1440,390,320]){
   await page.setViewportSize({width,height:900});
   for(const anchor of ['given-start','scene','scene-2','scene-3']){
    await page.goto(base+'/learn-s10-6.html#'+anchor);await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.locator('#'+anchor).isVisible());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+' '+anchor);
    assert.equal(await page.locator('.katex-error').count(),0);
    if(anchor!=='given-start'){
     const step=page.locator('#'+anchor);
     assert.equal(await step.locator('.coalition-person').count(),3);
     assert.equal(await step.locator('.state-grid').count(),0);
     assert.ok(await page.locator('.condition-card').isVisible());
     if(anchor==='scene-2')assert.match(await step.locator('[data-member="豆商甲"]').innerText(),/还没给他分货/);
     if(anchor==='scene-3')assert.equal(await step.locator('.coalition-verdict').count(),3);
    }
    await page.screenshot({path:path.join(shots,`${width}-${anchor}.png`),fullPage:true});
   }
  }
  await page.goto(base+'/learn-s10-6.html#scene');
  await page.locator('#scene [data-direction="next"]').focus();await page.keyboard.press('Enter');
  assert.ok(await page.locator('#scene-2').isVisible());
  await page.goBack();assert.ok(await page.locator('#scene').isVisible());
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#scene [data-direction="next"]').click();
  assert.ok(await page.locator('#scene-2').isVisible());
  assert.equal(await page.locator('#scene-2 .guided-step-body').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#scene-2 [data-direction="next"]').click();assert.ok(await page.locator('#scene-3').isVisible());
  // The standalone lesson uses its source HTML directly and has a readable no-JS fallback.
  const offline=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const p=await offline.newPage();await p.goto('file://'+path.join(root,'learn-s10-6.html')+'#scene-3');
  assert.ok(await p.locator('#scene-3 .coalition-board').isVisible());
  assert.equal(await p.locator('#scene-3 .coalition-verdict').count(),3);await offline.close();
  assert.deepEqual(errors,[]);console.log('PASS 12 responsive views, keyboard navigation, history, reduced motion, offline/no-JS and zero page errors');
 }finally{if(browser)await browser.close();server.close();}
}
if(process.argv.includes('--browser'))browserCheck().catch(e=>{console.error(e);process.exitCode=1;});
