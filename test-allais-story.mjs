import fs from 'node:fs';
import assert from 'node:assert/strict';
import {lottery,mixture,expected,allais} from './src/uncertainty.mjs';
import {allaisStories,allaisFrame,allaisReadout,allaisDecompose,allaisEuComparison} from './src/allais-story.mjs';

let checks=0;
function ok(value,message){checks++;assert.ok(value,message)}
function eq(actual,expectedValue,message){checks++;assert.deepEqual(actual,expectedValue,message)}
function close(a,b,message){checks++;assert.ok(Math.abs(a-b)<1e-10,`${message}: ${a} vs ${b}`)}

eq(Object.keys(allaisStories),['allais'],'single printed topic in 3.4');
const story=allaisStories.allais;
eq(story.frames.length,8,'eight continuous frames');
eq(story.labels,['$0','$3,000','$4,000'],'prize labels follow printed amounts');
ok(story.intro.length>25&&story.end.length>25,'intro and conclusion');

// Printed lotteries, PDF57-58 / printed 38-39. Prize order: $0, $3000, $4000.
eq(allais.prizes,[0,3000,4000],'prize order');
eq(allais.L1,[.8,0,.2],'L1 = 0.2[$4000] + 0.8[$0]');
eq(allais.R1,[.75,.25,0],'R1 = 0.25[$3000] + 0.75[$0]');
eq(allais.L2,[.2,0,.8],'L2 = 0.8[$4000] + 0.2[$0]');
eq(allais.R2,[0,1,0],'R2 = [$3000]');
for(const k of ['L1','R1','L2','R2']){lottery(allais[k]);checks++}

// Printed table and percentages.
eq(allais.responses,{L1L2:20,L1R2:44,R1L2:5,R1R2:31},'printed joint response table');
eq(Object.values(allais.responses).reduce((a,b)=>a+b,0),100,'table sums to 100%');
const r0=allaisReadout(allaisFrame('allais',0));
eq(r0.consistent,51,'about 51% consistent with expected utility');
eq(r0.paradox,49,'crossing pairs 44% + 5%');

// Compound decomposition L1 = .25 L2 + .75[0], R1 = .25 R2 + .75[0].
const {l1FromL2,r1FromR2}=allaisDecompose();
l1FromL2.forEach((v,i)=>close(v,allais.L1[i],'L1 decomposition '+i));
r1FromR2.forEach((v,i)=>close(v,allais.R1[i],'R1 decomposition '+i));

// Expected utility: for every admissible Bernoulli function the two differences have the same sign.
let grid=0;
for(let v0=-2;v0<=2;v0+=.5)for(let v4=v0+.25;v4<=v0+6;v4+=.75)for(let t=-.5;t<=1.5;t+=.05){
 const v3=v0+t*(v4-v0),c=allaisEuComparison(v3,v0,v4);grid++;
 close(c.diff1,.25*c.diff2,'U(L1)-U(R1)=0.25[U(L2)-U(R2)]');
 eq(c.rel1,c.rel2,'same ranking direction in both problems');
 close(c.uL1,expected(allais.L1,[v0,v3,v4]),'U(L1)');
 close(c.uR2,v3,'U(R2)=v($3000)');
 ok(!(c.rel1==='≻'&&c.rel2==='≺'),'(L1,R2) never strict EU pattern');
}
// Threshold under normalization v($0)=0, v($4000)=1.
eq(allaisEuComparison(.8).rel1,'∼','indifferent at threshold 0.8 in problem 1');
eq(allaisEuComparison(.8).rel2,'∼','indifferent at threshold 0.8 in problem 2');
eq(allaisEuComparison(.75).rel1,'≻','v=.75: L1 preferred');
eq(allaisEuComparison(.75).rel2,'≻','v=.75: L2 preferred');
eq(allaisEuComparison(.85).rel1,'≺','v=.85: R1 preferred');
eq(allaisEuComparison(.85).rel2,'≺','v=.85: R2 preferred');
assert.throws(()=>allaisEuComparison(.5,1,1));checks++;

for(let i=0;i<story.frames.length;i++){
 const f=allaisFrame('allais',i),r=allaisReadout(f);
 ok(f.source.includes('原书'),'frame '+i+' cites the textbook');
 ok(f.narration.length>40&&f.formula.length>10,'frame '+i+' explanation');
 eq(r.rel1,r.rel2,'frame '+i+' displayed EU rankings move together');
 ok(['pair1','pair2','both'].includes(f.pair),'frame '+i+' pair key');
}
assert.throws(()=>allaisFrame('allais',8));checks++;
assert.throws(()=>allaisFrame('allais',-1));checks++;
assert.throws(()=>allaisFrame('allais',1.5));checks++;

const report={
 passed:true,checks,stories:1,frames:story.frames.length,euGridComparisons:grid,
 source:'Osborne–Rubinstein 2020.12.21(h) §3.4, printed pp.38–39 (PDF57–58)',
 printedLotteries:{L1:allais.L1,R1:allais.R1,L2:allais.L2,R2:allais.R2,prizeOrder:allais.prizes},
 printedResponses:allais.responses,
 boundary:'Response shares are the textbook-reported 7,932-student online experiment, not data collected by this site. Finite grids verify the scene algebra; the general proof is the common-branch cancellation shown symbolically.'
};
fs.writeFileSync('qa/allais-story-models.json',JSON.stringify(report,null,2)+'\n');
console.log(report);
