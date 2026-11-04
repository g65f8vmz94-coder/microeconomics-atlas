import assert from 'node:assert/strict';
import fs from 'node:fs';
import {total,indivisible,insurance,production,labor,bank,lemons,fishing,signaling} from './src/markets.mjs';
let checks=0;
const yes=(x,message)=>{checks++;assert.ok(x,message)};
const near=(a,b,message)=>yes(Math.abs(a-b)<1e-7,message+': '+a+' / '+b);
for(const kind of ['four','tickets','noTrade'])for(const buyer of [0,4,6,10,14])for(const price of [0,2,4,5,6,10,14,100,120]){
 const r=indivisible(kind,buyer,price);near(total(r.allocation.map(x=>x.has)),r.s,'物品守恒');near(total(r.allocation.map(x=>x.money)),0,'货币守恒');
 yes(r.equilibrium===(price>=r.lo&&price<=r.hi),'价格区间充要性');if(r.equilibrium)r.allocation.forEach(x=>{yes(x.gain>=-1e-8,'自愿交易');yes(x.has?x.v>=price:price>=x.v,'个人最优')});
}
for(const mode of ['pool','aggregate','insurer','belief'])for(const pi of [.1,.4,.5,.7,.9])for(const capital of [.1,1,4])for(const belief of [.1,.5,.9]){
 const r=insurance(mode,pi,.35,capital,belief,1),mult=mode==='insurer'?3:1;
 for(let j=0;j<2;j++)near(mult*r.a[0][j]+r.a[1][j],mult*r.e[0][j]+r.e[1][j],'逐状态守恒');
 r.a.forEach((a,i)=>{near(r.p*a[0]+a[1],r.p*r.e[i][0]+r.e[i][1],'状态预算');yes(Math.min(...a)>-1e-8,'非负支付');yes(r.eu[i]>=r.eu0[i]-1e-8,'主观福利不下降')});
 if(mode==='pool')r.a.forEach(a=>near(a[0],a[1],'共同总量下完全保险'));
 if(mode==='aggregate'){yes(r.p>r.fair,'灾难价格溢价');r.a.forEach(a=>yes(a[0]<a[1],'个人保留总量风险'))}
 if(mode==='insurer'){yes((Math.abs(r.a[0][0]-r.a[0][1])<1e-7)===(capital>=3*(1-pi)-1e-8),'资本门槛');if(capital<3*(1-pi)-1e-8){near(r.a[1][0],0,'赔付约束');near(pi/(1-pi)*Math.sqrt(r.a[0][1]/r.a[0][0]),r.p,'风险厌恶者FOC')}}
}
for(const A of [3,8,12])for(const B of [3,6,12])for(const share of [.1,.5,.9])for(const alpha of [.15,.7,.85])for(const beta of [.15,.3,.85]){
 const base=production(1,A,B,share,alpha,beta),r=production(base.eq,A,B,share,alpha,beta);
 near(r.excess[0],0,'生产经济商品1出清');near(r.excess[1],0,'生产经济商品2出清');near((r.supply[0]/A)**2+(r.supply[1]/B)**2,1,'技术边界');near(total(r.income),r.profit,'利润全部分配');
 for(const mult of [.5,1.5]){const p=base.eq*mult,t=production(p,A,B,share,alpha,beta);near(p*t.excess[0]+t.excess[1],0,'生产经济Walras');for(let i=0;i<=16;i++){const angle=i*Math.PI/32;yes(t.profit>=p*A*Math.cos(angle)+B*Math.sin(angle)-1e-8,'生产者全局支持平面')}}
}
for(const A of [2,5,10])for(const beta of [.15,.4,.85]){const r=labor(A,beta,1);near(r.demand,r.supply,'劳动市场出清');near(r.output,r.profit+r.workerConsumption,'产出分配');near(A/(2*Math.sqrt(r.demand)),r.w,'资本家最优');}
for(const a of [.2,1,5])for(const b of [.2,2,5]){const q=bank(a,b),r=bank(a,b,q.eq);near(r.gap,0,'网点预期一致');near(q.eq+a*q.eq,1-q.eq+b*(1-q.eq),'无差异居民');yes(bank(a*.9,b).eq>q.eq,'改善左网点增加左客流');}
for(const kind of ['gap','even','tiny'])for(let a=105;a<=300;a+=5){const alpha=a/100;const r=lemons(kind,alpha);yes(r.all.length>0,'至少一个正交易均衡');r.all.forEach(c=>{near(c.p,alpha*c.mean,'买家无差异');r.q.forEach((v,i)=>yes(i<c.n?v<=c.p+1e-8:v>=c.p-1e-8,'卖方最优'))});}
for(const v of [2,6,8])for(const k of [.85,1,2])for(const fraction of [.1,.5,.95]){
 const original=fishing(v,k),improved=fishing(v,k,'pareto',fraction),tax=fishing(v,k,'tax',fraction,.5,true),unpaid=fishing(v,k,'tax',fraction,.5,false);
 near(original.consumer,0,'原消费者剩余');near(original.fisher,0,'原渔民利润');yes(improved.consumer>0&&improved.fisher>0,'协商严格帕累托改善');near(10*tax.consumer+5*tax.fisher,tax.surplus,'税收返还不创造额外资源');near(unpaid.consumer,0,'不返还消费者无改善');near(unpaid.fisher,0,'不返还渔民无改善');near(tax.T,tax.optimal,'半额价值税实现本例社会最优');
}
for(const bH of [.3,1,2.7])for(const low of [.05,.1,.3,.5,.9,.95])for(const menu of ['pool','separate']){
 const r=signaling(4,10,3,bH,low,menu);let profitable=false;
 for(let ti=0;ti<=80;ti++)for(let wi=0;wi<=120;wi++){const t=ti/20,w=wi/10,q=signaling(4,10,3,bH,low,menu,t,w);if(q.profit>1e-7)profitable=true;if(menu==='separate'&&r.candidateStable)yes(q.profit<=1e-7,'通过全域条件的分离集合无网格盈利进入');}
 if(menu==='pool'){const t=Math.min(1,(10-r.mean)/(3+bH)),w=r.mean+(3+bH)*t/2,q=signaling(4,10,3,bH,low,menu,t,w);yes(!q.take[0]&&q.take[1]&&q.profit>0,'混同被筛选合同打破')}
 else if(!r.candidateStable){const q=signaling(4,10,3,bH,low,menu,0,(r.mean+r.hUtility)/2);yes(q.take.every(Boolean)&&q.profit>0,'失败分离被混同合同打破')}
 else yes(!profitable,'稳定候选无观察到的盈利进入');
}
const report={checks,passed:true,scope:'Chapter11–14 finite illustrations: resource/budget conservation, equilibrium boundaries, optimality witnesses, insurance capital constraints, fiscal accounting and contract-entry cases. Finite tests supplement the stated analytic derivations.'};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/markets-models.json',JSON.stringify(report,null,2));console.log(report);
