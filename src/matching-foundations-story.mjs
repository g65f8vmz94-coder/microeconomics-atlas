import {examples,analysis} from './matching-lab.mjs';
import {matchingFoundationsContent,matchingFoundationsKeys} from './matching-foundations-content.mjs';

const profile=examples.lesson181;
const study=analysis(profile.X,profile.Y);
const blank=[-1,-1,-1];
const serial=study.serial,global=study.rankMinimum,greedy=study.greedy;
const plans={
 d181:[blank,blank,blank,blank,blank,blank],
 d182:[blank,[1,-1,-1],[1,0,-1],serial,greedy,serial],
 d183:[blank,serial,global,greedy,serial,global],
 e181:[blank,blank,[1,-1,-1],[1,0,-1],serial,serial],
 e182:[blank,serial,greedy,global,global,global],
 e183:[blank,blank,[0,-1,-1],[0,-1,1],greedy,greedy]
};
export const matchingFoundationsProfile=profile;
export const matchingFoundationsAnalysis=study;
export function matchingFoundationsPairScore(x,y){return profile.X[x].indexOf(y)+profile.Y[y].indexOf(x)+2;}
export function matchingFoundationsFrame(key,step){
 if(!matchingFoundationsKeys.includes(key))throw Error('unknown matching foundations case '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('matching foundations film step outside 0..5');
 const matching=plans[key][step].slice(),pairs=matching.map((y,x)=>y<0?null:{x,y,score:matchingFoundationsPairScore(x,y)}).filter(Boolean);
 const c=matchingFoundationsContent[key],focus=key==='d181'?[null,0,1,2,null,null][step]:key==='e181'?[null,null,0,1,2,null][step]:key==='e183'?[null,null,0,2,1,null][step]:null;
 const all=study.all.map(m=>({matching:m.slice(),score:study.score(m)}));
 return {kind:'matching',key,step,identity:c.steps[step][0],narration:c.steps[step][1],matching,pairs,focus,complete:pairs.length===3,score:pairs.reduce((n,p)=>n+p.score,0),all,minimum:Math.min(...all.map(a=>a.score)),serial:serial.slice(),global:global.slice(),greedy:greedy.slice(),profile};
}
