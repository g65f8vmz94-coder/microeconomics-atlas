import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),katex=require('./src/vendor/katex/katex.min.js'),math=require('./src/math-format.js');
import {cxIds,cxResolve,cxPick,cxData,cxScene,cxThresholdRank,cxSatisficingRank,cxList} from './src/choice-exercises.mjs';
import {cxContent} from './src/choice-exercises-content.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const perms=a=>a.length?a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(r=>[x,...r])):[[]];
const vectors=(n,vals)=>n?vectors(n-1,vals).flatMap(r=>vals.map(v=>[...r,v])):[[]];
function alpha(kind,data,n){for(let A=1;A<(1<<n);A++)for(let B=1;B<(1<<n);B++)if((A&B)===B){const x=cxPick(kind,A,data);if(B&(1<<x))eq(cxPick(kind,B,data),x);}}
for(const [id,kind,data,A,B,x,y]of [['p1a','local',cxData.local,15,13,0,2],['p1b','wins',cxData.wins,7,5,0,2],['p1e','color',cxData.color,7,5,2,0],['p6','caring',cxData.caring,7,6,2,1]]){eq(cxPick(kind,A,data),x);eq(cxPick(kind,B,data),y);eq(!!(B&(1<<x)),true);eq(x!==y,true);eq(cxScene(id,3).focus,y);}
// Lexicographic numeric encoding is an independent oracle for binary criteria.
for(const bits of [cxData.lex.bits,[[0,0],[0,1]],[[0,0],[0,1],[1,0],[1,1]]]){
 const n=bits.length,score=bits.map(b=>b.reduce((s,v)=>2*s+v,0));for(let mask=1;mask<(1<<n);mask++){const xs=cxList(mask,n),winner=xs.reduce((a,b)=>score[b]>score[a]?b:a);eq(cxPick('lex',mask,{bits}),winner);const literal=cxPick('literal',mask,{bits});if(literal!==null)eq(literal,winner);}alpha('lex',{bits},n);
}
eq(cxPick('literal',3,cxData.empty),null);eq(cxPick('lex',3,cxData.empty),1);
for(const u of vectors(3,[0,10,11]))for(const v of vectors(3,[0,1,2])){
 const data={u,v,threshold:10},rank=cxThresholdRank(data);for(let mask=1;mask<8;mask++)eq(cxPick('threshold',mask,data),rank.find(i=>mask&(1<<i)));alpha('threshold',data,3);
}
for(const values of vectors(3,[-1,0,1]))for(const order of perms([0,1,2]))for(const best of [false,true]){
 const data={values,order,threshold:0},kind=best?'bestFallback':'satisfice',rank=cxSatisficingRank(data,best);
 for(let mask=1;mask<8;mask++)eq(cxPick(kind,mask,data),rank.find(i=>mask&(1<<i)));alpha(kind,data,3);
}
// All strict four-item orders: intersection theorem and disjoint path identity.
for(const rank of perms([0,1,2,3])){
 const c=mask=>cxPick('rank',mask,{rank});for(let A=1;A<16;A++)for(let B=1;B<16;B++){
  if((B&(1<<c(A)))&&(A&(1<<c(B)))){eq(c(A),c(B));eq(c(A&B),c(A));}
  if(!(A&B))eq(c(A|B),c((1<<c(A))|(1<<c(B))));
 }
}
// Three pairwise relations admit an alpha-consistent triple winner iff acyclic.
let tables=0,pathIndependent=0,alphaConsistent=0;
for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)for(let top=0;top<3;top++){
 const t={1:0,2:1,4:2,3:a?1:0,5:b?2:0,6:c?2:1,7:top};tables++;
 let al=true,pi=true;for(let A=1;A<8;A++)for(let B=1;B<8;B++){
  if((A&B)===B&&(B&(1<<t[A]))&&t[A]!==t[B])al=false;
  if(!(A&B)&&t[A|B]!==t[(1<<t[A])|(1<<t[B])])pi=false;
 }
 eq(al,pi);if(al)alphaConsistent++;if(pi)pathIndependent++;
 const edges=[[0,1,t[3]],[0,2,t[5]],[1,2,t[6]]],cycle=edges.every(([x,y,w])=>edges.filter(e=>e[2]===w).length===1);
 if(cycle)eq(al,false);
}
eq(tables,24);eq(alphaConsistent,6);eq(pathIndependent,6);
let frames=0;for(const id of cxIds){const c=cxContent[id];eq(!!c.intro&&!!c.end&&c.proofs.length>=2,true);eq(cxResolve(id),id);for(let p=0;p<c.phases.length;p++){
 const s=cxScene(id,p);eq(s.id,id);eq(!!s.title,true);if(s.focus!==null)eq(!!(s.mask&(1<<s.focus)),true);frames++;
 for(const f of [c.phases[p].formula,...c.proofs.map(p=>p.formula)].filter(Boolean))for(const part of math.splitMath(f)){const rendered=katex.renderToString(math.toTex(part),{throwOnError:true,strict:'ignore',output:'mathml'});eq(rendered.includes('<math'),true);}
 }}
for(const v of 'abcde')eq(cxResolve('p1',v),'p1'+v);eq(cxResolve('p1','oops'),'p1a');eq(cxResolve('p3'),'p3qualified');eq(cxResolve('p4'),'p4qualified');eq(cxResolve('p5'),'p5a');eq(cxResolve('attention'),null);
eq(cxScene('p3qualified',2).scan,2);eq(cxScene('p3qualified',3).scan,2);eq(cxScene('p1c',1).mask,0);
for(const phase of [0,1,2,3,4]){const s=cxScene('p8',phase);eq(cxList(s.mask,6).length,phase===0?2:5);if(phase>=2)eq(Number(s.rows[2][2])-Number(s.rows[2][1]),2);}
const report={passed:true,checks,cases:cxIds.length,frames,choiceTables:tables,pathIndependent,alphaConsistent,scope:'Computed witnesses; complete menus for binary lexicographic, threshold and satisficing rules; ties fixed; disjoint path identity and pair/triple consistency. Finite checks supplement the separate general proofs, not the infinite-domain proof.'};
fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/choice-exercises-models.json',JSON.stringify(report,null,2));console.log(report);
