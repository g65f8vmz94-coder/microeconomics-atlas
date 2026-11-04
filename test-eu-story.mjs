import fs from 'node:fs';
import assert from 'node:assert/strict';
import {lottery,mixture,support,expected,continuityWeight} from './src/uncertainty.mjs';
import {euStories,euFrame,euReadout,affineBernoulli,canonicalReduction} from './src/eu-story.mjs';

let checks=0;
function ok(value,message){checks++;assert.ok(value,message)}
function eq(actual,expectedValue,message){checks++;assert.deepEqual(actual,expectedValue,message)}
function close(a,b,message){checks++;assert.ok(Math.abs(a-b)<1e-10,`${message}: ${a} vs ${b}`)}

const counts={eu:6,euimplies:7,eurep:7,affine:6};
eq(Object.keys(euStories),Object.keys(counts),'four printed-section topics in 3.3');

for(const [mode,story] of Object.entries(euStories)){
 eq(story.frames.length,counts[mode],mode+' film length');
 ok(story.intro.length>25&&story.end.length>25,mode+' intro and conclusion');
 eq(story.labels.length,3,mode+' three prize labels');
 for(let i=0;i<story.frames.length;i++){
  const frame=euFrame(mode,i),r=euReadout(frame);
  ok(frame.source.includes('原书')||frame.source.includes('自主')||frame.source.includes('第1章'),mode+' frame '+i+' provenance');
  ok(frame.narration.length>25&&frame.formula.length>5,mode+' frame '+i+' explanation');
  lottery(frame.p);lottery(frame.q);checks+=2;
  close(r.left,expected(frame.p,frame.v),mode+' frame '+i+' left EU');
  close(r.right,expected(frame.q,frame.v),mode+' frame '+i+' right EU');
  ok(['≻','∼','≺'].includes(r.relation),mode+' frame '+i+' relation');
 }
}

// 1. Definition 3.5 checks
eq(euReadout(euFrame('eu',0)).left,10,'degenerate lottery [a] equals v(a)');
eq(euReadout(euFrame('eu',0)).right,6,'degenerate lottery [b] equals v(b)');
close(euReadout(euFrame('eu',1)).left,7.2,'weighted sum for p=(.5,.3,.2)');
close(euReadout(euFrame('eu',1)).right,6.0,'weighted sum for q=(.2,.6,.2)');
eq(euReadout(euFrame('eu',1)).relation,'≻','higher expected utility strictly preferred');
eq(euReadout(euFrame('eu',3)).relation,'∼','different distributions with equal EU tie');
eq(support(euFrame('eu',4).p),[0,1],'zero-probability prize excluded from support');

// 2. Proposition 3.1 checks: Continuity & Independence
close(euReadout(euFrame('euimplies',1)).alpha,.5,'alpha=.5 for v=(10,6,2)');
eq(euReadout(euFrame('euimplies',1)).relation,'∼','continuity mixture indifferent to [b]');
close(euReadout(euFrame('euimplies',2)).alpha,.75,'alpha=.75 for v=(10,8,2)');
eq(euReadout(euFrame('euimplies',2)).relation,'∼','shifted v(b)=8 indifferent at alpha=.75');
for(const va of [8,10,15,24])for(const vb of [3,5,7])for(const vc of [-2,0,1,2]){
 const alpha=continuityWeight(va,vb,vc);
 ok(alpha>0&&alpha<1,'interior continuity weight');
 close(expected([alpha,0,1-alpha],[va,vb,vc]),vb,'mixture EU matches v(b)');
}
// Independence common-branch cancellation and positive weight
const branchL=euFrame('euimplies',3),compoundL=euFrame('euimplies',4);
close(euReadout(compoundL).diff,compoundL.alphaK*euReadout(branchL).diff,'common branch cancels; diff scaled by alpha_k');
eq(euReadout(branchL).relation,euReadout(compoundL).relation,'positive alpha_k preserves strict order');
eq(euReadout(euFrame('euimplies',6)).relation,'∼','alpha_k=0 collapses both compound lotteries to common branch');

// 3. Proposition 3.2 checks: Constructive representation on finite Z
const vCanon=[1,.5,0];
eq(euReadout(euFrame('eurep',1)).relation,'∼','middle prize indifferent to canonical M/m lottery');
const p3=euFrame('eurep',2).p,q3=euFrame('eurep',2).q;
canonicalReduction(p3,vCanon).forEach((v,i)=>close(v,[.7,0,.3][i],'K-step independence reduction of p'));
canonicalReduction(q3,vCanon).forEach((v,i)=>close(v,[.5,0,.5][i],'K-step independence reduction of q'));
eq(euReadout(euFrame('eurep',5)).relation,'≻','Lemma 3.1 ranks reduced M/m lotteries by M probability');
eq(euReadout(euFrame('eurep',6)).relation,'∼','[M]~[m] boundary gives constant zero representation');
for(let i=0;i<=20;i++)for(let j=0;j<=20-i;j++){
 const p=[i/20,j/20,(20-i-j)/20],red=canonicalReduction(p,vCanon);
 lottery(red);checks++;
 close(red[0],expected(p,vCanon),'reduced M probability equals EU');
 close(expected(red,vCanon),expected(p,vCanon),'compound collapse preserves EU');
}

// 4. Positive affine transformations vs negative & nonlinear transformations
const baseP=euFrame('affine',0).p,baseQ=euFrame('affine',0).q;
eq(euReadout(euFrame('affine',0)).relation,'≺','baseline v=(1,.5,0) ranks p < q');
for(const alpha of [.1,.5,1,2,8,15])for(const beta of [-10,-1,0,2,25]){
 const w=affineBernoulli(vCanon,alpha,beta);
 const uP=expected(baseP,w),uQ=expected(baseQ,w);
 close(uP,alpha*expected(baseP,vCanon)+beta,'affine identity for p');
 close(uQ,alpha*expected(baseQ,vCanon)+beta,'affine identity for q');
 ok(uP<uQ,'positive affine transformation preserves p < q');
}
eq(euReadout(euFrame('affine',4)).relation,'≻','negative alpha reverses preference order');
eq(euReadout(euFrame('affine',5)).relation,'≻','strictly increasing nonlinear cube transformation reverses lottery ranking');

for(const bad of [['eu',6],['missing',0],['eurep',-1]])assert.throws(()=>euFrame(...bad));
checks+=3;

const report={
 passed:true,
 section:'3.3',
 frames:Object.fromEntries(Object.entries(euStories).map(([k,v])=>[k,v.frames.length])),
 totalFrames:Object.values(counts).reduce((a,b)=>a+b,0),
 checks,
 sourceExamples:'Definition 3.5, Proposition 3.1, Proposition 3.2, positive affine Comment; printed pp.35–38 (PDF pp.54–57)',
 simplexGridPoints:231,
 affineParameterPairs:30,
 positiveWeightAndFlatBoundariesExplained:true
};
fs.writeFileSync('qa/eu-story-models.json',JSON.stringify(report,null,2)+'\n');
console.log(report);
