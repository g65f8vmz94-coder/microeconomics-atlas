export const exercise5Cases={
 p51:{section:'5.3',page:71,label:'习题5.1 · 字典序仍有最优需求',kind:'lex'},
 p52:{section:'5.4',page:71,label:'习题5.2 · CD支出份额',kind:'cd'},
 p53:{section:'5.5',page:71,label:'习题5.3 · 平方根效用理性化',kind:'sqrt'},
 p54:{section:'5.5',page:72,label:'习题5.4 · 垂直射线与WARP反例',kind:'orthogonal'},
 p55a:{section:'5.6',page:72,label:'习题5.5(a) · 支出随价格弱增',kind:'expenditure'},
 p55b:{section:'5.6',page:72,label:'习题5.5(b) · 支出一次齐次',kind:'homogeneity'},
 p56:{section:'5.5',page:72,label:'习题5.6 · 10单位上限与折点',kind:'cap'},
 p57a:{section:'5.4',page:73,label:'习题5.7(a) · 食物、货币与全部最优解',kind:'food'},
 p57b:{section:'5.6',page:73,label:'习题5.7(b) · 食物需求不随价格上升',kind:'food-price'},
 p58a:{section:'5.6',page:73,label:'习题5.8(a) · 借款者与利率上升',kind:'borrow'},
 p58b:{section:'5.6',page:73,label:'习题5.8(b) · 出借者不会转为借款者',kind:'lend'},
 p59a:{section:'5.4',page:73,label:'习题5.9(a) · 时间中性与对称切线',kind:'neutral'},
 p59b:{section:'5.4',page:74,label:'习题5.9(b) · 当期偏向不必有MRS>1',kind:'present'},
 p59c:{section:'5.6',page:74,label:'习题5.9(c) · 非正利率与交换论证',kind:'swap'}
};
export const p5Dot=(p,x)=>p.reduce((v,a,i)=>v+a*x[i],0);
export function p5Utility(kind,x,y,a=.5){
 if(kind==='cd')return Math.max(0,x)**a*Math.max(0,y)**(1-a);
 if(kind==='sqrt')return Math.sqrt(Math.max(0,x))+Math.sqrt(Math.max(0,y));
 if(kind==='linear')return x+y;
 if(kind==='complement')return Math.min(x,y);
 if(kind==='cap')return Math.min(x,10)*y;
 if(kind==='weak-cap')return Math.min(x,10)+.2*y;
 throw Error('unknown utility '+kind);
}
export function p5Demand(kind,p=1,q=1,w=12,a=.5){
 if(kind==='lex')return[w/p,0];
 if(kind==='cd')return[a*w/p,(1-a)*w/q];
 if(kind==='sqrt')return[w*q/(p*(p+q)),w*p/(q*(p+q))];
 if(kind==='orthogonal')return[w*p/(p*p+q*q),w*q/(p*p+q*q)];
 if(kind==='cap'){const x=Math.min(10,w/(2*p));return[x,(w-p*x)/q]}
 if(kind==='weak-cap'){const x=p<5*q?Math.min(10,w/p):0;return[x,(w-p*x)/q]}
 throw Error('unknown demand '+kind);
}
export function p5Orthogonal(p=1,q=2,w=5){const A=p5Demand('orthogonal',p,q,w),B=p5Demand('orthogonal',q,p,w),cross=[p5Dot([p,q],B),p5Dot([q,p],A)];return{A,B,cross,violation:w>0&&Math.abs(p-q)>1e-9,gap:w-cross[0]}}
export function p5Hicks(kind,p=1,q=1,reference=[2,2]){
 const u=p5Utility(kind,...reference),h=kind==='cd'?[u*Math.sqrt(q/p),u*Math.sqrt(p/q)]:kind==='complement'?[u,u]:p<q?[u,0]:p>q?[0,u]:[u/2,u/2];return{h,e:p5Dot([p,q],h),u,reference};
}
export function p5FoodV(kind,z,a=4){return kind==='linear'?a*z:kind==='exp'?a*(-Math.expm1(-z)):a*Math.log1p(z)}
export function p5FoodMarginal(kind,z,a=4){return kind==='linear'?a:kind==='exp'?a*Math.exp(-z):a/(1+z)}
export function p5Food(kind='log',price=2,M=12,a=4,tie=.5){
 const upper=M/price;let lo,hi;
 if(kind==='linear'){if(Math.abs(a-price)<1e-9){lo=0;hi=upper}else lo=hi=a>price?upper:0}
 else lo=hi=Math.min(upper,Math.max(0,kind==='exp'?Math.log(a/price):a/price-1));
 const z=lo+(hi-lo)*tie,m=M-price*z;return{z,m,interval:[lo,hi],upper,u:m+p5FoodV(kind,z,a),marginal:p5FoodMarginal(kind,z,a),regime:hi>lo?'整段最优':z===0?'不买食物':z===upper?'货币为零':'内点'};
}
export function p5Intertemporal(r=.1,y=5,a=.65,kind='cd'){
 const p=1+r,w=(2+r)*y;if(p<=0)throw RangeError('plot model requires positive gross interest');const bundle=p5Demand(kind,p,1,w,a);return{r,y,p,w,bundle,borrow:bundle[0]-y,save:y-bundle[0]};
}
export function p5Borrow(r0=.1,r1=1.1,y=5,a=.65,kind='cd'){
 const A=p5Intertemporal(r0,y,a,kind),B=p5Intertemporal(r1,y,a,kind),compensatedWealth=p5Dot([B.p,1],A.bundle),C=p5Demand(kind,B.p,1,compensatedWealth,a);return{A,B,C,compensatedWealth,wealthGap:compensatedWealth-B.w,initiallyBorrows:A.borrow>1e-9,initiallyLends:A.save>1e-9};
}
// A smooth, increasing, concave and strictly present-biased utility whose MRS
// on every diagonal point is EXACTLY1. Perspective f(z)=1-.12z^2+.02z^3.
export function p5TimeUtility(kind,x,y,theta=2){
 if(kind!=='cubic')return(kind==='neutral'?1:theta)*Math.log1p(x)+Math.log1p(y);
 const S=1+x+y,D=x-y;return S*(1-.12*(D/S)**2+.02*(D/S)**3)-1;
}
export function p5TimeGradient(kind,x,y,theta=2){
 if(kind!=='cubic')return[(kind==='neutral'?1:theta)/(1+x),1/(1+y)];
 const S=1+x+y,z=(x-y)/S,f=1-.12*z*z+.02*z*z*z,df=-.24*z+.06*z*z;return[f+(1-z)*df,f-(1+z)*df];
}
export function p5TimeDemand(kind,r=0,y=5,theta=2){
 const p=1+r,w=(2+r)*y,upper=w/p;if(p<=0)throw RangeError('positive gross interest required for finite diagram');let x;
 if(kind!=='cubic'){const t=kind==='neutral'?1:theta;x=Math.max(0,Math.min(upper,(t*(1+w)-p)/(p*(t+1))))}
 else{const derivative=z=>{const g=p5TimeGradient(kind,z,w-p*z);return g[0]-p*g[1]};if(derivative(0)<=0)x=0;else if(derivative(upper)>=0)x=upper;else{let lo=0,hi=upper;for(let i=0;i<70;i++){const m=(lo+hi)/2;if(derivative(m)>0)lo=m;else hi=m}x=(lo+hi)/2}}
 return[x,w-p*x];
}
export function p5TimeSwap(r=0,y=5,fraction=.4,kind='weighted',theta=2){const p=1+r,w=(2+r)*y,A=[fraction*y,w-p*fraction*y],B=[A[1],A[0]],costs=[p5Dot([p,1],A),p5Dot([p,1],B)];return{A,B,p,w,costs,slack:w-costs[1],utilityGain:p5TimeUtility(kind,...B,theta)-p5TimeUtility(kind,...A,theta)}}
