export const equilibriumStoryKeys=['gates102','prices102','linear102','complements102','surplus102','destroy102','walras102','product102'];
const eqDot=(p,x)=>p[0]*x[0]+p[1]*x[1];
const eqNear=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));
const eqBundle=x=>Array.isArray(x)&&x.length===2&&x.every(v=>Number.isFinite(v)&&v>=0);
export const equilibriumUtility=(kind,x)=>kind==='linear'?x[0]+x[1]:kind==='min'?Math.min(...x):x[0]*x[1];
// Analytic optimum sets, including zero-price and zero-wealth boundaries.
export function equilibriumBest(kind,p,e,x){
 if(!['linear','min','product'].includes(kind)||!eqBundle(p)||!p.some(v=>v>0)||!eqBundle(e))throw Error('Invalid preference, price or endowment');
 const wealth=eqDot(p,e),cost=eqBundle(x)?eqDot(p,x):null,affordable=cost!==null&&(cost<wealth||eqNear(cost,wealth));
 let value;
 if(kind==='linear')value=p.every(v=>v>0)?wealth/Math.min(...p):Infinity;
 else if(kind==='min')value=wealth/(p[0]+p[1]);
 else value=p.every(v=>v>0)?wealth**2/(4*p[0]*p[1]):wealth===0?0:Infinity;
 const utility=eqBundle(x)?equilibriumUtility(kind,x):null;
 return {wealth,cost,affordable,utility,best:value,attained:Number.isFinite(value),budgetLine:affordable&&eqNear(cost,wealth),optimal:affordable&&Number.isFinite(value)&&eqNear(utility,value)};
}
export function equilibriumInspect(kind,prices,endowments,assignment){
 if(!Array.isArray(endowments)||endowments.length===0||!endowments.every(eqBundle))throw Error('Invalid endowments');
 const supply=[0,1].map(k=>endowments.reduce((s,e)=>s+e[k],0));if(supply.some(v=>v<=0))throw Error('Each aggregate supply must be positive');
 const valid=Array.isArray(assignment)&&assignment.length===endowments.length&&assignment.every(eqBundle);
 const people=endowments.map((e,i)=>equilibriumBest(kind,prices,e,valid?assignment[i]:null));
 const totals=valid?[0,1].map(k=>assignment.reduce((s,x)=>s+x[k],0)):null;
 const excess=totals?.map((v,k)=>v-supply[k])??null;
 const clearing=excess?.map(v=>eqNear(v,0))??[false,false];
 return {supply,totals,excess,people,valid,clearing,allocation:valid&&clearing.every(Boolean),individualOptimal:people.every(x=>x.optimal),allBudgetLines:people.every(x=>x.budgetLine),excessValue:excess?eqDot(prices,excess):null,equilibrium:valid&&clearing.every(Boolean)&&people.every(x=>x.optimal)};
}
export function equilibriumStory(key,step=0){
 if(!equilibriumStoryKeys.includes(key))throw Error('Unknown equilibrium story');
 const t=Math.min(5,Math.max(0,Math.floor(Number(step)||0)));
 const f={key,step:t,kind:'product',prices:[.5,1],endowments:[[8,0],[0,4]],assignment:[[4,2],[4,2]],limit:12,compareOriginal:false};
 if(key==='gates102'){
  f.prices=[[.5,1],[.5,1],[1,1],[.5,1],[1,2],[.5,1]][t];
  f.assignment=[[[8,0],[0,4]],[[6,1],[2,3]],[[4,4],[2,2]],[[4,2],[4,2]],[[4,2],[4,2]],[[4,2],[4,2]]][t];
 }else if(key==='prices102'){
  f.prices=t===3?[1,2]:[.5,1];f.assignment=t===0?[[8,0],[0,4]]:t===1?[[4,2],[0,4]]:[[4,2],[4,2]];
 }else if(key==='linear102'){
  f.kind='linear';f.limit=24;f.prices=t===3?[2,1]:t===4?[0,1]:[1,1];
  const trade=[0,1,4,0,0,2][t];f.assignment=t===4?null:t===3?[[0,16],[0,4]]:[[8-trade,trade],[trade,4-trade]];
 }else if(key==='complements102'){
  f.kind='min';const alpha=t===3||t===4?4:8;f.endowments=[[alpha,0],[0,4]];
  f.prices=[[1,1],[3,1],[1,3],[1,1],[3,1],[0,1]][t];
  if(t===5)f.assignment=[[4,0],[4,4]];
  else f.assignment=f.endowments.map(e=>{const d=eqDot(f.prices,e)/(f.prices[0]+f.prices[1]);return[d,d]});
 }else if(key==='surplus102'){
  f.kind='min';f.prices=t===4?[1,0]:[0,1];f.endowments=t===4?[[4,0],[0,8]]:t===5?[[4,0],[0,4]]:[[8,0],[0,4]];
  f.assignment=[[[4,0],[4,4]],[[0,0],[8,4]],[[2,0],[6,4]],[[5,0],[3,4]],[[4,6],[0,2]],[[0,0],[4,4]]][t];
 }else if(key==='destroy102'){
  f.kind='min';f.compareOriginal=true;const gamma=[8,6,4,2,2,2][t];f.endowments=[[gamma,0],[0,4]];f.prices=gamma>4?[0,1]:gamma===4?[1,1]:[1,0];
  f.assignment=[[[4,0],[4,4]],[[2,0],[4,4]],[[2,2],[2,2]],[[2,2],[0,2]],[[2,4],[0,0]],[[2,2],[0,2]]][t];
 }else if(key==='walras102'){
  f.kind='min';f.prices=t===5?[0,1]:[1,1];f.assignment=[[[6,2],[2,2]],[[6,2],[2,2]],[[5,3],[3,1]],[[6,2],[1,3]],[[7,0],[1,3]],[[0,0],[9,4]]][t];
 }else{
  f.prices=[[1,1],[1,1],[.75,1],[.5,1],[1,2],[.5,1]][t];
  f.assignment=t===0?f.endowments.map(x=>x.slice()):f.endowments.map(e=>{const w=eqDot(f.prices,e);return [w/(2*f.prices[0]),w/(2*f.prices[1])]});
 }
 f.check=equilibriumInspect(f.kind,f.prices,f.endowments,f.assignment);
 f.net=f.assignment?.map((x,i)=>x.map((v,k)=>v-f.endowments[i][k]))??null;
 f.original=f.compareOriginal?{endowments:[[8,0],[0,4]],prices:[0,1],assignment:[[4,0],[4,4]],utility:[0,4]}:null;
 return f;
}
