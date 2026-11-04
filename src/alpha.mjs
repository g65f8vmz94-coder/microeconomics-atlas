// Osborne-Rubinstein 2.3, printed21-22. Finite computations accompany general proofs.
import {menus,members,table24} from './choice.mjs';
import {rzAnalyze,rzCompare,rzOrders} from './rationalization.mjs';

export const alphaCases=['alpha','rationalalpha','constructrank'];
export const alphaOrders=n=>rzOrders(n);
export function alphaDecode(code,n=3){
 if(!Number.isInteger(n)||n<0||n>6||code.length!==menus(n).length||!/^[0-5u]*$/.test(code))throw Error('finite candidate table code');
 return Object.fromEntries(menus(n).map((A,i)=>[A,code[i]==='u'?null:Number(code[i])]));
}
export function alphaEncode(data,n=3){
 return menus(n).map(A=>data[A]===null||data[A]===undefined?'u':String(data[A])).join('');
}
export function alphaFromOrder(order){
 // Validation is shared with the independently tested strict-order comparator.
 rzCompare(order,{},order.length);
 return Object.fromEntries(menus(order.length).map(A=>[A,order.find(x=>A&(1<<x))]));
}
export const alphaTable=index=>table24(index);

export function alphaPair(data,n,A,B){
 const full=(1<<n)-1,a=data[A]??null,b=data[B]??null;
 const row={A,B,a,b,applies:false,pass:null,winnerInSmall:a===null?null:!!(B&(1<<a))};
 if(!Number.isInteger(A)||A<=0||A>full)return{...row,kind:'empty-or-invalid-large'};
 if(!Number.isInteger(B)||B<0||B>full)return{...row,kind:'invalid-small'};
 if(B===0)return{...row,kind:'empty-small'};
 if(A===B)return{...row,kind:'same-menu'};
 if((B&A)!==B)return{...row,kind:'not-subset'};
 if((a!==null&&(!Number.isInteger(a)||a<0||a>=n||!(A&(1<<a))))||(b!==null&&(!Number.isInteger(b)||b<0||b>=n||!(B&(1<<b)))))return{...row,kind:'invalid-answer'};
 if(a===null)return{...row,kind:'unanswered-large'};
 if(!(B&(1<<a)))return{...row,kind:'winner-removed'};
 if(b===null)return{...row,applies:true,kind:'unanswered-small'};
 return{...row,applies:true,pass:a===b,kind:a===b?'preserved':'violated'};
}
export function alphaAnalyze(data,n=3){
 const base=rzAnalyze(data,n),pairs=[];
 for(const A of menus(n))for(const B of menus(n))if(B!==A&&(B&A)===B)pairs.push(alphaPair(data,n,A,B));
 const failures=pairs.filter(p=>p.kind==='violated');
 return{...base,pairs,failures,fullyChecked:pairs.filter(p=>p.kind==='preserved'||p.kind==='violated').length,
  alphaComplete:base.complete&&failures.length===0,
  // This is an extension test for finite full-domain alpha, not a claim that
  // absence of a directly observed nested-pair failure proves extendibility.
  canCompleteAlpha:base.invalid.length===0&&base.compatibleKnown,
  alphaCompletions:base.compatible.length};
}
export function alphaPeel(data,n=3){
 let remaining=(1<<n)-1;const rows=[],order=[];let stop=null;
 while(remaining){
  const x=data[remaining];
  if(x===null||x===undefined){stop={kind:'unanswered',menu:remaining};break;}
  if(!Number.isInteger(x)||x<0||x>=n||!(remaining&(1<<x))){stop={kind:'invalid-answer',menu:remaining,answer:x};break;}
  rows.push({round:rows.length+1,menu:remaining,winner:x});order.push(x);remaining&=~(1<<x);
 }
 const complete=order.length===n,comparison=complete?rzCompare(order,data,n):null;
 return{n,rows,order,remaining,stop,complete,comparison};
}
export function alphaTail(data,n,peel,A){
 const full=(1<<n)-1;
 if(!Number.isInteger(A)||A<=0||A>full||!peel.complete)return null;
 const m=peel.order.findIndex(x=>A&(1<<x)),x=peel.order[m],tail=peel.order.slice(m).reduce((s,y)=>s|(1<<y),0);
 return{A,m,x,tail,observed:data[A]??null,matches:data[A]===x,sameMenu:A===tail,pair:alphaPair(data,n,tail,A)};
}
export function alphaStudy(data,n=3,A=(1<<n)-1,B=1,target=A,order=rzOrders(n)[0]){
 const analysis=alphaAnalyze(data,n),peel=alphaPeel(data,n),comparison=rzCompare(order,data,n);
 return{analysis,peel,pair:alphaPair(data,n,A,B),tail:alphaTail(data,n,peel,target),comparison,
  canUseProposition21:analysis.complete&&analysis.invalid.length===0&&comparison.fits,
  canUseProposition22:analysis.alphaComplete,
  peeledOrderRepresentsFull:analysis.complete&&peel.complete&&peel.comparison.fits};
}
export function alphaSourceWitness(kind){
 if(kind==='median')return{n:5,A:31,B:28,data:{31:2,28:3},names:['a₁','a₂','a₃','a₄','a₅'],source:'Example2.2',note:'Only the two rows used in the source counterexample are loaded.'};
 if(kind==='restaurant')return{n:4,A:15,B:3,data:{15:1,3:0},names:['三文鱼','牛排','蜗牛','蛙腿'],source:'Example2.3',note:'Large menu is later in the story; set inclusion is not chronology. Given aversion comparisons are unnecessary for this alpha witness.'};
 if(kind==='party')return{n:3,A:7,B:3,data:{7:0,3:1},names:['A','B₁','B₂'],source:'Example2.4',note:'Fixed hosts; contextual refinement belongs to the separately labeled2.2 model.'};
 throw Error('unknown source witness');
}
