import {aggregate,relationCheck,allProfiles} from './final-topics.mjs';
import {p201Vote,p201Audit,p203Decision,p203Audit,p205Tournament,p205Audit} from './aggregation-exercises.mjs';
import {aggregationPropertiesContent,aggregationPropertiesKeys} from './aggregation-properties-content.mjs';
const profileA=[[0,1,2],[0,2,1],[1,0,2]];
const neutralB=profileA.map(r=>r.map(v=>v===0?1:v===1?0:v));
const anonymousB=[profileA[2],profileA[1],profileA[0]];
const positiveA=[[1,2,0],[0,1,2],[0,1,2]],positiveB=[[1,0,2],[0,1,2],[0,1,2]];
const caveatA=[[0,1,2],[0,1,2],[0,1,2]],caveatB=[[0,2,1],[0,1,2],[0,1,2]];
const paretoA=Array.from({length:3},()=>[0,1,2]);
const iiaA=[[2,1,0],[2,0,1],[2,0,1]],iiaB=[[1,2,0],[2,0,1],[2,0,1]];
const rankingCases={fig201:{before:profileA,after:neutralB,rule:'borda',weights:[2,1,0],switchAt:2,change:'方案a与b换名字'},fig202:{before:profileA,after:anonymousB,rule:'borda',weights:[2,1,0],switchAt:2,change:'1号与3号交换整张排名卡'},d203:{before:profileA,after:neutralB,rule:'borda',weights:[2,1,0],switchAt:2,change:'方案a与b换名字'},d204:{before:profileA,after:anonymousB,rule:'borda',weights:[2,1,0],switchAt:2,change:'1号与3号交换整张排名卡'},d205:{before:positiveA,after:positiveB,rule:'borda',weights:[2,1,0],switchAt:2,change:'1号将a上升一位'},caveat:{before:caveatA,after:caveatB,rule:'plurality',weights:[1,0,0],switchAt:2,change:'1号将c从第三升到第二'},d206:{before:paretoA,after:paretoA,rule:'borda',weights:[2,1,0],afterWeights:[1,1,0],switchAt:3,change:'仅把名次分换为1/1/0'},d207:{before:iiaA,after:iiaB,rule:'borda',weights:[4,1,0],switchAt:2,change:'1号将c从首位挪到第二；a与b先后不变'}};
const binaryRules={p201a:'biased',p201b:'dictator',p201c:'tie'};
const tournamentRules={p205a:{rule:'wins',before:2,after:3,focus:[0,1],change:'1号对2号由负改胜'},p205b:{rule:'label-bias',before:2,after:9,focus:[0,1],change:'交换1号与2号姓名牌'},p205c:{rule:'all-tied',before:0,after:1,focus:[0,1],change:'1号对2号由负改胜'},p205d:{rule:'quality',before:9,after:41,focus:[0,1],change:'只将3号对4号由负改胜'}};
export function aggregationPropertiesFrame(key,step){
 if(!aggregationPropertiesKeys.includes(key))throw Error('unknown aggregation property '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('aggregation property step outside 0..5');
 const c=aggregationPropertiesContent[key],scene=c.scenes[step];let model;
 if(rankingCases[key]){
  const spec=rankingCases[key],active=step>=spec.switchAt,before=aggregate(spec.before,spec.rule,spec.weights),after=aggregate(spec.after,spec.rule,spec.afterWeights||spec.weights),profile=active?spec.after:spec.before,r=active?after:before;
  model={mode:'ranking',profile,beforeProfile:spec.before,afterProfile:spec.after,beforeScores:before.score,afterScores:after.score,scores:r.score,relation:r.R,rule:spec.rule,weights:active?(spec.afterWeights||spec.weights):spec.weights,active,change:spec.change,focus:key==='d207'?[0,1]:key==='caveat'?[2,1]:key==='d205'?[0,1]:[0,1],label:key==='d207'?'每人对a、b的先后均未改':key==='caveat'?'首位票三项仍为3、0、0':key==='d206'?'每个人都把a排在b前':spec.change};
 }else if(binaryRules[key]){
  const rule=binaryRules[key],audit=p201Audit(3,rule),w=audit.witnesses[key==='p201a'?'neutrality':key==='p201b'?'anonymity':'responsive'],active=step>=(key==='p201c'?3:2),votes=active?w.after:w.before;
  model={mode:'binary',votes,beforeVotes:w.before,afterVotes:w.after,sign:p201Vote(votes,rule),beforeSign:p201Vote(w.before,rule),afterSign:p201Vote(w.after,rule),rule,active,change:key==='p201a'?'交换a与b的名称':key==='p201b'?'交换1号与2号身份':'1号从b改投a',focus:[0,1],label:key==='p201a'?'两份档案社会都判a胜':key==='p201b'?'社会始终照个人1投票':'社会始终让a和b并列'};
 }else if(key==='p203e'){
  const w=p203Audit(3,3,'first-different').witnesses.I,active=step>=2,choices=active?w.after:w.before;
  model={mode:'decision',choices,beforeChoices:w.before,afterChoices:w.after,selected:p203Decision(choices,'first-different'),beforeSelected:p203Decision(w.before,'first-different'),afterSelected:p203Decision(w.after,'first-different'),active,change:'a的支持者始终只有3号',focus:[w.alternative],label:'本站反例规则违反性质I；一般定理证明另见下方'};
 }else{
  const spec=tournamentRules[key],active=step>=2,code=active?spec.after:spec.before,r=p205Tournament(4,code,spec.rule),before=p205Tournament(4,spec.before,spec.rule),after=p205Tournament(4,spec.after,spec.rule);
  model={mode:'tournament',code,score:r.score,wins:r.wins,quality:r.quality,matches:r.R,beforeScore:before.score,afterScore:after.score,active,change:spec.change,rule:spec.rule,focus:spec.focus,label:spec.change,scale:Math.max(...before.score,...after.score,1)};
 }
 return {key,step,identity:scene[0],narration:scene[1],...model};
}
export const aggregationPropertiesFixtures={profileA,neutralB,anonymousB,positiveA,positiveB,caveatA,caveatB,paretoA,iiaA,iiaB};
export function aggregationPropertiesCheck(){
 const checks={profiles:allProfiles.length,neutral:0,anonymous:0,responsiveCounterexample:0};
 for(const p of allProfiles){const renamed=p.map(r=>r.map(v=>v===0?1:v===1?0:v)),swapped=[p[1],p[0],p[2]],a=aggregate(p,'borda'),b=aggregate(renamed,'borda'),d=aggregate(swapped,'borda');for(let x=0;x<3;x++)for(let y=0;y<3;y++){const rx=x===0?1:x===1?0:x,ry=y===0?1:y===1?0:y;if(a.R[x][y]!==b.R[rx][ry])throw Error('Borda neutrality');if(a.R[x][y]!==d.R[x][y])throw Error('Borda anonymity');checks.neutral++;checks.anonymous++;}}
 const old=aggregate(caveatA,'plurality'),next=aggregate(caveatB,'plurality');if(!old.R[2][1]||!old.R[1][2]||next.R[2][1]&&!next.R[1][2])throw Error('missing strict responsiveness counterexample');checks.responsiveCounterexample++;
 for(const key of ['fig201','fig202','d203','d204','d205','caveat','d206','d207'])for(const step of [0,5]){const f=aggregationPropertiesFrame(key,step);if(!relationCheck(f.relation).complete||!relationCheck(f.relation).transitive)throw Error('invalid PAF output '+key);}
 return checks;
}
