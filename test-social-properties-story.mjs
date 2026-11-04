import assert from 'node:assert/strict';
import {socialPropertiesContent,socialPropertiesKeys} from './src/social-properties-content.mjs';
import {socialPropertiesFrame} from './src/social-properties-story.mjs';
import {sum,close} from './src/social-lab.mjs';

let checks=0;const yes=(v,msg)=>{checks++;assert.ok(v,msg)};
assert.deepEqual(socialPropertiesKeys,['d194','d195','d196','d197','x197','d198','d199']);
for(const key of socialPropertiesKeys){
 const c=socialPropertiesContent[key];yes(c.scenes.length===6,key+' six authored scenes');yes(c.question&&c.conditions&&c.formula&&c.proof.length===3&&c.template&&c.trap&&c.source,key+' teaching layers');
 for(let step=0;step<6;step++){
  const f=socialPropertiesFrame(key,step);yes(f.key===key&&f.step===step,key+' stage');yes(f.left.feasible&&f.right.feasible,key+' feasible');yes(close(sum(f.left.input),1)&&close(sum(f.right.input),1),key+' inputs');yes(close(sum(f.left.wealth),f.left.total)&&close(sum(f.right.wealth),f.right.total),key+' wealth conservation');yes(f.oldToNew.length===f.left.lambda.length&&new Set(f.oldToNew).size===f.oldToNew.length,key+' identity map');yes(f.showLeftWealth===(step>=1)&&f.showRightProfile===(step>=3)&&f.showRightWealth===(step>=4),key+' reveal');
 }
}
const f=k=>socialPropertiesFrame(k,5);
yes(close(f('d194').left.total,11/3)&&close(f('d194').right.total,6)&&f('d194').right.efficient,'efficiency 11/3 to 6');
yes(close(f('d195').left.wealth[0],f('d195').left.wealth[1])&&close(f('d195').right.wealth[0],0)&&close(f('d195').right.wealth[1],4),'symmetry counterexample');
yes(f('d196').left.wealth[2]>f('d196').left.wealth[1]&&f('d196').right.lambda[2]>f('d196').right.lambda[1]&&f('d196').right.wealth[2]<f('d196').right.wealth[1],'relative monotonicity witness');
yes(f('d197').left.lambda.join(',')==='7,3,13'&&f('d197').right.lambda.join(',')==='3,13,7','textbook permutation profiles');
for(let i=0;i<3;i++)yes(close(f('d197').left.wealth[i],f('d197').right.wealth[f('d197').oldToNew[i]]),'anonymous person '+i);
yes(socialPropertiesFrame('x197',0).left.wealth.join(',')==='2,2'&&f('x197').left.wealth.join(',')==='3,0'&&f('x197').right.wealth.join(',')==='3,0'&&f('x197').right.wealth[f('x197').oldToNew[0]]===0,'book symmetry without anonymity');
yes(f('d198').left.lambda.join(',')==='2,3'&&f('d198').right.lambda.join(',')==='5,3'&&f('d198').left.wealth[0]===2&&f('d198').right.wealth[0]===0,'book own monotonicity counterexample');
yes(f('d199').left.lambda.join(',')==='3,2'&&f('d199').right.lambda.join(',')==='3,4'&&f('d199').left.wealth[0]===3&&f('d199').right.wealth[0]===0,'book others monotonicity counterexample');
for(const [key,value] of [['d194',6],['d195',8],['d196',7],['d197',13],['x197',3],['d198',5],['d199',4]])yes(close(f(key).right.max,value),key+' maximum');
console.log({passed:true,checks,cases:socialPropertiesKeys.length,frames:socialPropertiesKeys.length*6});
