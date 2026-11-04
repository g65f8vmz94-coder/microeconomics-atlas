import assert from 'node:assert/strict';
import katex from './src/vendor/katex/katex.min.js';
import {workerChoice} from './src/signaling-lab.mjs';
import {educationMarketContent,educationMarketKeys} from './src/education-market-content.mjs';
import {educationMarketStory,evaluateEducationOffers} from './src/education-market-story.mjs';

let checks=0;
assert.equal(educationMarketKeys.length,19);
const exerciseKeys=new Set(['p1','p2empty','p2single','p2pair']);
for(const key of educationMarketKeys){const c=educationMarketContent[key];assert.equal(c.steps.length,6,key);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.trap&&c.source,key);assert.ok(c.source.includes(exerciseKeys.has(key)?'章末习题':'§14.2'),`source label: ${key}`);katex.renderToString(c.formula,{throwOnError:true,strict:'ignore'});checks+=4;for(let step=0;step<6;step++){const f=educationMarketStory(key,step);assert.equal(f.identity,c.steps[step][0]);assert.equal(f.narration,c.steps[step][1]);assert.equal(f.view,c.view);if(f.view==='signal'&&f.entry){const entrants=f.after.details.filter(x=>x.id===f.entry.id);assert.equal(entrants.length,1);assert.ok(Number.isFinite(entrants[0].profit));}checks++;}}
const fig=educationMarketStory('fig141',4);assert.equal(workerChoice(fig.contracts,3).id,'a');assert.equal(workerChoice(fig.contracts,1).id,'b');assert.equal(workerChoice([fig.entry],3).id,'φ');assert.equal(workerChoice([fig.entry],1).id,'φ');checks+=4;
const pool=educationMarketStory('pool',3);assert.deepEqual(pool.after.details.at(-1).attendees,['H']);assert.ok(pool.after.details.at(-1).profit>0);checks+=2;
const baseline=educationMarketStory('baseline142',5);assert.equal(baseline.current.details[0].profit,0);assert.deepEqual(baseline.after.details.at(-1).attendees,['H']);assert.ok(baseline.after.details.at(-1).profit>0);checks+=3;
const rules=educationMarketStory('d144',3);assert.deepEqual(rules.after.details.at(-1).attendees,['H']);assert.ok(rules.after.details.at(-1).profit>0);checks+=2;
const onlyH=educationMarketStory('d143',2);assert.deepEqual(onlyH.current.details.find(x=>x.id==='H').attendees,['H']);assert.equal(onlyH.current.details.find(x=>x.id==='H').profit,1);checks+=2;
const unemployed=educationMarketStory('proof1',2);assert.deepEqual(unemployed.after.details.at(-1).attendees,['L','H']);assert.ok(unemployed.after.details.at(-1).profit>0);checks+=2;
assert.equal(educationMarketStory('proof3',1).current.details.find(x=>x.id==='L').profit,-1);assert.equal(educationMarketStory('proof3',2).current.details.find(x=>x.id==='H').profit,-1);checks+=2;
for(const [key,steps,who] of [['proof4',[1,4],['L']],['proof5',[2,4],['H']]])for(const step of steps){const e=educationMarketStory(key,step).after.details.at(-1);assert.deepEqual(e.attendees,who);assert.ok(e.profit>0);checks+=2;}
assert.equal(educationMarketStory('threshold',0).model.equilibrium,true);assert.equal(educationMarketStory('threshold',3).model.equilibrium,false);assert.deepEqual(educationMarketStory('threshold',3).after.details.at(-1).attendees,['L','H']);assert.ok(educationMarketStory('threshold',3).after.details.at(-1).profit>0);assert.equal(educationMarketStory('threshold',4).model.equilibrium,true);checks+=5;
assert.equal(educationMarketStory('boundaryShare',0).current.choice.L.id,'absent');assert.equal(educationMarketStory('boundaryShare',2).after.details.at(-1).attendees.length,0);assert.ok(educationMarketStory('boundaryShare',4).after.details.at(-1).profit<0);checks+=3;
for(const [step,H,L,profit] of [[0,'-','-',0],[2,'+','-',.5],[3,'+','+',0],[4,'+','-',5],[5,'+','-',0]]){const f=educationMarketStory('p1',step);assert.equal(f.model.choiceH,H);assert.equal(f.model.choiceL,L);assert.equal(step===4?f.model.profitMinus:f.model.profitPlus,profit);checks+=3;}
for(const step of [1,3]){const f=educationMarketStory('p2empty',step);assert.equal(f.after.choice1,'新校');assert.equal(f.after.choice2,'新校');checks+=2;}
const singleNo=educationMarketStory('p2single',2),singleYes=educationMarketStory('p2single',4);assert.equal(singleNo.after.choice2,'A');assert.equal(singleYes.after.choice1,'A');assert.equal(singleYes.after.choice2,'新校');checks+=3;
const pairA=educationMarketStory('p2pair',2),pairB=educationMarketStory('p2pair',4),pairFinal=educationMarketStory('p2pair',5);assert.equal(pairA.after.choice1,'新校');assert.equal(pairA.after.choice2,'B');assert.equal(pairB.after.choice1,'A');assert.equal(pairB.after.choice2,'新校');assert.equal(pairFinal.model.equilibrium,true);checks+=5;
assert.throws(()=>evaluateEducationOffers([{id:'x',t:-1,w:2}]));checks++;
console.log({passed:true,cases:19,frames:114,checks});
