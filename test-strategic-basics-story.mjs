import assert from 'node:assert/strict';
import {strategicBasicsContent,strategicBasicsKeys} from './src/strategic-basics-content.mjs';
import {strategicBasicsStory,strategicBasicsGames,analyzeBasicGame} from './src/strategic-basics-story.mjs';
import {traveler,matrixGames} from './src/games.mjs';
let checks=0;const ok=(x,m)=>{assert.ok(x,m);checks++};
assert.equal(strategicBasicsKeys.length,11);
for(const key of strategicBasicsKeys){const c=strategicBasicsContent[key];ok(c.steps.length===6,key+' six frames');for(const field of ['title','question','conditions','formula','template','trap','source'])ok(!!c[field],key+' '+field);ok(c.proof.length>=3,key+' proof');for(let s=0;s<6;s++){const f=strategicBasicsStory(key,s);ok(f.step===s&&f.identity===c.steps[s][0]&&f.narration===c.steps[s][1],key+' frame '+s);if(f.kind==='matrix'){ok(f.audit.gains.every(x=>x>=0),key+' gains');for(const [i,j] of f.audit.ne)ok(analyzeBasicGame(f.game,[i,j]).isNE,key+' NE');}}}
const eq=(x,y)=>assert.deepEqual(x,y);
eq(strategicBasicsStory('traveler',0).audit.u,[300,300]);eq(strategicBasicsStory('traveler',1).audit.u,[304,294]);eq(strategicBasicsStory('traveler',2).audit.u,[254,244]);eq(strategicBasicsStory('traveler',3).audit.u,[250,250]);eq(strategicBasicsStory('traveler',4).audit.u,[180,180]);
let pure=[];for(let a=180;a<=300;a++)for(let b=180;b<=300;b++){const r=traveler(a,b);if(r.gains.every(g=>g===0))pure.push([a,b]);if(a>b)ok(r.u[0]===b-5,`higher report ${a},${b}`);if(a===b&&a>180)ok(traveler(a-1,b).u[0]===a+4,`same high ${a}`);}eq(pure,[[180,180]]);
const ne=(game)=>analyzeBasicGame(game).ne;eq(ne(matrixGames.pd),[[1,1]]);eq(ne(strategicBasicsGames.sympathy),[[0,0],[1,1]]);eq(ne(matrixGames.bach),[[0,0],[1,1]]);eq(ne(strategicBasicsGames.favorite),[[0,1],[1,0]]);eq(ne(strategicBasicsGames.parity),[]);eq(ne(strategicBasicsGames.fingers),[]);eq(ne(matrixGames.gates),[[0,0],[1,1],[2,2]]);
for(let i=0;i<5;i++)for(let j=0;j<5;j++)eq(strategicBasicsGames.fingers.M[i][j],strategicBasicsGames.parity.M[i%2][j%2]);
for(const key of ['symmetry','favorite']){const g=key==='symmetry'?matrixGames.pd:strategicBasicsGames.favorite;for(let i=0;i<2;i++)for(let j=0;j<2;j++)ok(g.M[i][j][0]===g.M[j][i][1],key+' symmetric payoff representation');}
ok(strategicBasicsContent.sympathy.source.includes('本站自主例'),'modified preferences provenance');ok(strategicBasicsContent.behavior.conditions.includes('历史'),'historical sample boundary');
console.log({passed:true,cases:strategicBasicsKeys.length,frames:strategicBasicsKeys.length*6,checks});
