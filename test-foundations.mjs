import assert from 'node:assert/strict';
import fs from 'node:fs';
import {caseSections,caseNames,relationStats,relationWitness,majorityPair,similarity,layers,cinemaUtility,favoriteEight,parityUtility,additiveContradiction} from './src/foundations.mjs';
let checks=0;const ok=(b,m)=>{assert.ok(b,m);checks++};
const modes=Object.values(caseSections).flat();ok(modes.length===36,'all chapter1 source cases');ok(new Set(modes).size===modes.length,'distinct cases');for(const m of modes)ok(!!caseNames[m],m+' has name');
for(const [kind,step,expected] of [['complete',0,[false,false]],['complete',1,[true,true]],['transitive',0,[false,false]],['transitive',1,[true,true]],['equivalence',0,[false,true]],['equivalence',1,[false,false]],['equivalence',2,[true,true]],['p5',0,[true,true]],['p5',1,[false,true]],['p5',2,[true,true]]]){
 const s=relationWitness(kind,step).stats;ok(s.complete===expected[0]&&s.transitive===expected[1],kind+' stage '+step);
}
const cycle=[true,true,false,false,true,true,true,false,true];const cyc=relationStats(cycle);ok(cyc.complete,'majority cycle is complete');ok(!cyc.transitive,'majority cycle is not transitive');
for(let a=0;a<3;a++)for(let b=0;b<3;b++)if(a!==b)ok(majorityPair(a,b)+majorityPair(b,a)===3,'three voters decisive');
ok(majorityPair(0,1)===2&&majorityPair(1,2)===2&&majorityPair(2,0)===2,'Condorcet cycle');
const sim=similarity();ok(sim.ab===0&&sim.bc===0&&sim.ac===-1,'similarity counterexample');
const ranks=layers([1,2,2,3]);ok(JSON.stringify(ranks.map(x=>x.items))===JSON.stringify([[0],[1,2],[3]]),'finite utility strata');
ok(cinemaUtility(1,50)===1&&cinemaUtility(1,1)===50&&cinemaUtility(40,1)===2000,'book cinema extremes');
for(let r=1;r<=40;r++)for(let c=1;c<=50;c++){
 const u=cinemaUtility(r,c);ok(u>=1&&u<=2000,'seat rank bounded');if(c<50)ok(u>cinemaUtility(r,c+1),'left seat preferred');if(r<40)ok(cinemaUtility(r+1,50)>u,'next row outranks any current seat');
}
for(let n=1;n<=2000;n++){if(n===8)continue;ok(favoriteEight(8)>favoriteEight(n),'8 best under higher order');ok(favoriteEight(8,'closer')>favoriteEight(n,'closer'),'8 best under distance order');if(n>1&&n-1!==8)ok(favoriteEight(n)>favoriteEight(n-1),'non8 numerical order');ok(parityUtility(2)>parityUtility(2*n-1),'even above all odd');}
for(let n=1;n<=1000;n++){ok(parityUtility(2*n+2)>parityUtility(2*n),'even class increasing');ok(parityUtility(2*n+1)>parityUtility(2*n-1),'odd class increasing')}
const ac=additiveContradiction();ok(ac.sum.includes('f(5)−f(2)')&&ac.third.includes('g(20)−g(5)>f(5)−f(2)'),'additive contradiction directions');
const result={passed:true,chapter:1,cases:modes.length,checks,scope:'finite relation witnesses, Condorcet pair counts, source cinema ranks, integer utility constructions, additive contradiction; general infinite proofs remain explanatory'};
fs.writeFileSync(new URL('./qa/foundation-models.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
