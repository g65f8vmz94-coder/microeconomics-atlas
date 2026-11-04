export const permute=xs=>xs.length?xs.flatMap((x,i)=>permute(xs.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
export const orders=permute([0,1,2]);
export const allProfiles=Array.from({length:216},(_,n)=>[orders[n%6],orders[Math.floor(n/6)%6],orders[Math.floor(n/36)]]);
export const singlePeakedProfiles=allProfiles.filter(p=>p.every(r=>r[2]!==1));
export const profileNumber=p=>p.reduce((n,r,i)=>n+orders.findIndex(x=>x.join()===r.join())*6**i,0);
export function relationCheck(R){const n=R.length,missing=[],violations=[];for(let a=0;a<n;a++)for(let b=0;b<n;b++){if(!R[a][b]&&!R[b][a])missing.push([a,b]);for(let c=0;c<n;c++)if(R[a][b]&&R[b][c]&&!R[a][c])violations.push([a,b,c]);}return {complete:!missing.length,transitive:!violations.length,missing,violations};}
export function formation(mode='value',b=2,w=.5){const points=[[2,1],[b,3],[1,4]],scores=points.map(([x,y])=>mode==='distance'?-Math.hypot(x-2,y-3):w*x+(1-w)*y),ranks=[[0,1,2],[1,2,0],[2,0,1]];
 const R=points.map((a,i)=>points.map((z,j)=>i===j||mode==='majority'?i===j||ranks.filter(r=>r.indexOf(i)<r.indexOf(j)).length>=2:mode==='unanimity'?a[0]>=z[0]&&a[1]>=z[1]:mode==='lex'?a[0]>z[0]||a[0]===z[0]&&a[1]>=z[1]:scores[i]>=scores[j]-1e-10));return {points,scores,R,...relationCheck(R)};}
export const pairs=[[0,1],[1,2],[0,2]];
export function experiment(answers=[0,1,1]){const R=Array.from({length:3},(_,i)=>Array.from({length:3},(_,j)=>i===j));pairs.forEach(([a,b],i)=>{R[a][b]=answers[i]>=0;R[b][a]=answers[i]<=0});return {R,...relationCheck(R)};}
export const employment=[0,50,65,100,144,170,196],profits=[-8,1,1.5,2,1.6,1,.4];
export function producerGoals(lambda=0){const scores=employment.map((n,i)=>profits[i]-lambda*(196-n)),best=Math.max(...scores),chosen=scores.flatMap((v,i)=>Math.abs(v-best)<1e-9?[i]:[]),dominated=employment.map((n,i)=>employment.some((m,j)=>m>=n&&profits[j]>=profits[i]&&(m>n||profits[j]>profits[i])));return {scores,chosen,dominated};}
export function housing(profile,indifferent=false){const prices=Array.from({length:27},(_,i)=>[1+i%3,1+Math.floor(i/3)%3,1+Math.floor(i/9)]),allocations=orders,equilibria=[];
 const check=(a,p)=>a.map((h,i)=>({affordable:p[h]<=p[i],better:indifferent?[]:profile[i].filter(x=>p[x]<=p[i]&&profile[i].indexOf(x)<profile[i].indexOf(h))}));
 for(let k=0;k<prices.length;k++)for(let j=0;j<allocations.length;j++)if(check(allocations[j],prices[k]).every(x=>x.affordable&&!x.better.length))equilibria.push({priceIndex:k,allocationIndex:j});
 const allocationKeys=[...new Set(equilibria.map(e=>e.allocationIndex))],trace=[],remaining=new Set([0,1,2]);let result=[-1,-1,-1];
 while(remaining.size){const pointer=Object.fromEntries([...remaining].map(i=>[i,profile[i].find(h=>remaining.has(h))]));let v=[...remaining][0],path=[];while(!path.includes(v)){path.push(v);v=pointer[v]}const cycle=path.slice(path.indexOf(v));cycle.forEach(i=>result[i]=pointer[i]);trace.push({cycle,pointer:{...pointer},remaining:[...remaining],result:[...result]});cycle.forEach(i=>remaining.delete(i));}
 return {prices,allocations,equilibria,allocationKeys,trace,ttc:result,check};}
export function aggregate(profile,rule='borda',weights=[2,1,0],dictator=0){
 const counts=Array.from({length:3},(_,a)=>Array.from({length:3},(_,b)=>a===b?profile.length:profile.filter(r=>r.indexOf(a)<r.indexOf(b)).length));
 const score=[0,1,2].map(a=>rule==='external'?2-a:rule==='dictator'?2-profile[dictator].indexOf(a):rule==='plurality'?profile.filter(r=>r[0]===a).length:rule==='copeland'?[0,1,2].filter(b=>b!==a).reduce((s,b)=>s+(counts[a][b]>counts[b][a]?1:counts[a][b]===counts[b][a]?.5:0),0):profile.reduce((s,r)=>s+weights[r.indexOf(a)],0));
 const R=counts.map((row,a)=>row.map((v,b)=>rule==='majority'?v>=counts[b][a]:score[a]>=score[b]-1e-9));return {score,counts,R,...relationCheck(R)};
}
const clone=p=>p.map(r=>[...r]),relationSign=(R,a,b)=>+R[a][b]-+R[b][a];
const auditCache=new Map();
export function aggregationAudit(rule='borda',weights=[2,1,0],dictator=0){const key=[rule,...weights,dictator].join();if(auditCache.has(key))return auditCache.get(key);
 const witnesses={preference:null,neutrality:null,anonymity:null,responsive:null,pareto:null,iia:null},binary=new Map();
 const put=(k,v)=>{if(!witnesses[k])witnesses[k]=v};
 for(const p of allProfiles){const r=aggregate(p,rule,weights,dictator);if(!r.transitive)put('preference',{before:p,violations:r.violations});
  const swappedNames=p.map(row=>row.map(x=>x===0?1:x===1?0:2)),swappedPeople=[p[1],p[0],p[2]],rn=aggregate(swappedNames,rule,weights,dictator),ra=aggregate(swappedPeople,rule,weights,dictator);
  if(r.R.some((row,a)=>row.some((v,b)=>v!==rn.R[a===0?1:a===1?0:2][b===0?1:b===1?0:2])))put('neutrality',{before:p,after:swappedNames});
  if(JSON.stringify(r.R)!==JSON.stringify(ra.R))put('anonymity',{before:p,after:swappedPeople});
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){if(a===b)continue;
   if(p.every(row=>row.indexOf(a)<row.indexOf(b))&&relationSign(r.R,a,b)!==1)put('pareto',{before:p,pair:[a,b]});
   const k=a+','+b+':'+p.map(row=>+(row.indexOf(a)<row.indexOf(b))).join(''),sign=relationSign(r.R,a,b);const old=binary.get(k);if(old&&old.sign!==sign)put('iia',{before:old.profile,after:p,pair:[a,b]});else if(!old)binary.set(k,{profile:p,sign});
  }
  for(let who=0;who<3;who++)for(let pos=1;pos<3;pos++){const next=clone(p),x=next[who][pos];[next[who][pos-1],next[who][pos]]=[next[who][pos],next[who][pos-1]];const z=aggregate(next,rule,weights,dictator);for(let other=0;other<3;other++)if(other!==x&&r.R[x][other]&&relationSign(z.R,x,other)!==1)put('responsive',{before:p,after:next,pair:[x,other],who});}
 }
 const out={witnesses,profiles:216};auditCache.set(key,out);return out;
}
export function socialWinner(profile,rule='plurality'){if(rule==='constant')return 0;if(rule==='dictator')return profile[0][0];const score=aggregate(profile,rule).score,max=Math.max(...score);return score.findIndex(x=>x===max);}
export function manipulation(profile,who,report,rule){const before=socialWinner(profile,rule),changed=clone(profile);changed[who]=report;const after=socialWinner(changed,rule);return {before,after,changed,improved:profile[who].indexOf(after)<profile[who].indexOf(before)};}
const manipulationCache=new Map();
export function manipulationAudit(rule){if(manipulationCache.has(rule))return manipulationCache.get(rule);let witness=null,unanimity=null;for(const p of allProfiles){const chosen=socialWinner(p,rule);if(p.every(r=>r[0]===p[0][0])&&chosen!==p[0][0])unanimity={profile:p,chosen};for(let who=0;who<3;who++)for(const report of orders){const r=manipulation(p,who,report,rule);if(r.improved&&!witness)witness={profile:p,who,report,...r};}}const out={witness,unanimity,profiles:216};manipulationCache.set(rule,out);return out;}
export const arrowSteps=[
 ['前提','至少三个方案、所有严格个人排序都可输入；社会输出必须完备且传递，并满足Pareto与IIA。'],
 ['极端位置','固定方案b。若每个人都把b放在首位或末位，则社会也必须把b唯一置顶或置底。假设a≽b≽c，保持与b的比较，把所有人的c抬到a之上：Pareto给c≻a，IIA保留a≽b≽c，传递性产生矛盾。'],
 ['只看谁支持b','首尾位置相同的人群对应相同的b与其他方案的成对比较。IIA保证b的社会首尾位置不依赖其余方案之间的排序。'],
 ['找到关键个人','从所有人把b置底开始，依次将一个人的b移到首位。Pareto保证社会从置底变为置顶；第一个引发跳变的个人i*就是关键个人，其身份不依赖其他方案的排序。'],
 ['控制其余成对比较','对a、c≠b，把i*的排序改为a≻b≻c；前面的人把b置顶，后面的人置底。关键个人两侧的门槛与IIA给a≻b、b≻c，所以a≻c；再用IIA带回原输入。'],
 ['扩展到含b的比较','再取第三方案c，让i*排a≻c≻b，其他人将c置顶。上一步给a≻c，Pareto给c≻b，传递性给a≻b；IIA带回原输入。由此i*决定所有成对排序。']
];
export const gsSteps=[
 ['前提','确定性规则在全部严格排序上选出一个方案，至少三个方案，满足一致同意与防策略操纵。'],
 ['抬高一个方案','若原先选x，只把某人的y抬高，新结果只能是x或y；否则在变化前或变化后至少有一方能靠反向报告严格获益。'],
 ['共同前二','若所有人共同把x、y放在前二，结果必在{x,y}。否则从这种反例中取支持x人数最多的一个，仍把y排前的人可改报x在前而获益，违背防操纵。'],
 ['前二顺序决定结果','保持每个人对x、y的顺序，改变更低方案的位置。由前两步，获选方案不能换成更低方案，也不能无理由从x变成y。'],
 ['构造社会排序','对任意x、y，把它们抬到每个人前二并保留相对次序；若规则选x，就定义社会x≽y。前面步骤保证成对关系完备、反对称，并排除三项循环，得到传递性。'],
 ['调用Arrow','构造出的偏好汇总函数满足Pareto与IIA，因而存在同一位独裁者i*。'],
 ['回到原选择','若原规则选x，将任意y与x抬至前二，选中结果仍是x；故i*对每个y都偏好x。原规则始终选i*的首选，得到定理。']
];
