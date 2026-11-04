import {aggregate,relationCheck} from './final-topics.mjs';
import {p201Vote,p202Single,p204Classify} from './aggregation-exercises.mjs';
import {socialPreferencesContent,socialPreferencesKeys} from './social-preferences-content.mjs';

const original=[[0,1,2],[1,2,0],[2,0,1]];
const scoring=[[0,1,2],[0,2,1],[1,2,0]];
const socialPreferencePairs=[[0,1],[1,2],[2,0]];
const checked=(R)=>R?relationCheck(R):null;

export function socialPreferencesFrame(key,step){
 if(!socialPreferencesKeys.includes(key))throw Error('unknown social preference story '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('social preference step outside 0..5');
 const c=socialPreferencesContent[key];let model;
 if(key==='ordinal')model={mode:'rankings',profile:original,revealPeople:Math.min(3,step+1),revealPairs:0,label:'每张卡只给先后顺序；尚未定义社会排序'};
 else if(key==='eurovision'){
  const counted=[0,0,1,2,3,3][step],r=aggregate(scoring.slice(0,counted),'borda',[2,1,0]);
  model={mode:'scores',profile:scoring,revealPeople:3,counted,scores:r.score,relation:counted===3?r.R:null,label:counted?`已计入 ${counted}/3 张排名卡`:'本站简化规则：首位2分、第二1分、第三0分'};
 }else if(key==='condorcet'){
  const r=aggregate(original,'majority');model={mode:'pairs',profile:original,revealPeople:3,revealPairs:[0,0,1,2,3,3][step],support:r.counts,relation:r.R,transitive:r.transitive,label:'原书三人三方案；逐对多数'};
 }else if(key==='p201d'){
  const k=step>=3?3:2,votes=Array.from({length:5},(_,i)=>i<k?1:0),sign=p201Vote(votes);
  model={mode:'binary',votes,k,n:5,sign,label:`本站五人代入：a得${k}票、b得${5-k}票；一般证明见下方`};
 }else if(key==='p202'){
  const unrestricted=step===5,r=p202Single([2,1,0,2],unrestricted);
  model={mode:'pairs',profile:r.profile,revealPeople:r.profile.length,revealPairs:step<2?0:step===2?1:3,support:r.support,relation:r.R,transitive:r.transitive,sourceDomain:r.sourceDomain,medianPeak:r.medianPeak,label:unrestricted?'已撤去单峰条件：这不是原题允许的输入':'原题单峰域：M不能排末位'};
 }else if(key==='p204a'){
  const r=p204Classify([2,1,4],false,7);
  model={mode:'classes',partitions:r.partitions,revealPeople:Math.min(3,step+1),revealPairs:step<3?0:step===3?2:3,counts:r.counts,relation:r.R,transitive:r.transitive,label:'本站三份合法划分：逐对多数判同类'};
 }else if(key==='p204b'){
  const group=[7,1,3,7,7,0][step],r=p204Classify([2,1,4],true,group);
  model={mode:'classes',partitions:r.partitions,revealPeople:3,revealPairs:step<2?0:3,group,members:r.members,relation:r.R,transitive:r.transitive,label:group===0?'G为空：全称条件自动成立':'G内每个人都说同类才算同类'};
 }
 return {kind:'social-preferences',key,step,identity:c.scenes[step][0],narration:c.scenes[step][1],pairs:socialPreferencePairs,...model};
}
export const socialPreferencesKeysWithModels=socialPreferencesKeys;
