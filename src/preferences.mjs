// Chapter 4, Osborne–Rubinstein 2020.12.21(h), printed pp.45–56.
// Pure model functions; visual examples never stand in for global proofs.
const near=(a,b)=>Math.abs(a-b)<1e-9;
export function prefU(kind,x,y,v=1.3){
 if(kind==='linear')return v*x+y;
 if(kind==='neutral')return y;
 if(kind==='threshold')return x<=10?x:11+y;
 if(kind==='min')return Math.min(x,y);
 if(kind==='ideal')return -(Math.abs(x-5)+Math.abs(y-5));
 if(kind==='max')return Math.max(x,y);
 if(kind==='bad')return x-y;
 if(kind==='log')return Math.log1p(x)+Math.log1p(y);
 if(kind==='quasi')return y+Math.sqrt(x);
 if(kind==='distance')return Math.hypot(x,y);
 if(kind==='balanced')return near(x,y)?1+x/(1+x):y/(1+y);
 if(kind==='product')return x*y;
 if(kind==='minSquared')return Math.min(x,y)**2;
 return null;
}
export function compareP(kind,a,b,v=1.3){
 if(kind==='lex'||kind==='sumlex'){
  const first=z=>kind==='lex'?z[0]:z[0]+z[1],x=first(a)-first(b);
  const tie=kind==='lex'?1:0;
  return x>1e-9?1:x< -1e-9?-1:a[tie]>b[tie]+1e-9?1:a[tie]<b[tie]-1e-9?-1:0;
 }
 const d=prefU(kind,...a,v)-prefU(kind,...b,v);return d>1e-9?1:d< -1e-9?-1:0;
}
export const blend=(a,b,t)=>a.map((z,i)=>t*z+(1-t)*b[i]);
export const monotoneTable={linear:[true,true],neutral:[true,false],threshold:[true,false],min:[true,false],ideal:[false,false],lex:[true,true]};
export const caseSections={
 '4.1':['bundle'],
 '4.2':['examples'],
 '4.3':['monotone'],
 '4.4':['continuity','continuityproof','intermediate'],
 '4.5':['convex','upper','concave','declining'],
 '4.6':['local','partial','problems1','problems2','problems3','problems4','problems5','problems6','problems7']
};
export const caseNames={bundle:'定义4.1 · 商品束与凸组合',examples:'例4.1—4.6 · 六种无差异集',monotone:'定义4.2—4.3 · 单调与强单调',continuity:'定义4.4 · 字典序的任意小反例',continuityproof:'命题4.1 · 连续效用的三段间隙',intermediate:'§4.4 · 连续偏好的中间束',convex:'定义4.5 · 整段混合与严格凸',upper:'命题4.2 · 上优集的双向证明',concave:'命题4.3 · 凹函数足够但非必要',declining:'§4.5 · 两段交换率为什么下降',local:'定义4.6 · 局部估值与折点',partial:'命题4.4 · 偏导数与局部方向',problems1:'习题4.1 · 三种偏好性质',problems2:'习题4.2 · 三种效用函数',problems3:'习题4.3 · 对角线上找无差异束',problems4:'习题4.4 · 拟线性曲线平移',problems5:'习题4.5 · min的凸性',problems6:'习题4.6 · 理想点的连续与凸',problems7:'习题4.7 · 相对更偏爱商品1'};
export function monotoneWitness(kind){
 const [weak,strong]=monotoneTable[kind];
 const base=kind==='ideal'?[5,5]:kind==='threshold'?[11,2]:[2,2];
 const larger=kind==='ideal'?[6,5]:kind==='threshold'?[12,2]:kind==='neutral'?[3,2]:kind==='min'?[3,2]:[3,2];
 return {base,larger,comparison:compareP(kind,larger,base),weak,strong};
}
export function lexContinuity(e=.5){const x=[1,2],y=[1,0],a=[1-e/2,2];return {x,y,a,distance:e/2,first:compareP('lex',x,y),reversed:compareP('lex',a,y)};}
export function utilityGap(step=0){const x=[5,5],y=[2,2],ux=prefU('linear',...x,1),uy=prefU('linear',...y,1),gap=ux-uy,third=gap/3,delta=.9;
 const a=[x[0]-delta*step,x[1]-delta*step],b=[y[0]+delta*step,y[1]+delta*step];return {x,y,a,b,ux,uy,third,ua:prefU('linear',...a,1),ub:prefU('linear',...b,1)};}
export function intermediateP(t=.5){const a=[8,8],c=[1,1],b=[4,5],target=prefU('product',...b),z=blend(a,c,t),root=(Math.sqrt(target)-1)/7;return {a,b,c,z,t,root,uz:prefU('product',...z),target};}
export function convexP(kind='min',t=.5){const a=kind==='lex'?[6,2]:kind==='max'?[6,1]:kind==='ideal'?[3,7]:[3,8],b=kind==='lex'?[2,6]:kind==='max'?[1,6]:kind==='ideal'?[7,3]:[8,3],z=blend(a,b,t);return {a,b,z,t,ua:prefU(kind,...a),ub:prefU(kind,...b),uz:prefU(kind,...z),zVersusB:compareP(kind,z,b),zVersusA:compareP(kind,z,a)};}
export function diminishingP(){const a=[10,10],b=[11,100/11],c=[12,100/12],beta=a[1]-b[1],gamma=b[1]-c[1],middle=blend(a,c,.5);return {a,b,c,beta,gamma,middle,umiddle:prefU('product',...middle),ub:100};}
export function localP(dx=1,dy=-.6,t=.2){const z=[4,4],q=[z[0]+t*dx,z[1]+t*dy],dot=4*(dx+dy),kinkDot=dx+dy;return {z,q,dot,kinkDot,productGain:prefU('product',...q)-16,minGain:prefU('min',...q)-4};}
export function problem1P(kind='distance',t=.5){let a,b;
 if(kind==='distance'){a=[6,0],b=[0,6]}
 else if(kind==='balanced'){a=[2,2];b=[0,10]}
 else {a=[6,2];b=[2,6]}
 const z=blend(a,b,t);return {a,b,z,ab:compareP(kind,a,b),zb:compareP(kind,z,b),za:compareP(kind,z,a)};
}
export function relativeP(alpha=1,beta=1.5){const a=[5,5],b=[5-alpha,5+beta],A=compareP('linear',b,a,2),B=compareP('linear',b,a,1);return {a,b,A,B,deltaA:beta-2*alpha,deltaB:beta-alpha,lex:compareP('lex',b,a)};}
