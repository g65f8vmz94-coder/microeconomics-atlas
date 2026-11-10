const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const coverage=require('./coverage.json');
const inventory=require('./src/exercise-inventory.json');
const {catalog,urlFor,loadChapters}=require('./src/guided/catalog.cjs');
const {inline,equation}=require('./src/guided/format.cjs');
async function main() {
  const chapters=catalog(coverage);
  const root=path.join(__dirname,'dist');
  const modules=await loadChapters(chapters);
  const content=Object.assign({},...modules);
  const expected=chapters.flatMap(c=>[...c.sections,...c.problems].map(m=>m.key));
  assert.equal(chapters.length,20);
  assert.equal(chapters.flatMap(c=>c.sections).length,90);
  assert.equal(chapters.flatMap(c=>c.problems).length,151);
  assert.deepEqual(Object.keys(content).sort(),expected.filter(k=>k!=='p3.9').sort());
  assert.equal(inventory.actualNumberedProblems,inventory.problems.length);
  assert.equal(inventory.problems.filter(p=>p.id==='Problem 3.6').length,0);
  for(const n of [8,9]){
   const item=inventory.problems.find(p=>p.id==='Problem 7.'+n);
   assert.equal(item.printedPage,102);assert.equal(item.pdfPage,121);
   assert.equal(coverage.exercises.filter(r=>r.id===item.id).length,1);
  }
  assert.ok(inline('每人剩1/2元').includes('<mfrac>'));
  assert.ok(equation(String.raw`x\succeq y\lor y\succeq x`).includes('或者'));

  let frames=0,proofs=0,plots=0,networks=0;
  for(const [key,u] of Object.entries(content)){
   const check=(v,note)=>assert.ok(v,key+' '+note);
   check(u.title&&u.given&&u.columns.length>=2&&u.columns.length<=4,'conditions and columns');
   check(u.frames.length>=3&&u.frames.length<=5,'timeline length');
   check(u.proof.length>=2,'solution steps');
   for(const [action,cells,note] of u.frames){
    check(action&&note&&cells.length===u.columns.length,'frame structure');
    for(const value of cells)check(typeof value==='string'?value.trim():Number.isFinite(value),'computed state');
   }
   for(const [title,tex,why,step] of u.proof){
    check(title&&why&&Number.isInteger(step)&&step>=0&&step<u.frames.length,'proof round trip');
    if(tex)check(equation(tex).includes('<math'),'rendered math');
   }
   const [prompt,options,answer,why]=u.practice;
   check(prompt&&why&&options.length>=2&&options.length<=4&&Number.isInteger(answer)&&answer>=0&&answer<options.length,'transfer exercise');
   if(u.plot){
    plots++;const p=u.plot;check(p.x[0]<p.x[1]&&p.y[0]<p.y[1]&&p.axes.length===2,'fixed axes');
    check(p.dots.length===u.frames.length&&p.lines.length>0,'plot per frame');
    for(const [x,y] of p.dots)check(x>=p.x[0]-1e-8&&x<=p.x[1]+1e-8&&y>=p.y[0]-1e-8&&y<=p.y[1]+1e-8,'current point in frame');
    for(const line of p.lines)check(line.label&&line.points.length>=2&&line.points.every(p=>p.every(Number.isFinite)),'computed series');
   }
   if(u.network){
    networks++;const g=u.network,ids=new Set(g.nodes.map(n=>n.id));
    check(ids.size===g.nodes.length&&g.frames.length===u.frames.length&&g.legend,'network');
    for(const node of g.nodes)check(node.x>=0&&node.x<=1&&node.y>=0&&node.y<=1,'node coordinates');
    for(const edge of g.frames.flat())check(edge.length===2&&edge.every(id=>ids.has(id)),'named endpoints');
   }
   if(u.payoff){
    const g=u.payoff;
    check(g.players.length===2&&g.cells.length===g.rows.length&&g.cols.length>=2,'payoff dimensions');
    check(g.cells.every(r=>r.length===g.cols.length&&r.every(v=>v.length===2&&v.every(Number.isFinite))),'payoff pairs');
    check(g.frames.length===u.frames.length&&g.frames.every(([r,c])=>Number.isInteger(r)&&Number.isInteger(c)&&g.cells[r]?.[c]),'highlighted strategy profile');
   }
   if(u.holds)check(u.holds.frames.length===u.frames.length&&u.holds.frames.every(f=>f.length===u.holds.labels.length&&f.every(v=>typeof v==='string'&&v.trim())),'tentative assignments');
   if(u.portions)check(u.portions.frames.length===u.frames.length&&u.portions.frames.every(f=>f.length===2&&f.every(([q,p])=>q>=0&&q<=u.portions.max&&p>=0)),'contract menu');
   if(u.tickets)check(u.tickets.counts.length===u.frames.length&&u.tickets.counts.every(c=>c.every(Number.isInteger)&&c.reduce((a,b)=>a+b,0)===4),'four equiprobable tickets');
   const html=fs.readFileSync(path.join(root,urlFor(key)),'utf8');
   check(html.includes('id="guide-data"')&&html.includes('id="solution"')&&html.includes('id="transfer"'),'published entry');
   check(!/<script\b[^>]+src=|<link\s+[^>]*stylesheet|katex-error/.test(html),'self-contained page');
   frames+=u.frames.length;proofs+=u.proof.length;
  }
  // Independent arithmetic and accounting identities drawn from different chapters.
  const rows=k=>content[k].frames.map(f=>f[1]);
  assert.deepEqual(rows('s1.2').map(r=>r[2]),['茶','奶','汁']);
  for(const [,cash,fees]of rows('s2.5'))assert.equal(cash+fees,12);
  for(const row of rows('s3.1'))assert.equal(row.reduce((sum,v)=>sum+parseFloat(v),0),100);
  for(const [cakes,milk,bill]of rows('s5.1'))assert.equal(2*cakes+milk,bill);
  for(const [q,one,two]of rows('p6.2')){assert.equal(one,2+q*q);assert.equal(two,4+q*q/2);}
  for(const [q,p,mr,profit]of rows('s7.2')){assert.equal(p,12-q);assert.equal(mr,12-2*q);assert.equal(profit,p*q-q*q/2);}
  assert.deepEqual(rows('p7.8').at(-1).slice(2),[7,4]);
  assert.equal(new Set(rows('s8.2').at(-1)).size,3);
  for(const [,d,s,z]of rows('s10.3'))assert.ok(Math.abs(d-s-z)<1e-9);
  const ch14 = chapters.find(c=>c.number===14);
  assert.equal(ch14.problems.find(p=>p.id==='14.1').page,'211–212');
  for(const [w,b,where,profit] of rows('s14.1')){
   assert.equal(where,b>w?'去新店':'留原店');
   if(b>w)assert.equal(profit,8-b);
  }
  for(const key of expected)assert.ok(fs.existsSync(path.join(root,urlFor(key))),key);
  console.log(JSON.stringify({chapters:chapters.length,sections:90,problems:inventory.actualNumberedProblems,newUnits:Object.keys(content).length,frames,proofs,plots,networks}));
}
main().catch(err=>{console.error(err);process.exitCode=1;});
