import assert from 'node:assert/strict';
import fs from 'node:fs';
import {project,reportComparison,permutations,galeShapley,blockingPairs,matchingAnalysis,profiles,distribution,wealthChecks,sum} from './src/models.mjs';
let checks=0;const ok=(x,m)=>{checks++;assert.ok(x,m)};
for(const values of [[5,-1,-1,-1,-1],[-5,1,1,1,1],[-7,1,1,3,4],[-5,2,2,2,2]]){
 const p=project(values);ok(p.transfers.every(x=>x<=0),'VCG transfers cannot be positive');
}
assert.deepEqual(project([-7,1,1,3,4]).transfers,[0,0,0,-1,-2]);checks++;
for(let v=-5;v<=5;v++)for(let a=-5;a<=5;a++)for(let b=-5;b<=5;b++)for(let report=-12;report<=12;report++){
 for(const rule of ['vcg','majority'])ok(reportComparison([v,a,b],report,rule).gain<=1e-9,rule+' truth-telling dominance');
}
ok(reportComparison([1,-3,-2],8,'sum').gain>0,'Sum rule must expose profitable manipulation');
const perms=permutations([0,1,2]),triples=perms.flatMap(a=>perms.flatMap(b=>perms.map(c=>[a,b,c])));
for(const X of triples)for(const Y of triples){
 for(const side of ['X','Y']){
  const r=galeShapley(X,Y,side);ok(new Set(r.matching).size===3&&r.matching.every(x=>x>=0),'complete bijection');ok(!blockingPairs(X,Y,r.matching).length,'stable algorithm outcome');ok(r.trace.length<=10,'termination bound');
 }
 const ax=galeShapley(X,Y,'X').matching,ay=galeShapley(X,Y,'Y').matching;
 for(const m of perms.filter(m=>!blockingPairs(X,Y,m).length)){
  ok(X.every((p,i)=>p.indexOf(ax[i])<=p.indexOf(m[i])),'X-optimal among all stable');
  ok(Y.every((p,y)=>p.indexOf(ay.indexOf(y))<=p.indexOf(m.indexOf(y))),'Y-optimal among all stable');
  ok(Y.every((p,y)=>p.indexOf(ax.indexOf(y))>=p.indexOf(m.indexOf(y))),'X-proposing worst stable for Y');
 }
}
assert.deepEqual(galeShapley(profiles.textbook.X,profiles.textbook.Y).matching,[0,2,1,3]);checks++;
ok(matchingAnalysis(profiles.multiple.X,profiles.multiple.Y).stable.length>1,'multiple stable profile');
for(let a=0;a<=4;a++)for(let b=0;b<=4;b++)for(let c=0;c<=4;c++)for(const rule of ['equal-own','max-own','equal-equal','max-equal','one-one','proportional','min-equal','max-first','max-lowest']){
 const r=distribution([a,b,c],rule);ok(Math.abs(sum(r.input)-1)<1e-9,'unit input');ok(Math.abs(sum(r.wealth)-r.output)<1e-9,'wealth conservation');ok(r.wealth.every(w=>w>=0),'nonnegative wealth');
 if(rule==='max-equal'){for(let who=0;who<3;who++){const w=wealthChecks([a,b,c],rule,who,2);ok(w.own&&w.others&&w.symmetric&&r.efficient,'four axioms on tested profiles')}}
}
const results={date:new Date().toISOString(),checks,matchingExhaustive:{n:3,preferenceProfiles:triples.length**2,completeStrictRankings:true},mechanismDomain:{values:'integers [-5,5]',reports:'integers [-12,12]',rules:['VCG','majority']},passed:true,scope:'Pure algorithm models for chapters17–19 only. Finite verification supports implementation; it is not proof of all textbook claims.'};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/models.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
