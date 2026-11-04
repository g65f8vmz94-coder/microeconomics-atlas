import assert from 'node:assert/strict';
import {aggregationMethodsContent,aggregationMethodsKeys} from './src/aggregation-methods-content.mjs';
import {aggregationMethodsFrame,aggregationMethodsAllDomainCheck,aggregationMethodsFixtures} from './src/aggregation-methods-story.mjs';
import {aggregate,allProfiles,orders} from './src/final-topics.mjs';
import {p203Decision} from './src/aggregation-exercises.mjs';
let checks=0;const ok=(x,msg)=>{checks++;assert.ok(x,msg);};
ok(aggregationMethodsKeys.length===10,'ten source-bound stories');
for(const key of aggregationMethodsKeys){const c=aggregationMethodsContent[key];ok(c.scenes.length===6,key+' six scenes');ok(c.question.length>15&&c.conditions.length>20&&c.proof.length===3,key+' teaching and proof');for(let s=0;s<6;s++){const f=aggregationMethodsFrame(key,s);ok(f.identity===c.scenes[s][0]&&f.narration===c.scenes[s][1],key+' scene '+s);ok(f.mode&&f.label,key+' model '+s);}}
assert.deepEqual(aggregationMethodsFrame('favorites',5).scores,[1,2,0]);checks++;
assert.deepEqual(aggregationMethodsFrame('scoring',5).scores,[3,5,1]);checks++;
assert.deepEqual(aggregationMethodsFrame('pairwise',5).scores,[1,1,1]);checks++;
ok(aggregate(aggregationMethodsFixtures.cycle,'majority').transitive===false,'raw Condorcet cycle');
ok(aggregate(aggregationMethodsFixtures.cycle,'copeland').transitive===true,'Copeland scores form relation');
for(const p of allProfiles){const favorite=aggregate(p,'plurality'),special=aggregate(p,'borda',[1,0,0]);assert.deepEqual(favorite.R,special.R);checks++;const fixed=aggregate(p,'external'),ranks=aggregate(p,'dictator');assert.deepEqual(fixed.score,[2,1,0]);checks++;for(let a=0;a<3;a++)for(let b=0;b<3;b++){ok(ranks.R[a][b]===(p[0].indexOf(a)<=p[0].indexOf(b)),'fixed dictator full order');}}
const all=aggregationMethodsAllDomainCheck();ok(all.profiles===216&&all.rules.length===5&&all.checks===1080,'all PAF outputs complete/transitive');
const votes=Array.from({length:27},(_,v)=>[v%3,Math.floor(v/3)%3,Math.floor(v/9)]);
for(const x of votes){for(const d of [0,2])for(const pi of orders){const rename=x.map(k=>pi[k]);ok(p203Decision(rename,'projection',d)===pi[p203Decision(x,'projection',d)],'neutral projection '+d);}ok(p203Decision(x,'projection',1)===x[1],'dictatorial choice');}
ok(p203Decision([1,1,1],'constant')!==1,'constant violates unanimous choice b');
ok(aggregationMethodsFrame('p203a',4).otherResults.join()=== '1,0','name exchange follows both rules');
ok(aggregationMethodsFrame('p203b',5).choices.every(x=>x===1),'unanimous b evidence');
console.log({passed:true,checks,cases:aggregationMethodsKeys.length,frames:60,fullDomainPAF:all.checks});
