import {matrixAnalysis,matrixGames} from './games.mjs';
import {strategicInterpretationContent} from './strategic-interpretation-content.mjs';

// [game, actual group-1 first-action share, actual group-2 share,
//  group-1 belief about group-2 share, group-2 belief about group-1 share].
const routes={
 norm:[['bach',1,1,1,1],['bach',0,1,1,0],['bach',1,0,0,1],['bach',1,1,1,1],['bach',0,0,0,0],['bach',1,1,1,1]],
 deviation:[['bach',1,1,1,1],['bach',0,1,1,0],['bach',1,0,0,1],['bach',0,0,0,0],['bach',1,0,0,1],['bach',1,1,1,1]],
 noPure:[['pennies',1,1,1,1],['pennies',0,1,1,0],['pennies',0,0,0,0],['pennies',1,0,0,1],['pennies',1,1,1,1],['pennies',.5,.5,.5,.5]],
 population:[['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.7,.5,.5,.7],['pennies',.7,.5,.5,.7],['pennies',.5,.5,.5,.5]],
 beliefs:[['pennies',.5,.5,.8,.5],['pennies',.5,.5,.8,.5],['pennies',.5,.5,.8,.5],['pennies',.5,.5,.8,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5]],
 mixed:[['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5]],
 pd:[['pd',1,1,1,1],['pd',0,1,1,0],['pd',1,0,0,1],['pd',0,0,0,0],['pd',0,0,0,0],['pd',0,0,0,0]],
 boundary:[['pennies',.7,.5,.5,.7],['pennies',.7,.5,.5,.5],['pennies',.7,.5,.5,.7],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5],['pennies',.5,.5,.5,.5]]
};
export function interpretationState(game,p1,p2,b1,b2){
 if(!matrixGames[game])throw Error('Unknown game');
 for(const n of [p1,p2,b1,b2])if(!Number.isFinite(n)||n<0||n>1)throw Error('Invalid share or belief');
 const analysis=matrixAnalysis(game,0,0,b2,b1),rows=analysis.mixed.rows,cols=analysis.mixed.cols,tol=1e-9;
 const support1=(p1<=tol||rows[0]>=rows[1]-tol)&&(p1>=1-tol||rows[1]>=rows[0]-tol);
 const support2=(p2<=tol||cols[0]>=cols[1]-tol)&&(p2>=1-tol||cols[1]>=cols[0]-tol);
 const correct1=Math.abs(b1-p2)<tol,correct2=Math.abs(b2-p1)<tol;
 return {game,p1,p2,b1,b2,analysis,rows,cols,support:[support1,support2],correct:[correct1,correct2],steady:support1&&support2&&correct1&&correct2};
}
export function interpretationStory(key,step=0){
 const content=strategicInterpretationContent[key],route=routes[key];if(!content||!route)throw Error('Unknown §15.8 case');
 const k=Math.max(0,Math.min(5,Math.round(step))),[game,p1,p2,b1,b2]=route[k],state=interpretationState(game,p1,p2,b1,b2);
 return {...state,key,step:k,identity:content.steps[k][0],narration:content.steps[k][1]};
}
export const interpretationRoutes=routes;
