import assert from 'node:assert/strict';
import {matchingFoundationsKeys,matchingFoundationsContent} from './src/matching-foundations-content.mjs';
import {matchingFoundationsFrame,matchingFoundationsAnalysis,matchingFoundationsPairScore} from './src/matching-foundations-story.mjs';

let checks=0;const ok=(value,message)=>{checks++;assert.ok(value,message);};
const equal=(a,b,message)=>{checks++;assert.deepEqual(a,b,message);};
equal(matchingFoundationsKeys,['d181','d182','d183','e181','e182','e183']);
equal(matchingFoundationsAnalysis.serial,[1,0,2]);equal(matchingFoundationsAnalysis.rankMinimum,[2,0,1]);equal(matchingFoundationsAnalysis.greedy,[0,2,1]);
equal(matchingFoundationsAnalysis.score(matchingFoundationsAnalysis.serial),12);
equal(matchingFoundationsAnalysis.score(matchingFoundationsAnalysis.rankMinimum),10);
equal(matchingFoundationsAnalysis.score(matchingFoundationsAnalysis.greedy),11);
for(const key of matchingFoundationsKeys){const content=matchingFoundationsContent[key];equal(content.steps.length,6,key+' has six scenes');for(let step=0;step<6;step++){const f=matchingFoundationsFrame(key,step);ok(f.identity===content.steps[step][0],key+' scene title');ok(f.narration===content.steps[step][1],key+' scene caption');ok(f.matching.length===3,key+' three X');ok(new Set(f.pairs.map(p=>p.y)).size===f.pairs.length,key+' no reused Y');ok(f.pairs.every(p=>p.score===matchingFoundationsPairScore(p.x,p.y)),key+' model score');ok(f.score===f.pairs.reduce((n,p)=>n+p.score,0),key+' score total');ok(f.minimum===10,key+' global min');ok(f.all.length===6,key+' exhaustive matching list');ok(f.complete===(f.pairs.length===3),key+' completeness');}}
for(const key of ['e181','e183']){const count=Array.from({length:6},(_,s)=>matchingFoundationsFrame(key,s).pairs.length);ok(count.every((n,i)=>i===0||n>=count[i-1]),key+' causal pair growth');equal(count.at(-1),3);}
for(const key of ['d182','d183','e181','e182','e183'])ok(matchingFoundationsFrame(key,5).complete,key+' ends with complete matching');
const finalGreedy=matchingFoundationsFrame('e183',5),finalGlobal=matchingFoundationsFrame('e182',5);ok(finalGreedy.score>finalGlobal.score,'local greedy worse on site profile');
console.log({passed:true,checks,cases:matchingFoundationsKeys.length,frames:matchingFoundationsKeys.length*6});
