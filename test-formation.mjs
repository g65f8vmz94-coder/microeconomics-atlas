import assert from 'node:assert/strict';
import fs from 'node:fs';
import {criterionOrders,scoreRelation,distancePreference,lexicographicRelation,lexicographicDecision,unanimityRelation,majorityRelation,pairOutcome,weightedLexExample,lexProofBranches} from './src/formation.mjs';
let checks=0;const ok=(b,m)=>{assert.ok(b,m);checks++},eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++};
const props=r=>({complete:[0,1,2].every(i=>[0,1,2].every(j=>r[i*3+j]||r[j*3+i])),transitive:[0,1,2].every(i=>[0,1,2].every(j=>[0,1,2].every(k=>!r[i*3+j]||!r[j*3+k]||r[i*3+k])))});
const rs=criterionOrders.map(x=>scoreRelation(x.ranks)),allOrders=new Set();for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)allOrders.add([a,b,c].flatMap(x=>[a,b,c].map(y=>+(x>=y))).join(''));
eq(new Set(rs.map(r=>r.map(Number).join(''))),allOrders,'all13 finite weak orderings, not just strict permutations');
let lexProfiles=0,unanimityProfiles=0,majorityProfiles=0,cycles=0,ties=0;
for(let i=0;i<13;i++)for(let j=0;j<13;j++){
 const first=criterionOrders[i].ranks,second=criterionOrders[j].ranks,r=lexicographicRelation(rs[i],rs[j]);lexProfiles++;
 const oracle=first.flatMap((x,a)=>first.map((y,b)=>x>y||(x===y&&second[a]>=second[b])));eq(r,oracle,'lex tuple comparator');ok(props(r).complete&&props(r).transitive,'lex order properties');
 for(let a=0;a<3;a++)for(let b=0;b<3;b++){const d=lexicographicDecision(rs[i],rs[j],a,b);eq(d.decisive,first[a]===first[b]?2:1,'second criterion only on first tie');eq(d.outcome,pairOutcome(oracle,a,b),'actual lex decision');}
 for(let k=0;k<13;k++){
  const out=unanimityRelation([rs[i],rs[j],rs[k]]);unanimityProfiles++;eq(out,Array.from({length:9},(_,t)=>rs[i][t]&&rs[j][t]&&rs[k][t]),'intersection oracle');ok(props(out).transitive,'unanimity preserves transitivity');const prev=unanimityRelation([rs[i],rs[j]]);ok(out.every((v,t)=>!v||prev[t])&&prev.every((v,t)=>!v||rs[i][t]),'adding criterion only removes common edges');
 }
}
for(let i=0;i<6;i++)for(let j=0;j<6;j++)for(let k=0;k<6;k++){
 const ids=[i,j,k],out=majorityRelation(ids.map(x=>rs[x]));majorityProfiles++;
 const votes=Array.from({length:9},(_,t)=>ids.reduce((n,id)=>n+Number(criterionOrders[id].ranks[Math.floor(t/3)]>=criterionOrders[id].ranks[t%3]),0));eq(out.votes,votes,'majority votes independent rank oracle');eq(out.pairs,votes.map(n=>n>=2),'majority threshold');ok(props(out.pairs).complete,'three strict criteria produce complete weak relation');if(!props(out.pairs).transitive)cycles++;
}
eq(majorityRelation([rs[0],rs[3],rs[4]]).votes.filter((x,i)=>[1,5,6].includes(i)),[2,2,2],'book Condorcet exact three pairs');ok(cycles>0&&cycles<majorityProfiles,'both cyclic and transitive profiles');
const counter=unanimityRelation([rs[6],rs[2],rs[12]]);ok(props(counter).complete&&pairOutcome(counter,0,1)==='right','weak support vs strict reverse is NOT sufficient for incomparability');ok(pairOutcome(unanimityRelation([rs[0],rs[2]]),0,1)==='incomparable','strict opposition really is incomparable');
for(let M=1;M<=80;M++)for(let ticks=0;ticks<=50;ticks++){
 const out=weightedLexExample(M,ticks);eq(out.weightedWinner,M*ticks>100?'B':M*ticks<100?'A':'tie','integer exact boundary');eq(out.lexWinner,ticks>0?'B':'A','epsilon0 uses second feature');ok(Math.abs((out.uB-out.uA)-out.difference)<1e-12,'displayed difference matches exact discrete comparison');if(out.weightedWinner==='tie')ties++;
}
ok(ties>0,'weighted boundary actually exercised');
for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++)for(let c=-2;c<=2;c++){const r=scoreRelation([a,b,c]);ok(props(r).complete&&props(r).transitive,'value rule even with negative values and ties');}
for(let iz=0;iz<=40;iz++)for(let ib=0;ib<=40;ib++){
 const z=iz/4,b=ib/4,out=distancePreference([1,b,9],z);eq(out.distances,[Math.abs(1-z),Math.abs(b-z),Math.abs(9-z)],'absolute distances');eq(out.pairs,[1,b,9].flatMap(x=>[1,b,9].map(y=>Math.abs(x-z)<=Math.abs(y-z))),'distance lower is better');ok(props(out.pairs).complete&&props(out.pairs).transitive,'distance order properties');
}
for(const b of lexProofBranches){const [f,s]=b.ranks.map(scoreRelation),r=lexicographicRelation(f,s);ok(r[1]&&r[5]&&r[2],'each proof sample really has the two premises and conclusion');}
for(const f of [()=>majorityRelation([rs[0],rs[0]]),()=>majorityRelation([rs[6],rs[0],rs[0]]),()=>unanimityRelation([]),()=>lexicographicRelation(Array(9).fill(false),rs[0]),()=>weightedLexExample(1,.1)]){assert.throws(f);checks++;}
const report={passed:true,checks,weakOrders:13,lexProfiles,unanimityProfiles,majorityProfiles,majorityCycles:cycles,weightedCases:80*51,weightedTies:ties,distanceCases:41*41,scope:'All 3-object weak-criterion pairs/triples; three strict-criterion profiles; exact discrete weighted boundaries. Finite computation supplements arbitrary-set proofs, not a substitute.'};fs.writeFileSync('qa/formation-models.json',JSON.stringify(report,null,2));console.log(report);
