import assert from 'node:assert/strict';
import fs from 'node:fs';
import {caseSections,caseNames,menus,members,table24,alphaFailures,rankFromAlpha,chooseByRank,medianChoice,satisficingChoice,satisficingRank,originalSatisficing,menuChoice,frameData,outcomeDistribution,sourceRates,problem1Witnesses} from './src/choice.mjs';
let checks=0;const ok=(x,m)=>{assert.ok(x,m);checks++};
const cases=Object.values(caseSections).flat();ok(cases.length===27,'27 chapter2 entries including section2.1 extensions');ok(new Set(cases).size===cases.length,'unique cases');for(const x of cases)ok(!!caseNames[x],x+' named');
ok(JSON.stringify(menus(3))===JSON.stringify([1,2,4,3,5,6,7]),'three-alternative menu enumeration');
let rational=0;for(let i=0;i<24;i++){
 const t=table24(i),bad=alphaFailures(t,3),rank=rankFromAlpha(t,3);
 for(const mask of menus(3))ok(members(mask,3).includes(t[mask]),'choice lies in menu');
 if(!bad.length){rational++;ok(rank?.length===3,'rank exists');for(const mask of menus(3))ok(t[mask]===chooseByRank(mask,rank),'rank rationalizes every menu')}
 else ok(rank===null,'violating α has no rank');
}ok(rational===6,'exactly six of 24 choice tables rationalizable');
ok(medianChoice(31,5)===2&&medianChoice(28,5)===3,'source median violation');
for(let threshold=-3;threshold<=4;threshold++)for(const fallback of ['last','best']){
 const rank=satisficingRank(originalSatisficing.values,threshold,undefined,fallback);
 for(const mask of menus(4))ok(satisficingChoice(mask,originalSatisficing.values,threshold,undefined,fallback)===chooseByRank(mask,rank),'satisficing agrees with fixed rank');
 const table=Object.fromEntries(menus(4).map(mask=>[mask,satisficingChoice(mask,originalSatisficing.values,threshold,undefined,fallback)]));ok(!alphaFailures(table,4).length,'satisficing satisfies alpha');
}
const u=[12,11,4],v=[1,10,9],rule={kind:'threshold-u',u,v,threshold:10};for(const mask of menus(3))ok(menuChoice(rule,mask)===chooseByRank(mask,[0,1,2]),'problem1d fixed rank');
const caring={kind:'caring',u:[0,1,2],v:[2,1,0],threshold:1};ok(menuChoice(caring,7)===0&&menuChoice(caring,3)===1,'problem6 alpha violation');
for(const key of ['a','b','e']){const w=problem1Witnesses[key];ok((w.B&w.A)===w.B&&(w.B&(1<<w.large))!==0&&w.large!==w.small,'problem1 witness '+key)}
const d=(x,y)=>{const a=outcomeDistribution(frameData[x]),b=outcomeDistribution(frameData[y]);return a.length===b.length&&a.every(([v,p],i)=>v===b[i][0]&&Math.abs(p-b[i][1])<1e-12)};
ok(d('A','C')&&d('B','D'),'framing lotteries identical in distribution');
ok(sourceRates.attention.AB.reduce((a,b)=>a+b)===100&&sourceRates.attention.ABC.reduce((a,b)=>a+b)===100,'attention percentages total 100');
ok(sourceRates.framing.A===51&&sourceRates.framing.D===93&&sourceRates.mental.ticket===65&&sourceRates.mental.cash===79,'textbook historical reports');
for(const A of menus(4))for(const B of menus(4))if(!(A&B)){
 const rank=[2,0,3,1],both=chooseByRank(A|B,rank),a=chooseByRank(A,rank),b=chooseByRank(B,rank);
 ok(both===chooseByRank((1<<a)|(1<<b),rank),'path independence');
}
const result={passed:true,chapter:2,cases:cases.length,checks,scope:'full 24-table finite rationalizability enumeration, satisficing rank/alpha across all 4-option menus and threshold variants, textbook framing distributions and reported percentages, choice-rule witnesses, path independence; general infinite proofs remain explanatory'};
fs.writeFileSync(new URL('./qa/choice-models.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
