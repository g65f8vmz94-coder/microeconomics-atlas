import {symmetricBR,finiteBR,monotoneTrace} from './games.mjs';
import {strategicExistenceContent} from './strategic-existence-content.mjs';

export const originalFigure154a={one:[2,2,4,6,6,6,7],two:[1,3,4,4,5,5,6,7]};
export const figure154b={intervals:[[1,3],[4,5],[6,6],[7,8]],b:[1,2,3,4],a:[4,7,7,8],br2:[1,1,1,2,2,3,4,4]};
const trace=monotoneTrace();
const routes={
 intro:[0,.2,.5,.8,1,.5],prop151:[0,.06,.2,.8,1,.5],fig153a:[0,.2,.5,.8,1,.5],noAsym:[.2,.35,.45,.6,.75,.5],ex1512:[0,.2,.7,.5,1,.3]
};
const finiteRoutes={prop152:[0,1,2,3,5,6],fig154a:[0,1,2,4,5,6],proofPartition:[0,0,1,2,3,3],ties:[0,1,2,3,4,5]};
export function existenceStory(key,step=0){
 const content=strategicExistenceContent[key];if(!content)throw Error('Unknown §15.4 case');const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:content.steps[k][0],narration:content.steps[k][1]};
 if(key in routes){const x=routes[key][k];if(key==='ex1512')return {...base,kind:'complement',x,y:1-x};const br=symmetricBR('increasing',x),pair=key==='noAsym'?[.8,.2]:[x,x];return {...base,kind:'continuous',x,br,g:br-x,pair,roots:[.2,.5,.8]};}
 if(key==='prop152'||key==='fig154a'){const index=finiteRoutes[key][k],pair=trace[index];return {...base,kind:'finite',pair,trace:trace.slice(0,index+1),one:finiteBR.one,two:finiteBR.two,ne:finiteBR.one[pair[1]-1]===pair[0]&&finiteBR.two[pair[0]-1]===pair[1]};}
 if(key==='proofPartition'){const index=finiteRoutes[key][k],a=figure154b.a[index],b=figure154b.b[index],m=figure154b.intervals.findIndex(([l,r])=>a>=l&&a<=r)+1;return {...base,kind:'partition',index,a,b,m,figure:figure154b,ne:m===index+1};}
 if(key==='ties'){return {...base,kind:'ties',pair:[[1,1],[1,2],[2,1],[2,2],[1,1],[2,2]][k],payoff:[0,0]};}
 throw Error('No §15.4 route for '+key);
}
