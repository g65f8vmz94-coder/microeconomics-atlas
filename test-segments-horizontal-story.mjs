import assert from 'node:assert/strict';
import {segmentsM, segmentsTeachingM} from './src/monopoly.mjs';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let checked=0;
for(const parameters of [{},{a1:120,a2:90,c:15,k:.6},{a1:100,a2:10,c:20,k:.4},{a1:10,a2:10,c:140,k:0}]){
 const model=segmentsM(parameters);
 for(let i=0;i<=400;i++){
  const frame=segmentsTeachingM(model,i/100);
  near(frame.qs[0]+frame.qs[1],model.Q);
  near(frame.profit,model.profitAt(...frame.qs));
  frame.sumQuantities.forEach((q,j)=>{
   near(q,Math.max(0,(model.A[j]-frame.sumLevel)/(2*model.B[j])));
   if(q>1e-8) near(model.A[j]-2*model.B[j]*q,frame.sumLevel);
   else assert.ok(model.A[j]<=frame.sumLevel+1e-8);
  });
  if(model.exit.some(Boolean)){
   frame.qs.forEach((q,j)=>near(q,model.qs[j]));
   near(frame.sumLevel,model.mc);
  }
  checked++;
 }
}
const example=segmentsM(),middle=segmentsTeachingM(example,3.5);
near(segmentsTeachingM(example,3).sumLevel,example.mc);
near(segmentsTeachingM(example,4).sumLevel,example.mc);
near(middle.sumLevel,80);
near(middle.sumQuantities[0],10);
near(middle.sumQuantities[1],0);
assert.match(middle.narration,/假想/);
assert.match(middle.narration,/不是说眼前实际总量已经改变/);
console.log(JSON.stringify({passed:true,states:checked,defaultTotal:example.Q,defaultMC:example.mc,hypotheticalLevel:middle.sumLevel,hypotheticalQuantities:middle.sumQuantities}));
