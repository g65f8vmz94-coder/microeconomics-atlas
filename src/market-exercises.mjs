import {identity,example91,example92,topTrading,checkEquilibrium,tradingPartition,permutations,marketUniquenessStory} from './market.mjs';

export const marketExerciseCases=['p1','p2a','p2b','p2c','p3','p4a','p4b','p5','p6','p7'];
export const marketExerciseOriginal=[[1,2,0,3],[3,2,1,0],[1,2,3,0],[2,0,3,1]];
const marketExerciseCopy=p=>p.map(r=>r.slice());

// Delete only genuine top cycles outside the focal person. The focal person's
// outgoing edge is deliberately unused, so this menu is independent of a report.
export function marketResidualMenu(prefs,e,focal,prefix=[]){
 const people=e.map((_,i)=>i),owner=new Map(e.map((h,i)=>[h,i]));
 if(!people.includes(focal)||owner.size!==e.length||prefs.length!==e.length||prefs.some(r=>r.length!==e.length||new Set(r).size!==e.length||r.some(h=>!owner.has(h))))throw Error('Complete strict preferences and a full initial allocation required');
 let active=people.slice();const rounds=[];
 const pointers=()=>Object.fromEntries(active.filter(i=>i!==focal).map(i=>[i,owner.get(prefs[i].find(h=>active.includes(owner.get(h))))]));
 const remove=cycle=>{const next=pointers();if(!cycle.length||new Set(cycle).size!==cycle.length||cycle.includes(focal)||cycle.some((i,j)=>!active.includes(i)||next[i]!==cycle[(j+1)%cycle.length]))throw Error('Not a top cycle outside focal owner');const before=active.slice();active=active.filter(i=>!cycle.includes(i));rounds.push({active:before,pointers:next,cycle:cycle.slice(),remaining:active.slice()});};
 prefix.forEach(remove);
 while(true){let cycle=null;const next=pointers();for(const start of active){let i=start;const path=[],seen=new Map();while(i!==focal&&!seen.has(i)){seen.set(i,path.length);path.push(i);i=next[i];}if(i!==focal){cycle=path.slice(seen.get(i));break;}}if(!cycle)break;remove(cycle);}
 return {active,houses:active.map(i=>e[i]),cycles:rounds.map(r=>r.cycle),rounds,pointers:pointers()};
}

export function marketExerciseStory(key,step=0){
 if(!marketExerciseCases.includes(key))throw Error('Unknown market exercise');
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),e=identity.slice();
 const f={key,step:t,e,prefs:marketExerciseCopy(example91),afterPrefs:null,before:e.slice(),after:e.slice(),current:e.slice(),people:identity.slice(),focus:[],dim:[],cycle:[],prices:null,kind:'实际配置',beforeLabel:'对照住房',referenceLabel:'原产权',gradePeople:[],menus:null};
 if(key==='p1'){
  f.before=[0,2,1,3];f.after=[1,0,2,3];f.current=(t?f.after:f.before).slice();f.referenceLabel='当前配置a';f.beforeLabel='原先住';f.e=f.before.slice();f.focus=[0,1,2];f.gradePeople=identity.slice();f.cycle=tradingPartition(f.before,f.after).find(c=>c.length>1);f.dim=t>=2?[3]:[];f.kind=t?'可行的改善方案b':'题目给定的配置a';
 }else if(key==='p2a'||key==='p2b'){
  f.prefs=identity.map(()=>identity.slice());f.prices=[4,3,2,1];f.focus=key==='p2a'?[0]:identity.slice();f.beforeLabel='原来住';
  if(key==='p2b'&&t===2){f.current=[1,0,2,3];f.cycle=[0,1];f.kind='临时试换，不是均衡';}
  f.isEquilibrium=checkEquilibrium(f.prefs,e,f.current,f.prices);
 }else if(key==='p2c'){
  f.e=[3,2,1,0];const favorite=t===0?null:Math.min(3,t-1);f.favorite=favorite;
  f.prefs=[[0,1,2,3],[0,1,2,3],[3,0,1,2],favorite===null?[0,1,2,3]:[favorite,...identity.filter(h=>h!==favorite)]];
  f.before=f.e.slice();const result=topTrading(f.prefs,f.e,[3,0,1,2]);f.after=result.allocation;
  f.current=Array(4).fill(-1);if(favorite!==null)f.current[3]=result.allocation[3];
  f.cycle=favorite===null?[]:result.rounds[0].cycle;f.focus=f.cycle.slice();f.kind='只核对4号，不展示完整分房';f.beforeLabel='最初拥有';
  f.firstPointers={0:3,1:3,2:0,...(favorite===null?{}:{3:f.e.indexOf(favorite)})};
 }else if(['p3','p4a','p4b'].includes(key)){
  f.prefs=marketExerciseCopy(marketExerciseOriginal);const old=topTrading(f.prefs,e);f.before=old.allocation;f.prices=old.price;f.afterPrefs=marketExerciseCopy(f.prefs);
  if(key==='p3'){
   const result=topTrading(f.prefs,e,[0,1,3]);f.after=result.allocation;f.current=(t<2?f.before:f.after).slice();f.people=t<2?identity.slice():[0,1,3];f.focus=[0,3];f.dim=t>=2?[2]:[];f.gradePeople=[0,1,3];f.prices=t<2?old.price:result.price;f.departed=t>=2?{person:2,house:2}:null;f.kind=t<2?'四人在场的均衡':'3号与原房C退出后的均衡';
  }else if(key==='p4a'){
   f.afterPrefs[0]=[1,0,2,3];f.after=topTrading(f.afterPrefs,e).allocation;f.current=f.before.slice();f.focus=[0];f.gradePeople=[];f.isEquilibrium=checkEquilibrium(t?f.afterPrefs:f.prefs,e,f.current,old.price);f.kind='同一组价格与住房仍是均衡';
  }else{
   f.afterPrefs[1]=[0,3,2,1];f.after=topTrading(f.afterPrefs,e).allocation;f.current=(t<3?f.before:f.after).slice();f.focus=[0];f.gradePeople=[0];
   const newer=marketResidualMenu(f.afterPrefs,e,0),older=marketResidualMenu(f.prefs,e,0,newer.cycles);f.menus={old:older,new:newer};f.kind=t<3?'旧均衡作对照':'只比较偏好未变的1号';f.prices=null;
  }
 }else if(key==='p5'){
  f.prefs=[[2,1,0,3],[0,1,2,3],[2,0,1,3],[3,0,1,2]];f.afterPrefs=marketExerciseCopy(f.prefs);f.afterPrefs[0]=[0,1,2,3];
  f.before=topTrading(f.prefs,e).allocation;f.after=topTrading(f.afterPrefs,e).allocation;f.current=(t<3?f.before:f.after).slice();f.focus=[0];f.gradePeople=[0];f.dim=t>=1?[2,3]:[];
  const menu=marketResidualMenu(f.prefs,e,0);f.menus={menu};f.reportResults=permutations(identity).map(report=>{const p=marketExerciseCopy(f.prefs);p[0]=report;return {report,house:topTrading(p,e).allocation[0]};});f.beforeLabel='诚实所得';f.kind=t<3?'诚实结果；先处理其他人的圈':'谎报结果；仍按真实喜好评价';
 }else if(key==='p6'){
  f.prefs=marketExerciseCopy(example92);const result=topTrading(f.prefs,e);f.before=result.allocation;f.prices=result.price;f.after=[2,-1,0,-1];f.coalition=[0,2];f.focus=f.coalition.slice();f.gradePeople=t>=3?f.coalition:[];
  f.current=t<2?f.before.slice():t===2?[0,-1,2,-1]:f.after.slice();f.people=t<2?identity.slice():f.coalition.slice();f.dim=t>=1?[1,3]:[];f.beforeLabel='均衡住';f.kind=t<2?'均衡作对照':'只比较联盟内方案，不是全市场配置';
  const owned=f.coalition.map(i=>e[i]);f.coalitionPlans=permutations(owned).map(hs=>({houses:hs,allBetter:f.coalition.every((i,j)=>f.prefs[i].indexOf(hs[j])<f.prefs[i].indexOf(f.before[i]))}));f.ownedValue=owned.reduce((s,h)=>s+f.prices[h],0);f.proposalValue=f.coalition.reduce((s,i)=>s+f.prices[f.after[i]],0);
 }else if(key==='p7'){
  const weak=marketUniquenessStory('strict95',5);f.e=weak.initial;f.people=weak.initial.slice();f.prefs=null;f.ranks=weak.ranks;f.before=weak.a;f.after=weak.b;f.current=(t<2?f.before:f.after).slice();f.prices=t<4?weak.p:weak.q;f.focus=[0,1];f.gradePeople=[0,1];f.beforeLabel='第一套均衡';f.kind=t<2?'第一套价格下的均衡':t<4?'可行福利比较；不是原价格下的均衡':'第二套价格下的另一均衡';
  f.firstEquilibrium=weak.eqP;f.secondEquilibrium=weak.eqQ;f.isEquilibrium=t<2||t>=4;f.beforeStable=false;
 }
 f.grades=f.current.map((h,i)=>h<0?null:f.gradePeople.includes(i)?f.ranks?f.ranks[i][f.before[i]]-f.ranks[i][h]:f.prefs[i].indexOf(f.before[i])-f.prefs[i].indexOf(h):null);
 return f;
}
