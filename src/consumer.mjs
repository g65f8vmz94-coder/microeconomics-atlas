const eps=1e-9;
export function utilityC(model,x,y,a=.5){switch(model){case 'linear':return x+y;case 'complement':return Math.min(x,y);case 'product':return x*y;case 'quasi':return x+Math.sqrt(Math.max(0,y));case 'max':return Math.max(x,y);case 'quadratic':return x*x+y*y;case 'ideal':return -((x-3)**2+(y-3)**2);case 'giffen':return Math.min(x+y,4*x+2*y-12);default:return Math.max(0,x)**a*Math.max(0,y)**(1-a)}}
export function demandC(model,p=1,q=1,w=12,a=.5){
 const end=[[w/p,0],[0,w/q]];let bundle,set=[];
 if(['linear','cheaper','expensive'].includes(model)){if(p===q)bundle=model==='expensive'?end[0]:[w/(2*p),w/(2*q)];else bundle=(model==='expensive'?p>q:p<q)?end[0]:end[1];if(p===q&&model==='linear')set=end;}
 else if(model==='complement'||model==='equal')bundle=[w/(p+q),w/(p+q)];
 else if(model==='product'||model==='half')bundle=[w/(2*p),w/(2*q)];
 else if(model==='cap'){const x=Math.min(7,w/p);bundle=[x,(w-p*x)/q];}
 else if(model==='quasi'){const y=Math.min(w/q,(p/(2*q))**2);bundle=[(w-q*y)/p,y];}
 else if(model==='ideal'){if(3*p+3*q<=w)bundle=[3,3];else{const x=Math.max(0,Math.min(w/p,(p*w+3*q*(q-p))/(p*p+q*q)));bundle=[x,(w-p*x)/q];}}
 else if(model==='giffen'){
  const candidates=[...end],den=3*q-p;if(Math.abs(den)>eps){const x=(12*q-w)/den,y=(w-p*x)/q;if(x>=-eps&&y>=-eps)candidates.push([Math.max(0,x),Math.max(0,y)])}
  const max=Math.max(...candidates.map(([x,y])=>utilityC('giffen',x,y)));set=candidates.filter(([x,y])=>utilityC('giffen',x,y)>=max-eps);bundle=set.at(-1);
 }else if(model==='max'||model==='quadratic'){const values=end.map(([x,y])=>utilityC(model,x,y)),best=Math.max(...values);set=end.filter((_,i)=>Math.abs(values[i]-best)<eps);bundle=set[0];}
 else bundle=[a*w/p,(1-a)*w/q];
 return {bundle,optimalEndpoints:set.length>1?set:[],spending:p*bundle[0]+q*bundle[1],wealth:w,p,q,model,u:utilityC(model,...bundle,a)};
}
export function hicksC(model,p,q,target,a=.5){let bundle;
 if(model==='linear')bundle=p<q?[target,0]:p>q?[0,target]:[target/2,target/2];
 else if(model==='complement')bundle=[target,target];
 else if(model==='product')bundle=[Math.sqrt(target*q/p),Math.sqrt(target*p/q)];
 else if(model==='quasi'){const z=Math.min(Math.max(0,target),p/(2*q));bundle=[Math.max(0,target-z),z*z];}
 else if(model==='giffen'){
  const candidates=[[Math.max(0,target,(target+12)/4),0],[0,Math.max(0,target,(target+12)/2)]],x=6-target/2,y=1.5*target-6;
  if(x>=-eps&&y>=-eps)candidates.push([Math.max(0,x),Math.max(0,y)]);
  bundle=candidates.filter(([x,y])=>utilityC('giffen',x,y)>=target-eps).reduce((x,y)=>p*x[0]+q*x[1]<=p*y[0]+q*y[1]?x:y);
 }else{const w=target*(p/a)**a*(q/(1-a))**(1-a);bundle=[a*w/p,(1-a)*w/q];}
 return {bundle,expenditure:p*bundle[0]+q*bundle[1],target,model};
}
export function slutskyC(model='cd',p0=1,p1=2,q=1,w=12,a=.5,method='slutsky'){
 const A=demandC(model,p0,q,w,a),wealth=method==='hicks'?hicksC(model,p1,q,A.u,a).expenditure:p1*A.bundle[0]+q*A.bundle[1],B=demandC(model,p1,q,wealth,a),C=demandC(model,p1,q,w,a);
 return {A,B,C,wealth,method,sub:B.bundle[0]-A.bundle[0],income:C.bundle[0]-B.bundle[0],total:C.bundle[0]-A.bundle[0]};
}
export function warpC(first,second){const dot=(p,x)=>p[0]*x[0]+p[1]*x[1],a=first.bundle,b=second.bundle,cross=[dot(first.prices,b),dot(second.prices,a)],affordable=[cross[0]<=first.w+eps,cross[1]<=second.w+eps],strict=[cross[0]<first.w-eps,cross[1]<second.w-eps],distinct=Math.hypot(a[0]-b[0],a[1]-b[1])>eps,ownCosts=[dot(first.prices,a),dot(second.prices,b)];
 return {cross,affordable,strict,distinct,ownCosts,violation:distinct&&affordable.every(Boolean)&&strict.some(Boolean),validObservation:ownCosts[0]<=first.w+eps&&ownCosts[1]<=second.w+eps};}
export function sourceWarp(){return {first:{prices:[1,2],w:2,bundle:[0,1]},second:{prices:[2,1],w:2,bundle:[1,0]}};}
export function rationalizationC(rule='cheaper',candidate='linear',p=1,q=1,w=12){const observed=demandC(rule,p,q,w),optimal=demandC(candidate,p,q,w),observedUtility=utilityC(candidate,...observed.bundle),gap=optimal.u-observedUtility;return {observed,optimal,observedUtility,gap,currentConsistent:gap<=eps,globalKnown:(rule==='cheaper'&&candidate==='linear')||(rule==='half'&&candidate==='product')};}
export function mrsC(model,x,y,a=.5){if(model==='linear')return 1;if(model==='product')return x>0?y/x:null;if(model==='cd')return x>0?a/(1-a)*y/x:null;if(model==='quasi')return 2*Math.sqrt(y);return null;}
export function localDerivativesC(model,p=1,q=1,w=12,a=.5){const r=demandC(model,p,q,w,a),h=1e-4,lowP=demandC(model,p-h,q,w,a).bundle,highP=demandC(model,p+h,q,w,a).bundle,lowW=demandC(model,p,q,w-h,a).bundle,highW=demandC(model,p,q,w+h,a).bundle;
 const own=(highP[0]-lowP[0])/(2*h),income=(highW[0]-lowW[0])/(2*h),cross=(highP[1]-lowP[1])/(2*h),hLow=hicksC(model,p-h,q,r.u,a),hHigh=hicksC(model,p+h,q,r.u,a),compensated=(hHigh.bundle[0]-hLow.bundle[0])/(2*h),jump=Math.abs(highP[0]-lowP[0])>1;
 const nonsmoothBoundary=(model==='linear'&&Math.abs(p-q)<h)||(model==='quasi'&&Math.abs(w/q-(p/(2*q))**2)<h)||(model==='giffen'&&(Math.abs(p-q)<h||Math.abs(p-2*q)<h||Math.abs(w-4*p)<h||Math.abs(w-12*q)<h));
 return {own,income,cross,compensated,identity:own-compensated+r.bundle[0]*income,jump,nonsmoothBoundary,...r};}
export function normalMRSC(model='cd',p=1,q=1,w=8,extra=4,a=.5){const old=demandC(model,p,q,w,a),next=demandC(model,p,q,w+extra,a),vertical=[old.bundle[0],old.bundle[1]+extra/q];return {old,next,vertical,mrsOld:mrsC(model,...old.bundle,a),mrsVertical:mrsC(model,...vertical,a),mrsNext:mrsC(model,...next.bundle,a)};}
export function budgetC(p=2,q=1,w=12,scale=2,endowed=false){const wealth=endowed?4*p+4*q:w,old=[8,8],current=[wealth/p,wealth/q],scaled=[scale*wealth/(scale*p),scale*wealth/(scale*q)];return {wealth,current,scaled,old,scaledPrices:[scale*p,scale*q],scaledWealth:scale*wealth,endowment:[4,4]};}
export function existenceCounter(progress=.9){return {bundle:[progress,0],utility:progress,boundaryBundle:[1,0],boundaryUtility:0,next:[(1+progress)/2,0],nextUtility:(1+progress)/2,supremum:1};}
