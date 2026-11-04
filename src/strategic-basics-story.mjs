import {argmax,matrixGames,traveler} from './games.mjs';
import {strategicBasicsContent} from './strategic-basics-content.mjs';

const table={row:['T','B'],col:['L','R'],M:[[[5,0],[-1,1]],[[3,7],[-2,0]]]};
const sympathy={row:['C 合作','D 背叛'],col:['C 合作','D 背叛'],M:[[[6,6],[0,5]],[[5,0],[1,1]]]};
const favorite={row:['F 最爱','N 让步'],col:['F 最爱','N 让步'],M:[[[0,0],[2,1]],[[1,2],[0,0]]]};
const parity={row:['奇','偶'],col:['奇','偶'],M:[[[0,1],[1,0]],[[1,0],[0,1]]]};
const fingers={row:['1','2','3','4','5'],col:['1','2','3','4','5'],M:Array.from({length:5},(_,i)=>Array.from({length:5},(_,j)=>((i+j)%2===0?[0,1]:[1,0])))};
const games={table,pd:matrixGames.pd,sympathy,symmetry:matrixGames.pd,bach:matrixGames.bach,favorite,fingers,pennies:parity,gates:matrixGames.gates};
export function analyzeBasicGame(game,selected=[0,0]){
 const {row,col,M}=game,n=row.length,m=col.length;
 if(!n||!m||M.length!==n||M.some(r=>r.length!==m||r.some(v=>v.length!==2||v.some(x=>!Number.isFinite(x)))))throw Error('Invalid payoff game');
 const brRow=Array.from({length:m},(_,j)=>argmax(M.map(r=>r[j][0]))),brCol=M.map(r=>argmax(r.map(v=>v[1]))),ne=[];
 for(let i=0;i<n;i++)for(let j=0;j<m;j++)if(brRow[j].includes(i)&&brCol[i].includes(j))ne.push([i,j]);
 const [i,j]=selected;if(i<0||i>=n||j<0||j>=m)throw Error('Invalid selected cell');
 const u=M[i][j],gains=[Math.max(...M.map(r=>r[j][0]))-u[0],Math.max(...M[i].map(v=>v[1]))-u[1]];
 return {brRow,brCol,ne,selected,u,gains,isNE:gains.every(x=>x<1e-9)};
}
const routes={
 table:{selected:[[0,0],[0,0],[0,0],[0,0],[0,0],[1,0]],from:[null,null,null,null,null,null]},
 pd:{selected:[[0,0],[0,0],[0,1],[1,1],[1,1],[0,0]],from:[null,[0,0],[0,0],null,null,[1,1]]},
 sympathy:{selected:[[0,0],[0,0],[0,0],[0,0],[0,0],[1,1]],from:[null,null,null,null,null,null]},
 symmetry:{selected:[[0,0],[1,0],[0,1],[0,1],[0,0],[1,1]],from:[null,null,null,null,null,null]},
 bach:{selected:[[0,1],[0,0],[1,1],[0,0],[1,1],[0,0]],from:[null,[0,1],[0,1],null,null,null]},
 favorite:{selected:[[0,0],[0,0],[0,1],[0,1],[1,0],[1,0]],from:[null,null,[0,0],null,null,null]},
 fingers:{selected:[[0,0],[0,1],[2,4],[3,1],[0,1],[0,0]],from:[null,[0,0],null,null,null,null]},
 pennies:{selected:[[0,0],[1,0],[1,1],[0,1],[0,0],[0,0]],from:[null,[0,0],[1,0],[1,1],null,null]},
 gates:{selected:[[0,1],[0,0],[1,1],[2,2],[0,0],[0,0]],from:[null,[0,1],null,null,null,null]}
};
const travelerPath=[[300,300],[299,300],[249,250],[250,250],[180,180],[180,180]];
const behaviorPath=[[300,300],[299,300],[299,300],[299,300],[300,300],[300,300]];
export function strategicBasicsStory(key,step=0){
 const c=strategicBasicsContent[key];if(!c)throw Error('Unknown §15.2 case');
 const k=Math.max(0,Math.min(5,Math.round(step))),base={key,step:k,identity:c.steps[k][0],narration:c.steps[k][1]};
 if(key==='traveler'||key==='behavior'){
  const [a,b]=(key==='traveler'?travelerPath:behaviorPath)[k],audit=traveler(a,b),from=key==='traveler'&&k===1?[300,300]:key==='traveler'&&k===2?[250,250]:key==='traveler'&&k===3?[260,250]:null;
  return {...base,kind:key,amounts:[a,b],audit,from,showNE:key==='traveler'&&k>=4,subjective:key==='behavior'&&k>=2};
 }
 const route=routes[key],game=key==='fingers'&&k>=4?parity:games[key],selected=route.selected[k],audit=analyzeBasicGame(game,selected),from=route.from[k],uFrom=from?game.M[from[0]][from[1]]:null;
 return {...base,kind:'matrix',game,selected,audit,from,deviation:from?{player:from[0]!==selected[0]&&from[1]!==selected[1]?'joint':from[0]!==selected[0]?0:1,from,to:selected,before:uFrom,after:audit.u}:null,showBR:(key==='table'?false:key==='symmetry'?k>=3:key==='fingers'?k===5:k>=2),showNE:key==='pd'?k>=4:key==='bach'?k>=3:key==='favorite'?k>=4:key==='gates'?k>=4:key==='sympathy'?k>=3:key==='pennies'?false:key==='fingers'?false:false};
}
export const strategicBasicsGames={table,sympathy,favorite,parity,fingers};
