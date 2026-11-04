import assert from 'node:assert/strict';
import {bookProfiles,budgetValues,projectOutcome,trueUtility,compareReport,vcgUtilities,auctionOutcome,budgetGrid,rebateExample} from './src/mechanism.mjs';

let checks=0;
function eq(a,b){assert.deepEqual(a,b);checks++}
const textbook=[
 {d:1,t:[-4,0,0,0,0]},
 {d:0,t:[-4,0,0,0,0]},
 {d:1,t:[0,0,0,-1,-2]},
 {d:1,t:[0,0,0,0,0]}
];
bookProfiles.forEach((p,i)=>{const r=projectOutcome(p);eq(r.decision,textbook[i].d);eq(r.transfers,textbook[i].t)});
eq(projectOutcome([8,-1,-1],'majority').decision,0);
eq(projectOutcome([8,-1,-1],'sum').decision,1);
eq(compareReport(2,[-2,-1],4,'sum').gain,2);
eq(compareReport(2,[-2,-1],4,'vcg').gain,-1);
eq(rebateExample(1).utility,1);eq(rebateExample(-8).utility,5);
eq(budgetGrid().length,9);
for(const v of budgetValues)for(const y of budgetValues){const honest=projectOutcome([v,y]);for(const x of budgetValues){const other=projectOutcome([x,y]);assert.ok(trueUtility(v,honest)>=trueUtility(v,other)-1e-9);checks++}}
for(let S=-15;S<=15;S++)for(let v=-15;v<=15;v++){
 const u=vcgUtilities(v,[S]);eq(u.project-u.noProject,v+S);
 const honest=projectOutcome([v,S]);for(let x=-15;x<=15;x+=3){const other=projectOutcome([x,S]);assert.ok(trueUtility(v,honest)>=trueUtility(v,other)-1e-9,`VCG v=${v}, S=${S}, x=${x}`);checks++}
}
for(let C=0;C<=18;C+=3)for(let v=-8;v<=12;v+=2){const b=[-3,4],h=projectOutcome([v,...b],'vcg',C);for(let x=-8;x<=12;x+=2){const a=projectOutcome([x,...b],'vcg',C);assert.ok(trueUtility(v,h)>=trueUtility(v,a)-1e-9);checks++}}
eq(auctionOutcome([10,5,3],[10,5,3],'second').utility[0],5);
eq(auctionOutcome([10,5,3],[10,5,3],'first').utility[0],0);
eq(auctionOutcome([6,5,3],[10,5,3],'first').utility[0],4);
eq(auctionOutcome([5,5,3],[10,5,3],'second').winner,0);
console.log(JSON.stringify({passed:true,checks}));
