// Sections2.4/2.5, printed22-24. General proofs live in sequential-content.mjs.
import {menus,members,satisficingChoice,satisficingRank,originalSatisficing,alphaFailures,table24} from './choice.mjs';
import {rzOrders} from './rationalization.mjs';
import {alphaPair} from './alpha.mjs';
export const sdOrders=rzOrders;
export const sdOriginal={values:[...originalSatisficing.values],threshold:0,order:[0,1,2,3]};
function sdValidate(values,threshold,order){const n=values.length;if(n>6||!values.every(Number.isFinite)||!Number.isFinite(threshold)||order.length!==n||new Set(order).size!==n||order.some(x=>!Number.isInteger(x)||x<0||x>=n))throw Error('finite values and a fixed complete ordering required');}
export function sdInterview(values,threshold,order,A){
 sdValidate(values,threshold,order);const n=values.length,full=(1<<n)-1;if(!Number.isInteger(A)||A<=0||A>full)return{valid:false,choice:null,rows:[],good:[],reason:'empty-or-invalid-menu'};
 const xs=order.filter(i=>A&(1<<i)),good=xs.filter(i=>values[i]>=threshold),rows=[];let choice=null;
 for(const i of xs){const satisfactory=values[i]>=threshold;rows.push({candidate:i,value:values[i],satisfactory});if(satisfactory){choice=i;break;}}
 if(choice===null)choice=xs[xs.length-1];
 return{valid:true,choice,rows,good,fallback:good.length===0,last:xs[xs.length-1],skipped:xs.filter(i=>!rows.some(r=>r.candidate===i))};
}
export function sdSatisficing(values,threshold,order,A){
 const interview=sdInterview(values,threshold,order,A),n=values.length,rank=satisficingRank(values,threshold,order),data=Object.fromEntries(menus(n).map(M=>[M,satisficingChoice(M,values,threshold,order)])),rows=menus(n).map(M=>({menu:M,choice:data[M],predicted:rank.find(i=>M&(1<<i))}));
 return{interview,rank,data,rows,good:order.filter(i=>values[i]>=threshold),bad:order.filter(i=>values[i]<threshold),matched:rows.filter(r=>r.choice===r.predicted).length,alphaFailures:alphaFailures(data,n),prediction:interview.valid?rank.find(i=>A&(1<<i)):null};
}
export function sdPumpRoute(type='cycle',table=1,A=7,B=3){
 if(type==='cycle')return{valid:true,type,start:0,data:{3:0,6:1,5:2},offers:[5,6,3],period:3,source:'Original three binary observations; no unprovided triple answer invented'};
 if(type!=='menu')throw Error('unknown pump route');
 const data=table24(table),pair=alphaPair(data,3,A,B);return{valid:pair.kind==='violated',type,start:data[A]??null,data,offers:[B,A],period:2,pair,source:'Autonomous complete three-item function illustrates the source general construction'};
}
export function sdPump(options={}){
 const o={type:'cycle',table:1,A:7,B:3,steps:0,fee:1,willing:1,cash:9,notice:-1,decay:false,...options};
 if(!Number.isInteger(o.steps)||o.steps<0||o.steps>1000||!Number.isInteger(o.notice)||o.notice< -1||![o.fee,o.willing,o.cash].every(x=>Number.isFinite(x)&&x>=0))throw Error('finite nonnegative payments/wealth and nonnegative integer steps required');
 const route=sdPumpRoute(o.type,o.table,o.A,o.B),rows=[],states=[{step:0,held:route.start,cash:o.cash,paid:0}];let held=route.start,cash=o.cash,paid=0;
 // Relative rounding allowance: a positive fee can never be accepted against
 // exactly zero willingness or cash, however small the amount is.
 const exceeds=(a,b)=>a>b&&a-b>8*Number.EPSILON*Math.max(a,b);
 const next=()=>{
  if(!route.valid)return{allowed:false,reason:'not-an-alpha-witness'};
  const j=rows.length,menu=route.offers[j%route.period],choice=route.data[menu],factor=o.decay?2**(-j):1,fee=o.fee*factor,willing=o.willing*factor;
  const base={menu,from:held,to:choice,fee,willing,cash,inventory:7^(1<<held)};
  if(o.notice>=0&&j>=o.notice)return{...base,allowed:false,reason:'noticed-and-refuses'};
  if(!(menu&(1<<held))||choice===held||!Number.isInteger(choice)||!(menu&(1<<choice)))return{...base,allowed:false,reason:'no-chosen-replacement'};
  if(exceeds(fee,willing))return{...base,allowed:false,reason:'not-willing-to-pay'};
  if(exceeds(fee,cash))return{...base,allowed:false,reason:'cannot-afford'};
  return{...base,allowed:true};
 };
 for(let j=0;j<o.steps;j++){const proposal=next();if(!proposal.allowed)break;cash=Math.max(0,cash-proposal.fee);paid+=proposal.fee;held=proposal.to;rows.push({...proposal,step:j+1,remaining:cash,paid,inventoryAfter:7^(1<<held)});states.push({step:j+1,held,cash,paid});}
 const proposal=next();return{options:o,route,rows,states,held,cash,paid,completed:rows.length,cycles:Math.floor(rows.length/route.period),returned:rows.length>0&&held===route.start,proposal,stop:proposal.allowed?null:proposal.reason,positiveLoss:paid>0,decliningBound:o.decay?2*o.fee:null};
}
