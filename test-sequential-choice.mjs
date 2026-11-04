import assert from 'node:assert/strict';import fs from 'node:fs';
import {sdInterview,sdSatisficing,sdPump,sdPumpRoute} from './src/sequential-choice.mjs';
import {table24} from './src/choice.mjs';
let checks=0,interviews=0,profiles=0,pumpRuns=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++},ok=(v,msg)=>{assert.ok(v,msg);checks++};
const perms=a=>a.length?a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
const refInterview=(values,t,order,A)=>{const available=order.filter(i=>(A>>i)&1),passed=available.filter(i=>values[i]>=t),winner=passed.length?passed[0]:available.at(-1);return{available,winner,inspected:passed.length?available.slice(0,available.indexOf(winner)+1):available};};
for(let n=1;n<=4;n++)for(let code=0;code<3**n;code++){let k=code,values=Array.from({length:n},()=>{const z=k%3-1;k=Math.floor(k/3);return z});for(const t of[-2,-1,0,.5,1,2])for(const order of perms(Array.from({length:n},(_,i)=>i))){
 const s=sdSatisficing(values,t,order,1);eq(s.matched,(1<<n)-1);eq(s.alphaFailures.length,0);eq(new Set(s.rank).size,n);profiles++;
 for(let A=1;A<1<<n;A++){const r=refInterview(values,t,order,A),a=sdInterview(values,t,order,A),best=r.available.reduce((x,y)=>{const gx=values[x]>=t,gy=values[y]>=t;if(gx!==gy)return gy?y:x;return(gx?order.indexOf(y)<order.indexOf(x):order.indexOf(y)>order.indexOf(x))?y:x});eq(a.choice,r.winner);eq(a.rows.map(x=>x.candidate),r.inspected);eq(a.choice,best);eq(s.data[A],best);eq(a.skipped,r.available.filter(x=>!r.inspected.includes(x)));ok(a.rows.length<=r.available.length);interviews++;}
 }}
for(let mask=0;mask<16;mask++)for(const order of perms([0,1,2,3])){const s=sdSatisficing([0,1,2,3].map(i=>(mask>>i)&1),.5,order,15);for(let A=1;A<16;A++)for(let B=1;B<16;B++)if(A!==B&&(A&B)===B&&(B&(1<<s.data[A])))eq(s.data[A],s.data[B],'all qualification partitions and nested menus');}
eq(sdInterview([-1,-2,1,3],0,[0,1,2,3],15).choice,2);eq(sdSatisficing([-1,-2,1,3],0,[0,1,2,3],15).rank,[2,3,1,0]);eq(sdInterview([-1,-2,1,3],1,[0,1,2,3],15).choice,2);eq(sdInterview([-1,-2,1,3],5,[0,1,2,3],15).choice,3);eq(sdInterview([-1,-2,1,3],-5,[0,1,2,3],15).choice,0);eq(sdInterview([1],0,[0],0).choice,null);eq(sdSatisficing([],0,[],0).rows,[]);
const source=sdPump({steps:3});eq(source.states.map(s=>s.held),[0,2,1,0]);eq(source.rows.map(r=>r.menu),[5,6,3]);eq(source.paid,3);eq(source.cash,6);eq(source.returned,true);
for(let table=0;table<24;table++){const d=table24(table);for(let A=0;A<8;A++)for(let B=0;B<8;B++){
 const expected=A>0&&B>0&&A!==B&&(A&B)===B&&!!(B&(1<<d[A]))&&d[A]!==d[B];eq(sdPumpRoute('menu',table,A,B).valid,expected);
 for(const steps of[0,1,2,3,7]){const p=sdPump({type:'menu',table,A,B,steps,fee:1,willing:1,cash:20});pumpRuns++;eq(p.completed,expected?steps:0);if(expected){eq(p.held,steps%2?d[B]:d[A]);eq(p.paid,steps);eq(p.cash,20-steps);for(const r of p.rows){eq(r.to,d[r.menu]);ok(r.menu&(1<<r.from));ok(r.inventory&(1<<r.to));ok(!(r.inventoryAfter&(1<<r.to)));eq(r.inventoryAfter|(1<<r.to),7);}}else eq(p.paid,0);}
 }}
for(const decay of[false,true])for(const fee of[0,.25,1,2,5])for(const willing of[0,.25,1,5])for(const cash of[0,.5,2,9,30])for(const notice of[-1,0,2,3,6])for(const steps of[0,1,2,3,6,12,24]){
 const p=sdPump({decay,fee,willing,cash,notice,steps});pumpRuns++;ok(p.cash>=0);ok(p.paid>=0);ok(Math.abs(p.cash+p.paid-cash)<1e-9);ok(p.completed<=steps);ok(notice<0||p.completed<=notice);eq(p.held,[0,2,1][p.completed%3]);
 if(fee>willing)eq(p.completed,0);if(fee===0&&notice===-1)eq(p.completed,steps);for(let i=0;i<p.rows.length;i++){const r=p.rows[i];ok(r.fee<=r.willing+1e-10);ok(r.fee<=r.cash+1e-10);eq(r.to,[2,1,0][i%3]);eq(r.menu,[5,6,3][i%3]);eq(r.fee,fee*(decay?2**(-i):1));}
 if(decay&&cash>=2*fee&&willing>=fee&&notice===-1){eq(p.completed,steps);ok(Math.abs(p.paid-2*fee*(1-2**(-steps)))<1e-9);if(fee>0)ok(p.paid<2*fee);}
 if(!decay&&fee>0&&willing>=fee&&notice===-1)eq(p.completed,Math.min(steps,Math.floor(cash/fee+1e-9)));
}
for(const args of[{steps:-1},{steps:1.5},{fee:-1},{cash:Infinity},{willing:NaN}]){assert.throws(()=>sdPump(args));checks++;}
// A positive microscopic fee must not pass a zero cash/WTP boundary.
for(const fee of[1e-11,1e-15,Number.MIN_VALUE]){
 const unwilling=sdPump({fee,willing:0,cash:9,steps:3});eq(unwilling.completed,0);eq(unwilling.paid,0);eq(unwilling.stop,'not-willing-to-pay');
 const broke=sdPump({fee,willing:fee,cash:0,steps:3});eq(broke.completed,0);eq(broke.paid,0);eq(broke.stop,'cannot-afford');
 const equal=sdPump({fee,willing:fee,cash:fee,steps:3});eq(equal.completed,1);eq(equal.cash,0);eq(equal.paid,fee);
}
const decimal=sdPump({fee:.1,willing:.1,cash:.3,steps:4});eq(decimal.completed,3);ok(Math.abs(decimal.paid-.3)<Number.EPSILON);eq(decimal.cash,0);
const result={passed:true,checks,finiteSatisficingProfiles:profiles,interviewMenus:interviews,pumpRuns,sourceCycle:{objects:[0,2,1,0],offers:[5,6,3],paid:3},scope:'Independent interview/ordinal comparisons,all four-item qualification partitions and proper submenus,all24 full three-item functions and64 menu pairs; money/inventory conservation,closed-form fixed/declining payments,awareness,willingness,affordability and stopping. General proofs separate.'};fs.writeFileSync('qa/sequential-models.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
