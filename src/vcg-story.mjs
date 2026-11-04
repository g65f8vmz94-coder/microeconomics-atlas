import {vcgStoryContent} from './vcg-story-content.mjs';
import {projectOutcome,trueUtility,auctionOutcome,bookProfiles,budgetGrid,rebateExample} from './mechanism.mjs';

const clamp=step=>Math.max(0,Math.min(5,Math.round(step)));
const project=(key,index,reports,values=reports,focus=0,cost=0)=>{
 const outcome=projectOutcome(reports,'vcg',cost),without=projectOutcome(reports.filter((_,i)=>i!==focus),'vcg',cost*(reports.length-1)/reports.length);
 return {key,step:index,kind:'project',reports,values,focus,cost,outcome,withoutDecision:without.decision,focusUtility:values?trueUtility(values[focus],outcome,focus):null};
};
export function vcgStoryFrame(key,step=0){
 const content=vcgStoryContent[key];if(!content)throw Error('Unknown §17.3 case');const index=clamp(step);
 let f;
 switch(key){
 case 'd175':{
  const negative=index>=4,reports=negative?[-7,3,3]:[index===2?5:7,-3,-3],values=negative?[-7,3,3]:[7,-3,-3];
  f=project(key,index,reports,values);break;
 }
 case 'e173':{
  const row=[0,1,2,3,0,2][index];f=project(key,index,bookProfiles[row],null,index===5?4:0);f.bookRow=row;break;
 }
 case 'p171':{
  const negative=index>=4,value=negative?(index===5?-6:-5):5,other=negative?[3,3]:[-2,-2];f=project(key,index,[value,...other],[value,...other]);f.otherSum=other.reduce((a,b)=>a+b,0);f.utilityIfBuild=value+Math.min(0,f.otherSum);f.utilityIfNot=-Math.max(0,f.otherSum);f.utilityDifference=value+f.otherSum;break;
 }
 case 'nonexec':f=project(key,index,[-5,1,1,1,1],[-5,1,1,1,1]);break;
 case 'rebate':{
  const report=index>=2?-8:1,rebate=rebateExample(report);f=project(key,index,[report,10],[1,10]);f.rebate=rebate.rebate;f.focusUtility=rebate.utility;f.baseFocusUtility=trueUtility(1,f.outcome);break;
 }
 case 'fairness':{
  const poor=[99,99,99,99,150,200][index],reports=[100,100,...Array(poor).fill(-1)],outcome=projectOutcome(reports);
  f={key,step:index,kind:'fairness',poor,rich:2,richValue:100,poorValue:-1,outcome,positiveCount:reports.filter(x=>x>0).length,negativeCount:poor};break;
 }
 case 'q171a':{
  const rows=budgetGrid(),cell=[0,2,3,6,8,4][index];f={key,step:index,kind:'grid',rows,selected:rows[cell],proof:false};break;
 }
 case 'q171b':{
  const profiles=[[-5,-5],[4,4],[4,-5],[-1,-5],[-1,4],[-5,4]],reports=profiles[index],rows=budgetGrid();f={key,step:index,kind:'grid',rows,selected:{x:reports[0],y:reports[1],decision:+(reports[0]+reports[1]>0)},proof:true};break;
 }
 case 'q172a':case 'q172b':{
  const bids=key==='q172a'?[[10,5,3],[10,5,3],[4,5,3],[12,5,3],[5,5,3],[10,5,3]][index]:[[10,5,3],[6,5,3],[6,5,3],[6,5,3],[10,5,3],[6,5,3]][index],values=[10,5,3],rule=key==='q172a'?'second':'first';
  f={key,step:index,kind:'auction',bids,values,rule,outcome:auctionOutcome(bids,values,rule),honest:auctionOutcome([values[0],...bids.slice(1)],values,rule)};break;
 }
 case 'q173':{
  const values=[10,4,1],cost=9;f=project(key,index,values,values,Math.min(2,Math.floor(index/2)),cost);break;
 }
 }
 return {...f,identity:content.steps[index][0],narration:content.steps[index][1]};
}
