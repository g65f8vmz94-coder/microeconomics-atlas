'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const notes=require('./src/guided/teaching-notes.cjs');
const {catalog,loadChapters,urlFor}=require('./src/guided/catalog.cjs');
const {math,inline}=require('./src/guided/format.cjs');
const {gunzipSync}=require('node:zlib');
async function main(){
 const chapters=catalog(require('./coverage.json')),units=Object.assign({},...await loadChapters(chapters));
 const ids=chapters.flatMap(c=>c.sections.map(s=>s.key));
 assert.deepEqual(Object.keys(notes).sort(),ids.sort());
 let scenes=0,rewritten=0,formulas=0;
 for(const id of ids){
  const n=notes[id],u=units[id];assert.ok(n.question.endsWith('？')&&n.read.length>20,id);
  if(n.steps){assert.equal(n.steps.length,u.frames.length,id+' step count');rewritten+=n.steps.length;}
  for(const s of [n.question,n.read,...(n.steps||[])])for(const m of s.matchAll(/\$([^$]+)\$/g)){math(m[1]);formulas++;}
  const html=fs.readFileSync(path.join('dist',urlFor(id)),'utf8');assert.ok(html.includes(inline(n.read)),id+' reading guide');
  for(const [i,f]of u.frames.entries()){
   const anchor=i?'scene-'+(i+1):'scene';const section=html.match(new RegExp('<section class="guided-step guided-scene" id="'+anchor+'"[\\s\\S]*?</section>'))?.[0];
   assert.ok(section&&section.includes('step-task'),id+' '+anchor+' question');
   if(n.steps)assert.ok(section.includes(inline(n.steps[i])),id+' authored explanation');scenes++;
  }
 }
 // Independent arithmetic for formerly unexplained scores and accounting columns.
 assert.deepEqual(units['s4.5'].frames.map(f=>f[1].slice(0,2)),[[1,4],[1.75,3.25],[2.5,2.5],[4,1]]);
 assert.match(units['s4.5'].frames[0][2],/起点是 \$\(1,4\)/);
 const fish=units['s13.3'].frames.map(f=>f[1]);assert.equal(fish[1][2],(6-4.5)*3/10);assert.equal(fish[1][3],(4.5-3)*3/5);assert.equal(fish[3][2],9/15);
 assert.ok(Math.abs(units['s16.4'].frames[0][1][1]-(1-.6)/(1-.8*.6))<1e-5);
 const raw=fs.readFileSync('dist/downloads/lesson-10-6.html','utf8');
 const packed=raw.match(/id="page-runtime-gzip">([^<]+)/)[1];
 assert.equal(gunzipSync(Buffer.from(packed,'base64')).toString(),['lesson-film.js','frontend.js','site.js'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n;\n'));
 console.log(JSON.stringify({sections:ids.length,scenes,rewrittenSteps:rewritten,mathExpressions:formulas,sharedRuntimeByteIdentity:true}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
