// Original, finite illustrations of Osborne–Rubinstein chapters 11–14.
// Pure functions: prices are candidates unless equilibrium is explicitly tested.
export const total = a => a.reduce((s,x)=>s+x,0);
export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
export function indivisible(kind='four',buyer=10,price=5) {
 const people=kind==='tickets'?[...Array.from({length:14},(_,i)=>({id:'S'+(i+1),v:0,own:1})),...Array.from({length:17},(_,i)=>({id:'B'+(i+1),v:100,own:0}))]:kind==='noTrade'?[{id:'S1',v:8,own:1},{id:'S2',v:10,own:1},{id:'B1',v:2,own:0},{id:'B2',v:4,own:0}]:[{id:'S1',v:0,own:1},{id:'S2',v:6,own:1},{id:'B1',v:4,own:0},{id:'B2',v:buyer,own:0}];
 const sorted=[...people].sort((a,b)=>b.v-a.v||b.own-a.own||a.id.localeCompare(b.id)),s=total(people.map(x=>x.own)),lo=sorted[s].v,hi=sorted[s-1].v,chosen=new Set(sorted.slice(0,s).map(x=>x.id));
 const allocation=people.map(p=>({...p,has:+chosen.has(p.id),money:price*(p.own-(+chosen.has(p.id))),gain:(p.v-price)*((+chosen.has(p.id))-p.own)}));
 const strict=people.filter(x=>x.v>price+1e-8).length,weak=people.filter(x=>x.v>=price-1e-8).length;
 return {people,sorted,s,lo,hi,price,strict,weak,equilibrium:strict<=s&&s<=weak,allocation,surplus:total(allocation.map(x=>x.gain))};
}
export function insurance(mode,pi=.4,shock=.5,capital=1,beliefB=.3,progress=1) {
 let e,a,p,utility,names=['甲','乙'],note='';
 if(mode==='insurer') {
  const m=3,threshold=m*(1-pi);e=[[0,1],[capital,capital]];names=['每位投保人','保险人'];
  if(capital>=threshold-1e-9){a=[[1-pi,1-pi],[capital-threshold,capital+m*pi]];p=pi/(1-pi)}
  else{const x1=capital/m,k=pi/(1-pi)*Math.sqrt(x1),z=2/(Math.sqrt(k*k+4)+k),x2=z*z;p=pi/(1-pi)*Math.sqrt(x2/x1);a=[[x1,x2],[0,capital+m*(1-x2)]];}
  utility=[x=>pi*Math.sqrt(x[0])+(1-pi)*Math.sqrt(x[1]),x=>pi*x[0]+(1-pi)*x[1]];
  note='投保人共3位；保险人柱不是“每人平均”。资本门槛为3(1−π)。';
 }else if(mode==='belief') {
  e=[[1,1],[1,1]];const h=Math.max(pi,beliefB),l=Math.min(pi,beliefB),q=clamp(.5,l,h);p=q/(1-q);
  if(Math.abs(h-l)<1e-9)a=[[1,1],[1,1]];
  else{const ah=q>.5?[1/q,0]:q<.5?[2,2-1/(1-q)]:[2,0];const al=[2-ah[0],2-ah[1]];a=pi>beliefB?[ah,al]:[al,ah];}
  utility=[x=>pi*x[0]+(1-pi)*x[1],x=>beliefB*x[0]+(1-beliefB)*x[1]];note='风险中性、初始各(1,1)。信念相同时展示保留禀赋的一种均衡，配置不唯一。';
 }else {
  const s=mode==='aggregate'?shock:1;e=[[8*s,2],[2*s,8]];p=pi*10/((1-pi)*10*s);
  a=e.map(x=>{const wealth=p*x[0]+x[1];return [pi*wealth/p,(1-pi)*wealth]});
  utility=[0,1].map(()=>x=>pi*Math.log(x[0])+(1-pi)*Math.log(x[1]));note='两人都采用对数伯努利效用；共同概率为π和1−π。';
 }
 const shown=a.map((x,i)=>x.map((v,j)=>e[i][j]+progress*(v-e[i][j])));
 return {e,a,p,shown,names,note,utility,eu0:e.map((x,i)=>utility[i](x)),eu:shown.map((x,i)=>utility[i](x)),fair:pi/(1-pi)};
}
export function production(r=1,A=8,B=6,share=.5,alpha=.7,beta=.3) {
 const mix=share*alpha+(1-share)*beta,profit=Math.hypot(A*r,B),supply=[A*A*r/profit,B*B/profit],income=[share*profit,(1-share)*profit],bundles=income.map((w,i)=>[(i?beta:alpha)*w/r,(1-(i?beta:alpha))*w]);
 const demand=[total(bundles.map(x=>x[0])),total(bundles.map(x=>x[1]))],eq=B/A*Math.sqrt(mix/(1-mix));
 return {mix,profit,supply,income,bundles,demand,eq,excess:demand.map((x,i)=>x-supply[i])};
}
export function labor(A=5,beta=.4,multiplier=1) {
 const supply=1-beta,eq=A/(2*Math.sqrt(supply)),w=eq*multiplier,demand=(A/(2*w))**2,output=A*Math.sqrt(demand),profit=output-w*demand,workerConsumption=w*supply;
 return {supply,eq,w,demand,output,profit,workerConsumption,leisure:beta,excess:demand-supply};
}
export function bank(a=1,b=2,z=.5) {
 const t=[a*z,b*(1-z)],cut=clamp((1+t[1]-t[0])/2,0,1),eq=(1+b)/(2+a+b),social=(1+2*b)/(2+2*a+2*b);
 return {t,cut,eq,social,gap:cut-z,totalCost:.5*(z*z+(1-z)**2)+a*z*z+b*(1-z)**2};
}
export function lemons(kind='gap',alpha=1.5,m=3,noTrade=false) {
 const q=kind==='even'?[.15,.3,.45,.6,.75,.9]:kind==='tiny'?[.01,.1,.25,.5,.75,1]:[.05,.1,.2,.6,.8,1];
 const candidates=q.map((_,i)=>{const n=i+1,mean=total(q.slice(0,n))/n,p=alpha*mean;return {n,mean,p,valid:p>=q[i]-1e-9&&(i===q.length-1||p<=q[i+1]+1e-9)}});
 const chosen=noTrade?{n:0,mean:0,p:q[0]/2,valid:true}:candidates[m-1];
 return {q,candidates,chosen,all:candidates.filter(x=>x.valid),surplus:(alpha-1)*total(q.slice(0,chosen.n)),lost:(alpha-1)*total(q.slice(chosen.n))};
}
export function fishing(v=6,k=1,mode='equilibrium',fraction=.5,taxFraction=.5,rebate=true) {
 const original=v/k,optimal=v/(2*k),tax=mode==='tax'?v*taxFraction:0,T=mode==='pareto'?fraction*original:(v-tax)/k,c=k*T,p=mode==='pareto'?(v+c)/2:v;
 const revenue=tax*T,transfer=mode==='tax'&&rebate?revenue/15:0;
 return {original,optimal,tax,T,c,p,revenue,transfer,consumer:(v-p)*T/10+transfer,fisher:(p-c-tax)*T/5+transfer,surplus:(v-c)*T};
}
export function wages(v=8,w=5,entry=6) {return {v,w,entry,profit:v-w,entryAccepted:entry>w,entryProfit:entry>w?v-entry:0,stable:Math.abs(w-v)<1e-9,withdraw:w>v};}
export function signaling(vL=4,vH=10,bL=3,bH=1,shareL=.5,menu='separate',t=1,w=6) {
 const tH=(vH-vL)/bL,mean=shareL*vL+(1-shareL)*vH,base=menu==='separate'?[{id:'L',t:0,w:vL},{id:'H',t:tH,w:vH}]:[{id:'P',t:0,w:mean}],entry={id:'E',t,w};
 const choose=(contracts,b)=>[...contracts,{id:'外部',t:0,w:0}].sort((a,c)=>{const diff=(c.w-b*c.t)-(a.w-b*a.t);return Math.abs(diff)>1e-8?diff:a.t-c.t||a.id.localeCompare(c.id)})[0];
 const before=[choose(base,bL),choose(base,bH)],after=[choose([...base,entry],bL),choose([...base,entry],bH)],take=after.map(x=>x.id==='E'),mass=(take[0]?shareL:0)+(take[1]?1-shareL:0),productivity=mass?((take[0]?shareL*vL:0)+(take[1]?(1-shareL)*vH:0))/mass:0;
 return {tH,mean,base,entry,before,after,take,mass,profit:mass?productivity-w:0,entryProductivity:productivity,candidateStable:shareL>=bH/bL-1e-9,hUtility:vH-bH*tH,bL,bH,vL,vH};
}
