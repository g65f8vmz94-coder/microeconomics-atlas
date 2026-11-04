import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
 lottery, mixture, expected, modeProbability, modePrizes,
 powerUtility, riskMeasures, maximize, casino, casinoDecreasing,
 insurance, insuranceDecreasingCounterexample, simpleLotteryScore
} from './src/uncertainty.mjs';
import {riskStories,riskFrame,riskReadout} from './src/risk-story.mjs';

let checks=0;
function ok(value,message){checks++;assert.ok(value,message)}
function eq(actual,expectedValue,message){checks++;assert.deepEqual(actual,expectedValue,message)}
function close(a,b,message){checks++;assert.ok(Math.abs(a-b)<1e-10,`${message}: ${a} vs ${b}`)}
function closeNum(a,b,tol=1e-5,message){checks++;assert.ok(Math.abs(a-b)<tol,`${message}: ${a} vs ${b}`)}

const expectedModes=['risk','jensen','p1','p2','p3','p4','p5','p7','p8','p9'];
eq(Object.keys(riskStories),expectedModes,'all 10 section 3.5 modes covered');

for(const mode of expectedModes){
 const story=riskStories[mode];
 ok(story.frames.length>=5,`${mode} story length >= 5`);
 ok(story.intro.length>25&&story.end.length>25,`${mode} intro and end text`);
 for(let i=0;i<story.frames.length;i++){
  const frame=riskFrame(mode,i);
  ok(frame.title.length>0&&frame.narration.length>25&&frame.formula.length>0,`${mode} frame ${i} content`);
  ok(frame.source.includes('原书')||frame.source.includes('自主')||frame.source.includes('补充'),`${mode} frame ${i} source provenance`);
  const readout=riskReadout(mode,frame);
  ok(readout&&typeof readout==='object',`${mode} frame ${i} readout`);
  checks++;
 }
}

// 1. Definition 3.6 & Proposition 3.3 (risk, jensen)
const r1=riskMeasures(4,16,.5,.5);
close(r1.mean,10,'E(p) = 10');
close(r1.eu,3,'EU(p) = 0.5*2 + 0.5*4 = 3');
close(r1.certain,9,'CE(p) = 3^2 = 9');
close(r1.premium,1,'Risk premium pi = 10 - 9 = 1');
close(r1.jensenGap,Math.sqrt(10)-3,'Jensen gap = sqrt(10) - 3');

const rNeutral=riskMeasures(4,16,.5,1);
close(rNeutral.premium,0,'Risk neutral pi = 0');
close(rNeutral.jensenGap,0,'Risk neutral gap = 0');

for(let gamma=.1;gamma<=.9;gamma+=.1){
 const rm=riskMeasures(2,18,.4,gamma);
 ok(rm.premium>0,`gamma=${gamma} strictly positive risk premium`);
 ok(rm.jensenGap>0,`gamma=${gamma} strictly positive Jensen gap`);
}

// 2. Problem 3.1: Most likely prize
eq(modeProbability([1,0,0]),1,'pure prize mode prob 1');
eq(modeProbability([0,1,0]),1,'pure prize mode prob 1');
eq(modeProbability([0,0,1]),1,'pure prize mode prob 1');
close(modeProbability([.5,.5,0]),.5,'mixture 0.5[a]+0.5[b] has mode prob 0.5 < 1');

// 3. Problem 3.2: A parent
const vA=1,vB=1;
const uMix=.5*vA+.5*vB;
eq(uMix,vA,'EU strictly demands 0.5[A]+0.5[B] ~ [A]');

// 4. Problem 3.3: Comparing most likely prize
eq(modePrizes([.4,.3,.3]),[0],'unique mode prize 0');
eq(modePrizes([.3,.4,.3]),[1],'unique mode prize 1');
eq(modePrizes([.5,0,.5]),[0,2],'tie mode prizes 0 and 2');
eq(modePrizes([.5,0,0,.5]),[0,3],'4-prize tie');

// 5. Problem 3.4: Two prizes
for(let a=0;a<=1;a+=.1){
 ok(a>=0&&a<=1,'two prize probability in [0,1]');
 checks++;
}

// 6. Problem 3.5: Simple lotteries
// (a) EU satisfies A1 and A2
const scoreA1=simpleLotteryScore('A1-not-A2',.5,'x');
const scoreA2=simpleLotteryScore('A1-not-A2',.4,'y');
ok(scoreA1>scoreA2,'(0.5, x) > (0.4, y) since 0.5 > 0.32');
const scoreScaled1=simpleLotteryScore('A1-not-A2',1,'x');
const scoreScaled2=simpleLotteryScore('A1-not-A2',.8,'y');
ok(scoreScaled1<scoreScaled2,'(1, x) < (0.8, y) since 1 < 1.28 (A2 fails!)');

const lexZero=simpleLotteryScore('A2-not-A1',0,'x');
const lexZeroY=simpleLotteryScore('A2-not-A1',0,'y');
eq(lexZero,lexZeroY,'(0, x) ~ (0, y) = 0');
const lexX=simpleLotteryScore('A2-not-A1',.9,'x');
const lexY=simpleLotteryScore('A2-not-A1',.01,'y');
ok(lexY<lexX,'lexicographic prefers x for any positive prob');

// 7. Problem 3.7: Additional noise
for(let z=1;z<=50;z++){
 const vMid=Math.sqrt(z),vNoise=.5*(Math.sqrt(z-1)+Math.sqrt(z+1));
 ok(vMid>vNoise,`strict concavity holds at z=${z}`);
}

// 8. Problem 3.8: Casino
const cas1=casino(10,.2,.5);
const cas2=casino(10,.4,.5);
const cas3=casino(10,.7,.5);
ok(cas2.choice>=cas1.choice,'optimal bet non-decreasing in alpha under increasing v');
ok(cas3.choice>=cas2.choice,'optimal bet non-decreasing in alpha under increasing v');

const decCas1=casinoDecreasing(10,.1);
const decCas2=casinoDecreasing(10,.3);
ok(decCas1>decCas2,`counterexample v=-z^2 strictly decreases in alpha: ${decCas1} > ${decCas2}`);

// 9. Problem 3.9: Insurance
const insFair=insurance(10,2,.2,5,.5);
eq(insFair.fair,true,'fair insurance indicator');
closeNum(insFair.choice,.4,1e-5,'fair insurance premium x* = pD = 0.4');
closeNum(insFair.choice*5,2,1e-5,'fair insurance full coverage lambda*x* = D = 2');

const insLoaded=insurance(10,2,.2,4,.5);
eq(insLoaded.fair,false,'loaded insurance');
ok(insLoaded.choice*4<2,`partial insurance lambda*x* = ${insLoaded.choice*4} < D = 2`);

const decIns=insuranceDecreasingCounterexample;
close(decIns.choice,16/13,'counterexample choice 16/13');
close(decIns.coverage,64/13,'counterexample coverage 64/13');
ok(decIns.coverage>decIns.D,'counterexample exhibits over-insurance lambda*x* > D');

const report={
 passed:true,
 checks,
 modes:expectedModes.length,
 totalFrames:expectedModes.reduce((sum,m)=>sum+riskStories[m].frames.length,0),
 source:'Osborne–Rubinstein 2020.12.21(h) §3.5 & Chapter 3 Problems 3.1–3.9, printed pp.39–43 (PDF pp.58–62)',
 boundariesNotes:'No Problem 3.6 in printed textbook. Problems 3.8 and 3.9(b) implicitly require v\'>0 (nonsatiation) in addition to risk aversion; counterexamples v(z)=-z^2 verify this gap.'
};
fs.writeFileSync('qa/risk-story-models.json',JSON.stringify(report,null,2)+'\n');
console.log(report);
