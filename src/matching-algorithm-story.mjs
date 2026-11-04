import {examples,gs} from './matching-lab.mjs';
import {matchingAlgorithmContent,matchingAlgorithmKeys} from './matching-algorithm-content.mjs';

const profile=examples.book;
const xRun=gs(profile.X,profile.Y,'X'),yRun=gs(profile.X,profile.Y,'Y');
const stages={e184:[0,1,1,2,3,3],e184y:[0,1,2,3,4,5],p181:[0,1,2,2,3,3]};
export const matchingAlgorithmProfile=profile;
export const matchingAlgorithmRuns={X:xRun,Y:yRun};
export function matchingAlgorithmFrame(key,step){
 if(!matchingAlgorithmKeys.includes(key))throw Error('unknown algorithm case '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('algorithm film step outside 0..5');
 const side=key==='e184y'?'Y':'X',run=side==='Y'?yRun:xRun,stage=stages[key][step],snapshot=run.trace[stage];
 const orient=([a,b])=>side==='X'?{x:a,y:b}:{x:b,y:a};
 const proposals=snapshot.proposals.map(orient),rejections=snapshot.rejections.map(orient);
 const cumulativeRejections=run.trace.slice(1,stage+1).flatMap(t=>t.rejections.map(orient));
 const c=matchingAlgorithmContent[key];
 return {kind:'algorithm',key,step,stage,side,identity:c.steps[step][0],narration:c.steps[step][1],matching:snapshot.matching.slice(),proposals,rejections,cumulativeRejections,attempts:snapshot.attempts,heldCount:snapshot.matching.filter(y=>y>=0).length,complete:snapshot.matching.every(y=>y>=0),maxAttempts:profile.X.length*profile.Y.length,profile,terminal:run.trace.at(-1).matching.slice(),runLength:run.trace.length-1};
}
