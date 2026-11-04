import {truthfulReportContent} from './truthful-report-content.mjs';
import {projectOutcome,trueUtility} from './mechanism.mjs';

export function truthfulReportFrame(key,step=0){
 const content=truthfulReportContent[key];if(!content)throw Error('Unknown §17.2 case');
 const index=Math.max(0,Math.min(5,Math.round(step)));
 let value=2,otherReports=[-2,-1],report=2,rule='sum';
 if(key==='d173'&&index>=4)report=4;
 if(key==='d174'){otherReports=[4,-1];rule='majority';report=index===3?-5:index===4?9:2;}
 if(key==='e171'){
  value=8;rule='majority';otherReports=index>=3&&index<5?[4,-1]:[-1,-1];
  report=index===2?100:index===4?-5:8;
 }
 if(key==='e172'&&index>=2)report=4;
 const honest=projectOutcome([value,...otherReports],rule),current=projectOutcome([report,...otherReports],rule);
 const honestUtility=trueUtility(value,honest),currentUtility=trueUtility(value,current);
 return {key,step:index,identity:content.steps[index][0],narration:content.steps[index][1],value,report,otherReports,rule,honest,current,honestUtility,currentUtility,gain:currentUtility-honestUtility};
}
