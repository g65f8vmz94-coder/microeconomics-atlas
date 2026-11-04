import {cdExchange,textbookExchange,nonconvexExchange,multipleExcess} from './economy.mjs';
import {equilibriumInspect} from './exchange-equilibrium-story.mjs';

export const existenceKeys=['demand103','continuity103','root103','bridge103','multiple103','nonunique103','boundary103'];
export function existenceCurve(kind,p){
 if(!Number.isFinite(p)||p<=0)throw Error('Strictly positive finite price required');
 if(kind==='A')return 1/p-4;
 if(kind==='B')return 4/p-1;
 if(kind==='multiple')return multipleExcess(p).z;
 if(kind==='jump')return p<=1?6:-4;
 return 5/p-5;
}
export function existenceBracket(iterations=0){
 let low=.2,high=5;const steps=[];
 for(let i=0;i<iterations;i++){const mid=(low+high)/2,value=existenceCurve('sum',mid);steps.push({low,high,mid,value});if(value===0){low=high=mid;break}if(value>0)low=mid;else high=mid;}
 return {low,high,steps};
}
export function existenceQuadraticCheck(prices,endowments,assignment){
 const r=equilibriumInspect('linear',prices,endowments,assignment);
 r.people=r.people.map((person,i)=>{const value=r.valid?assignment[i][0]**2+assignment[i][1]**2:null,best=prices.every(x=>x>0)?(person.wealth/Math.min(...prices))**2:Infinity;return {...person,utility:value,best,attained:Number.isFinite(best),optimal:person.affordable&&Number.isFinite(best)&&Math.abs(value-best)<1e-8*Math.max(1,best)}});
 r.individualOptimal=r.people.every(x=>x.optimal);r.equilibrium=r.allocation&&r.individualOptimal;return r;
}
export function existenceStory(key,step=0){
 if(!existenceKeys.includes(key))throw Error('Unknown existence story');
 const t=Math.min(5,Math.max(0,Math.floor(Number(step)||0))),f={key,step:t,kind:'cd',view:'curve',curve:'sum',curves:['sum'],prices:[1,1],endowments:[[8,2],[2,8]],assignment:null,check:null,interval:null,marks:[],xRange:[.2,5],yRange:[-5,21],scope:'真实两户经济：按给定价格计算需求计划'};
 let p=1;
 if(key==='demand103'){p=[.2,.5,1,2,5,1][t];f.view='ledger';}
 else if(key==='continuity103'){
  p=[.2,.2,.2,.99,1.01,1][t];f.curves=t===0?['A']:t===1?['A','B']:['A','B','sum'];f.curve=t===0?'A':t===1?'B':'sum';
  if(t===5){f.kind='jump';f.curve='jump';f.curves=['jump'];f.scope='数学反例：跳跃函数不是由本例消费者需求推导';}
 }else if(key==='root103'){
  p=[.2,2.6,1.4,.8,1.1,1][t];f.interval=existenceBracket(Math.min(t,4));
  f.marks=[{p:f.interval.low,label:'左端'},{p:f.interval.high,label:'右端'}];
 }else if(key==='bridge103'){
  p=t===0?.2:1;f.view='ledger';
 }else if(key==='multiple103'){
  f.kind='shape';f.curve='multiple';f.curves=['multiple'];f.xRange=[.5,3.5];f.yRange=[-.18,.18];p=[.5,1,2,3,1.5,3.5][t];f.marks=[1,2,3].slice(0,Math.min(t,3)).map(x=>({p:x,label:'零点'+x}));f.scope='图10.2的自主函数示意；未声称构造了对应的完整消费者偏好';
 }else if(key==='nonunique103'){
  f.kind='min';f.view='ledger';f.endowments=[[8,0],[0,8]];f.prices=[[1,1],[1,3],[3,1],[2,2],[.5,1],[0,1]][t];
  const sum=f.prices[0]+f.prices[1],r=textbookExchange('complements',{alpha:8,beta:8,t:f.prices[0]/sum,share:0});f.assignment=r.bundles;f.scope='例10.2等量情境：比较支持价格与各自最优配置';
 }else{
  f.kind='quadratic';f.view='ledger';const symmetric=t!==0;f.prices=t===4?[2,1]:t===5?[0,1]:[1,1];
  const choices=t===0?[0,1]:t===1?[0,0]:t===2?[0,1]:[1,1];
  const r=nonconvexExchange(symmetric,f.prices[0]/(f.prices[0]+f.prices[1]),...choices);f.endowments=r.endowments;f.assignment=r.bundles||null;f.scope=t===0?'非凸但有均衡：甲只带米，乙只带豆':'另一个初始经济：两人各有米2、豆1';
 }
 if(f.kind==='cd'){
  f.prices=[p,1];const r=cdExchange({X:10,Y:10,e1:8,e2:2,a:.5,b:.5,p});f.assignment=[r.at.A,r.at.B];
  if(key==='bridge103'&&t===4){f.assignment=f.endowments.map(x=>x.slice());f.scope='自主反例：两市场出清，但指定篮子不是各人的最优需求';}
  f.check=equilibriumInspect('product',f.prices,f.endowments,f.assignment);
 }else if(f.kind==='min')f.check=equilibriumInspect('min',f.prices,f.endowments,f.assignment);
 else if(f.kind==='quadratic')f.check=existenceQuadraticCheck(f.prices,f.endowments,f.assignment);
 else f.prices=[p,1];
 f.price=f.prices[1]>0?f.prices[0]/f.prices[1]:null;f.value=f.view==='curve'?existenceCurve(f.curve,p):null;f.marks=f.marks.map(m=>({...m,value:existenceCurve(f.curve,m.p)}));
 if(f.check)f.net=f.assignment?.map((a,i)=>a.map((v,k)=>v-f.endowments[i][k]))??null;
 return f;
}
