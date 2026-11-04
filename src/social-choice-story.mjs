import {socialWinner,manipulation,manipulationAudit,aggregate,allProfiles} from './final-topics.mjs';
import {p203Decision,p203Audit,p206Median} from './aggregation-exercises.mjs';
import {socialChoiceContent,socialChoiceKeys} from './social-choice-content.mjs';
const socialChoiceBase=[[2,1,0],[1,0,2],[0,1,2]];
const socialChoiceUnanimous=[[0,1,2],[0,2,1],[0,1,2]];
const socialChoiceProofProfiles=[
 [[2,1,0],[1,0,2],[0,1,2]],
 [[0,2,1],[1,0,2],[0,1,2]],
 [[0,1,2],[1,0,2],[1,0,2]],
 [[0,2,1],[1,0,2],[0,2,1]],
 [[2,0,1],[0,1,2],[1,2,0]],
 [[2,1,0],[1,0,2],[0,1,2]]
];
const socialChoiceBinaryVotes=[[0,1,1],[0,1,1],[1,0,0],[0,0,0],[0,1,1],[1,0,1]];
const socialChoiceMedianReports=[.5,.8,.8,.8,.2,.5];
const copy=p=>p.map(x=>[...x]);
export function socialChoiceFrame(key='d208',step=0){
 const selected=socialChoiceKeys.includes(key)?key:'d208',index=Math.max(0,Math.min(5,Math.round(Number(step)||0))),c=socialChoiceContent[selected];
 if(selected==='p206'){const report=socialChoiceMedianReports[index],m=p206Median([.1,.3,.6,.9],.5,report,1,3);return {key:selected,step:index,mode:'median',report,others:m.others,truePeak:m.truePeak,truth:m.truth,outcome:m.lie,lower:m.lower,upper:m.upper,trueUtility:m.trueUtility,reportedOutcomeUtility:m.reportedOutcomeUtility,gain:m.gain,scene:c.scenes[index]};}
 if(selected==='p203d'){const choices=[...socialChoiceBinaryVotes[index]],outcome=p203Decision(choices,'majority');return {key:selected,step:index,mode:'binary',choices,outcome,votesA:choices.filter(x=>x===0).length,votesB:choices.filter(x=>x===1).length,scene:c.scenes[index]};}
 const profile=copy(selected==='d209'?socialChoiceUnanimous:selected==='p202'?socialChoiceProofProfiles[index]:socialChoiceBase);
 if(selected==='d210'){const m=manipulation(socialChoiceBase,0,[1,0,2],'plurality'),changed=index>=2;return {key:selected,step:index,mode:'manipulation',profile:changed?copy(m.changed):profile,trueProfile:copy(socialChoiceBase),reportChanged:changed,outcome:changed?m.after:m.before,honestOutcome:m.before,lieOutcome:m.after,trueBetter:m.improved,scene:c.scenes[index]};}
 const rule=selected==='d208'||selected==='p202'?'dictator':'plurality',outcome=selected==='d209'&&index===4?1:rule==='dictator'?profile[1][0]:socialWinner(profile,rule);
 return {key:selected,step:index,mode:selected==='p202'?'proof':'choice',profile,outcome,rule:selected==='d209'&&index===4?'固定选b':rule,pair:index===3&&selected==='p202'?[0,1]:null,scene:c.scenes[index]};
}
export function socialChoiceAudit(){
 const plurality=manipulationAudit('plurality'),dictator=manipulationAudit('dictator'),binary=p203Audit(3,2,'majority');
 const pairComparisons=allProfiles.length*3;
 return {pluralityManipulation:!!plurality.witness,pluralityWitness:plurality.witness,dictatorManipulation:!!dictator.witness,dictatorUnanimityCounterexample:!!dictator.unanimity,binary,profiles:allProfiles.length,pairComparisons};
}
