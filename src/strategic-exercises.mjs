// Original models for Osborne--Rubinstein ch15 problems, printed241--246.
export const exercise15Cases={
 p151:{section:'15.1',label:'习题15.1 · 100步蜈蚣的战略式',page:241,kind:'centipede'},
 p152a:{section:'15.2',label:'习题15.2(a) · 超额需求均归零',page:242,kind:'demand'},
 p152b:{section:'15.2',label:'习题15.2(b) · 小需求优先',page:242,kind:'demand-priority'},
 p153:{section:'15.2',label:'习题15.3 · 连续时间消耗战',page:242,kind:'attrition'},
 p154:{section:'15.2',label:'习题15.4 · 多人清洁困境',page:243,kind:'clean'},
 p155:{section:'15.2',label:'习题15.5 · 猜平均数的三分之二',page:243,kind:'guess'},
 p156:{section:'15.2',label:'习题15.6 · 廉价沟通的完整计划',page:243,kind:'cheap'},
 p157:{section:'15.3',label:'习题15.7 · 军备投入',page:243,kind:'war'},
 p158:{section:'15.3',label:'习题15.8 · 全支付拍卖',page:243,kind:'allpay'},
 p159:{section:'15.3',label:'习题15.9 · 候选人选址',page:244,kind:'location'},
 p1510a:{section:'15.3',label:'习题15.10(a) · 对称需求与零成交角点',page:244,kind:'smooth-demand'},
 p1510b:{section:'15.3',label:'习题15.10(b) · 接近硬门槛的极限',page:244,kind:'demand-limit'},
 p1511:{section:'15.3',label:'习题15.11 · 公共项目贡献',page:244,kind:'contribution'},
 p1512:{section:'15.6',label:'习题15.12 · 价格的同比变化',page:244,kind:'kantian-price'},
 p1513a:{section:'15.5',label:'习题15.13(a) · 严格竞争与保底值',page:245,kind:'competitive'},
 p1513b:{section:'15.5',label:'习题15.13(b) · 提高一格收益的反例',page:245,kind:'comparative'},
 p1514:{section:'15.7',label:'习题15.14 · 两行三列的混合均衡族',page:245,kind:'mixed23'},
 p1515:{section:'15.7',label:'习题15.15 · 鹰鸽与冲突成本',page:245,kind:'hawk'},
 p1516a:{section:'15.7',label:'习题15.16(a) · 攻防收益矩阵',page:245,kind:'attack'},
 p1516b:{section:'15.7',label:'习题15.16(b) · 前两个目标必须受攻击',page:246,kind:'attack'},
 p1516c:{section:'15.7',label:'习题15.16(c) · 第三个目标的进入门槛',page:246,kind:'attack'},
 p1517:{section:'15.8',label:'习题15.17 · 委员会的参与概率',page:246,kind:'committee'},
 p1518:{section:'15.7',label:'习题15.18 · O’Neill四张牌',page:246,kind:'oneill'}
};
export const p15Sum=a=>a.reduce((a,b)=>a+b,0);
export function p15Centipede(a,b,T=50){let pay=[0,0];for(let t=0;t<2*T;t++){const i=t%2;if(Math.floor(t/2)>=[a,b][i])return pay;pay=pay.map((v,j)=>v+(j===i?-1:2))}return pay}
export function p15Demand(a,b,priority=false){if(a+b<=10)return[a,b];if(!priority)return[0,0];return a===b?[5,5]:a<b?[a,10-a]:[10-b,b]}
export function p15Finite(kind,delta=0){
 let rows=[],cols=[],pay;
 if(kind==='centipede'){rows=cols=Array.from({length:51},(_,i)=>String(i));pay=(i,j)=>p15Centipede(i,j)}
 if(kind==='demand'||kind==='demand-priority'){rows=cols=Array.from({length:11},(_,i)=>String(i));pay=(i,j)=>p15Demand(i,j,kind==='demand-priority')}
 if(kind==='cheap'){
  rows=['说B/去B','说B/去S','说S/去B','说S/去S'];cols=['B后B/S后B','B后B/S后S','B后S/S后B','B后S/S后S'];
  pay=(i,j)=>{const msg=Math.floor(i/2),act=i%2,response=msg===0?Math.floor(j/2):j%2;return act===response?(act===0?[2,1]:[1,2]):[0,0]};
 }
 if(kind==='competitive'){rows=['T','B'];cols=['L','R'];const M=[[[0,3],[2,1]],[[1+delta,2],[3,0]]];pay=(i,j)=>M[i][j]}
 if(kind==='comparative'){rows=['T','B'];cols=['L','R'];const M=[[[1,1],[2+delta,0]],[[0,0],[3,1]]];pay=(i,j)=>M[i][j]}
 if(!pay)throw Error('unknown finite exercise '+kind);
 const M=rows.map((_,i)=>cols.map((_,j)=>pay(i,j))),ne=[];
 for(let i=0;i<rows.length;i++)for(let j=0;j<cols.length;j++)if(M.every(r=>r[j][0]<=M[i][j][0]+1e-9)&&M[i].every(x=>x[1]<=M[i][j][1]+1e-9))ne.push([i,j]);
 return{rows,cols,M,ne};
}
export function p15Mixed(M,p,q){const row=M.map(r=>p15Sum(r.map((v,j)=>v[0]*q[j]))),col=q.map((_,j)=>p15Sum(M.map((r,i)=>r[j][1]*p[i]))),u=[p15Sum(row.map((v,i)=>v*p[i])),p15Sum(col.map((v,j)=>v*q[j]))];return{row,col,u,gains:[Math.max(...row)-u[0],Math.max(...col)-u[1]]}}
export function p15Pay(kind,a,b,z=4,w=z){
 if(kind==='attrition')return a<b?[-a,w-a]:a>b?[z-b,-b]:[z/2-a,w/2-b];
 if(kind==='war')return a+b===0?[z/2,z/2]:[z*a/(a+b)-a,z*b/(a+b)-b];
 if(kind==='allpay')return a===b?[z/2-a,w/2-b]:a>b?[z-a,-b]:[-a,w-b];
 if(kind==='location'){const shares=a===b?[.5,.5]:a<b?[(a+b)/2,1-(a+b)/2]:[1-(a+b)/2,(a+b)/2];return shares.map(v=>Math.abs(v-.5)<1e-9?0:v>.5?1:-1)}
 if(kind==='smooth-demand'){const g=Math.max(0,1-a-b)**z;return[a*g,b*g]}
 if(kind==='contribution')return[2*Math.log(1+a+b)-a,z*Math.log(1+a+b)-b];
 if(kind==='kantian-price'){const profit=p=>p*Math.max(0,1-p);return a===b?[profit(a)/2,profit(b)/2]:a<b?[profit(a),0]:[0,profit(b)]}
 throw Error('unknown continuous exercise '+kind);
}
export function p15Taper(s,epsilon){if(s<=1-epsilon)return 1;if(s>=1)return 0;const r=(s-1+epsilon)/epsilon;return(1-r)**2*(1+2*r)}
export function p15TaperEq(epsilon){let lo=0,hi=1;for(let k=0;k<70;k++){const r=(lo+hi)/2,s=1-epsilon+epsilon*r,g=(1-r)**2*(1+2*r),dg=-6*r*(1-r)/epsilon;if(g+s/2*dg>0)lo=r;else hi=r}return(1-epsilon+epsilon*(lo+hi)/2)/2}
export function p15GuessBounds(){const a=[100];while(a.at(-1)>1)a.push(Math.floor(2*a.at(-1)/3+.5));return a}
export function p15GuessPay(reports){const target=2*p15Sum(reports)/(3*reports.length),nearest=Array.from({length:100},(_,i)=>i+1).filter(v=>Math.abs(v-target)<=Math.min(Math.abs(Math.floor(target)-target),Math.abs(Math.ceil(target)-target))+1e-9);return{target,winners:reports.map(v=>nearest.includes(v)?1:0),nearest}}
export function p15Attack(values=[6,4,1]){
 const threshold=values[0]*values[1]/(values[0]+values[1]),active=values[2]<=threshold?2:3,D=p15Sum(values.slice(0,active).map(v=>1/v)),value=(active-1)/D,p=values.map((v,i)=>i<active?1/v/D:0),q=values.map((v,i)=>i<active?1-value/v:0),M=values.map((v,i)=>values.map((_,j)=>[i===j?0:v,i===j?0:-v]));
 return{threshold,active,value,p,q,M,audit:p15Mixed(M,p,q)};
}
export function p15Committee(c=.25){if(c<=0){const q=c<0?1:0;return{p:1,q,PA:1,payoffs:[1-c,1-c,-c*q],attendance:[1,1,q],indifference:[q/2-c,-c]}}const p=Math.sqrt(1-2*c),q=1-p,PA=p*(1+c);return{p,q,PA,payoffs:[p,p,1-c-p],attendance:[p,p,q],indifference:[.5*(1-p+p*q)-c,.5*(1-p*p)-c]}}
export const p15Matrix23=[[[2,2],[0,3],[2,2]],[[3,0],[1,1],[2,2]]];
export function p15Hawk(c){return [[[-c,-c],[1,0]],[[0,1],[.5,.5]]]}
export const p15Oneill=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>{const win=+(i===3&&j===3||i<3&&j<3&&i!==j);return[win,1-win]}));
