import assert from 'node:assert/strict';
import {aggregationPropertiesContent,aggregationPropertiesKeys} from './src/aggregation-properties-content.mjs';
import {aggregationPropertiesFrame,aggregationPropertiesCheck} from './src/aggregation-properties-story.mjs';
import {aggregate,allProfiles,orders} from './src/final-topics.mjs';
import {p201Audit,p203Audit,p205Audit,p205Tournament} from './src/aggregation-exercises.mjs';
let checks=0;const ok=(x,msg)=>{checks++;assert.ok(x,msg);};
ok(aggregationPropertiesKeys.length===16,'sixteen source-bound stories');
for(const key of aggregationPropertiesKeys){const c=aggregationPropertiesContent[key];ok(c.scenes.length===6,key+' six scenes');ok(c.question.length>15&&c.conditions.length>20&&c.proof.length===3,key+' teaching and proof');for(let s=0;s<6;s++){const f=aggregationPropertiesFrame(key,s);ok(f.identity===c.scenes[s][0]&&f.narration===c.scenes[s][1],key+' scene '+s);ok(f.mode&&f.label,key+' model '+s);}}
const full=aggregationPropertiesCheck();checks+=full.neutral+full.anonymous+full.responsiveCounterexample;
assert.deepEqual(aggregationPropertiesFrame('d205',0).scores,[4,4,1]);checks++;
assert.deepEqual(aggregationPropertiesFrame('d205',5).scores,[5,4,0]);checks++;
assert.deepEqual(aggregationPropertiesFrame('caveat',0).scores,[3,0,0]);checks++;
assert.deepEqual(aggregationPropertiesFrame('caveat',5).scores,[3,0,0]);checks++;
assert.deepEqual(aggregationPropertiesFrame('d206',0).scores,[6,3,0]);checks++;
assert.deepEqual(aggregationPropertiesFrame('d206',5).scores,[3,3,0]);checks++;
assert.deepEqual(aggregationPropertiesFrame('d207',0).scores.slice(0,2),[2,1]);checks++;
assert.deepEqual(aggregationPropertiesFrame('d207',5).scores.slice(0,2),[2,4]);checks++;
for(const key of ['p201a','p201b','p201c']){const f=aggregationPropertiesFrame(key,5),audit=p201Audit(3,f.rule);ok(Object.values(audit.witnesses).filter(Boolean).length===1,key+' only one property fails');}
const i=p203Audit(3,3,'first-different');ok(!!i.witnesses.I&&!i.witnesses.neutrality&&!i.witnesses.pareto,'I witness keeps neutrality and unanimity');const e0=aggregationPropertiesFrame('p203e',0),e1=aggregationPropertiesFrame('p203e',5);assert.equal(e0.beforeChoices.map((x,j)=>x===0?j:-1).filter(x=>x>=0).join(),e1.afterChoices.map((x,j)=>x===0?j:-1).filter(x=>x>=0).join());checks++;ok(e0.beforeSelected!==e1.afterSelected,'same a supporters change outcome');
for(const [key,rule,failed] of [['p205a','wins',null],['p205b','label-bias','anonymity'],['p205c','all-tied','monotonicity'],['p205d','quality','independence']]){const a=p205Audit(4,rule),bad=Object.entries(a.witnesses).filter(([,v])=>!!v).map(([k])=>k);assert.deepEqual(bad,failed?[failed]:[]);checks++;const f=aggregationPropertiesFrame(key,5);ok(f.score.length===4&&f.scale>=Math.max(...f.score),key+' same fixed scale');}
const q0=aggregationPropertiesFrame('p205d',0),q1=aggregationPropertiesFrame('p205d',5);ok(q0.score[0]===q0.score[1]&&q1.score[1]>q1.score[0],'irrelevant match flips comparison of players 1 and 2');
for(const p of allProfiles){const before=aggregate(p,'borda'),renamed=p.map(r=>r.map(v=>v===0?1:v===1?0:v)),after=aggregate(renamed,'borda');for(const [a,b] of [[0,1],[1,2],[0,2]]){const ra=a===0?1:a===1?0:a,rb=b===0?1:b===1?0:b;ok(before.R[a][b]===after.R[ra][rb],'neutral all profiles');}}
console.log({passed:true,checks,cases:16,frames:96,fullDomainProperties:full});
