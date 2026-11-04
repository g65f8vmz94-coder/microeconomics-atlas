import assert from 'node:assert/strict';
import fs from 'node:fs';
import {relationStats} from './src/foundations.mjs';
import {answerRelation,derivedRelations,equivalencePartition,rankRelation,relationPresets,derivedProofs,relationProofFrame} from './src/relations.mjs';
let checks=0,relations=0,preferences=0;const ok=(b,m)=>{checks++;assert.ok(b,m)};
// Enumerate each ordered pair independently, including the diagonal. The oracle
// uses direct quantified loops rather than the production transpose/partition code.
for(const n of [1,2,3])for(let mask=0;mask<2**(n*n);mask++){
 const r=Array.from({length:n*n},(_,k)=>!!(mask&(2**k))),R=(a,b)=>r[a*n+b];relations++;
 let complete=true,reflexive=true,transitive=true,symmetric=true,antisymmetric=true;
 for(let a=0;a<n;a++){if(!R(a,a))reflexive=false;for(let b=0;b<n;b++){if(!R(a,b)&&!R(b,a))complete=false;if(R(a,b)!==R(b,a))symmetric=false;if(a!==b&&R(a,b)&&R(b,a))antisymmetric=false;for(let c=0;c<n;c++)if(R(a,b)&&R(b,c)&&!R(a,c))transitive=false}}
 const got=relationStats(r,n);for(const [key,v]of Object.entries({complete,reflexive,transitive,symmetric,antisymmetric,equivalence:reflexive&&symmetric&&transitive}))ok(got[key]===v,key+' quantified oracle');
 if(complete&&transitive)preferences++;
 const d=derivedRelations(r,n),P=(a,b)=>R(a,b)&&!R(b,a),I=(a,b)=>R(a,b)&&R(b,a);
 for(let a=0;a<n;a++)for(let b=0;b<n;b++){ok(d.strict[a*n+b]===P(a,b),'strict definition');ok(d.indifferent[a*n+b]===I(a,b),'indifference definition');if(transitive)for(let c=0;c<n;c++){
  if(P(a,b)&&P(b,c))ok(P(a,c),'strict transitivity');if(I(a,b)&&I(b,c))ok(I(a,c),'indifference transitivity');if(R(a,b)&&P(b,c))ok(P(a,c),'weak-strict propagation');if(P(a,b)&&R(b,c))ok(P(a,c),'strict-weak propagation');
 }}
 const partition=equivalencePartition(r,n);
 if(reflexive&&symmetric&&transitive){ok(!!partition,'valid equivalence gives classes');const flat=partition.flat();ok(flat.length===n&&new Set(flat).size===n,'classes cover exactly once');for(let a=0;a<n;a++)for(let b=0;b<n;b++)ok(partition.some(g=>g.includes(a)&&g.includes(b))===R(a,b),'same class iff relation')}
 else ok(partition===null,'invalid relation cannot be silently partitioned');
 if(complete)ok(reflexive,'textbook completeness includes diagonal');
}
const expected={a:[true,true,false,true],b:[true,false,true,true],tie:[true,true,true,true],missing:[true,false,false,true]};for(const[k,v]of Object.entries(expected)){ok(JSON.stringify(answerRelation(k).pairs)===JSON.stringify(v),'source questionnaire '+k);ok(answerRelation(k).complete===(k!=='missing'),'missing is outside complete questionnaire')}
ok(relationStats(relationPresets.identity.pairs).symmetric&&relationStats(relationPresets.identity.pairs).antisymmetric,'both properties can hold');ok(!relationStats(relationPresets.neither.pairs).symmetric&&!relationStats(relationPresets.neither.pairs).antisymmetric,'neither can hold');
ok(!relationStats(relationPresets.diagonal.pairs).complete,'distinct-pair completeness does not replace diagonal');
for(const[k,p]of Object.entries(derivedProofs))for(let step=0;step<p.steps.length;step++){
 const f=relationProofFrame(k,step),sample=rankRelation(p.ranks);for(let i=0;i<9;i++)if(f.shown[i])ok(sample[i],'proof edge true in stated sample');for(const[a,b]of f.forbidden)ok(!sample[a*3+b],'strict excluded edge false');for(const[a,b]of f.assumptions)ok(!sample[a*3+b],'contradiction edges are assumptions, not true data');
 if(k==='weakStrict')ok(f.shown[1]&&f.shown[3],'weak-first illustration really includes the stated tie');if(k==='strictWeak'&&step>=1)ok(f.shown[5]&&f.shown[7],'weak-second illustration really includes the stated tie');
 if(f.groups)ok(JSON.stringify(f.groups)===JSON.stringify(equivalencePartition(sample)),'shown partition matches example');
}
const result={passed:true,checks,relations,completeAndTransitiveRelations:preferences,proofTypes:Object.keys(derivedProofs).length,scope:'All Boolean relations on 1/2/3 objects, derived relations, textbook diagonal convention, equivalence classes, proof-diagram samples and contradiction annotations. Finite exhaustive checks supplement separately written arbitrary-set proofs.'};fs.writeFileSync('qa/relations-models.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
