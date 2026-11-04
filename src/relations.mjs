import {relationStats} from './foundations.mjs';

export const relationModes=['encoding','relationlab','derived','ordinal'];
export function answerRelation(answer){
 const options={a:[true,false],b:[false,true],tie:[true,true],missing:[false,false]};
 if(!Object.hasOwn(options,answer))throw Error('Unknown answer');
 const [ab,ba]=options[answer];return{pairs:[true,ab,ba,true],code:answer==='a'?1:answer==='b'?-1:answer==='tie'?0:null,complete:ab||ba};
}
export function rankRelation(ranks){return ranks.flatMap(a=>ranks.map(b=>a>=b));}
export const relationPresets={
 order:{name:'偏好：a ≻ b ∼ c',labels:['a','b','c'],description:'同一无差异类中的备选项同样好，不同类之间可以严格排序。',pairs:rankRelation([2,1,1])},
 cycle:{name:'完备但循环',labels:['a','b','c'],description:'任意两项都能比较，但 a 胜 b、b 胜 c、c 又胜 a。',pairs:[true,true,false,false,true,true,true,false,true]},
 diagonal:{name:'只删去 aRa',labels:['a','b','c'],description:'不同对象间的比较全在，但缺少 aRa。按本书含同一对象的定义，完备性不成立。',pairs:rankRelation([3,2,1]).map((v,i)=>i===0?false:v)},
 neighbor:{name:'邻居：对称而不传递',labels:['a','b','c'],description:'a与b、b与c互为邻居，a与c不是邻居；这里不把自己算作自己的邻居。',pairs:[false,true,false,true,false,true,false,true,false]},
 older:{name:'更年长：反对称',labels:['20岁','30岁','40岁'],description:'箭头从较年长者指向较年轻者。同一人不会比自己年长，所以不反身，因而不完备。',pairs:[20,30,40].flatMap(a=>[20,30,40].map(b=>a>b))},
 less:{name:'小于：一般二元关系',labels:['3','5','7'],description:'原书举例3<5成立、7<1不成立。图用3、5、7构成有限样例，箭头表示严格小于。',pairs:[3,5,7].flatMap(a=>[3,5,7].map(b=>a<b))},
 knows:{name:'认识：逐对判断真假',labels:['a','b','c'],description:'此例只有a认识b、b认识c。认识谁是一份逐对输入；二元关系本身不保证完备、对称或传递。',pairs:[false,true,false,false,false,true,false,false,false]},
 all:{name:'全部无差异',labels:['a','b','c'],description:'每对都双向关联，只有一个无差异类。',pairs:Array(9).fill(true)},
 identity:{name:'仅与自己关联',labels:['a','b','c'],description:'恒等关系同时对称、反对称且传递，是等价关系；不同对象不可比，故不完备。',pairs:[true,false,false,false,true,false,false,false,true]}
};
relationPresets.neither={name:'既不对称也不反对称',labels:['a','b','c'],description:'a与b双向关联，破坏反对称；b关联c而c不关联b，破坏对称。因此两种性质也可以同时不成立。',pairs:[true,true,false,true,true,true,false,false,true]};
export function derivedRelations(pairs,n=3){
 if(pairs.length!==n*n)throw Error('Relation matrix size');
 const weak=pairs.map(Boolean),strict=weak.map((v,k)=>v&&!weak[(k%n)*n+Math.floor(k/n)]),indifferent=weak.map((v,k)=>v&&weak[(k%n)*n+Math.floor(k/n)]);
 return {weak,strict,indifferent,stats:{weak:relationStats(weak,n),strict:relationStats(strict,n),indifferent:relationStats(indifferent,n)}};
}
export function equivalencePartition(pairs,n=3){
 if(!relationStats(pairs,n).equivalence)return null;
 const seen=new Set(),groups=[];for(let i=0;i<n;i++)if(!seen.has(i)){const group=[];for(let j=0;j<n;j++)if(pairs[i*n+j]){seen.add(j);group.push(j)}groups.push(group)}return groups;
}
export const derivedProofs={
 indifferent:{name:'无差异的传递性',ranks:[1,1,1],premises:'a∼b，b∼c',result:'a∼c',steps:['先展开 a∼b：a≽b 且 b≽a。','再展开 b∼c：b≽c 且 c≽b。','正向链 a≽b≽c，得到 a≽c。','反向链 c≽b≽a，得到 c≽a；合起来 a∼c。'],formula:String.raw`a\sim b,\ b\sim c\Rightarrow(a\succeq c\land c\succeq a)\Rightarrow a\sim c`},
 strict:{name:'严格偏好的传递性',ranks:[3,2,1],premises:'a≻b，b≻c',result:'a≻c',steps:['a≻b 给出 a≽b，且不成立 b≽a。','b≻c 给出 b≽c，且不成立 c≽b。','由弱关系传递得到 a≽c。','若 c≽a，则 c≽a≽b，得到 c≽b，与 b≻c 矛盾；所以 a≻c。'],formula:String.raw`a\succ b,\ b\succ c\Rightarrow a\succ c`},
 weakStrict:{name:'弱偏好接严格偏好',ranks:[2,2,1],premises:'a≽b，b≻c',result:'a≻c',steps:['a≽b 允许 a 与 b 无差异。图用 a∼b 展示这个边界。','b≻c 同时要求 b≽c 且不成立 c≽b。','弱关系传递先给出 a≽c。','若 c≽a，则 c≽a≽b，违反 b≻c；因此 a≻c。'],formula:String.raw`a\succeq b,\ b\succ c\Rightarrow a\succ c`},
 strictWeak:{name:'严格偏好接弱偏好',ranks:[2,1,1],premises:'a≻b，b≽c',result:'a≻c',steps:['a≻b 要求 a≽b，且不成立 b≽a。','b≽c 允许 b 与 c 无差异。图用 b∼c 展示这个边界。','弱关系传递先给出 a≽c。','若 c≽a，则 b≽c≽a，违反 a≻b；因此 a≻c。'],formula:String.raw`a\succ b,\ b\succeq c\Rightarrow a\succ c`}
};
derivedProofs.equivalence={name:'等价类为什么恰好划分集合',ranks:[1,1,1],premises:'I反身、对称、传递',result:'分组不重不漏',steps:[
 '先定义 [a] 为所有满足 aIx 的对象x。反身性给出 aIa，所以每个对象至少属于自己的类，所有类覆盖X。',
 '假设 [a] 与 [b] 共有c。由 aIc、bIc，对称性给出 cIb，再用传递性得到 aIb。图示取三者同类，展示这个“有交”的分支。',
 '任取 x∈[a]。由 aIb 的对称性有 bIa；再接 aIx，得到 bIx。所以 [a] 包含于 [b]。',
 '交换a与b，同理得到 [b] 包含于 [a]。因此只要两类有交，它们就完全相同；不同的类互不相交。',
 '若x与y同属 [a]，则 aIx、aIy。对称性给 xIa，传递性给 xIy：同类必关联。',
 '若xIy，则x与y都在 [x] 中：xIx来自反身性，xIy来自已知。这就证明关联必同类，合起来是“当且仅当”。'
 ],formula:String.raw`[a]_I=\{x\in X:a\,I\,x\};\quad [a]_I\cap[b]_I\ne\varnothing\Rightarrow[a]_I=[b]_I`};

// These are partial proof diagrams, not full input relations. Red edges are
// temporary assumptions/consequences in a contradiction, never extra preferences.
export function relationProofFrame(kind,step){
 const proof=derivedProofs[kind];if(!proof)throw Error('Unknown proof');
 step=Math.max(0,Math.min(proof.steps.length-1,Math.trunc(step)));
 const shown=Array(9).fill(false),put=(a,b)=>{shown[a*3+b]=true};for(let i=0;i<3;i++)put(i,i);
 let assumptions=[],forbidden=[];
 if(kind==='equivalence'){
  if(step>=1){put(0,2);put(1,2);put(2,1);put(0,1)}
  if(step>=2){put(2,0);put(1,0)}
 }else{
  put(0,1);if(kind==='indifferent'||kind==='weakStrict')put(1,0);else forbidden.push([1,0]);
  if(step>=1){put(1,2);if(kind==='indifferent'||kind==='strictWeak')put(2,1);else forbidden.push([2,1])}
  if(step>=2)put(0,2);
  if(step>=3){if(kind==='indifferent')put(2,0);else assumptions=kind==='strictWeak'?[[2,0],[1,0]]:[[2,0],[2,1]]}
 }
 const groups=kind==='equivalence'&&step>=3?[[0,1,2]]:null;
 return {shown,assumptions,forbidden,focus:step>=3?1:Math.min(step,2),groups};
}
