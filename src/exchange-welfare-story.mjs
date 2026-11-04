import {externalityExchange,spendingContradiction} from './economy.mjs';
export const welfareKeys=['cost105','external105','price105','convex105','strong105','boundary105','redistribute105'];
const welfareCopy=a=>a.map(x=>x.slice());
const welfareNear=(a,b)=>Math.abs(a-b)<1e-9;
export function welfareUtility(kind,x){return kind==='min'?Math.min(...x):kind==='first'?x[0]:kind==='second'?x[1]:kind==='weighted'?2*x[0]+x[1]:x[0]+x[1];}
export function welfareAssessment(kinds,baseline,assignment,resources,external=false){
 const value=a=>external?[a[0][0]+a[0][1]-2*a[1][1],2*a[1][0]+3*a[1][1]]:a.map((x,i)=>welfareUtility(kinds[i],x));
 const valid=assignment.length===baseline.length&&assignment.flat().every(x=>Number.isFinite(x)&&x>=0),totals=[0,1].map(k=>assignment.reduce((s,a)=>s+a[k],0));
 const before=value(baseline),after=value(assignment),gains=after.map((v,i)=>v-before[i]);
 const feasible=valid&&totals.every((v,k)=>welfareNear(v,resources[k])),allWeak=gains.every(v=>v>=-1e-9),someStrict=gains.some(v=>v>1e-9),allStrict=gains.every(v=>v>1e-9);
 return {valid,totals,before,after,gains,feasible,allWeak,someStrict,allStrict,paretoImprovement:feasible&&allWeak&&someStrict};
}
// Demand CORRESPONDENCES for the textbook externality example. The other
// consumer's consumption is held fixed during each individual optimization.
export function welfareExternalDemand(p){
 if(!Number.isFinite(p)||p<=0)throw Error('Positive first-good price required');
 const a=p<1?'rice':p>1?'bean':'line',b=p<2/3?'rice':p>2/3?'bean':'line';
 const A=a==='rice'?[[1,0]]:a==='bean'?[[0,p]]:[[1,0],[0,1]];
 const B=b==='rice'?[[1/p,0]]:b==='bean'?[[0,1]]:[[1/p,0],[0,1]];
 return {p,A,B,choice:[a,b],eq:p>=2/3&&p<=1,allocation:p>=2/3&&p<=1?[[1,0],[0,1]]:null};
}
export function welfareStory(key,step=0){
 if(!welfareKeys.includes(key))throw Error('Unknown welfare story');const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0)));
 const f={key,step:t,view:'ledger',baseline:[[1,1],[1,1]],assignment:[[1,1],[1,1]],resources:[2,2],kinds:['min','min'],prices:[1,1],limit:3,identity:'固定价格下的配置比较',scope:'原书命题10.4的一般证明；米豆数值为自主构造。'};
 if(key==='cost105'){
  f.assignment=[[[1,1],[1,1]],[[1.2,1.2],[.8,.8]],[[1.2,1.2],[1,1]],[[1.2,1.2],[1,1]],[[1.2,1.2],[1,1]],[[1,1],[1,1]]][t];f.identity=t>=2&&t<=4?'假设的改善方案：资源不够，不能成交':'同一资源下的配置比较';f.costProof=spendingContradiction(.2);
 }else if(key==='external105'){
  f.baseline=[[1,0],[0,1]];f.resources=[1,1];f.limit=1.5;f.prices=[.8,1];f.external=true;f.kinds=['external','weighted'];f.progress=[0,0,.25,.5,1,1][t];const e=externalityExchange(.8,f.progress);f.assignment=[e.A,e.B];f.identity=t>=2?'资源可行的福利比较，不是新均衡':'每人把对方消费当成给定';f.scope='原书印刷147页Comments1的完整数值反例；生活情境为自主解释。';
 }else if(key==='price105'){
  f.view='price';f.price=[.5,2/3,.8,1,1.2,.8][t];f.demand=welfareExternalDemand(f.price);f.baseline=[[1,0],[0,1]];f.assignment=welfareCopy(f.baseline);f.prices=[f.price,1];f.resources=[1,1];f.external=true;f.identity='逐个价格检查最优需求能否同时实现';f.scope='原书印刷147页Comments1的全部正价格分段；端点保留完整需求集合。';
 }else if(key==='convex105'){
  f.baseline=[[1,1],[2,2]];f.resources=[3,3];f.kinds=['first','linear'];f.prices=null;f.limit=3.5;
  f.assignment=[[[1,1],[2,2]],[[2,0],[1,3]],[[1.5,.5],[1.5,2.5]],[[1.5,.5],[1.5,2.5]],[[1.4,.4],[1.6,2.6]],[[1.4,.4],[1.6,2.6]]][t];f.identity=t<2?'先找全体不差、至少一人更好的方案':t<4?'与原配置混合，保留严格改善和正数量':'从严格获益者拿出很少的两种商品';f.scope='原书Comments2(a)的自主数值演示；任意人数的一般证明另列。';
 }else if(key==='strong105'){
  f.baseline=[[1,1],[0,1]];f.resources=[1,2];f.kinds=['linear','weighted'];f.prices=null;f.limit=2.5;
  f.assignment=[[[1,1],[0,1]],[[0,2],[1,0]],[[0,2],[1,0]],[[.25,2],[.75,0]],[[.25,2],[.75,0]],[[.25,2],[.75,0]]][t];f.identity=t<3?'乙严格获益，但手里只有米':'乙分出少量米，甲乙都严格获益';f.scope='原书Comments2(b)的自主数值演示；偏好强单调，允许原配置在边界。';
 }else if(key==='boundary105'){
  f.baseline=[[1,1.5],[0,.5]];f.resources=[1,2];f.kinds=['min','second'];f.prices=null;f.limit=2.5;
  f.assignment=[[[1,1.5],[0,.5]],[[1,1],[0,1]],[[1,1],[0,1]],[[.9,1],[.1,1]],[[1,1],[0,1]],[[1,1],[0,1]]][t];f.identity='条件缺失的反例：原配置不在内点，偏好不强单调';f.scope='自主构造反例，解释Comments2条件的重要性；不是原书原例。';
 }else{
  f.baseline=[[6,6],[4,4]];f.resources=[10,10];f.kinds=['linear','linear'];f.prices=[1,1];f.limit=12;
  f.assignment=[[[6,6],[4,4]],[[6,6],[4,4]],[[8,4],[2,6]],[[9,4],[1,6]],[[8,5],[2,6]],[[6,6],[4,4]]][t];f.identity=t===3?'有人多得，有人少得：不是全体改善':t===4?'凭空多出一份豆：不可行':'有效初始分配下的同价交易';f.scope='原书Comments3—4；米豆分配为自主构造，存在均衡是论证前提。';
 }
 f.check=welfareAssessment(f.kinds,f.baseline,f.assignment,f.resources,!!f.external);
 f.wealth=f.prices?f.baseline.map(a=>f.prices[0]*a[0]+f.prices[1]*a[1]):null;f.costs=f.prices?f.assignment.map(a=>f.prices[0]*a[0]+f.prices[1]*a[1]):null;
 return f;
}
