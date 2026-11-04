import assert from 'node:assert/strict';
import {cases,casesBySection,productionEconomy,technology,paretoExample,nonconvex,comparative,noTrade,leontiefException,chain,pollution,production,marginalProduct,labor,laborPlan,laborPareto,outputCapitalist,technologyImprovement} from './src/production-market.mjs';
const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,a+' differs from '+b);
const all=[...casesBySection['12.1'],...casesBySection['12.2']];
assert.equal(all.length,21);assert.equal(new Set(all).size,all.length);
all.forEach(k=>assert.ok(cases[k]?.page>=175&&cases[k]?.page<=185,k));

for(const share of [.15,.5,.85])for(const a of [.2,.7,.8])for(const b of [.2,.3,.8]){
 const eq=productionEconomy({share,thetaA:a,thetaB:b});
 near(eq.gap[0],0);near(eq.gap[1],0);near(eq.q*eq.supply[0]+eq.supply[1],eq.profit);
 near(eq.q*eq.demand[0]+eq.demand[1],eq.profit);
 for(const mult of [.55,.8,1.2,1.45]){
  const r=productionEconomy({share,thetaA:a,thetaB:b,mult});
  near(r.q*r.gap[0]+r.gap[1],0);
  assert.equal(r.clears,Math.abs(mult-1)<1e-8);
 }
}
for(const fraction of [.2,.6,1]){
 const t=technology(8,6,fraction);assert.ok(t.feasible(...t.frontier));
 assert.ok(t.feasible(...t.disposed));assert.ok(!t.feasible(9,6));
}
const p=paretoExample();for(let j=0;j<2;j++){
 near(p.initial[0][j]+p.initial[1][j],p.alternative[0][j]+p.alternative[1][j]);
}p.initialU.forEach((u,i)=>assert.ok(p.alternativeU[i]>u));
for(const q of [.5,1,1.5])assert.equal(nonconvex(q).consumerMatches,false);
for(const q of [.6,1,2,3,3.4]){
 const r=comparative(q);
 r.people.forEach(x=>{
  near(x.t*x.output[0]+x.output[1],x.c);
  near(x.revenue,Math.max(q*x.c/x.t,x.c));
 });
}
assert.equal(noTrade(2).tradeVolume,0);
const exception=leontiefException();
for(let j=0;j<2;j++)near(exception.production[j],exception.consumption[j]);
exception.people.forEach(x=>near(x.production[0]+x.production[1],x.consumption[0]+x.consumption[1]));
assert.ok(exception.people[0].production.every(x=>x>0));
for(const beta of [.3,.5,.7]){
 const r=chain({beta});
 near(r.x,r.firmDemand);near(r.marketGap,0);
 near(r.sellerY+r.profit,r.g);
 near(r.beta/(1-r.t),(1-r.beta)/(2*r.t));
}
for(const q of [.6,1,1.5,2,2.4]){
 const r=pollution(q);assert.equal(r.equilibrium,q>=1&&q<=2);
 assert.ok(r.alternativeUtility>r.privateUtility);
}
for(const beta of [.3,.5,.7])for(const mult of [.7,1,1.4]){
 const r=labor({beta,mult});
 near(marginalProduct(r.firmLabor,4),r.w);
 near(r.workerLabor,1-beta);
 if(mult===1)near(r.firmLabor,r.workerLabor);
}
assert.equal(laborPlan({a:.5,l:.5}).timeFeasible,true);
assert.equal(laborPlan({a:.5,l:.4}).timeFeasible,false);
const pareto=laborPareto({alternativeLabor:.4});
near(pareto.xRequired+pareto.zAvailable,production(.4));
assert.ok(pareto.capitalGain<0);
for(const reduction of [.05,.1,.2,.35]){
 const r=outputCapitalist({reduction});
 near(r.outputMaxLabor,r.a);near(r.profitAtAlternative>0?1:0,1);
 assert.ok(r.zAlt>0);
}
for(const kind of ['capital','worker']){
 for(const strength of [.2,.8,1,1.5]){
  const r=technologyImprovement(kind,strength);
  assert.ok(r.newOutput>r.oldOutput);
  for(const a of [.05,.2,.5,.8,1,2,4,9]){
   assert.ok(production(a,4,kind,strength)>production(a,4));
   assert.ok(marginalProduct(a,4,kind,strength)>0);
   const h=1e-5,second=(production(a+h,4,kind,strength)-2*production(a,4,kind,strength)+production(a-h,4,kind,strength))/(h*h);
   assert.ok(second<0,kind+' not concave at '+a);
  }
 }
}
assert.ok(technologyImprovement('capital',.8).capitalChange<0);
assert.ok(technologyImprovement('worker',1).workerChange<0);
console.log(JSON.stringify({chapter:12,cases:all.length,modelChecks:'passed'}));
