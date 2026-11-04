import assert from 'node:assert/strict';
import {socialPreferencesContent,socialPreferencesKeys} from './src/social-preferences-content.mjs';
import {socialPreferencesFrame} from './src/social-preferences-story.mjs';
import {aggregate} from './src/final-topics.mjs';
import {p201Vote,p202Single,p204Classify} from './src/aggregation-exercises.mjs';

let checks=0;const yes=(v,msg)=>{checks++;assert.ok(v,msg)};
const keys=['ordinal','eurovision','condorcet','p201d','p202','p204a','p204b'];assert.deepEqual(socialPreferencesKeys,keys);
for(const key of keys){const c=socialPreferencesContent[key];yes(c.scenes.length===6,key+' six scenes');yes(c.question&&c.conditions&&c.formula&&c.proof.length===3&&c.template&&c.trap&&c.source,key+' teaching layers');for(let step=0;step<6;step++){const f=socialPreferencesFrame(key,step);yes(f.key===key&&f.step===step,key+' stage');yes(f.identity===c.scenes[step][0]&&f.narration===c.scenes[step][1],key+' prose');yes(f.mode&&f.label,key+' model labels');if(f.relation)yes(f.relation.every(row=>row.length===3),key+' relation size');}}
const f=(k,i=5)=>socialPreferencesFrame(k,i);
yes(f('ordinal').profile.map(r=>r.join('')).join('|')==='012|120|201','three authored ranks');
yes(f('eurovision').scores.join(',')==='4,3,2','scoring totals');
yes(f('condorcet').transitive===false&&f('condorcet').support[0][1]===2&&f('condorcet').support[1][2]===2&&f('condorcet').support[2][0]===2,'original Condorcet cycle');
yes(aggregate(f('condorcet').profile,'majority').transitive===false,'majority model');
yes(f('p201d',0).k===2&&f('p201d',3).k===3&&p201Vote(f('p201d',3).votes)===1,'majority threshold');
for(const n of [1,3,5,7,9])for(let a=0;a<=n;a++)for(let b=0;b<=n-a;b++)for(let c=0;c<=n-a-b;c++)yes(p202Single([a,b,c,n-a-b-c]).transitive,'all illustrated odd single-peaked profiles');
yes(f('p202',4).sourceDomain&&f('p202',4).transitive&&!f('p202').sourceDomain&&!f('p202').transitive,'restricted vs unrestricted domain');
yes(!f('p204a').transitive&&f('p204a').counts[0][1]===2&&f('p204a').counts[1][2]===2&&f('p204a').counts[0][2]===1,'partition majority witness');
for(let group=0;group<8;group++)yes(p204Classify([2,1,4],true,group).transitive,'partition intersection group '+group);
yes(f('p204b').group===0&&f('p204b').relation.flat().every(Boolean),'empty group universal relation');
console.log({passed:true,checks,cases:keys.length,frames:keys.length*6});
