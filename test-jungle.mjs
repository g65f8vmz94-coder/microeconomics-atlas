import assert from 'node:assert/strict';
import * as j from './src/jungle.mjs';
const same=(a,b)=>a.every((x,k)=>x===b[k]);
const perms3=j.permutations([0,1,2]),perms4=j.permutations([0,1,2,3]);
let profilesChecked=0,ordersChecked=0,paretoChecked=0,dynamicChecked=0;
for(const p1 of perms3)for(const p2 of perms3)for(const p3 of perms3){const prefs=[p1,p2,p3];profilesChecked++;for(const order of perms3){const a=j.serial(prefs,order).allocation;const eqs=perms3.filter(b=>j.strictEq(prefs,order,b));assert.equal(eqs.length,1);assert.ok(same(eqs[0],a));assert.equal(j.paretoAlternatives(prefs,a).length,0);ordersChecked++;const stages=j.dynamicProcess(prefs,order);assert.ok(stages.length<=4);assert.ok(same(stages.at(-1),a));dynamicChecked++;}for(const a of perms3){const stable=j.paretoAlternatives(prefs,a).length===0;const inverse=j.reverseOrder(prefs,a);assert.equal(Boolean(inverse),stable);if(stable){assert.ok(same(j.serial(prefs,inverse).allocation,a));paretoChecked++;}}}
assert.ok(same(j.serial(j.sourcePrefs,[0,1,2,3]).allocation,j.sourceEquilibrium));
assert.deepEqual(j.paretoAlternatives(j.sourcePrefs,j.sourceAllocation),[[2,3,0,1]]);
assert.equal(perms4.filter(a=>j.strictEq(j.sourcePrefs,[0,1,2,3],a)).length,1);
assert.equal(perms3.filter(a=>j.externalEqSeats(a,[0,1,2],j.externalUtility3).ok).length,0);
assert.deepEqual(perms3.filter(a=>j.externalEqSeats(a,[0,1,2],j.externalUtility4).ok).map(a=>a.join('')).sort(),j.externalRotations.map(a=>a.join('')).sort());
assert.equal(j.externalPareto(j.externalUtility4,j.externalRotations[0]).length,0);
assert.ok(j.externalPareto(j.externalUtility4,j.externalRotations[1]).some(a=>same(a,j.externalRotations[0])));
assert.ok(j.externalPareto(j.externalUtility4,j.externalRotations[2]).some(a=>same(a,j.externalRotations[0])));
for(const a of [[0,1],[1,0]])assert.equal(j.externalEq(a,[0,1],j.tiedUtility).ok,true);
assert.deepEqual(j.permutations([0,1]).filter(a=>j.externalEq(a,[0,1],j.tiedUtility).ok).length,2);
assert.equal(j.externalEq([0,1,2,3],[0,1,2,3],j.creamUtility).ok,true);
assert.equal(perms4.filter(a=>j.externalEq(a,[0,1,2,3],j.creamUtility).ok).length,1);
assert.ok([0,1,2,3].every(i=>j.creamUtility([1,2,3,0],i)>j.creamUtility([0,1,2,3],i)));
for(const n of [4,6]){const ids=Array.from({length:n},(_,i)=>i),all=j.permutations(ids),eqs=all.filter(a=>j.externalEqSeats(a,ids,j.neighborUtility).ok),expected=n===4?8:48;assert.equal(eqs.length,expected);for(const a of eqs){const pairs=Array.from({length:n/2},(_,k)=>[a[2*k],a[2*k+1]].sort((x,y)=>x-y).join('')).sort();assert.deepEqual(pairs,Array.from({length:n/2},(_,k)=>`${2*k}${2*k+1}`));assert.equal(j.externalPareto(j.neighborUtility,a).length,0)}}
assert.ok(perms3.every(a=>j.majorityBeaters([[0,1,2],[0,1,2],[0,1,2]],a).length>0));
const reportTrue=j.serial(j.sourcePrefs,[0,1,2,3]).allocation[1];for(const report of perms4){const a=j.serial([j.sourcePrefs[0],report,j.sourcePrefs[2],j.sourcePrefs[3]],[0,1,2,3]).allocation;assert.ok(j.sourcePrefs[1].indexOf(reportTrue)<=j.sourcePrefs[1].indexOf(a[1]))}
const cyclePrefs=[[1,0,2],[2,1,0],[0,2,1]],before=[0,1,2],after=[1,2,0];assert.ok(cyclePrefs.every((p,i)=>p.indexOf(after[i])<p.indexOf(before[i])));assert.ok([[0,1],[0,2],[1,2]].every(([i,k])=>{const a=j.swap(before,i,k);return !(cyclePrefs[i].indexOf(a[i])<cyclePrefs[i].indexOf(before[i])&&cyclePrefs[k].indexOf(a[k])<cyclePrefs[k].indexOf(before[k]))}));
console.log(JSON.stringify({profilesChecked,ordersChecked,paretoChecked,dynamicChecked,sourceExample:'matched',externalExamples:'matched',cream:'unique equilibrium and strict Pareto improvement',neighbor:'4 and 6 person exhaustive',majority:'all six allocations beaten',report:'all 24 reports checked'}));
