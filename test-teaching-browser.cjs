'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const notes=require('./src/guided/teaching-notes.cjs'),{urlFor}=require('./src/guided/catalog.cjs');
const root=path.join(__dirname,'dist'),out=path.join(__dirname,'qa/teaching-alignment');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('Content-Type',f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const base=process.env.TEACHING_BASE_URL||'http://127.0.0.1:'+server.address().port;
 const errors=[],report={base,widths:[1440,390,320],firstScenes:0,expandedSteps:0,screenshots:[]};
 try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  const go=async(id,anchor='scene')=>{await page.goto(base+'/'+urlFor(id)+'#'+anchor);await page.evaluate(()=>document.fonts.ready);await page.locator('#'+anchor).waitFor({state:'visible'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' '+anchor+' overflow');assert.equal(await page.locator('.katex-error').count(),0);};
  for(const width of report.widths){
   await page.setViewportSize({width,height:900});
   for(const id of Object.keys(notes)){
    await go(id);assert.equal(await page.locator('#scene .guided-reading-key').count(),1,id);assert.ok(await page.locator('#scene .step-task').isVisible());report.firstScenes++;
    if(['s1.1','s4.5','s10.6','s12.1','s13.3','s16.4','s20.4'].includes(id)){
     const file=`${width}-${id}.png`;await page.screenshot({path:path.join(out,file),fullPage:true});report.screenshots.push(file);
    }
   }
   console.log('PASS all 90 first scenes at '+width);
  }
  for(const[id,n]of Object.entries(notes))if(n.steps)for(let i=1;i<n.steps.length;i++){await go(id,'scene-'+(i+1));assert.ok(await page.locator('#scene-'+(i+1)+' .guided-scene-why').innerText());report.expandedSteps++;}
  await go('s13.3','scene-4');await page.screenshot({path:path.join(out,'320-s13.3-final.png'),fullPage:true});
  await go('s4.5');await page.locator('#scene [data-direction="next"]').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#scene-2').isVisible());await page.goBack();assert.ok(await page.locator('#scene').isVisible());
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#scene [data-direction="next"]').click();assert.equal(await page.locator('#scene-2 .guided-step-body').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.goto(base+'/learn-p10-6.html#answer');assert.ok(await page.locator('#answer').isVisible());
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});const p=await c.newPage();await p.goto('file://'+path.join(root,'learn-s13-3.html')+'#scene-2');assert.ok(await p.locator('#scene-2').isVisible());await c.close();
  await page.goto('file://'+path.join(root,'downloads/lesson-10-6.html'));await page.waitForTimeout(350);assert.ok(await page.locator('math').count()>0);assert.equal(await page.locator('script#page-runtime-gzip').count(),1);
  assert.deepEqual(errors,[]);report.pageErrors=errors;report.keyboard=true;report.reducedMotion=true;report.offline=true;report.passed=true;fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
