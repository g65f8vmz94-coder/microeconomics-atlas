import assert from 'node:assert/strict';
import {menuM,menuOutcomeM} from './src/monopoly.mjs';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const kink={VL:q=>q-.2*q*q,VH:q=>q-.2*q*q+.4*q+.5*Math.max(q-.5,0)};
const examples=[menuM('standard'),menuM('high'),menuM('close'),kink];
let feasible=0,candidates=0;
for(const {VH,VL} of examples){
 const D=q=>VH(q)-VL(q),f=q=>2*VL(q)-VH(q);
 for(let a=0;a<=10;a++)for(let b=0;b<=10;b++){
  const qH=a/10,qL=b/10;
  for(let i=0;i<=8;i++)for(let j=0;j<=8;j++){
   const mL=VL(qL)*i/8,mH=VH(qH)*j/8;
   const h=VH(qH)-mH,l=VL(qL)-mL;
   if(h< -1e-9||l< -1e-9||h+1e-9<VH(qL)-mL||l+1e-9<VL(qH)-mH)continue;
   assert.ok(qH+1e-9>=qL);
   assert.ok(mH+mL<=VH(1)+f(qL)+1e-8);
   feasible++;
  }
 }
 for(let i=0;i<=100;i++){
  const q=i/100,ml=VL(q),mh=VH(1)-D(q);
  const hBig=VH(1)-mh,hSmall=VH(q)-ml,lBig=VL(1)-mh;
  near(hBig,D(q));near(hSmall,D(q));near(VL(q)-ml,0);
  assert.ok(hBig>=-1e-8&&lBig<=1e-8);
  near(ml+mh,VH(1)+f(q));candidates++;
 }
}
assert.ok(finiteDifferencePeak(kink,.5));
function finiteDifferencePeak({VL,VH},q){const f=x=>2*VL(x)-VH(x);return f(q)>f(q-.001)&&f(q)>f(q+.001)}
for(const preset of ['standard','high','close']){
 const z=menuM(preset),r=menuOutcomeM(z,z.qstar,z.ml,z.mh,'seller');
 assert.ok(r.irL>=-1e-8&&r.irH>=-1e-8&&r.icH>=-1e-8&&r.icL>=-1e-8);
 near(z.separate,z.VH(1)+2*z.VL(z.qstar)-z.VH(z.qstar));
}
assert.equal(menuM('high').qstar,0);assert.equal(menuM('close').qstar,1);
console.log(JSON.stringify({passed:true,valuationExamples:examples.length,feasibleMenus:feasible,candidateQuantities:candidates,nondifferentiableMaximum:.5,boundaryQuantities:[0,1]}));
