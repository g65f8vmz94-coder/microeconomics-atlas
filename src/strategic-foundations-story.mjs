import {argmax} from './games.mjs';
import {strategicFoundationsContent} from './strategic-foundations-content.mjs';

const stall={row:['早市','夜市'],col:['早市','夜市'],M:[[[4,4],[0,2]],[[2,0],[3,3]]]};
const tied={row:['早市','夜市'],col:['早市','夜市'],M:[[[4,4],[0,0]],[[4,1],[2,2]]]};

export function analyzeFoundationGame(game,selected=[0,0]){
 const {M,row,col}=game;
 if(row.length!==2||col.length!==2||M.length!==2||M.some(r=>r.length!==2||r.some(v=>v.length!==2||v.some(x=>!Number.isFinite(x)))))throw Error('Expected finite 2×2 payoff game');
 const brRow=[0,1].map(j=>argmax([M[0][j][0],M[1][j][0]]));
 const brCol=[0,1].map(i=>argmax([M[i][0][1],M[i][1][1]]));
 const ne=[];for(let i=0;i<2;i++)for(let j=0;j<2;j++)if(brRow[j].includes(i)&&brCol[i].includes(j))ne.push([i,j]);
 const [i,j]=selected,u=M[i][j],gains=[Math.max(M[0][j][0],M[1][j][0])-u[0],Math.max(M[i][0][1],M[i][1][1])-u[1]];
 return {brRow,brCol,ne,selected,u,gains,isNE:gains.every(x=>x<1e-9)};
}
const route={
 d151:{selected:[[0,0],[0,0],[0,1],[0,1],[0,0],[1,1]],visible:[0,0,0,4,4,4],focus:['players','actions','profile','payoff','other','all']},
 ordinal151:{selected:[[1,1],[1,1],[1,1],[1,1],[1,1],[1,1]],visible:[4,4,4,4,4,4],focus:['row','row','col','payoff','br','ne']},
 d152:{selected:[[0,1],[0,1],[1,1],[1,1],[1,1],[1,1]],visible:[4,4,4,4,4,4],focus:['profile','deviation','profile','row','col','joint']},
 d153:{selected:[[0,0],[0,0],[1,1],[0,0],[1,1],[0,0]],visible:[4,4,4,4,4,4],focus:['column0','column0','column1','row0','row1','ne']},
 tie151:{selected:[[1,0],[1,0],[1,0],[1,0],[1,1],[0,0]],visible:[4,4,4,4,4,4],focus:['payoff','column0','col-deviation','deviation','ne','ne']}
};
export function strategicFoundationsStory(key,step=0){
 const c=strategicFoundationsContent[key],path=route[key];if(!c||!path)throw Error('Unknown strategic foundations case');
 const k=Math.max(0,Math.min(5,Math.round(step))),old=key==='tie151'?tied:stall;
 const rowScale=key==='ordinal151'&&k>=1,colScale=key==='ordinal151'&&k>=2;
 const M=old.M.map(row=>row.map(([a,b])=>[rowScale?2*a+1:a,colScale?3*b+2:b]));
 const game={row:[...old.row],col:[...old.col],M};
 const selected=path.selected[k],audit=analyzeFoundationGame(game,selected);
 let deviation=null;
 if(key==='d151'&&k===4)deviation={kind:'col',from:[0,1],to:[0,0]};
 if(key==='d152'){if(k===1)deviation={kind:'row',from:[0,1],to:[1,1]};if(k===3)deviation={kind:'row',from:[1,1],to:[0,1]};if(k===4)deviation={kind:'col',from:[1,1],to:[1,0]};if(k===5)deviation={kind:'joint',from:[1,1],to:[0,0]};}
 if(key==='tie151'&&k>=2&&k<=3)deviation={kind:'col',from:[1,0],to:[1,1]};
 if(deviation){const a=game.M[deviation.from[0]][deviation.from[1]],b=game.M[deviation.to[0]][deviation.to[1]];deviation.gains=[b[0]-a[0],b[1]-a[1]];}
 return {key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],game,audit,selected,visibleCells:path.visible[k],focus:path.focus[k],deviation,showBR:key==='d153'||key==='tie151'&&k>=1||key==='ordinal151'&&k>=4,showNE:key==='d153'&&k===5||key==='tie151'&&k>=4||key==='ordinal151'&&k===5};
}
