import {kantian,cournot} from './games.mjs';
import {strategicKantianContent} from './strategic-kantian-content.mjs';

const routes={
 intro:[[.25,.25,1],[.25,.25,1.5],[.25,.25,1.5],[.25,.25,1],[1/3,1/3,1],[.25,.25,1]],
 definition:[[.2,.3,1],[.2,.3,1.2],[.2,.3,.8],[.2,.3,1.2],[0,.5,1],[.2,.3,1]],
 derive:[[.2,.2,.5],[.2,.2,1],[.2,.2,1.25],[.2,.2,1.25],[.2,.2,1.25],[.25,.25,1]],
 line:[[.1,.4,1],[.2,.3,1],[.25,.25,1],[.4,.1,1],[0,.5,1],[.1,.4,1]],
 compare:[[.25,.25,1],[.25,.25,1.5],[.25,.25,1.5],[.25,.25,1.5],[1/3,1/3,1],[1/3,1/3,.75]],
 boundary:[[1,1,1],[1,1,1],[1,1,1],[1,1,.25],[1,1,.25],[1/3,1/3,1]]
};
export function kantianStory(key,step=0){
 const c=strategicKantianContent[key];if(!c)throw Error('Unknown §15.6 case');const k=Math.max(0,Math.min(5,Math.round(step))),[q1,q2,lambda]=routes[key][k],model=kantian(q1,q2,lambda),nash=cournot(q1,q2,0).ne;
 return {key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],q1,q2,lambda,model,nash,total:q1+q2,maxLambda:Math.min(3,1/Math.max(q1,q2))};
}
export const strategicKantianRoutes=routes;
