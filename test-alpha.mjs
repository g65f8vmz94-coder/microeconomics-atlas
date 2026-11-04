import assert from 'node:assert/strict';
import fs from 'node:fs';
import {alphaDecode,alphaEncode,alphaFromOrder,alphaPair,alphaAnalyze,alphaPeel,alphaTail,alphaStudy,alphaSourceWitness} from './src/alpha.mjs';
import {rzMedian,rzRestaurant,rzParty} from './src/rationalization.mjs';
const subsets=n=>Array.from({length:(1<<n)-1},(_,i)=>i+1).sort((a,b)=>a.toString(2).replace(/0/g,'').length-b.toString(2).replace(/0/g,'').length||a-b);
const items=(A,n)=>Array.from({length:n},(_,i)=>i).filter(i=>A&(1<<i));
const permutations=a=>a.length?a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(t=>[x,...t])):[[]];
const reference=(order,n)=>Object.fromEntries(subsets(n).map(A=>[A,items(A,n).reduce((x,y)=>order.indexOf(x)<order.indexOf(y)?x:y)]));
let checks=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++},ok=(a,m)=>{assert.ok(a,m);checks++};
let complete4=0,good4=0;
const sets4=subsets(4),options4=sets4.map(A=>items(A,4)),strict4=permutations([0,1,2,3]),goodCodes4=new Set(strict4.map(o=>alphaEncode(reference(o,4),4)));
for(let index=0;index<20736;index++){
 let v=index;const data={};for(let i=0;i<sets4.length;i++){const opts=options4[i];data[sets4[i]]=opts[v%opts.length];v=Math.floor(v/opts.length)}eq(v,0);
 const expected=goodCodes4.has(alphaEncode(data,4)),a=alphaAnalyze(data,4),p=alphaPeel(data,4);
 eq(a.complete,true);eq(a.alphaComplete,expected,'all20736 four-item full functions');eq(a.alphaCompletions,expected?1:0);eq(p.complete,true);eq(new Set(p.order).size,4);eq(p.comparison.fits,expected);
 if(expected){good4++;for(const C of sets4){const t=alphaTail(data,4,p,C);ok((C&t.tail)===C);ok(C&(1<<t.x));eq(data[t.tail],t.x);eq(data[C],t.x);eq(t.matches,true);eq(t.sameMenu?true:t.pair.pass,true);}}
 else ok(p.comparison.rows.some(r=>!r.match),'peeling completion alone cannot prove representation');
 complete4++;
}
eq(good4,24);
const strict3=permutations([0,1,2]),refs3=strict3.map(o=>reference(o,3));let candidates3=0,hiddenObstructions=0;
for(let i=0;i<4**7;i++){
 let v=i,code='';for(let j=0;j<7;j++){code+='012u'[v%4];v=Math.floor(v/4)}const data=alphaDecode(code),valid=Object.entries(data).every(([A,x])=>x===null||items(+A,3).includes(x));
 const fits=valid?refs3.filter(t=>Object.entries(data).every(([A,x])=>x===null||t[A]===x)):[];
 const a=alphaAnalyze(data);eq(alphaEncode(data),code);eq(a.canCompleteAlpha,fits.length>0);eq(a.alphaCompletions,fits.length);
 const independentFailures=[];for(const A of subsets(3))for(const B of subsets(3))if(A!==B&&(A&B)===B&&data[A]!==null&&data[B]!==null&&items(A,3).includes(data[A])&&items(B,3).includes(data[B])&&(B&(1<<data[A]))&&data[B]!==data[A])independentFailures.push([A,B]);
 eq(a.failures.map(p=>[p.A,p.B]),independentFailures);if(valid&&!fits.length&&!a.failures.length)hiddenObstructions++;candidates3++;
}
const cyc=alphaAnalyze(alphaDecode('012021u'));eq(cyc.failures.length,0);eq(cyc.canCompleteAlpha,false);eq(cyc.complete,false);ok(hiddenObstructions>0);
let orderedFunctions=0;for(let n=1;n<=6;n++)for(const order of permutations(Array.from({length:n},(_,i)=>i))){
 const data=alphaFromOrder(order);eq(data,reference(order,n));const p=alphaPeel(data,n);eq(p.order,order);eq(p.comparison.fits,true);
 for(const C of subsets(n)){const t=alphaTail(data,n,p,C);eq(t.x,data[C]);eq(t.sameMenu||t.pair.kind==='preserved',true);}
 orderedFunctions++;
}
const d=alphaFromOrder([0,1,2]);eq(alphaPair(d,3,7,6).kind,'winner-removed');eq(alphaPair(d,3,7,7).kind,'same-menu');eq(alphaPair(d,3,7,0).kind,'empty-small');eq(alphaPair(d,3,3,5).kind,'not-subset');eq(alphaPair(d,3,0,1).kind,'empty-or-invalid-large');
for(const bad of[-32,-1,3,32,1.5,[0,1]]){eq(alphaPair({...d,7:bad},3,7,3).kind,'invalid-answer');eq(alphaPeel({...d,7:bad},3).stop.kind,'invalid-answer')}
eq(alphaPeel({},3).stop.kind,'unanswered');eq(alphaTail({},3,alphaPeel({},3),7),null);eq(alphaAnalyze({0:0},3).invalid.length,1);
const partial={7:0,6:1,4:2},pp=alphaPeel(partial);eq(pp.complete,true);eq(pp.comparison.fits,true);eq(alphaAnalyze(partial).complete,false);eq(alphaStudy(partial).peeledOrderRepresentsFull,false);
for(const[k,v]of[['median',rzMedian()],['restaurant',rzRestaurant()],['party',rzParty()]]){const w=alphaSourceWitness(k);eq(w.data,v.data);eq(alphaPair(w.data,w.n,w.A,w.B).kind,'violated');eq(alphaAnalyze(w.data,w.n).canCompleteAlpha,false)}
eq(alphaAnalyze({},0).alphaComplete,true);eq(alphaPeel({},0).order,[]);
const result={passed:true,checks,completeFourItemFunctions:complete4,rationalizableFourItemFunctions:good4,threeItemCandidateTables:candidates3,partialHiddenObstructions:hiddenObstructions,strictOrderGeneratedFunctions:orderedFunctions,sourceWitnesses:3,scope:'Independent full-function enumeration and permutation lookup,partial/invalid record checks,known alpha versus full extension,actual peeling/tail equality and proper-inclusion cases,unique-best finite proof conditions; general arguments written separately.'};fs.mkdirSync('qa',{recursive:true});fs.writeFileSync('qa/alpha-models.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
