// Osborne–Rubinstein, Models in Microeconomic Theory (2020.12.21 h), Ch.3, printed pp.31–43.
// Source hypotheses and omitted monotonicity/domain assumptions are stated next to their cases.
export const caseSections={
 '3.1':['lottery','simplex'],
 '3.2':['pessimist','goodbad','support','continuity','compound','independence','monotonic'],
 '3.3':['eu','euimplies','eurep','affine'],
 '3.4':['allais'],
 '3.5':['risk','jensen','p1','p2','p3','p4','p5','p7','p8','p9']
};
export const caseNames={
 lottery:'定义3.1 · 彩票与支撑集',simplex:'图3.1 · 概率线段与三角形',
 pessimist:'例3.1 · 悲观者',goodbad:'例3.2 · 好与坏',support:'例3.3 · 最少备选',continuity:'定义3.2 · 连续性',compound:'定义3.3 · 复合彩票',independence:'定义3.4 · 独立性',monotonic:'引理3.1 · 独立性推出单调',
 eu:'定义3.5 · 期望效用',euimplies:'命题3.1 · 期望效用的性质',eurep:'命题3.2 · 期望效用表示',affine:'§3.3 · 伯努利数的正仿射变换',allais:'§3.4 · Allais 实验',
 risk:'定义3.6 · 风险厌恶与中性',jensen:'命题3.3 · 凹性与风险厌恶',
 p1:'习题3.1 · 最可能奖品的概率',p2:'习题3.2 · 公平抛硬币的父母',p3:'习题3.3 · 按众数奖品比较',p4:'习题3.4 · 两种奖品的三类偏好',p5:'习题3.5 · 简单彩票 A1/A2',p7:'习题3.7 · 额外公平风险',p8:'习题3.8 · 赌场下注',p9:'习题3.9 · 公平与非公平保险'
};
export const sum=xs=>xs.reduce((a,b)=>a+b,0);
export function lottery(ps){if(!ps.length||ps.some(x=>!Number.isFinite(x)||x<0)||Math.abs(sum(ps)-1)>1e-9)throw Error('概率必须非负且总和为1');return ps}
export const support=ps=>ps.map((p,i)=>p>0?i:-1).filter(i=>i>=0);
export const mixture=(a,p,q)=>{if(a<0||a>1||p.length!==q.length)throw Error('混合权重/奖品维度无效');return lottery(p.map((x,i)=>a*x+(1-a)*q[i]))};
export const expected=(p,v)=>{if(p.length!==v.length)throw Error('维度不同');return sum(p.map((x,i)=>x*v[i]))};
export const worstPrize=(p,values)=>Math.min(...support(p).map(i=>values[i]));
export const goodMass=(p,good)=>sum(p.filter((_,i)=>good.includes(i)));
export const supportSize=p=>support(p).length;
export const modeProbability=p=>Math.max(...p);
export const modePrizes=p=>p.map((v,i)=>Math.abs(v-modeProbability(p))<1e-10?i:-1).filter(i=>i>=0);
export function continuityWeight(a,b,c){if(!(a>b&&b>c))throw Error('须有 a>b>c');return (b-c)/(a-c)}
export const textbookCompound={p:[.6,0,.4],q:[.2,.3,.5]};
export const compound=a=>mixture(a,textbookCompound.p,textbookCompound.q);
export const allais={L1:[.8,0,.2],R1:[.75,.25,0],L2:[.2,0,.8],R2:[0,1,0],prizes:[0,3000,4000],responses:{L1L2:20,L1R2:44,R1L2:5,R1R2:31}};
export const powerUtility=(x,gamma)=>{if(x<0||gamma<=0)throw Error('非负财富且正指数');return x**gamma};
export function riskMeasures(low,high,pHigh,gamma){
 if(low<0||high<low||pHigh<0||pHigh>1)throw Error('奖金/概率无效');
 const mean=(1-pHigh)*low+pHigh*high,eu=(1-pHigh)*powerUtility(low,gamma)+pHigh*powerUtility(high,gamma),certain=eu**(1/gamma);
 return {mean,eu,certain,premium:mean-certain,jensenGap:powerUtility(mean,gamma)-eu};
}
export function maximize(f,lo,hi){
 let a=lo,b=hi;for(let i=0;i<90;i++){const c=a+(b-a)*.38196601125,d=b-(b-a)*.38196601125;if(f(c)<f(d))a=c;else b=d}
 const candidates=[lo,hi,(a+b)/2];return candidates.reduce((x,y)=>f(y)>f(x)?y:x,lo);
}
export function casino(w,alpha,gamma=.5){
 if(w<=0||alpha<0||alpha>1)throw Error('财富/概率无效');
 const value=x=>alpha*powerUtility(w+2*x,gamma)+(1-alpha)*powerUtility(w-x,gamma);
 const choice=maximize(value,0,w);
 return {choice,value:value(choice),win:w+2*choice,lose:w-choice};
}
export function casinoDecreasing(w,alpha){
 if(w<=0||alpha<0||alpha>1)throw Error('财富/概率无效');
 return Math.max(0,Math.min(w,w*(1-3*alpha)/(1+3*alpha)));
}
export function insurance(w,D,p,lambda,gamma=.5){
 if(w<D||D<=0||p<=0||p>=1||lambda<=0)throw Error('财富/损失/概率/赔付无效');
 const maxX=w,wealth=x=>({no:w-x,yes:w-D-x+lambda*x}),value=x=>{const z=wealth(x);if(z.no<0||z.yes<0)return -Infinity;return (1-p)*powerUtility(z.no,gamma)+p*powerUtility(z.yes,gamma)};
 const choice=maximize(value,0,maxX);return {choice,wealth:wealth(choice),value:value(choice),fair:Math.abs(p*lambda-1)<1e-9,full:D/lambda};
}
export const insuranceDecreasingCounterexample={w:10,D:2,p:.2,lambda:4,choice:16/13,coverage:64/13};
export function simpleLotteryScore(kind,alpha,prize){
 if(alpha<0||alpha>1)throw Error('概率无效');
 if(kind==='A1-not-A2')return prize==='x'?alpha:2*alpha*alpha;
 if(kind==='A2-not-A1')return alpha===0?0:(prize==='x'?2:1)+alpha/10;
 throw Error('未知示例');
}
