import assert from 'node:assert/strict';
import {socialChoiceContent,socialChoiceKeys} from './src/social-choice-content.mjs';
import {socialChoiceFrame,socialChoiceAudit} from './src/social-choice-story.mjs';
import {allProfiles,socialWinner,manipulationAudit} from './src/final-topics.mjs';
import {p203Audit,p206Median} from './src/aggregation-exercises.mjs';
let checked=0;const ok=(x,m)=>{assert.ok(x,m);checked++};
ok(socialChoiceKeys.length===6,'six cases');
for(const k of socialChoiceKeys){const c=socialChoiceContent[k];ok(c.scenes.length===6&&c.proof.length>=3,'six explanatory stages and reusable proof '+k);for(let s=0;s<6;s++){const f=socialChoiceFrame(k,s);ok(f.key===k&&f.step===s,'frame identity '+k+s);ok(!!f.scene[0]&&!!f.scene[1],'scene text '+k+s);if(['choice','proof','manipulation'].includes(f.mode))ok(f.profile.length===3&&f.profile.every(r=>new Set(r).size===3),'strict rankings '+k+s);}}
const a=socialChoiceAudit();ok(a.pluralityManipulation&&!!a.pluralityWitness,'actual plurality manipulation');ok(!a.dictatorManipulation&&!a.dictatorUnanimityCounterexample,'dictatorship rule properties');ok(a.binary.profiles===8&&Object.values(a.binary.witnesses).every(x=>x===null)&&a.binary.dictators.length===0,'three-person majority properties');
const d=socialChoiceFrame('d210',0),lie=socialChoiceFrame('d210',4);ok(d.outcome===0&&lie.outcome===1&&lie.trueBetter,'honest a vs lie b under actual preference');ok(d.profile[0][0]===2&&lie.profile[0][0]===1,'only player1 report changes');ok(JSON.stringify(d.profile.slice(1))===JSON.stringify(lie.profile.slice(1)),'others fixed');
ok(socialChoiceFrame('d208',0).outcome===1,'fixed person2 selects b');
ok(socialChoiceFrame('d209',0).outcome===0&&socialChoiceFrame('d209',4).outcome===1,'unanimous vs fixed-b contrast');
for(const p of allProfiles){const fixed2=p[1][0];for(let j=0;j<3;j++)for(const r of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]){const q=p.map(x=>[...x]);q[j]=r;const result=q[1][0];ok(j===1?p[1].indexOf(fixed2)<=p[1].indexOf(result):result===fixed2,'fixed2 strategy-proof');}if(p.every(r=>r[0]===p[0][0]))ok(fixed2===p[0][0],'fixed2 unanimous');}
for(const n of [3,5]){const b=p203Audit(n,2,'majority');ok(!Object.values(b.witnesses).some(Boolean)&&b.dictators.length===0,'odd majority n='+n);}
for(const others of [[.1,.3,.6,.9],[0,0,1,1],[.2,.4,.4,.7]])for(let z=0;z<=1.0001;z+=.05)for(let r=0;r<=1.0001;r+=.05){const m=p206Median(others,Math.min(1,z),Math.min(1,r),1,3);ok(m.gain<=1e-9,'median truth weakly dominates');}
ok(socialChoiceFrame('p206',0).outcome===.5&&socialChoiceFrame('p206',2).outcome===.6&&socialChoiceFrame('p206',4).outcome===.3,'median film outcomes');
console.log({passed:true,checked,cases:6,frames:36,profiles:216});
