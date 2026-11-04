import assert from 'node:assert/strict';
import {socialFoundationsContent,socialFoundationsKeys} from './src/social-foundations-content.mjs';
import {socialFoundationsFrame} from './src/social-foundations-story.mjs';
import {sum,close,distribute} from './src/social-lab.mjs';

let checks=0;const eq=(a,b,msg)=>{checks++;assert.deepEqual(a,b,msg)},ok=(v,msg)=>{checks++;assert.ok(v,msg)};
eq(socialFoundationsKeys,['d191','d192','d193','e191','e192','e193','e194','e195','e196']);
for(const key of socialFoundationsKeys){const c=socialFoundationsContent[key];eq(c.scenes.length,6,key+' six scenes');ok(c.question&&c.conditions&&c.proof.length===3&&c.template&&c.source,key+' content');for(let step=0;step<6;step++){const f=socialFoundationsFrame(key,step),m=distribute(f.lambda,f.rule);eq(f.identity,c.scenes[step][0]);eq(f.narration,c.scenes[step][1]);eq(f.input,m.input);eq(f.output,m.output);eq(f.wealth,m.wealth);ok(close(sum(f.input),1),key+' input conserved');ok(close(sum(f.output),sum(f.wealth)),key+' wealth conserved');ok(f.output.every((q,i)=>close(q,f.input[i]*f.lambda[i])),key+' linear production');}}
eq(socialFoundationsFrame('d191',5).output,[1,2,3]);ok(!socialFoundationsFrame('d191',5).visibleWealth,'definition19.1 does not impose redistribution');
eq(socialFoundationsFrame('d192',4).wealth,[2,2,2]);eq(socialFoundationsFrame('d192',5).wealth,[3,3,3]);eq(socialFoundationsFrame('d192',5).output,[0,0,9]);
eq(socialFoundationsFrame('d193',2).wealth,[3,3,3]);eq(socialFoundationsFrame('d193',5).wealth,[4,4,4]);
eq(socialFoundationsFrame('e191',5).wealth,[1,2,3]);eq(socialFoundationsFrame('e192',4).wealth,[0,0,9]);eq(socialFoundationsFrame('e192',5).wealth,[0,4.5,4.5]);eq(socialFoundationsFrame('e192',5).input,[0,.5,.5]);
eq(socialFoundationsFrame('e193',5).output,[1,2,3]);eq(socialFoundationsFrame('e193',5).wealth,[2,2,2]);eq(socialFoundationsFrame('e194',5).wealth,[3,3,3]);eq(socialFoundationsFrame('e195',5).output,[3,0,0]);eq(socialFoundationsFrame('e195',5).wealth,[0,3,0]);eq(socialFoundationsFrame('e196',4).wealth,[1.5,3,4.5]);eq(socialFoundationsFrame('e196',5).wealth,[0,0,0]);ok(!!socialFoundationsFrame('e196',5).formulaOverride,'zero denominator explained');
console.log({passed:true,checks,cases:socialFoundationsKeys.length,frames:socialFoundationsKeys.length*6});
