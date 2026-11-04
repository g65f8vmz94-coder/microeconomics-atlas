export const exercise10Cases={
 p101a:{section:'10.9',page:152,label:'习题10.1(a) · 线性与互补：均衡、核心',kind:'linear-complement'},
 p101b:{section:'10.2',page:152,label:'习题10.1(b) · 一名A与两名B',kind:'one-two'},
 p101c:{section:'10.2',page:152,label:'习题10.1(c) · 只想要另一商品',kind:'opposite'},
 p101d:{section:'10.2',page:153,label:'习题10.1(d) · 原题的唯一均衡价格',kind:'original-cd'},
 p102a:{section:'10.5',page:153,label:'习题10.2(a) · 平均分配有效吗',kind:'equal-efficient'},
 p102b:{section:'10.6',page:153,label:'习题10.2(b) · 两人联盟阻挡',kind:'equal-core'},
 p102c:{section:'10.2',page:153,label:'习题10.2(c) · 免费商品与全部余量',kind:'free-good'},
 p103a:{section:'10.2',page:153,label:'习题10.3(a) · 复制市场仍是均衡',kind:'replicate'},
 p103b:{section:'10.3',page:154,label:'习题10.3(b) · 同类型与严格凸性',kind:'same-type'},
 p104:{section:'10.3',page:154,label:'习题10.4 · 鲁滨逊与支持价格',kind:'robinson'},
 p105a:{section:'10.3',page:154,label:'习题10.5(a) · 非凸仍可均衡',kind:'nonconvex-pure'},
 p105b:{section:'10.3',page:154,label:'习题10.5(b) · 为何只能等价',kind:'nonconvex-prices'},
 p105c:{section:'10.3',page:154,label:'习题10.5(c) · (2,1)对称禀赋无均衡',kind:'nonconvex-none'},
 p105d:{section:'10.3',page:154,label:'习题10.5(d) · 全部可均衡禀赋',kind:'nonconvex-all'},
 p106a:{section:'10.1',page:154,label:'习题10.6(a) · 商品束成为房屋',kind:'bundle-market'},
 p106b:{section:'10.2',page:155,label:'习题10.6(b) · 无法用线性商品价实现',kind:'nonlinear-bundles'},
 p107:{section:'10.9',page:155,label:'习题10.7 · 契约集合还包括边界',kind:'boundary-contract'},
 p108:{section:'10.2',page:155,label:'习题10.8 · 中位估值决定价格',kind:'indivisible'},
 p109a:{section:'10.8',page:155,label:'习题10.9(a) · 一人选择交换价格',kind:'price-setter'},
 p109b:{section:'10.4',page:155,label:'习题10.9(b) · 重新交易还能获利',kind:'reopen-monopoly'}
};
const p10Tolerance=1e-8;
export const p10Dot=(p,x)=>p[0]*x[0]+p[1]*x[1];
export function p10CD(eA=[2,3],eB=[5,4],a=.5,b=2/3,price=null){
 const X=eA[0]+eB[0],Y=eA[1]+eB[1],eq=(a*eA[1]+b*eB[1])/((1-a)*eA[0]+(1-b)*eB[0]),p=price??eq,wealth=[p10Dot([p,1],eA),p10Dot([p,1],eB)],bundles=[[a*wealth[0]/p,(1-a)*wealth[0]],[b*wealth[1]/p,(1-b)*wealth[1]]],excess=[bundles[0][0]+bundles[1][0]-X,bundles[0][1]+bundles[1][1]-Y];
 return{X,Y,eA,eB,a,b,eq,p,wealth,bundles,excess,clears:excess.every(x=>Math.abs(x)<p10Tolerance)};
}
export function p101LinearComplement(alpha=4,beta=6,k=beta/2){const A=[alpha-k,beta-k],B=[k,k];return{X:alpha,Y:beta,prices:[1,1],equilibrium:[[alpha-beta/2,beta/2],[beta/2,beta/2]],A,B,utilities:[alpha+beta-2*k,k],initialUtilities:[alpha,0],paretoStable:k>=0&&k<=Math.min(alpha,beta),core:k>=0&&k<=Math.min(alpha,beta/2),coreRange:[0,Math.min(alpha,beta/2)]}}
export function p101OneTwo(){return{prices:[1,1],endowments:[[1,0],[0,1],[0,1]],allocation:[[0,1],[.5,.5],[.5,.5]],total:[1,2]}}
export function p101Opposite(nA=2,nB=3,alpha=2,beta=1,scale=1){const eq=nB*beta/(nA*alpha),p=eq*scale,A=[0,p*alpha],B=[beta/p,0],excess=[nB*B[0]-nA*alpha,nA*A[1]-nB*beta];return{nA,nB,alpha,beta,eq,p,A,B,total:[nA*alpha,nB*beta],excess,clears:excess.every(x=>Math.abs(x)<p10Tolerance)}}
export function p102Equal(n1=3,n2=2){const n=n1+n2,u=n2/n,bundle=[n1/n,n2/n],coalitions=[];for(let a=0;a<=n1;a++)for(let b=0;b<=n2;b++){if(a+b===0)continue;const bestCommon=Math.min(a,b)/(a+b);coalitions.push({a,b,bestCommon,blocks:bestCommon>u+p10Tolerance})}return{n1,n2,n,bundle,u,paretoStable:true,inCore:n1===n2,coalitions,witness:n1>n2?{types:[1,1],resources:[1,1],each:[.5,.5],gain:.5-u}:null}}
export function p102Complement(n1=3,n2=2,t=0,weights=null){
 const n=n1+n2,prices=[t,1-t],endowments=Array.from({length:n},(_,i)=>i<n1?[1,0]:[0,1]),allocation=endowments.map((_,i)=>t>0&&t<1?(i<n1?[t,t]:[1-t,1-t]):t===0?(i<n1?[0,0]:[1,1]):i<n1?[1,1]:[0,0]);
 const surplus=t===0?n1-n2:t===1?n2-n1:0;
 if(surplus>0){const ws=weights??Array(n).fill(1),sum=ws.reduce((a,b)=>a+b,0);if(ws.length!==n||sum<=0||ws.some(x=>x<0))throw RangeError('nonnegative surplus shares must have positive sum');allocation.forEach((x,i)=>x[t===0?0:1]+=surplus*ws[i]/sum)}
 const excess=[0,1].map(k=>allocation.reduce((a,x)=>a+x[k],0)-[n1,n2][k]);return{n1,n2,n,prices,endowments,allocation,utilities:allocation.map(x=>Math.min(...x)),excess,clears:excess.every(x=>Math.abs(x)<p10Tolerance),surplus:Math.max(0,surplus)};
}
export function p103Replicate(n=3,a=.4,b=.7,strict=true){
 if(!strict){const endowments=Array.from({length:2*n},(_,i)=>i<n?[1,0]:[0,1]),allocation=Array.from({length:2*n},(_,i)=>{const j=i%n;if(n===1)return i===0?[1,0]:[0,1];return j===0?(i<n?[1,0]:[0,1]):j===1?(i<n?[0,1]:[1,0]):[.5,.5]});return{n,strict,prices:[1,1],endowments,allocation,base:null,typeABundlesDiffer:n>=2,excess:[0,0]}}
 const base=p10CD([2,1],[1,2],a,b),endowments=Array.from({length:2*n},(_,i)=>i<n?[2,1]:[1,2]),allocation=Array.from({length:2*n},(_,i)=>[...base.bundles[i<n?0:1]]),excess=[0,1].map(k=>allocation.reduce((a,x)=>a+x[k],0)-3*n);return{n,strict,base,prices:[base.p,1],endowments,allocation,typeABundlesDiffer:false,excess};
}
export function p104Robinson(e=[2,3],kind='cd',a=.5){const [x,y]=e;let t,interval=null;if(kind==='linear')t=.5;else if(kind==='complement'){t=x<y?1:x>y?0:.5;if(x===y)interval=[0,1]}else if(kind==='log')t=(1+y)/(2+x+y);else t=a*y/(a*y+(1-a)*x);return{e,kind,a,t,prices:[t,1-t],supportInterval:interval,allocation:[...e]}}
export function p105Nonconvex(eA=[2,1],eB=[2,1],t=.5,choiceA=0,choiceB=1){
 const X=eA[0]+eB[0],Y=eA[1]+eB[1],valid=X>0&&Y>0,wealth=[eA[0]+eA[1],eB[0]+eB[1]],equilibria=[];
 if(valid){if(Math.abs(X-wealth[0])<p10Tolerance)equilibria.push([[wealth[0],0],[0,wealth[1]]]);if(Math.abs(X-wealth[1])<p10Tolerance)equilibria.push([[0,wealth[0]],[wealth[1],0]])}
 const prices=[t,1-t];if(t===0||t===1)return{eA,eB,X,Y,valid,wealth,equilibria,prices,status:'unbounded',reason:'A positively valued good is free.'};
 const currentWealth=[p10Dot(prices,eA),p10Dot(prices,eB)],sets=currentWealth.map(w=>Math.abs(t-.5)<1e-10?[[w/t,0],[0,w/(1-t)]]:t<.5?[[w/t,0]]:[[0,w/(1-t)]]),bundles=sets.map((xs,i)=>xs[Math.min(xs.length-1,i===0?choiceA:choiceB)]),excess=[bundles[0][0]+bundles[1][0]-X,bundles[0][1]+bundles[1][1]-Y];
 return{eA,eB,X,Y,valid,wealth,equilibria,prices,status:'finite',currentWealth,sets,bundles,excess,clears:valid&&excess.every(x=>Math.abs(x)<p10Tolerance),existenceCondition:{crossEqual:Math.abs(eA[1]-eB[0])<p10Tolerance,diagonalEqual:Math.abs(eA[0]-eB[1])<p10Tolerance}};
}
export function p10Permutations(xs){return xs.length?xs.flatMap((x,i)=>p10Permutations(xs.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]]}
export const p106Houses=[[2,0],[0,2],[1,0],[0,1]];
export function p106Housing(prices=[4,4,2,1]){const coefficients=[[1,3],[3,1],[3,1],[3,1]],values=coefficients.map(c=>p106Houses.map(h=>p10Dot(c,h))),affordable=prices.map((income,i)=>prices.map((p,j)=>p<=income+p10Tolerance?j:-1).filter(j=>j>=0)),demand=affordable.map((js,i)=>{const u=Math.max(...js.map(j=>values[i][j]));return js.filter(j=>values[i][j]>=u-p10Tolerance)}),equilibria=p10Permutations([0,1,2,3]).filter(a=>a.every((j,i)=>demand[i].includes(j))),intended=[1,0,2,3],intendedOptimal=intended.every((j,i)=>demand[i].includes(j));return{houses:p106Houses,coefficients,values,prices,affordable,demand,equilibria,intended,intendedOptimal,linearPossible:false,positiveRepresentative:prices.every(p=>p>0)}}
// Positive, smooth local valuations on the whole nonnegative quadrant. Upper
// contours 2x+u*y >=u^2-u are halfspaces; MRS=2/u and sign follows x+y-1.
export function p107Utility(x,y){return(1+y+Math.sqrt((1+y)**2+8*x))/2}
export function p107Gradient(x,y){const D=Math.sqrt((1+y)**2+8*x),u=p107Utility(x,y);return[2/D,u/D]}
export function p107Contract(x=.4,y=.3){const A=[x,y],B=[1-x,1-y],gA=p107Gradient(...A),gB=p107Gradient(...B),mrs=[gA[0]/gA[1],gB[0]/gB[1]],stable=Math.abs(y)<p10Tolerance||Math.abs(y-1)<p10Tolerance||Math.abs(x+y-1)<p10Tolerance;let witness=null;
 if(!stable){const direction=x+y<1?1:-1,ratio=(mrs[0]+mrs[1])/2,room=direction>0?Math.min(1-x,y/ratio):Math.min(x,(1-y)/ratio);for(let k=0;k<50;k++){const e=room*.25*2**(-k),candidate=[x+direction*e,y-direction*ratio*e];if(p107Utility(...candidate)>p107Utility(...A)+1e-12&&p107Utility(1-candidate[0],1-candidate[1])>p107Utility(...B)+1e-12){witness=candidate;break}}}
 return{A,B,mrs,utilities:[p107Utility(...A),p107Utility(...B)],stable,witness,segments:'y=0 or y=1 or x+y=1'};
}
export function p108Indivisible(half=2,unit=1,cashBuffer=2,scale=1,tie=1){const n=2*half+1,values=Array.from({length:n},(_,i)=>(n-i)*unit),median=values[half],p=median*scale,money=values.map((_,i)=>values[0]+cashBuffer+i),sets=values.map(t=>Math.abs(t-p)<1e-9?[0,1,2]:t>p?[2]:[0]),stock=sets.map(xs=>xs.length===3?tie:xs[0]),afterMoney=money.map((M,i)=>M+p*(1-stock[i])),excess=stock.reduce((a,b)=>a+b,0)-n;return{n,values,median,p,money,sets,stock,afterMoney,excess,moneyExcess:afterMoney.reduce((a,b)=>a+b,0)-money.reduce((a,b)=>a+b,0),clears:excess===0,equilibriumStock:values.map((_,i)=>i<half?2:i===half?1:0)}}
export function p109Offer(e=[8,2],price=1,X=10,Y=10){const A=[(e[0]+e[1]/price)/2,(price*e[0]+e[1])/2],B=[X-A[0],Y-A[1]],feasible=B.every(x=>x>=-p10Tolerance);return{e,X,Y,price,A,B,feasible,u1:A[0]*A[1],u2:feasible?B[0]*B[1]:-Infinity}}
export function p109Setter(e=[8,2],X=10,Y=10){const lower=e[1]/(2*X-e[0]),upper=(2*Y-e[1])/e[0],monopoly=Math.sqrt(lower*upper),competitive=Y/X,M=p109Offer(e,monopoly,X,Y),C=p109Offer(e,competitive,X,Y);return{e,X,Y,lower,upper,monopoly,competitive,M,C,gain:M.u2-C.u2}}
export function p109Reopen(e=[8,2],rounds=3,X=10,Y=10){const stages=[];let initial=[...e];for(let i=0;i<rounds;i++){const s=p109Setter(initial,X,Y),before=(X-initial[0])*(Y-initial[1]);stages.push({...s,before,gainOverEndowment:s.M.u2-before});initial=[...s.M.A]}return{stages,last:stages.at(-1),endowment:initial}}
