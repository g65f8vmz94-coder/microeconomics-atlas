import assert from 'node:assert/strict';
import {projectOutcome,trueUtility} from './src/mechanism.mjs';
import {truthfulReportContent,truthfulReportKeys} from './src/truthful-report-content.mjs';
import {truthfulReportFrame} from './src/truthful-report-story.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
for(const key of truthfulReportKeys){const c=truthfulReportContent[key];eq(c.steps.length,6);assert.ok(c.question&&c.conditions&&c.proof.length>=3&&c.template&&c.source.includes('印刷'));checks++;for(let step=0;step<6;step++){const f=truthfulReportFrame(key,step),h=projectOutcome([f.value,...f.otherReports],f.rule),r=projectOutcome([f.report,...f.otherReports],f.rule);eq(f.honest,h);eq(f.current,r);eq(f.honestUtility,trueUtility(f.value,h));eq(f.currentUtility,trueUtility(f.value,r));eq(f.gain,f.currentUtility-f.honestUtility);eq(f.identity,c.steps[step][0]);}}
// A finite grid supports the proof, while the source text gives the argument for arbitrary reports.
for(const value of [-3,-1,0,1,3])for(const b of [-2,0,2])for(const c of [-2,0,2])for(const report of [-5,-1,0,1,5]){const honest=projectOutcome([value,b,c],'majority'),other=projectOutcome([report,b,c],'majority');assert.ok(trueUtility(value,honest)>=trueUtility(value,other),JSON.stringify({value,b,c,report}));checks++;}
const lie=truthfulReportFrame('e172',3);eq(lie.honest.decision,0);eq(lie.current.decision,1);eq(lie.honestUtility,0);eq(lie.currentUtility,2);eq(lie.gain,2);eq(lie.current.transfers,[0,0,0]);
eq(truthfulReportFrame('d174',3).gain,-2);eq(truthfulReportFrame('d174',4).gain,0);
eq(truthfulReportFrame('e171',2).current.decision,0);eq(truthfulReportFrame('e171',5).honest.total,6);
console.log({passed:true,checks,cases:truthfulReportKeys.length,frames:truthfulReportKeys.length*6});
