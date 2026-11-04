// Preparation for Chapter 9 Problems 4(b) and 5; not a lesson-completion claim.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {topTrading} from './src/market.mjs';
import {marketResidualMenu} from './src/market-exercises.mjs';

const permute=xs=>xs.length?xs.flatMap((x,i)=>permute(xs.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]];
const people=[0,1,2],orders=permute(people);

// Leave one owner and their initial house in the market. Delete only cycles
// that do not contain this owner. No outgoing edge of the focal owner is used.
function residual(prefs,e,focal,prefix=[]){
  let active=people.slice();const cycles=[];
  const owner=new Map(e.map((h,i)=>[h,i]));
  const arrows=()=>new Map(active.filter(i=>i!==focal).map(i=>[i,owner.get(prefs[i].find(h=>active.includes(owner.get(h))))]));
  const remove=cycle=>{
    const edges=arrows();
    assert(cycle.length>0&&!cycle.includes(focal)&&new Set(cycle).size===cycle.length);
    cycle.forEach((i,j)=>assert.equal(edges.get(i),cycle[(j+1)%cycle.length]));
    active=active.filter(i=>!cycle.includes(i));cycles.push(cycle.slice());
  };
  prefix.forEach(remove);
  while(true){
    const edges=arrows();let found=null;
    for(const start of active){
      let i=start;const path=[],seen=new Map();
      while(i!==focal&&!seen.has(i)){seen.set(i,path.length);path.push(i);i=edges.get(i);}
      if(i!==focal){found=path.slice(seen.get(i));break;}
    }
    if(!found)break;remove(found);
  }
  const edges=arrows();
  for(const start of active){let i=start;const seen=new Set();while(i!==focal){assert(!seen.has(i));seen.add(i);i=edges.get(i);}}
  return {active,houses:active.map(i=>e[i]),cycles};
}

let markets=0,reportChecks=0,promotionChecks=0,commonCycles=0;
for(const p0 of orders)for(const p1 of orders)for(const p2 of orders)for(const e of orders){
  const prefs=[p0,p1,p2],truth=topTrading(prefs,e,people).allocation;markets++;
  for(const focal of people){
    const menu=marketResidualMenu(prefs,e,focal),best=prefs[focal].find(h=>menu.houses.includes(h));
    assert.equal(truth[focal],best);assert.deepEqual(menu.houses,residual(prefs,e,focal).houses);
    for(const report of orders){
      const reported=prefs.map(r=>r.slice());reported[focal]=report;
      const outcome=topTrading(reported,e,people).allocation[focal];
      assert.equal(outcome,report.find(h=>menu.houses.includes(h)));
      assert(prefs[focal].indexOf(truth[focal])<=prefs[focal].indexOf(outcome));reportChecks++;
    }
  }
  // Person 2 raises only the ranking of person 1's initial house.
  const house=e[0],position=prefs[1].indexOf(house);
  for(let higher=0;higher<position;higher++){
    const improved=prefs.map(r=>r.slice());improved[1].splice(position,1);improved[1].splice(higher,0,house);
    const newer=marketResidualMenu(improved,e,0);
    // Every new-market cycle outside person 1 is valid in the old market.
    const older=marketResidualMenu(prefs,e,0,newer.cycles);commonCycles+=newer.cycles.length;
    assert(older.houses.every(h=>newer.houses.includes(h)));
    const oldChoice=prefs[0].find(h=>older.houses.includes(h));
    const newChoice=prefs[0].find(h=>newer.houses.includes(h));
    assert.equal(oldChoice,truth[0]);assert.equal(newChoice,topTrading(improved,e,people).allocation[0]);
    assert(prefs[0].indexOf(newChoice)<=prefs[0].indexOf(oldChoice));promotionChecks++;
  }
}
const result={passed:true,markets,reportChecks,promotionChecks,commonCycles,scope:'All strict three-person profiles and endowments. Checks the residual-menu proof construction for Problems 9.4(b) and 9.5; does not certify source-page visual inspection or finished lesson animations.'};
fs.writeFileSync('qa/market-priority-lemmas-models.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
