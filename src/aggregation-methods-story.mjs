import {aggregate,relationCheck,allProfiles} from './final-topics.mjs';
import {p203Decision} from './aggregation-exercises.mjs';
import {aggregationMethodsContent,aggregationMethodsKeys} from './aggregation-methods-content.mjs';
const base=[[0,1,2],[1,0,2],[1,2,0]];
const cycle=[[0,1,2],[1,2,0],[2,0,1]];
const another=[[0,1,2],[1,0,2],[2,0,1]];
const cFans=[[2,1,0],[2,0,1],[2,1,0]];
const displayPairs=[[0,1],[1,2],[2,0]];
export function aggregationMethodsFrame(key,step){
 if(!aggregationMethodsKeys.includes(key))throw Error('unknown aggregation method '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('aggregation method step outside 0..5');
 const c=aggregationMethodsContent[key];let model;
 if(key==='society')model={mode:'rankings',profile:base,revealPeople:Math.min(3,Math.max(0,step-1)),showResult:false,label:'N是参与的人，X是共同方案；三张卡构成一份档案'};
 else if(key==='paf'){
  const profile=step>=3?another:base,r=aggregate(profile,'plurality');
  model={mode:'scores',profile,revealPeople:3,counted:step>=2?3:0,scores:step>=2?r.score:[0,0,0],showResult:step>=2,label:step>=3?'档案已换，规则仍是只数首位':'第一份个人档案交给同一条规则'};
 }else if(key==='favorites'||key==='scoring'){
  const counted=[0,1,2,3,3,3][step],rule=key==='favorites'?'plurality':'borda',r=aggregate(base.slice(0,counted),rule,[2,1,0]);
  model={mode:'scores',profile:base,revealPeople:3,counted,scores:r.score,showResult:counted===3,unit:key==='favorites'?'首位票':'名次分',label:key==='favorites'?'只读取每张卡的首位，第二名不计票':'本站2/1/0计分：逐张排名入账'};
 }else if(key==='pairwise'){
  const r=aggregate(cycle,'copeland'),revealPairs=[0,1,2,3,3,3][step],scores=[0,0,0];displayPairs.slice(0,revealPairs).forEach(([a,b])=>{const x=r.counts[a][b],y=r.counts[b][a];if(x>y)scores[a]++;else if(y>x)scores[b]++;else{scores[a]+=.5;scores[b]+=.5;}});
  model={mode:'pairwise',profile:cycle,revealPeople:3,revealPairs,counts:r.counts,scores,relation:r.R,showResult:revealPairs===3,label:'先逐对比赛，再按胜场总分排；不是原始多数关系'};
 }else if(key==='external'||key==='dictator'){
  const profile=key==='external'&&step>=3?cFans:key==='dictator'&&step===5?[cycle[2],base[1],base[2]]:base;
  const r=aggregate(profile,key==='external'?'external':'dictator');
  model={mode:'rank-output',profile,revealPeople:3,score:r.score,relation:r.R,showResult:step>=2,label:key==='external'?'社会榜固定a>b>c，不随个人档案变化':'固定1号的完整排序；仅1号改口才跟着变'};
 }else{
  let choices,result,rule,label,otherResults=null;
  if(key==='p203a'){
   choices=step>=3?[1,0,0]:[0,1,1];rule='projection';result=p203Decision(choices,rule,0);otherResults=[p203Decision(choices,'projection',0),p203Decision(choices,'projection',2)];label='两个不同的中立规则：听1号首选／听3号首选';
  }else if(key==='p203b'){
   choices=step>=2?[1,1,1]:[0,1,1];rule='constant';result=p203Decision(choices,rule);label='固定选a；全员首选b时仍选a，违反一致同意';
  }else{
   choices=step>=4?[2,2,0]:step>=2?[2,1,0]:[0,1,1];rule='projection';result=p203Decision(choices,rule,1);label='固定听2号首选，所有档案都如此';
  }
  model={mode:'decision',choices,result,rule,otherResults,revealPeople:3,showResult:step>0,label};
 }
 return {key,step,identity:c.scenes[step][0],narration:c.scenes[step][1],...model};
}
export const aggregationMethodsFixtures={base,cycle,another,cFans};
export function aggregationMethodsAllDomainCheck(){
 const rules=['plurality','borda','copeland','external','dictator'];let checks=0;
 for(const p of allProfiles)for(const rule of rules){const r=aggregate(p,rule);if(!relationCheck(r.R).complete||!relationCheck(r.R).transitive)throw Error('invalid PAF '+rule);checks++;}
 return {profiles:allProfiles.length,rules,checks};
}
