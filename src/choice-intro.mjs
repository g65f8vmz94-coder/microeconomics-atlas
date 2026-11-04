// Section2.1, printed17–18. Examples are autonomous, definitions and implications source-based.
export const introCases=['choiceproblem','rationalaction','utilitychoice','strictidentify','rationalmeaning'];
export const introMenus=[1,2,4,3,5,6,7];
export const introMembers=(mask,n=3)=>Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i));
export const introPermutation=a=>a.length?a.flatMap((v,i)=>introPermutation(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
export const introStrictOrders=introPermutation([0,1,2]);
export const introWeakOrders=[...new Map(Array.from({length:27},(_,k)=>{const a=[Math.floor(k/9),Math.floor(k/3)%3,k%3],u=[...new Set(a)].sort((x,y)=>x-y),v=a.map(x=>u.indexOf(x));return[v.join(''),v]})).values()];
export const introRankDefault=introWeakOrders.findIndex(a=>a.join('')==='210');
export function introValidateTable(table,n=3){
 if(!Number.isInteger(n)||n<0||n>10)throw Error('finite model size');
 const domain=Array.from({length:(1<<n)-1},(_,i)=>i+1),missing=[],invalid=[];
 for(const A of domain){const x=table[A];if(x===null||x===undefined)missing.push(A);else if(!Number.isInteger(x)||x<0||x>=n||!(A&(1<<x)))invalid.push({menu:A,answer:x})}
 const extra=Object.keys(table).filter(k=>!domain.includes(Number(k)));
 return{domain,required:domain.length,answered:domain.length-missing.length,missing,invalid,extra,validFunction:!missing.length&&!invalid.length&&!extra.length};
}
export function introDecodeTable(code){if(!/^[012u]{7}$/.test(code))throw Error('seven candidate answers');return Object.fromEntries(introMenus.map((A,j)=>[A,code[j]==='u'?null:Number(code[j])]));}
export function introEncodeTable(table){return introMenus.map(A=>table[A]===null||table[A]===undefined?'u':String(table[A])).join('');}
export function introSetAnswer(table,A,x){if(!introMenus.includes(A)||!(x===null||Number.isInteger(x)&&x>=0&&x<=2))throw Error('candidate table');return{...table,[A]:x};}
export function introMaxima(values,mask){
 if(values.length!==3||!values.every(Number.isFinite)||!Number.isInteger(mask)||mask<0||mask>7)throw Error('three finite scores and legal mask');
 const xs=introMembers(mask);if(!xs.length)return{exists:false,best:[],value:null};const value=Math.max(...xs.map(i=>values[i]));return{exists:true,best:xs.filter(i=>values[i]===value),value};
}
export function introActor(ranks,actual,noticed,chosen){
 const full=introMaxima(ranks,actual),seen=introMaxima(ranks,noticed),feasible=Number.isInteger(chosen)&&introMembers(actual).includes(chosen),bestActual=feasible&&full.best.includes(chosen),bestNoticed=seen.best.includes(chosen),aware=actual===noticed;
 return{problem:actual!==0,actual:full,noticed:seen,feasible,bestActual,bestNoticed,aware,allAssumptions:actual!==0&&aware&&bestActual};
}
export function introTransform(values,mask,a,b){const transformed=values.map(x=>a*x+b),before=introMaxima(values,mask),after=introMaxima(transformed,mask);return{transformed,before,after,sameBest:before.best.join()===after.best.join(),strictlyIncreasing:a>0};}
export function introIdentify(orderA,orderB,mask){
 const ranks=order=>[0,1,2].map(i=>2-order.indexOf(i)),a=ranks(orderA),b=ranks(orderB);let witness=null;
 for(let i=0;i<3&&!witness;i++)for(let j=i+1;j<3;j++)if(Math.sign(a[i]-a[j])!==Math.sign(b[i]-b[j])){witness=[i,j];break}
 const at=mask=>({a:introMaxima(a,mask).best[0]??null,b:introMaxima(b,mask).best[0]??null});
 return{different:orderA.join()!==orderB.join(),witness,mask: witness?witness.reduce((s,i)=>s|(1<<i),0):null,current:at(mask),pair:witness?at(witness.reduce((s,i)=>s|(1<<i),0)):null};
}
export function introMeaning(readings,mask,seeks='high'){const utility=readings.map(x=>seeks==='high'?x:-x),m=introMaxima(utility,mask);return{utility,...m,chosen:m.best[0]??null,technicalRational:mask!==0};}
export function introNoMaximum(n){if(!Number.isInteger(n)||n<1)throw Error('positive integer');return{candidate:n,better:n+1,value:n,betterValue:n+1,globalMaximumExists:false,finiteWindowMaximum:n};}
