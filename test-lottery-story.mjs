import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lottery,support} from './src/uncertainty.mjs';
import {lotteryStories,lotteryFrame,probabilityPoint,frameSupport} from './src/lottery-story.mjs';

let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++};
const close=(a,b,message)=>ok(Math.abs(a-b)<1e-10,message);

for(const [mode,story] of Object.entries(lotteryStories))for(let i=0;i<story.frames.length;i++){
 const frame=lotteryFrame(mode,i);
 ok(!!frame.title&&!!frame.narration&&!!frame.formula&&!!frame.note,`${mode}/${i}: complete authored beat`);
 if(mode==='lottery'){
  if(frame.invalid){ok(i===4,'only the explicitly marked exercise is invalid');assert.throws(()=>lottery(frame.p));checks++;ok(frame.p[0]===.6&&frame.p[1]===.6,'invalid data were not renormalized');ok(frameSupport(frame)===null,'invalid candidate has no support set');}
  else{lottery(frame.p);checks++;ok(frameSupport(frame).length===support(frame.p).length,'positive support is exact');}
 }else{lottery(frame.pair);lottery(frame.tri);checks+=2;}
}
close(lotteryStories.lottery.frames[0].p[0],.001,'source raffle chance');
close(lotteryStories.lottery.frames[1].p[0],.3,'source grey holiday chance');
ok(frameSupport(lotteryStories.lottery.frames[2]).length===2,'tiny positive remains in support');
ok(frameSupport(lotteryStories.lottery.frames[3]).length===1,'zero leaves support');
assert.throws(()=>lottery([-.1,1.1]));checks++;
assert.throws(()=>lottery([.6,.6]));checks++;

const lineVertices=[[1,0],[0,1]],triVertices=[[0,1],[0,0],[1,0]];
for(let a=0;a<=20;a++)for(let b=0;b<=20-a;b++){
 const p=[a/20,b/20,1-(a+b)/20],xy=probabilityPoint(p,triVertices);
 close(xy[0],p[2],'flat triangle horizontal barycentric coordinate');
 close(xy[1],p[0],'flat triangle vertical barycentric coordinate');
 ok(xy[0]>=-1e-10&&xy[1]>=-1e-10&&xy[0]+xy[1]<=1+1e-10,'point stays in triangle including boundary');
}
for(let i=0;i<=20;i++){const p=[i/20,1-i/20],xy=probabilityPoint(p,lineVertices);close(xy[0],p[0],'two-prize x is p1');close(xy[1],p[1],'two-prize y is p2');close(xy[0]+xy[1],1,'two-prize point stays on line')}
ok(lotteryStories.simplex.frames.some(f=>f.tri.every((x,i)=>x===[1,0,0][i])),'deterministic corner is shown');
ok(lotteryStories.simplex.frames.some(f=>f.tri.every(x=>x>0)),'three-prize interior is shown');
ok(lotteryStories.simplex.frames.some(f=>f.tri.some(x=>x===0)&&f.tri.some(x=>x>0)),'triangle edge is shown');

const report={passed:true,section:'3.1',checks,sourceExamples:'car raffle 0.001 and grey holiday 0.3',frames:{lottery:lotteryStories.lottery.frames.length,simplex:lotteryStories.simplex.frames.length},invalidCandidatesNotRenormalized:true,tinyPositiveSupport:true,barycentricLineAndTriangle:true};
fs.writeFileSync(new URL('./qa/lottery-story-models.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
