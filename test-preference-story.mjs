import fs from 'node:fs';
import assert from 'node:assert/strict';
import {lottery,mixture,support,goodMass,worstPrize,compound,textbookCompound} from './src/uncertainty.mjs';
import {preferenceStories,preferenceFrame,preferenceReadout} from './src/preference-story.mjs';

let checks=0;
function ok(value,message){checks++;assert.ok(value,message)}
function eq(actual,expected,message){checks++;assert.deepEqual(actual,expected,message)}
function close(a,b,message){checks++;assert.ok(Math.abs(a-b)<1e-10,`${message}: ${a} vs ${b}`)}

const counts={pessimist:7,goodbad:6,support:5,continuity:7,compound:6,independence:6,monotonic:7};
eq(Object.keys(preferenceStories),Object.keys(counts),'seven printed-section topics');
for(const [mode,story] of Object.entries(preferenceStories)){
 eq(story.frames.length,counts[mode],mode+' film length');
 ok(story.intro.length>25&&story.end.length>25,mode+' starts and concludes');
 eq(story.labels.length,3,mode+' fixed outcome labels');
 for(let i=0;i<story.frames.length;i++){
  const frame=preferenceFrame(mode,i),r=preferenceReadout(frame);
  ok(frame.source.includes('原书')||frame.source.includes('自主'),mode+' frame '+i+' provenance');
  ok(frame.narration.length>25&&frame.formula.length>5,mode+' frame '+i+' explanation');
  lottery(frame.p);lottery(frame.q);checks+=2;
  ok(r.kind===frame.score,mode+' frame '+i+' readout');
  if(mode==='compound'){
   lottery(r.values);checks++;
   eq(r.values,mixture(frame.alpha,frame.p,frame.q),mode+' two-stage collapse');
  }else ok(['≻','∼','≺'].includes(r.relation),mode+' frame '+i+' comparison');
 }
}
ok(preferenceStories.pessimist.frames[2].p[2]===.001,'tiny positive risk preserved');
eq(support(preferenceStories.pessimist.frames[2].p),[0,2],'tiny risk remains possible');
eq(preferenceReadout(preferenceFrame('pessimist',2)).relation,'≺','pessimist still loses');
eq(preferenceReadout(preferenceFrame('pessimist',3)).relation,'≻','zero-risk endpoint jumps');
eq(preferenceReadout(preferenceFrame('pessimist',4)).relation,'∼','basic pessimist ties at same worst prize');
eq(preferenceReadout(preferenceFrame('pessimist',6)).relation,'∼','same worst b violates strict branch order');
close(goodMass(preferenceStories.goodbad.frames[0].p,[0,1]),.6,'good set sums two prizes');
eq(preferenceReadout(preferenceFrame('goodbad',2)).relation,'∼','good-set reallocation ties');
eq(preferenceReadout(preferenceFrame('support',1)).relation,'≻','tiny rain is a second option');
eq(preferenceReadout(preferenceFrame('support',2)).relation,'∼','zero rain removes an option');
eq(preferenceReadout(preferenceFrame('support',4)).relation,'≺','common branch violates independence under count rule');
eq(preferenceReadout(preferenceFrame('continuity',3)).relation,'∼','illustrative interior indifference');
eq(preferenceReadout(preferenceFrame('continuity',5)).relation,'≺','pessimist lacks interior indifference');
eq(textbookCompound,{p:[.6,0,.4],q:[.2,.3,.5]},'book compound ingredients');
for(let k=0;k<=100;k++){
 const alpha=k/100,out=compound(alpha),sum=out.reduce((a,b)=>a+b,0);
 close(out[0],alpha*.6+(1-alpha)*.2,'W path sum');
 close(out[1],(1-alpha)*.3,'D path sum');
 close(out[2],alpha*.4+(1-alpha)*.5,'L path sum');
 close(sum,1,'all outcomes exhaust probability');
}
compound(.75).forEach((v,i)=>close(v,[.5,.075,.425][i],'textbook boxes at alpha=.75'));
compound(.5).forEach((v,i)=>close(v,[.4,.15,.45][i],'textbook boxes at alpha=.5'));
eq(preferenceReadout(preferenceFrame('independence',1)).relation,'≻','goodbad preserves strict order');
eq(preferenceReadout(preferenceFrame('independence',2)).relation,'∼','pessimist breaks strict order');
eq(preferenceReadout(preferenceFrame('independence',3)).relation,'≺','min-options breaks tie');
eq(preferenceReadout(preferenceFrame('independence',5)).relation,'∼','zero branch makes final lotteries identical');
ok(worstPrize([.6,.4,0],[3,2,1])===worstPrize([0,1,0],[3,2,1]),'pessimist counterexample uses same worst outcome');
for(let i=1;i<=20;i++)for(let j=0;j<i;j++){
 const alpha=i/20,beta=j/20,pAlpha=[alpha,1-alpha,0],pBeta=[beta,1-beta,0],ratio=beta/alpha;
 const compressed=mixture(ratio,pAlpha,[0,1,0]);
 compressed.forEach((v,k)=>close(v,pBeta[k],'lemma collapse at '+alpha+','+beta));
 ok(ratio>=0&&ratio<1,'lemma uses a legal positive or zero common weight');
}
for(const bad of [['pessimist',7],['missing',0],['support',-1]])assert.throws(()=>preferenceFrame(...bad));
checks+=3;
const report={passed:true,section:'3.2',frames:Object.fromEntries(Object.entries(preferenceStories).map(([k,v])=>[k,v.frames.length])),totalFrames:Object.values(counts).reduce((a,b)=>a+b,0),checks,sourceExamples:'3.1–3.3, definitions3.2–3.4, lemma3.1; printed32–35',compoundPathGrid:101,lemmaAlgebraPairs:210,positiveWeightBoundaryExplained:true};
fs.writeFileSync('qa/preference-story-models.json',JSON.stringify(report,null,2)+'\n');
console.log(report);
