import assert from 'node:assert/strict';
import {socialCharacterizationContent,socialCharacterizationKeys} from './src/social-characterization-content.mjs';
import {socialCharacterizationFrame} from './src/social-characterization-story.mjs';
import {sum,close,distribute,arrivals} from './src/social-lab.mjs';

let checks=0;const yes=(v,msg)=>{checks++;assert.ok(v,msg)};
const keys=['p191','p192','q191a','q191b','q191c','q192a','q192b','q193a','q193b','q193c','q193d'];
assert.deepEqual(socialCharacterizationKeys,keys);
for(const key of keys){const c=socialCharacterizationContent[key];yes(c.scenes.length===6,key+' scenes');yes(c.question&&c.conditions&&c.formula&&c.proof.length===3&&c.template&&c.trap&&c.source,key+' teaching layers');for(let i=0;i<6;i++){const f=socialCharacterizationFrame(key,i);yes(f.key===key&&f.step===i,key+' stage');yes(f.lambda.length===f.wealth.length,key+' identities');yes(f.lambda.every(Number.isFinite)&&f.wealth.every(Number.isFinite),key+' finite');yes(close(sum(f.wealth),f.total),key+' wealth accounting');yes(f.complete?close(f.total,distribute(f.lambda,f.rule).total):f.total<=f.max,key+' model boundary');}}
const f=(k,i=5)=>socialCharacterizationFrame(k,i);
yes(f('p191').wealth.every(x=>x===3),'socialist reference 9/3');
yes(f('p192',0).total===2&&f('p192',0).max===6,'efficiency witness');
yes(f('p192',3).wealth[0]===0&&f('p192',2).wealth[0]===6,'own monotonicity witness');
yes(f('p192',5).wealth[0]===0&&f('p192',4).wealth[0]===3,'others monotonicity witness');
yes(f('q191b',1).lambda.join(',')==='2,4'&&f('q191b',1).wealth.join(',')==='2,1','relative counterexample');
yes(f('q191b',2).wealth[0]===2,'own weak monotonicity');
yes(f('q192a',1).wealth[0]===2&&f('q192a',3).wealth[0]===5,'strong own increase');
yes(close(f('q192b',1).wealth[1],1.8)&&close(f('q192b',3).wealth[1],2.5),'alternative strong own');
yes(close(f('q193a').wealth[0],1/2)&&close(f('q193a').wealth[1],5/2),'Shapley two persons');
for(const [i,v] of [1/4,11/12,29/12,77/12].entries())yes(close(f('q193b').wealth[i],v)&&close(f('q193c').wealth[i],v),'Shapley four persons '+i);
yes(f('q193c',4).arrivalContribution.join(',')==='1,0,5,4','original single order');
yes(arrivals([1,3,6,10]).orders.length===24,'all arrival orders');
yes(close(f('q193d',4).wealth[1],9/4)&&close(f('q193d',3).wealth[1]+f('q193d',5).wealth[1],7/3),'marginal counterexample');
console.log({passed:true,checks,cases:keys.length,frames:keys.length*6});
