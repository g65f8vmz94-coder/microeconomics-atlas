import {matrixGames,matrixAnalysis,locationShares} from './games.mjs';
import {strategicCompetitionContent} from './strategic-competition-content.mjs';

const route={
 intro:[[.5,.5],[.3,.5],[.5,.7],[.5,.5],[.3,.7],[.5,.5]],
 representation:[[.5,.7],[.5,.7],[.5,.7],[.5,.7],[.5,.7],[.5,.7]],
 location:[[.5,.5],[.5,.7],[.6,.55],[.6,.55],[.6,.55],[.5,.5]]
};
const matrixRoute={
 maxmin:[['pessimism',0,0],['pessimism',0,1],['pessimism',1,0],['pessimism',0,1],['pessimism',0,1],['pessimism',0,1]],
 bach:[['pessimism',0,0],['pessimism',0,1],['pessimism',1,0],['pessimism',0,1],['pessimism',1,1],['pessimism',0,0]],
 proof:[['saddle',1,1],['saddle',1,0],['saddle',1,1],['saddle',0,1],['saddle',1,1],['saddle',1,1]],
 samePayoff:[['equalSaddles',0,0],['equalSaddles',0,1],['equalSaddles',0,0],['equalSaddles',0,1],['equalSaddles',0,0],['equalSaddles',0,1]],
 noExistence:[['pennies',0,0],['pennies',1,0],['pennies',1,1],['pennies',0,1],['pennies',0,0],['pennies',1,1]]
};
export const equalSaddles={title:'自主构造 · 多个鞍点、相同收益',row:['上','下'],col:['左','右'],M:[[[0,0],[0,0]],[[0,0],[-1,1]]]};
export function analyzeCompetitionMatrix(game,i=0,j=0){
 if(game!=='equalSaddles')return matrixAnalysis(game,i,j);
 const M=equalSaddles.M,br1=[0,1].map(c=>{const v=Math.max(...M.map(r=>r[c][0]));return M.flatMap((r,k)=>r[c][0]===v?[k]:[])}),br2=M.map(r=>{const v=Math.max(...r.map(c=>c[1]));return r.flatMap((c,k)=>c[1]===v?[k]:[])}),pure=[];
 for(let a=0;a<2;a++)for(let b=0;b<2;b++)if(br1[b].includes(a)&&br2[a].includes(b))pure.push([a,b]);
 const rowWorst=M.map(r=>Math.min(...r.map(c=>c[0]))),colWorst=[0,1].map(b=>Math.min(...M.map(r=>r[b][1]))),gains=[Math.max(...M.map(r=>r[j][0]))-M[i][j][0],Math.max(...M[i].map(c=>c[1]))-M[i][j][1]];
 return {M,n:2,m:2,u:M[i][j],pure,br1,br2,rowWorst,colWorst,maxmin:[[0],[0,1]],gains,competitive:true};
}
export function competitionStory(key,step=0){
 const c=strategicCompetitionContent[key];if(!c)throw Error('Unknown §15.5 case');const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:c.steps[k][0],narration:c.steps[k][1]};
 if(key in route){const positions=route[key][k],model=locationShares(positions);return {...base,kind:'street',positions,model,zeroSumRepresentation:[model.shares[0],-model.shares[0]],shareSum:model.shares.reduce((a,b)=>a+b,0)};}
 const [game,i,j]=matrixRoute[key][k],model=analyzeCompetitionMatrix(game,i,j),descriptor=game==='equalSaddles'?equalSaddles:matrixGames[game];return {...base,kind:'matrix',game,pair:[i,j],model,descriptor};
}
