const epsP=1e-10;
export function bisectP(fn,lo,hi){for(let i=0;i<90;i++){const m=(lo+hi)/2;if(fn(m)>0)lo=m;else hi=m}return (lo+hi)/2}
export function powerP(A=1,r=.5){return {A,r,f:a=>A*a**r,mp:a=>a>0?A*r*a**(r-1):r<1?Infinity:r===1?A:0,increment:a=>A*((a+1)**r-a**r),valid:r>0&&r<1,concave:r<=1}}
export function shiftedP({A=2,b=1,p=1,w=1}={}){
 const f=a=>A*(Math.sqrt(a+b)-Math.sqrt(b)),mp=a=>a+b>0?A/(2*Math.sqrt(a+b)):Infinity;
 const profit=a=>p*f(a)-w*a,aProfit=Math.max(0,(p*A/(2*w))**2-b),aOutput=p*A>2*w*Math.sqrt(b)?(p*A/w)**2-2*p*A*Math.sqrt(b)/w:0;
 return {A,b,p,w,f,mp,profit,aProfit,aOutput,inverse:y=>(y/A+Math.sqrt(b))**2-b};
}
export function objectivesP(s={}){const m=shiftedP(s),lower=s.lower??3,aLower=m.inverse(lower),minimum=s.minimum??1;
 return {m,rows:[{label:'利润最大',a:m.aProfit},{label:'保本产量最大',a:m.aOutput},{label:'产量下限内利润最大',a:Math.max(m.aProfit,aLower)},{label:'成员数至少为给定下限的合作社',a:minimum}].map(z=>({...z,y:m.f(z.a),profit:m.profit(z.a),perMember:z.a?m.profit(z.a)/z.a:null})),lower,aLower,minimum};
}
export function technologyP({p=1,w=.29,delta=.7,kind='early'}={}){
 const f=a=>Math.sqrt(a),mpf=a=>a>0?1/(2*Math.sqrt(a)):Infinity,g=kind==='early'?a=>Math.sqrt(a)+delta*a*Math.exp(-a):a=>(1+delta)*Math.sqrt(a),mpg=kind==='early'?a=>a>0?1/(2*Math.sqrt(a))+delta*(1-a)*Math.exp(-a):Infinity:a=>a>0?(1+delta)/(2*Math.sqrt(a)):Infinity;
 const af=(p/(2*w))**2;let hi=Math.max(1,af*4);while(p*mpg(hi)>w)hi*=2;
 const ag=bisectP(a=>p*mpg(a)-w,1e-14,hi),outFor=h=>{let upper=1;while(p*h(upper)-w*upper>=0)upper*=2;return bisectP(a=>p*h(a)-w*a,1e-12,upper)},of=outFor(f),og=outFor(g);
 return {p,w,delta,kind,f,g,mpf,mpg,af,ag,yf:f(af),yg:g(ag),pf:p*f(af)-w*af,pg:p*g(ag)-w*ag,of,og,outputF:f(of),outputG:g(og)};
}
export const finitePlansP=[{a:0,y:0},{a:1,y:2},{a:2,y:2.5},{a:3,y:6},{a:4,y:6.2}];
export function planChoiceP(p,w){const values=finitePlansP.map(z=>p*z.y-w*z.a),best=Math.max(...values);return {values,best,winners:values.flatMap((v,i)=>Math.abs(v-best)<epsP?[i]:[])};}
export function priceProofP({p=1,w=1,other=2,which='w',i=0,j=0}={}){const before=planChoiceP(p,w),after=planChoiceP(which==='p'?other:p,which==='w'?other:w),A=finitePlansP[i],B=finitePlansP[j],pa=which==='p'?other:p,wa=which==='w'?other:w;
 return {before,after,i,j,A,B,first:p*A.y-w*A.a-(p*B.y-w*B.a),second:pa*B.y-wa*B.a-(pa*A.y-wa*A.a),product:which==='w'?(w-other)*(A.a-B.a):(other-p)*(A.y-B.y)};
}
export function inverseP(kind='sqrt',A=2,w=1,y=2){
 const cap=2,f=kind==='log'?a=>A*Math.log1p(a):kind==='plateau'?a=>Math.min(A*Math.sqrt(a),cap):kind==='saturating'?a=>A*(-Math.expm1(-a)):a=>A*Math.sqrt(a);
 const input=z=>z<0?Infinity:kind==='log'?Math.expm1(z/A):kind==='plateau'&&z>cap?Infinity:kind==='saturating'?z<A?-Math.log1p(-z/A):Infinity:(z/A)**2;
 const a=input(y);return {kind,A,w,y,cap,f,input,a,cost:Number.isFinite(a)?w*a:Infinity,C:z=>w*input(z),ceiling:kind==='plateau'?cap:kind==='saturating'?A:Infinity};
}
export function costsP({F=4,c=1,k=1,p=5,sunk=false}={}){
 const C=q=>q>0||sunk?F+c*q+k*q*q/2:0,VC=q=>c*q+k*q*q/2,MC=q=>c+k*q,AC=q=>q>0?(F+VC(q))/q:Infinity,profit=q=>p*q-C(q),candidate=Math.max(0,(p-c)/k),contribution=p*candidate-VC(candidate),gain=contribution-(sunk?0:F),operate=candidate>0&&gain>=-epsP,qProfit=operate?candidate:0;
 const D=(p-c)**2-2*k*F,possible=p>c&&D>=-epsP,lower=possible?Math.max(0,(p-c-Math.sqrt(Math.max(0,D)))/k):null,upper=possible?(p-c+Math.sqrt(Math.max(0,D)))/k:null;
 return {F,c,k,p,sunk,C,VC,MC,AC,profit,candidate,contribution,qProfit,profitBest:profit(qProfit),zeroProfit:profit(0),tie:candidate>0&&!sunk&&Math.abs(contribution-F)<epsP,lower,upper,qOutput:possible?upper:null,minAC:c+Math.sqrt(2*k*F),minACAt:F>0?Math.sqrt(2*F/k):0,feasible:q=>profit(q)>=-epsP};
}
export function acP(kind='convex',F=4){const C=kind==='nonconvex'?y=>4*y-y*y+y**3/3:y=>(kind==='fixed'&&y>0?F:0)+y+y*y/2,MC=kind==='nonconvex'?y=>4-2*y+y*y:y=>1+y,AC=y=>y>0?C(y)/y:Infinity,slope=y=>(MC(y)-AC(y))/y;return {kind,F,C,MC,AC,slope,MC0:kind==='nonconvex'?4:1,convex:kind==='convex'||kind==='fixed'&&F===0}}
export function costStaticsP({p=4,newP=6,c=1,k=1,F=0,factor=.5}={}){return {before:costsP({p,c,k,F}),after:costsP({p:newP,c:factor*c,k:factor*k,F})};}
export function factoriesP(y=3,k=2,share=.5){const one=y>0?k+y*y:0,two=y>0?2*k+y*y/2:0,currentTwo=2*k+y*y*(share*share+(1-share)**2),threshold=Math.sqrt(2*k);return {y,k,share,one,two,currentTwo,cost:Math.min(one,two),threshold,optimal:y===0?[0]:Math.abs(one-two)<epsP?[1,2]:one<two?[1]:[2],a1:(share*y)**2,a2:((1-share)*y)**2,C:q=>q===0?0:Math.min(k+q*q,2*k+q*q/2)};}
export function producerGoalsP(lambda=0){
 const employment=[0,50,65,100,144,170,196], profit=[-8,1,1.5,2,1.6,1,.4];
 const plans=employment.map((N,i)=>({N,profit:profit[i],fired:196-N,utility:profit[i]-lambda*(196-N)}));
 const best=Math.max(...plans.map(x=>x.utility));
 return {lambda,plans,best,winners:plans.filter(x=>Math.abs(x.utility-best)<epsP)};
}
export function firingP({A=2,b=0,p=1,w=1,a0=4,loss=.6,integer=false}={}){const m=shiftedP({A,b,p,w}),raw=m.aProfit>=a0?m.aProfit:loss>=w?a0:Math.min(a0,Math.max(0,(p*A/(2*(w-loss)))**2-b)),subjective=a=>m.profit(a)-loss*Math.max(0,a0-a);
 let ordinary=m.aProfit,chosen=raw,winners=[raw];if(integer){const candidates=[...new Set([0,Math.floor(a0),Math.ceil(a0),Math.floor(raw),Math.ceil(raw),Math.floor(ordinary),Math.ceil(ordinary)].filter(x=>x>=0))],best=Math.max(...candidates.map(subjective));winners=candidates.filter(a=>Math.abs(subjective(a)-best)<epsP).sort((a,b)=>a-b);chosen=winners.at(-1);const v=Math.max(...candidates.map(m.profit));ordinary=candidates.filter(a=>Math.abs(m.profit(a)-v)<epsP).sort((a,b)=>a-b).at(-1)}
 return {m,ordinary,chosen,winners,raw,subjective,cash:m.profit(chosen),moral:loss*Math.max(0,a0-chosen),fired:Math.max(0,a0-chosen),a0,loss};
}
export function jumpCostP(J=2,q=.9){const C=y=>y*y+(y>=1?J:0),exists=J<=1,output=exists?1+Math.sqrt(1-J):null;return {J,q,C,profit:y=>2*y-C(y),exists,output,sup:exists?output:1,feasible:2*q-C(q)>=-epsP};}
export function crusoeP({A=1,r=.5,theta=1,leisure=.5,w=1,goal='profit'}={}){
 const frontier=l=>A*Math.max(0,1-l)**r,U=(l,c)=>l>=0&&c>=0?l**theta*c:NaN,MRS=(l,c)=>l>0?theta*c/l:Infinity,mp=x=>x>0?A*r*x**(r-1):Infinity;
 const xStar=r/(theta+r),lStar=1-xStar,cStar=A*xStar**r,utilityStar=U(lStar,cStar),wStar=mp(xStar),xOut=1/(theta+1),wOut=A*xOut**(r-1);
 const firmX=(goal==='profit'?A*r/w:A/w)**(1/(1-r)),firmY=A*firmX**r,profit=Math.max(0,firmY-w*firmX),income=w+profit,lConsumer=Math.min(1,theta*income/((theta+1)*w)),cConsumer=Math.max(0,income-w*lConsumer),laborSupply=1-lConsumer,gap=firmX-laborSupply;
 return {A,r,theta,w,goal,frontier,U,MRS,mp,xStar,lStar,cStar,utilityStar,wStar,xOut,wOut,lOut:1-xOut,cOut:A*xOut**r,uOut:U(1-xOut,A*xOut**r),leisure,currentC:frontier(leisure),currentU:U(leisure,frontier(leisure)),firmX,firmY,profit,income,lConsumer,cConsumer,laborSupply,gap,goodsGap:firmY-cConsumer,inHarmony:Math.abs(gap)<1e-8,consumerUtility:U(lConsumer,cConsumer)};
}
