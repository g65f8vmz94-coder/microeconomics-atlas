import assert from 'node:assert/strict';import fs from 'node:fs';import {spawnSync} from 'node:child_process';import * as m from './src/monopoly.mjs';
let checks=0;const ok=(v,msg)=>{checks++;assert.ok(v,msg)},eq=(a,b,t=1e-7)=>ok(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
// Independent scans of full output boundaries verify that marginal conditions
// were not mistaken for sufficient conditions or used after shutdown.
for(const a of [20,100])for(const b of [.5,1,2])for(const c of [0,20,140])for(const k of [0,.4,1.5]){
 const z=m.linearM({a,b,c,k});ok(z.qm>=0&&z.qm<=z.choke);ok(z.qm<=z.qc&&z.qc<=z.qo+1e-8);eq(z.cost(0),0);
 for(let i=0;i<=120;i++){const q=z.choke*i/120;ok(z.profit(q)<=z.profit(z.qm)+1e-6);ok(z.TS(q)<=z.TS(z.qc)+1e-6);eq(m.welfareM(z,q).cs+m.welfareM(z,q).profit,z.TS(q));if(q>z.qo+1e-6)ok(z.profit(q)<0);}
 for(const cap of [0,c,a/2,a,140])for(const tie of ['min','max']){const r=m.capM(z,cap,tie);ok(r.q>=0&&r.q<=z.choke+1e-8);ok(r.profit>=-1e-7);for(let i=0;i<=100;i++){const q=z.choke*i/100;ok(r.profitAt(q)<=r.profit+1e-6)}if(k===0&&Math.abs(cap-c)<1e-8){ok(!!r.optimalInterval);for(const t of [0,.25,.5,1])eq(r.profitAt(t*r.kink),r.profit)}}
 const efficient=m.capM(z,z.P(z.qc),'max');eq(efficient.q,z.qc);if(k>0&&z.qc>0)eq(m.capM(z,z.P(z.qc),'min').q,z.qc);
 for(const t of [0,b*z.qc,120]){const r=m.subsidyM(z,t);eq(r.profit+r.consumerSurplus-r.fiscal,z.TS(r.q));for(let i=0;i<=100;i++){const q=z.choke*i/100;ok(z.profit(q)+t*q<=r.profit+1e-6)}if(t===b*z.qc)eq(r.q,z.qc)}
}
const flat=m.linearM({a:100,b:1,c:20,k:0});eq(m.capM(flat,20,'min').q,0);eq(m.capM(flat,20,'max').q,80);
const discrete=m.discreteRevenueM();eq(discrete.revenue[3],15);ok(discrete.marginal[3]>discrete.marginal[2]);
for(const r of [2.6,2.8,3,3.2,3.3]){const z=m.multipleM(r);eq(z.P(z.choke),0);for(const q of [1,2,r])eq(z.MR(q),1);for(let i=0;i<=300;i++){const q=z.choke*i/300;ok(z.slope(q)<0);ok(z.profit(q)<=z.profit(z.best[0])+1e-6);if(i>0&&i<300){const h=1e-5,fd=(z.P(q+h)*(q+h)-z.P(q-h)*(q-h))/(2*h);eq(fd,z.MR(q),1e-6)}}if(r===3)ok(z.best.length===2);else eq(z.best[0],r<3?1:r);}
for(const a1 of [10,100])for(const a2 of [10,80,140])for(const c of [0,20,140])for(const k of [0,.4,1.5]){
 const z=m.segmentsM({a1,a2,c,k});eq(z.mc,c+k*z.Q);for(let i=0;i<2;i++){ok(z.qs[i]>=0);if(z.qs[i]>1e-8)eq(z.A[i]-2*z.B[i]*z.qs[i],z.mc);else ok(z.A[i]<=z.mc+1e-6)}ok(z.profit>=z.uniform.profit-1e-6);
 for(let i=0;i<=16;i++)for(let j=0;j<=16;j++)ok(z.profitAt(a1*i/16,a2/1.2*j/16)<=z.profit+1e-6);
 for(let j=0;j<=100;j++){const p=Math.max(a1,a2)*j/100,qs=z.A.map((a,i)=>Math.max(0,(a-p)/z.B[i])),Q=qs[0]+qs[1],pi=p*Q-c*Q-k*Q*Q/2;ok(pi<=z.uniform.profit+1e-6)}
 for(const share of [-1,-.5,0,.5,1]){const r=m.reallocateM(z,share);eq(r.qs[0]+r.qs[1],z.Q);r.qs.forEach((q,i)=>{ok(q>=-1e-8);ok(q<=z.A[i]/z.B[i]+1e-8)});ok(r.profit<=z.profit+1e-6)}
}
for(const preset of Object.keys(m.menuPresetsM)){
 const z=m.menuM(preset);ok(z.qstar>=0&&z.qstar<=1);eq(z.best,z.separate);let rent=-1;
 for(let j=0;j<=80;j++){const q=j/80,r=m.menuOutcomeM(z,q);eq(r.irL,0);eq(r.icH,0);ok(r.irH>=-1e-8&&r.icL>=-1e-8);eq(r.profit,r.options[0].m+r.options[1].m);ok(r.profit<=z.best+1e-7);ok(r.rent>=rent);rent=r.rent;
  const buyer=m.menuOutcomeM(z,q,r.options[0].m,r.options[1].m,'buyer');ok(buyer.profit<=r.profit+1e-7);eq(buyer.profit,r.minProfit);
  if(q>0&&q<1){const eps=Math.min(.001,r.options[0].m/4,r.icL/4),strict=m.menuOutcomeM(z,q,r.options[0].m-eps,r.options[1].m-2*eps,'buyer');ok(strict.irL>0&&strict.icH>0&&strict.icL>0);ok(strict.H.chosen===2&&strict.L.chosen===1);eq(strict.profit,r.profit-3*eps)}
 }
 for(const q of [0,.5,1])for(const ml of [0,.75,1,2,5])for(const mh of [0,.75,1,2,5]){const r=m.menuOutcomeM(z,q,ml,mh);ok(r.profit<=z.best+1e-7);for(const type of ['H','L']){const V=type==='H'?z.VH:z.VL,choices=[0,V(q)-ml,V(1)-mh];eq(r[type].best,Math.max(...choices));ok(choices[r[type].chosen]>=r[type].best-1e-7)}}
}
const sep=m.menuM();eq(sep.qstar,.625);eq(sep.best,2.1125);const raised=m.menuOutcomeM(sep,sep.qstar,sep.ml,sep.mh+.1);ok(raised.H.chosen===1);ok(raised.profit<sep.best);
const original=m.doubleMarginsM();eq(original.direct.q,.25);eq(original.chain.q,1/6);eq(original.chain.wholesale,2/3);eq(original.chain.retail,5/6);eq(original.chain.producer,1/12);eq(original.chain.retailer,1/36);
for(const a of [.5,1,2])for(const b of [.5,1,2])for(const c of [0,.5,2])for(const k of [0,2,4]){const z=m.doubleMarginsM({a,b,c,k});ok(z.chain.q<=z.direct.q+1e-8);for(let j=0;j<=100;j++){const r=m.doubleMarginsM({a,b,c,k,wholesale:a*1.2*j/100});ok(r.current.producer<=z.chain.producer+1e-7)}const at=m.doubleMarginsM({a,b,c,k,wholesale:z.chain.wholesale});eq(at.current.q,z.chain.q)}
for(let j=0;j<=110;j++)for(const tie of ['one','two']){const r=m.doubleDiscreteM(j/10,tie);ok(r.producer<=12+1e-7);eq(r.retailer,Math.max(0,10-j/10,16-2*j/10));}
eq(m.doubleDiscreteM(6,'two').q,2);eq(m.doubleDiscreteM(6,'one').q,1);ok(!m.doubleDiscreteM(6,'one').maximumExists);eq(m.doubleDiscreteM(10,'one').q,0);ok(m.doubleDiscreteM(6-1e-5,'one').producer>11.999);
ok(m.taxDiscreteM(.6,.25).overshift);eq(m.taxDiscreteM(.6,.25).rise,.4);
for(const v of [.1,.51,.6,.65,.9])for(const t of [0,.1,.25,.5,1.2]){const r=m.taxDiscreteM(v,t);eq(r.after.profit,Math.max(0,1-t,2*(v-t)));if(!r.after.q)ok(r.after.price===null)}
for(const a of [4,10])for(const b of [.5,2])for(const c of [0,2,12])for(const t of [0,2,12]){const r=m.taxLinearM(a,b,c,t);if(r.q){eq(r.rise,t/2);eq(r.p-r.net,t)}else ok(r.p===null&&r.rise===null)}
for(const a1 of [2,6,12])for(const a2 of [1,a1/2,a1]){const r=m.fairnessM(a1,a2);ok(r.equal<=a2&&r.equal>=0);ok(r.unrestricted.profit>=r.profit-1e-7);eq(r.prices[0]+r.equal,a1);eq(r.prices[1]+r.equal,a2);for(let j=0;j<=100;j++){const q=a2*j/100;ok((a1+a2)*q-2*q*q<=r.profit+1e-7)}}eq(m.fairnessM(10,2).equal,2);
for(const values of [m.discreteValuesM.discount,m.discreteValuesM.premium,{H:[0,2,4],L:[0,3,5]},{H:[0,4,4],L:[0,1,6]}]){
 const z=m.optimalDiscreteMenuM(values),limit=Math.max(...values.H,...values.L)+1;let gridBest=0;
 // With integer values, this payment polygon has integer vertices; all
 // distinct menus use quantities1/2, with a prohibitively priced option
 // representing its deletion. Exhaustive prices independently verify the LP.
 for(let a=0;a<=limit;a++)for(let b=0;b<=limit;b++){const r=m.discreteMenuM(values,[{q:1,m:a},{q:2,m:b}]);gridBest=Math.max(gridBest,r.profit);ok(r.profit<=z.best+1e-7)}eq(gridBest,z.best);
 for(const r of z.winners){const options=[{q:r.qH,m:r.mh},{q:r.qL,m:r.ml}];eq(m.discreteMenuM(values,options).profit,z.best)}
}
eq(m.uniformDiscreteM().best.profit,21);eq(m.singleOptionM().profit,26);eq(m.optimalDiscreteMenuM().best,27);eq(m.discreteMenuM().H.chosen,2);eq(m.discreteMenuM().L.chosen,1);eq(m.optimalDiscreteMenuM(m.discreteValuesM.premium).best,24);
for(const [name,expected] of [['bundle',[20,22]],['separate',[30,22]]]){const r=m.bundlingM(name);eq(r.separate,expected[0]);eq(r.bundle.revenue,expected[1]);for(let p=0;p<=25;p+=.5){ok(p*r.values.filter(v=>v[0]+v[1]>=p).length<=r.bundle.revenue);for(let q=0;q<=20;q+=.5)ok(q*r.values.filter(v=>v[0]>=q).length+p*r.values.filter(v=>v[1]>=p).length<=r.separate)}}
for(const a of [4,10])for(const b of [.5,1])for(const c of [0,2,12])for(const k of [0,.5,2]){const z=m.linearM({a,b,c,k}),best=z.TS(z.qc),at=m.twoPartM(z);eq(at.profit,best);eq(at.q,z.qc);for(let j=0;j<=30;j++)for(const factor of [0,.5,1,1.01,1.5]){const r=m.twoPartM(z,a*1.5*j/30,factor);ok(r.profit<=best+1e-7);ok(r.consumerUtility>=-1e-7);eq(r.profit+r.consumerUtility,z.TS(r.q));if(factor>1&&r.demandBeforeFee>1e-7)ok(!r.accepted)}}
for(let n=1;n<=4;n++){const html=fs.readFileSync(`dist/downloads/lesson-7-${n}.html`,'utf8'),module=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)][0]?.[1];ok(!!module);ok(!/^import /m.test(module));ok(!/<iframe/.test(html));const r=spawnSync(process.execPath,['--input-type=module','--check'],{input:module,encoding:'utf8'});ok(r.status===0,r.stderr)}
fs.writeFileSync('qa/monopoly-models.json',JSON.stringify({passed:true,checks,scope:'Global output/policy scans incl shutdown and flat caps; monotone inverse demand with3 stationary points; coupled segments/uniform-price active sets/nonnegative reallocations; continuous menu IR/IC and adverse ties; double-margin original functions and supremum boundary; discrete/linear tax; fair-CS constraints; exact payment LP checked by exhaustive integer menus; all7 source exercises and four standalone modules'},null,2));console.log({passed:true,checks});
