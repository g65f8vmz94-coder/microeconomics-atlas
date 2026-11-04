// Osborne--Rubinstein, Models in Microeconomic Theory (2020.12.21 h), ch.18,
// printed pp.289--299. Original source stays private; these are fresh models.
export const examples={
 lesson181:{label:'本站三对人物示例',X:[[1,0,2],[0,1,2],[0,1,2]],Y:[[0,1,2],[2,0,1],[0,1,2]]},
 book:{label:'原书例18.4 · 四人偏好',X:[[0,3,1,2],[1,2,0,3],[3,1,2,0],[3,2,0,1]],Y:[[2,0,1,3],[2,1,3,0],[3,2,1,0],[0,3,2,1]]},
 unstable:{label:'原书例18.5 · 顺序独裁失稳',X:[[0,1,2],[0,1,2],[0,1,2]],Y:[[1,2,0],[2,1,0],[0,2,1]]},
 multiple:{label:'构造 · 两个稳定匹配',X:[[0,1,2],[1,0,2],[2,0,1]],Y:[[1,0,2],[0,1,2],[2,0,1]]},
 sameX:{label:'习题18.3 · X偏好相同',X:[[0,1,2],[0,1,2],[0,1,2]],Y:[[2,1,0],[0,2,1],[1,0,2]]},
 weakPareto:{label:'Roth构造 · 弱而非强帕累托',X:[[1,0,2],[0,1,2],[0,1,2]],Y:[[0,1,2],[2,0,1],[0,1,2]]},
 unequal:{label:'习题18.4(b) · 两A三B',X:[[0,1,2],[1,0,2]],Y:[[1,0],[0,1],[0,1]]},
 oneA:{label:'习题18.4(a) · 一A三B',X:[[1,0,2]],Y:[[0],[0],[0]]},
 manipulate:{label:'原书习题18.6 · 真实偏好',X:[[0,1,2],[1,0,2],[0,1,2]],Y:[[1,0,2],[0,1,2],[0,1,2]]}
};
export const cases={
 d181:{section:'18.1',label:'定义18.1 · 社会与严格偏好',page:289,kind:'society',profile:'book'},
 d182:{section:'18.1',label:'定义18.2 · 一对一匹配',page:289,kind:'matching',profile:'book'},
 d183:{section:'18.1',label:'定义18.3 · 匹配方法',page:290,kind:'method',profile:'book'},
 e181:{section:'18.1',label:'例18.1 · 顺序独裁',page:290,kind:'serial',profile:'unstable'},
 e182:{section:'18.1',label:'例18.2 · 总名次最小',page:290,kind:'rank',profile:'multiple'},
 e183:{section:'18.1',label:'例18.3 · 逐次选最优一对',page:290,kind:'greedy',profile:'multiple'},
 e184:{section:'18.2',label:'例18.4 · GSX 与 GSY 逐轮对照',page:293,kind:'gs',profile:'book'},
 e184y:{section:'18.2',label:'例18.4 · Y方发起的五轮',page:294,kind:'gs',profile:'book'},
 p181:{section:'18.2',label:'命题18.1 · 算法必终止',page:294,kind:'terminate',profile:'book'},
 d184:{section:'18.3',label:'定义18.4 · 阻挡对与稳定',page:295,kind:'stable',profile:'unstable'},
 e185:{section:'18.3',label:'例18.5 · 顺序独裁的不稳定结果',page:296,kind:'unstable',profile:'unstable'},
 p182:{section:'18.3',label:'命题18.2 · GS 结果稳定',page:296,kind:'gsStable',profile:'multiple'},
 p183:{section:'18.3',label:'命题18.3 · X 方稳定最优',page:296,kind:'xBest',profile:'multiple'},
 p184:{section:'18.3',label:'命题18.4 · Y 方稳定最差',page:297,kind:'yWorst',profile:'multiple'},
 q181:{section:'18.3',label:'习题18.1 · 帕累托稳定与阻挡对',page:298,kind:'pareto',profile:'unstable'},
 q182:{section:'18.3',label:'习题18.2 · X 方弱帕累托稳定',page:298,kind:'xPareto',profile:'weakPareto'},
 q183:{section:'18.3',label:'习题18.3 · X 方同偏好三问',page:298,kind:'sameX',profile:'sameX'},
 q184:{section:'18.3',label:'习题18.4 · 两侧人数不等',page:298,kind:'unequal',profile:'unequal'},
 q185:{section:'18.3',label:'习题18.5 · 三个项目各容 n 人',page:298,kind:'capacity'},
 q186:{section:'18.3',label:'习题18.6 · 接收方的操纵',page:299,kind:'manipulate',profile:'manipulate'},
 q187:{section:'18.3',label:'习题18.7 · 四人室友无稳定解',page:299,kind:'roommate'}
};
export const casesBySection=Object.fromEntries(['18.1','18.2','18.3'].map(s=>[s,Object.keys(cases).filter(k=>cases[k].section===s)]));
const rank=(pref,x)=>pref.indexOf(x);
export const invert=(m,size=Math.max(...m,-1)+1)=>Array.from({length:size},(_,y)=>m.indexOf(y));
export function permutations(xs){return xs.length?xs.flatMap((x,i)=>permutations(xs.filter((_,j)=>i!==j)).map(t=>[x,...t])):[[]]}
export function gs(X,Y,side='X'){
 const P=side==='X'?X:Y,R=side==='X'?Y:X,held=Array(R.length).fill(-1),next=Array(P.length).fill(0),trace=[];
 const snapshot=(proposals=[],rejections=[])=>({matching:side==='X'?invert(held,P.length).slice(0,X.length):held.slice(),held:held.slice(),proposals,rejections,attempts:next.reduce((a,b)=>a+b,0)});
 trace.push(snapshot());
 for(let guard=0;guard<=P.length*R.length;guard++){
  const free=P.map((_,i)=>i).filter(i=>!held.includes(i)&&next[i]<R.length);
  if(!free.length)return{matching:trace.at(-1).matching,trace,side};
  const proposals=free.map(p=>[p,P[p][next[p]++]]),rejections=[];
  for(let r=0;r<R.length;r++){
   const incoming=proposals.filter(([,y])=>y===r).map(([p])=>p),candidates=held[r]<0?incoming:[held[r],...incoming];
   if(!candidates.length)continue;
   candidates.sort((a,b)=>rank(R[r],a)-rank(R[r],b));held[r]=candidates[0];
   for(const p of candidates.slice(1))rejections.push([p,r]);
  }
  trace.push(snapshot(proposals,rejections));
 }
 throw Error('GS did not terminate within proposal bound');
}
export function blockers(X,Y,m){
 const inv=invert(m,Y.length),out=[];
 for(let x=0;x<X.length;x++)for(let y=0;y<Y.length;y++)if(m[x]!==y&&
  (m[x]<0||rank(X[x],y)<rank(X[x],m[x]))&&
  (inv[y]<0||rank(Y[y],x)<rank(Y[y],inv[y])))out.push([x,y]);
 return out;
}
export function analysis(X,Y){
 if(X.length!==Y.length)return{all:[],stable:[],serial:[],rankMinimum:[],greedy:[]};
 const all=permutations(Y.map((_,i)=>i)),stable=all.filter(m=>blockers(X,Y,m).length===0);
 const score=m=>m.reduce((v,y,x)=>v+rank(X[x],y)+rank(Y[y],x)+2,0);
 const rankMinimum=all.reduce((a,b)=>score(a)<=score(b)?a:b);
 const rest=Y.map((_,i)=>i),serial=X.map(p=>{const y=p.find(z=>rest.includes(z));rest.splice(rest.indexOf(y),1);return y});
 const greedy=Array(X.length).fill(-1),rx=X.map((_,i)=>i),ry=Y.map((_,i)=>i),greedyTrace=[];
 while(rx.length){const a=rx.flatMap(x=>ry.map(y=>({x,y,v:rank(X[x],y)+rank(Y[y],x)+2}))).sort((p,q)=>p.v-q.v||p.x-q.x||p.y-q.y)[0];greedy[a.x]=a.y;greedyTrace.push({...a,matching:greedy.slice()});rx.splice(rx.indexOf(a.x),1);ry.splice(ry.indexOf(a.y),1)}
 return{all,stable,serial,rankMinimum,greedy,greedyTrace,score};
}
export function paretoDominates(X,Y,a,b,side='both'){
 let strict=false;
 const xa=X.map((p,x)=>rank(p,a[x])),xb=X.map((p,x)=>rank(p,b[x]));
 const ya=Y.map((p,y)=>rank(p,a.indexOf(y))),yb=Y.map((p,y)=>rank(p,b.indexOf(y)));
 const A=side==='X'?xa:xa.concat(ya),B=side==='X'?xb:xb.concat(yb);
 for(let i=0;i<A.length;i++){if(A[i]>B[i])return false;if(A[i]<B[i])strict=true}
 return strict;
}
export const capacityPrefs={
 students:[[0,1,2],[0,1,2],[0,1,2],[1,0,2],[1,0,2],[2,1,0]],
 programs:[[2,0,1,3,4,5],[4,3,1,0,2,5],[5,0,1,2,3,4]],capacity:2
};
export function capacityGS(S,P,cap){
 const next=Array(S.length).fill(0),held=P.map(()=>[]),trace=[{matching:Array(S.length).fill(-1),proposals:[],rejections:[],held:held.map(a=>a.slice())}];
 for(let guard=0;guard<=S.length*P.length;guard++){
  const free=S.map((_,i)=>i).filter(i=>!held.some(a=>a.includes(i))&&next[i]<P.length);
  if(!free.length)break;
  const proposals=free.map(i=>[i,S[i][next[i]++]]),rejections=[];
  P.forEach((pref,j)=>{const all=held[j].concat(proposals.filter(([,p])=>p===j).map(([i])=>i)).sort((a,b)=>rank(pref,a)-rank(pref,b));held[j]=all.slice(0,cap);for(const i of all.slice(cap))rejections.push([i,j])});
  trace.push({matching:S.map((_,i)=>held.findIndex(a=>a.includes(i))),proposals,rejections,held:held.map(a=>a.slice())});
 }
 return{matching:trace.at(-1).matching,trace};
}
export function capacityBlockers(S,P,cap,m){
 const out=[];
 for(let i=0;i<S.length;i++)for(let j=0;j<P.length;j++)if(m[i]!==j&&(m[i]<0||rank(S[i],j)<rank(S[i],m[i]))){
  const assigned=S.map((_,k)=>k).filter(k=>m[k]===j);
  if(assigned.length<cap||assigned.some(k=>rank(P[j],i)<rank(P[j],k)))out.push([i,j]);
 }return out;
}
export const roomPrefs=[[1,2,3],[2,0,3],[0,1,3],[0,1,2]];
export const roomAssignments=[[1,0,3,2],[2,3,0,1],[3,2,1,0]];
export function roomBlockers(p,m){const out=[];for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(m[i]!==j&&rank(p[i],j)<rank(p[i],m[i])&&rank(p[j],i)<rank(p[j],m[j]))out.push([i,j]);return out}
