import assert from 'node:assert/strict';
import fs from 'node:fs';
import {utility,cdExchange,allocationCheck,manipulatedExchange} from './src/economy.mjs';
let checks=0;const eq=(x,y,label)=>{checks++;assert.ok(Math.abs(x-y)<1e-7,label+': '+x+' '+y)};
for(const e1 of [1,3,8,9])for(const e2 of [1,2,6,9])for(const a of [.15,.5,.85])for(const b of [.15,.5,.85]){
 const s={e1,e2,a,b},r=cdExchange(s),E=r.equilibrium;
 eq(E.A[0]+E.B[0],10,'good1 clearing');eq(E.A[1]+E.B[1],10,'good2 clearing');
 eq(r.eq*E.A[0]+E.A[1],r.eq*e1+e2,'budget conservation');
 for(const p of [.2,.7,1,2,5])eq(cdExchange({...s,p}).walras,0,'Walras law');
 const c=allocationCheck({...s,x:E.A[0],y:E.A[1]});checks++;assert.ok(c.efficient&&c.core,'equilibrium in core');
 const reopened=cdExchange({...s,e1:E.A[0],e2:E.A[1]});eq(reopened.eq,r.eq,'reopen price');eq(reopened.equilibrium.A[0],E.A[0],'no further trade');
 for(const t of [.2,2,5,8,9.8]){const y=r.curve(t);eq(a/(1-a)*y/t,b/(1-b)*(10-y)/(10-t),'contract curve MRS equality')}
 const m=manipulatedExchange({...s,report:.8},.7);eq(m.honestUtility,utility(...E.A,a),'honesty baseline ignores manipulated report');
}
const r={checks,passed:true,scope:'Two-person Cobb-Douglas exchange model; does not validate all exchange-economy claims.'};fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/economy.json',JSON.stringify(r,null,2));console.log(r);
