export const sum=xs=>xs.reduce((a,b)=>a+b,0);
export const permutations=xs=>xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>j!==i)).map(p=>[x,...p])):[[]];
export function project(reports,rule='vcg') {
  const total=sum(reports),decision=rule==='majority'?+(reports.filter(x=>x>0).length>reports.length/2):+(total>0);
  const transfers=reports.map(x=>rule==='vcg'?decision*(total-x)-Math.max(0,total-x):0);
  return {decision,transfers,total,revenue:-sum(transfers)};
}
export function reportComparison(values,report,rule) {
  const truthful=project(values,rule),reports=[report,...values.slice(1)],actual=project(reports,rule);
  const honestUtility=values[0]*truthful.decision+truthful.transfers[0],actualUtility=values[0]*actual.decision+actual.transfers[0];
  return {truthful,actual,reports,honestUtility,actualUtility,gain:actualUtility-honestUtility};
}
export const profiles={
  textbook:{label:'教材例18.4',X:[[0,3,1,2],[1,2,0,3],[3,1,2,0],[3,2,0,1]],Y:[[2,0,1,3],[2,1,3,0],[3,2,1,0],[0,3,2,1]]},
  multiple:{label:'多重稳定匹配（构造）',X:[[0,1,2,3],[1,0,2,3],[2,3,0,1],[3,2,0,1]],Y:[[1,0,2,3],[0,1,2,3],[3,2,0,1],[2,3,0,1]]},
  blocking:{label:'顺序独裁不稳定（扩展例）',X:[[0,1,2,3],[0,1,2,3],[0,1,2,3],[3,2,1,0]],Y:[[1,2,0,3],[2,1,0,3],[0,2,1,3],[3,0,1,2]]}
};
export function galeShapley(X,Y,side='X') {
  const P=side==='X'?X:Y,R=side==='X'?Y:X,n=P.length,next=Array(n).fill(0),held=Array(n).fill(-1),trace=[];
  const canonical=()=>side==='X'?Array.from({length:n},(_,p)=>held.indexOf(p)):held.slice();
  trace.push({matching:Array(n).fill(-1),proposals:[],rejections:[],held:held.slice()});
  while(held.some(x=>x<0)) {
    const free=Array.from({length:n},(_,i)=>i).filter(i=>!held.includes(i));
    const proposals=free.map(p=>{if(next[p]>=n)throw Error('Exhausted preference list');return[p,P[p][next[p]++]]});
    const rejections=[];
    for(let r=0;r<n;r++) {
      const candidates=[...proposals.filter(x=>x[1]===r).map(x=>x[0]),...(held[r]<0?[]:[held[r]])];
      if(!candidates.length)continue;
      candidates.sort((a,b)=>R[r].indexOf(a)-R[r].indexOf(b));held[r]=candidates[0];
      rejections.push(...candidates.slice(1).map(p=>[p,r]));
    }
    trace.push({matching:canonical(),proposals,rejections,held:held.slice()});
    if(trace.length>n*n+1)throw Error('Algorithm did not terminate');
  }
  return {matching:canonical(),trace};
}
export function blockingPairs(X,Y,m) {
  const result=[];
  for(let x=0;x<X.length;x++)for(let y=0;y<Y.length;y++) {
    const old=m.indexOf(y);
    if(m[x]!==y&&(m[x]<0||X[x].indexOf(y)<X[x].indexOf(m[x]))&&(old<0||Y[y].indexOf(x)<Y[y].indexOf(old))) result.push([x,y]);
  }
  return result;
}
export function matchingAnalysis(X,Y) {
  const all=permutations(X.map((_,i)=>i)),stable=all.filter(m=>!blockingPairs(X,Y,m).length);
  const ranks=m=>sum(m.map((y,x)=>X[x].indexOf(y)+Y[y].indexOf(x)+2));
  const rankMinimum=all.reduce((a,b)=>ranks(a)<=ranks(b)?a:b);
  const remaining=[...X.keys()],serial=X.map(p=>{const y=p.find(y=>remaining.includes(y));remaining.splice(remaining.indexOf(y),1);return y});
  const greedy=Array(X.length).fill(-1),rx=[...X.keys()],ry=[...Y.keys()];
  while(rx.length){let pair=rx.flatMap(x=>ry.map(y=>({x,y,r:X[x].indexOf(y)+Y[y].indexOf(x)}))).sort((a,b)=>a.r-b.r||a.x-b.x||a.y-b.y)[0];greedy[pair.x]=pair.y;rx.splice(rx.indexOf(pair.x),1);ry.splice(ry.indexOf(pair.y),1)}
  return {all,stable,rankMinimum,serial,greedy};
}
export function distribution(lambda,rule) {
  const n=lambda.length,M=Math.max(...lambda),m=Math.min(...lambda),total=sum(lambda),maxs=lambda.map(x=>x===M),mins=lambda.map(x=>x===m);
  let input,wealth;
  const maxInput=maxs.map(x=>+x/maxs.filter(Boolean).length);
  switch(rule) {
    case 'equal-own':input=lambda.map(()=>1/n);wealth=lambda.map(x=>x/n);break;
    case 'max-own':input=maxInput;wealth=lambda.map((x,i)=>input[i]*x);break;
    case 'equal-equal':input=lambda.map(()=>1/n);wealth=lambda.map(()=>total/n/n);break;
    case 'max-equal':input=maxInput;wealth=lambda.map(()=>M/n);break;
    case 'one-one':input=lambda.map((_,i)=>+(i===0));wealth=lambda.map((_,i)=>i===1?lambda[0]:0);break;
    case 'proportional':input=maxInput;wealth=lambda.map(x=>total?M*x/total:0);break;
    case 'min-equal':input=mins.map(x=>+x/mins.filter(Boolean).length);wealth=lambda.map(()=>m/n);break;
    case 'max-first':input=maxInput;wealth=lambda.map((_,i)=>i===0?M:0);break;
    case 'max-lowest':input=maxInput;wealth=mins.map(x=>x?M/mins.filter(Boolean).length:0);break;
    default:throw Error('Unknown economic system');
  }
  return {input,wealth,output:sum(input.map((a,i)=>a*lambda[i])),max:M,efficient:Math.abs(sum(wealth)-M)<1e-9};
}
export function wealthChecks(lambda,rule,who,delta) {
  const before=distribution(lambda,rule),next=lambda.map((x,i)=>x+(i===who?delta:0)),after=distribution(next,rule);
  return {before,after,next,own:after.wealth[who]>=before.wealth[who]-1e-9,others:before.wealth.every((w,i)=>i===who||after.wealth[i]>=w-1e-9),symmetric:lambda.every((x,i)=>lambda.every((y,j)=>x!==y||Math.abs(before.wealth[i]-before.wealth[j])<1e-9))};
}
