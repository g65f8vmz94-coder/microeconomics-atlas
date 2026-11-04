// §2.2, printed18–21. Finite inference and source situations; no claim about mental processes.
import {menus,members,medianChoice,table24} from './choice.mjs';
export const rzCases=['rationalize','example1','median','restaurant','party'];
const rzOrderCache=new Map();
export function rzOrders(n){if(!Number.isInteger(n)||n<0||n>6)throw Error('finite illustration supports0..6 alternatives');if(!rzOrderCache.has(n)){const p=a=>a.length?a.flatMap((x,i)=>p(a.filter((_,j)=>i!==j)).map(b=>[x,...b])):[[]];rzOrderCache.set(n,p(Array.from({length:n},(_,i)=>i)));}return rzOrderCache.get(n);}
export function rzDecode(code){if(!/^[012u]{7}$/.test(code))throw Error('seven candidate answers');return Object.fromEntries(menus(3).map((A,i)=>[A,code[i]==='u'?null:Number(code[i])]));}
export function rzEncode(data){return menus(3).map(A=>data[A]===null||data[A]===undefined?'u':String(data[A])).join('');}
export const rzTable=i=>table24(i);
export function rzCompare(order,data,n=order.length){const validOrder=order.length===n&&new Set(order).size===n&&order.every(x=>Number.isInteger(x)&&x>=0&&x<n);if(!validOrder)throw Error('strict permutation required');const rows=[];for(const A of menus(n)){const x=data[A];if(x===null||x===undefined)continue;const eligible=members(A,n),predicted=order.find(i=>eligible.includes(i));rows.push({A,chosen:x,predicted,match:x===predicted,valid:eligible.includes(x)});}return{rows,matched:rows.filter(x=>x.match).length,total:rows.length,fits:rows.every(x=>x.match)};}
export function rzCycle(edges,n){const adj=Array.from({length:n},()=>[]);for(const e of edges)if(!adj[e.from].includes(e.to))adj[e.from].push(e.to);let found=null;const walk=(u,path)=>{for(const v of adj[u]){const at=path.indexOf(v);if(at!==-1){found=[...path.slice(at),v];return true;}if(walk(v,[...path,v]))return true;}return false;};for(let i=0;i<n&&!found;i++)walk(i,[i]);return found?{nodes:found,edges:found.slice(0,-1).map((u,i)=>edges.find(e=>e.from===u&&e.to===found[i+1]))}:null;}
export function rzAnalyze(data,n=3,given=[]){
 const orders=rzOrders(n),domain=menus(n),missing=[],invalid=[],edges=[];
 for(const A of domain){const x=data[A];if(x===null||x===undefined){missing.push(A);continue;}if(!Number.isInteger(x)||!members(A,n).includes(x)){invalid.push({A,chosen:x});continue;}for(const y of members(A,n))if(y!==x)edges.push({from:x,to:y,A,kind:'choice'});}
 for(const key of Object.keys(data))if(!domain.some(A=>String(A)===key))invalid.push({A:key,chosen:data[key]});
 for(const e of given){if(!Number.isInteger(e.from)||!Number.isInteger(e.to)||e.from<0||e.to<0||e.from>=n||e.to>=n||e.from===e.to)throw Error('strict given comparison');edges.push({...e,kind:'given'});}
 const compatible=invalid.length?[]:orders.filter(order=>edges.every(e=>order.indexOf(e.from)<order.indexOf(e.to))),cycle=rzCycle(edges,n);
 return{n,domain,missing,invalid,edges,cycle,compatible,known:domain.length-missing.length,complete:missing.length===0&&invalid.length===0,compatibleKnown:invalid.length===0&&compatible.length>0,rationalizable:missing.length===0&&invalid.length===0&&compatible.length>0};
}
export function rzWeakIndifference(data,n=3){const v=rzAnalyze(data,n),known=menus(n).filter(A=>data[A]!==null&&data[A]!==undefined),nonSingle=known.filter(A=>members(A,n).length>1);return{valid:v.invalid.length===0,weaklyBest:v.invalid.length===0,uniquelyBest:v.invalid.length===0&&!nonSingle.length,nonUniqueMenus:nonSingle,complete:v.complete,known:known.length};}
export function rzAsIf(order,n=3){const table=Object.fromEntries(menus(n).map(A=>[A,order.find(i=>A&(1<<i))]));const rows=menus(n).map(A=>({A,scan:order.find(i=>A&(1<<i)),lookup:table[A]}));return{table,rows,same:rows.every(r=>r.scan===r.lookup)};}
export const rzMedianOffsets=[0,-1,1,-2,2];
export function rzMedianRole(mask){if(!Number.isInteger(mask)||mask<1||mask>31)throw Error('nonempty five-item menu');const xs=members(mask,5),mid=Math.floor((xs.length-1)/2),mapping=xs.map((i,j)=>({item:i,offset:j-mid,role:rzMedianOffsets.indexOf(j-mid)}));return{mask,chosen:medianChoice(mask,5),mapping,roleMask:mapping.reduce((s,x)=>s|(1<<x.role),0),chosenRole:0};}
const rzMedianAll=Object.fromEntries(menus(5).map(A=>[A,medianChoice(A,5)]));
export const rzMedianGlobal=rzAnalyze(rzMedianAll,5);
export function rzMedian(A=31,B=28){const a=rzMedianRole(A),b=rzMedianRole(B),data={[A]:a.chosen,[B]:b.chosen},roleData={[a.roleMask]:0,[b.roleMask]:0};return{a,b,data,analysis:rzAnalyze(data,5),whole:rzMedianGlobal,roleData,roleAnalysis:rzAnalyze(roleData,5),roleRank:[0,1,2,3,4]};}
export const rzFoodPrices=[2.5,4,4.5,4.5];
export const rzFoodNames=['三文鱼','牛排','蜗牛','蛙腿'];
export const rzFoodRefinedNames=['三文鱼','被视为低品质的牛排','被视为高品质的牛排','蜗牛','蛙腿'];
export const rzFoodSourceRank=[2,0,1,3,4];
export function rzRestaurant(first=0,second=1,refined=false,keepStory=true){if(![0,1].includes(first)||!Number.isInteger(second)||second<0||second>3)throw Error('restaurant response outside menu');const n=refined?5:4,A=3,B=refined?29:15,translate=(x,expanded)=>!refined?x:x===0?0:x===1?(expanded?2:1):x+1,a=translate(first,false),b=translate(second,true),data={[A]:a,[B]:b},snail=refined?3:2,frog=refined?4:3,given=keepStory?[{from:0,to:snail,label:'故事给定：三文鱼优于蜗牛'},{from:0,to:frog,label:'故事给定：三文鱼优于蛙腿'}]:[];return{n,A,B,a,b,data,given,refined,sourceResponses:first===0&&second===1,names:refined?rzFoodRefinedNames:rzFoodNames,analysis:rzAnalyze(data,n,given),sourceRank:refined?rzFoodSourceRank:null,sourceRankFit:refined?rzCompare(rzFoodSourceRank,data,5).fits:null};}
export const rzPartyNames=['A','B₁','B₂'];
export const rzPartyRefinedNames=['参加A','B₁：另一朋友未邀请','B₁：另一朋友也邀请','B₂：另一朋友未邀请','B₂：另一朋友也邀请'];
export const rzPartyConstructedRank=[1,3,0,2,4];
export function rzParty(first=1,second=0,refined=false){if(![0,1].includes(first)||!Number.isInteger(second)||second<0||second>2)throw Error('party response outside menu');const n=refined?5:3,A=3,B=refined?21:7,a=refined?(first===0?0:1):first,b=refined?([0,2,4][second]):second,data={[A]:a,[B]:b};return{n,A,B,a,b,data,refined,sourceResponses:first===1&&second===0,names:refined?rzPartyRefinedNames:rzPartyNames,analysis:rzAnalyze(data,n),sourceRank:refined?rzPartyConstructedRank:null,sourceRankFit:refined?rzCompare(rzPartyConstructedRank,data,5).fits:null};}
