import {matrixAnalysis,attrition} from './games.mjs';
import {strategicMixedContent} from './strategic-mixed-content.mjs';

const matrices={
 intro:[['pennies',1,1],['pennies',0,1],['pennies',.7,.5],['pennies',.7,.3],['pennies',.5,.5],['pennies',.5,.5]],
 distribution:[['pennies',.6,.4],['pennies',.6,.4],['pennies',.6,.3],['pennies',1,.3],['pennies',.5,.5],['pennies',.6,.4]],
 expected:[['pennies',.7,.3],['pennies',.7,.3],['pennies',.7,.3],['pennies',.7,.3],['pennies',.7,.5],['pennies',.5,.5]],
 support:[['pennies',.7,.3],['pennies',.7,.3],['pennies',.7,.3],['pennies',.7,.5],['pennies',1,.5],['pennies',.5,.5]],
 pure:[['pd',0,0],['pd',0,0],['pd',0,0],['pd',0,0],['pd',0,0],['pd',0,0]],
 pennies:[['pennies',.7,.3],['pennies',.7,1],['pennies',.7,.5],['pennies',.5,.5],['pennies',.5,.5],['pennies',.5,.5]],
 bach:[['bach',1,1],['bach',0,0],['bach',.5,.5],['bach',.5,1/3],['bach',2/3,1/3],['bach',2/3,1/3]]
};
const pureRoute=[[0,0],[0,1],[1,1],[0,2],[0,3],[3,0]];
export const holeWeights=[.2,0,.5,.3],endWeights=[.25,.35,.4];
export function attritionPayoff(t,s,c){return t<=s?-t*c:1-(s+1)*c;}
export function discreteExpected(t,weights,c){return weights.reduce((sum,p,s)=>sum+p*attritionPayoff(t,s,c),0);}
export function mixedStory(key,step=0){
 const c=strategicMixedContent[key];if(!c)throw Error('Unknown §15.7 case');const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:c.steps[k][0],narration:c.steps[k][1]};
 if(key in matrices){const [game,p1,p2]=matrices[key][k];return {...base,kind:'matrix',game,p1,p2,model:matrixAnalysis(game,0,0,p1,p2)};}
 if(key==='attrition'){const [t1,t2]=pureRoute[k],cost=.25,model=attrition(cost,t1,t2);return {...base,kind:'pure-war',cost,t1,t2,model};}
 if(key==='noHoles'){const cost=.25,t=1,weights=holeWeights;return {...base,kind:'finite-war',cost,weights,compare:[t,t+1],payoffs:[discreteExpected(t,weights,cost),discreteExpected(t+1,weights,cost)],gain:discreteExpected(t,weights,cost)-discreteExpected(t+1,weights,cost),focus:Math.min(k,3)};}
 if(key==='noEnd'){const cost=.25,T=2,weights=endWeights;return {...base,kind:'finite-war',cost,weights,compare:[T,T+1],payoffs:[discreteExpected(T,weights,cost),discreteExpected(T+1,weights,cost)],gain:discreteExpected(T+1,weights,cost)-discreteExpected(T,weights,cost),focus:Math.min(k,3)};}
 if(key==='geometric'||key==='tail'){const cost=.25,K=12,model=attrition(cost,0,0,K),focus=key==='tail'?[0,1,3,6,10,11][k]:[0,1,2,3,6,11][k];return {...base,kind:'geometric-war',cost,K,model,focus,partialSum:model.prob.slice(0,focus+1).reduce((a,b)=>a+b,0)};}
 throw Error('No §15.7 route for '+key);
}
export const strategicMixedMatrixRoutes=matrices;
