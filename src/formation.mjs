import {relationStats} from './foundations.mjs';

export const formationModes=['value','distance','lexformation','unanimity','majority'];
// Scores describe finite criterion orderings; they are not interpersonal utilities.
export const criterionOrders=[
 {label:'a ≻ b ≻ c',ranks:[3,2,1]}, {label:'a ≻ c ≻ b',ranks:[3,1,2]},
 {label:'b ≻ a ≻ c',ranks:[2,3,1]}, {label:'b ≻ c ≻ a',ranks:[1,3,2]},
 {label:'c ≻ a ≻ b',ranks:[2,1,3]}, {label:'c ≻ b ≻ a',ranks:[1,2,3]},
 {label:'a ∼ b ≻ c',ranks:[2,2,1]}, {label:'a ∼ c ≻ b',ranks:[2,1,2]},
 {label:'b ∼ c ≻ a',ranks:[1,2,2]}, {label:'a ≻ b ∼ c',ranks:[2,1,1]},
 {label:'b ≻ a ∼ c',ranks:[1,2,1]}, {label:'c ≻ a ∼ b',ranks:[1,1,2]},
 {label:'a ∼ b ∼ c',ranks:[1,1,1]}
];
export function scoreRelation(values){
 if(!values.length||values.some(x=>!Number.isFinite(x)))throw Error('Finite scores required');
 return values.flatMap(a=>values.map(b=>a>=b));
}
export function distancePreference(positions,ideal){
 if(!Number.isFinite(ideal))throw Error('Finite ideal required');
 const distances=positions.map(x=>{if(!Number.isFinite(x))throw Error('Finite positions required');return Math.abs(x-ideal)});
 return {distances,values:distances.map(d=>-d),pairs:scoreRelation(distances.map(d=>-d))};
}
function validCriteria(criteria,n,strict=false){
 if(!criteria.length||!Number.isInteger(n)||n<1)throw Error('Nonempty criteria required');
 for(const r of criteria){if(r.length!==n*n)throw Error('Criterion matrix size');const s=relationStats(r,n);if(!s.complete||!s.transitive||(strict&&!s.antisymmetric))throw Error('Criterion must be a complete, transitive'+(strict?', antisymmetric':'')+' relation')}
}
export function lexicographicRelation(first,second,n=3){
 validCriteria([first,second],n);
 return first.map((xy,k)=>{const yx=first[(k%n)*n+Math.floor(k/n)];return Boolean(xy&&(!yx||second[k]))});
}
export function lexicographicDecision(first,second,a,b,n=3){
 validCriteria([first,second],n);const ab=first[a*n+b],ba=first[b*n+a],decisive=ab!==ba?1:2;
 const relation=lexicographicRelation(first,second,n);return{decisive,outcome:pairOutcome(relation,a,b,n),pairs:relation};
}
export function unanimityRelation(criteria,n=3){validCriteria(criteria,n);return Array.from({length:n*n},(_,k)=>criteria.every(r=>r[k]));}
export function majorityRelation(criteria,n=3){
 if(criteria.length!==3)throw Error('This textbook rule has exactly three criteria');validCriteria(criteria,n,true);
 const votes=Array.from({length:n*n},(_,k)=>criteria.reduce((s,r)=>s+Number(r[k]),0));return{votes,pairs:votes.map(v=>v>=2)};
}
export function pairOutcome(pairs,a,b,n=3){const ab=!!pairs[a*n+b],ba=!!pairs[b*n+a];return ab&&ba?'tie':ab?'left':ba?'right':'incomparable'}
// Exact discrete control: epsilon=ticks/100, M integer. No floating tie tolerance.
export function weightedLexExample(M,ticks){
 if(!Number.isInteger(M)||M<1||!Number.isInteger(ticks)||ticks<0||ticks>50)throw Error('M positive integer; epsilon ticks in [0,50]');
 const gapTicks=M*ticks-100;return{epsilon:ticks/100,M,gapTicks,difference:gapTicks/100,uA:M/2+1,uB:M/2+M*ticks/100,lexWinner:ticks===0?'A':'B',weightedWinner:gapTicks===0?'tie':gapTicks>0?'B':'A'};
}
export const formationProofs={
 value:{title:'数值规则为何一定完备、传递',steps:[String.raw`\forall x,y,\quad v(x)\ge v(y)\ \lor\ v(y)\ge v(x)`,String.raw`x\succeq y,\ y\succeq z\Rightarrow v(x)\ge v(y)\ge v(z)`,String.raw`v(x)\ge v(z)\Rightarrow x\succeq z`],text:'任取备选项。完备来自实数可比较；传递来自实数的≥。数字相等时两个方向同时成立，不是不可比。'},
 distance:{title:'距离规则只是负距离的数值规则',steps:[String.raw`x\succeq y\iff d(x)\le d(y)`,String.raw`d(x)\le d(y)\iff-d(x)\ge-d(y)`,String.raw`v(x)=-d(x)`],text:'距离越小越好，所以要取负号。证明只用距离数值的大小次序；本例的绝对距离是自主构造。相同距离对应无差异，图的分行位置不是第二项特征。'},
 unanimity:{title:'一致同意为何保留传递',steps:[String.raw`x\succeq y,\ y\succeq z`,String.raw`\forall i:\ x\succeq_i y\land y\succeq_i z\Rightarrow x\succeq_i z`,String.raw`\forall i:\ x\succeq_i z\Rightarrow x\succeq z`],text:'任取x、y、z，逐个标准接链，再把“每个标准都同意”合回来。此证明适用于任意非空有限个标准，不依赖当前三对象是否恰好连成一条链。'},
 majority:{title:'多数完备，但不同边可能靠不同的两票',steps:[String.raw`\forall i:\ x\ne y\Rightarrow\bigl(x\succ_i y\ \lor\ y\succ_i x\bigr)`,String.raw`N(x,y)+N(y,x)=3\quad(x\ne y)`,String.raw`\max\{N(x,y),N(y,x)\}\ge2`],text:'三个标准各自完备、传递且反对称，两个不同对象不能打平；三票必有一边至少两票。自己与自己比较三票都为真。传递会失败，因为支持a胜b的两票不必是支持b胜c的同两票。'}
};
export const lexProofBranches=[
 {label:'第一项在 x、y 间决定',ranks:[[3,2,1],[1,1,1]],premises:String.raw`x\succ_1 y,\ y\succeq_1 z`,steps:[String.raw`x\succeq y,\ y\succeq z\Rightarrow y\succeq_1 z`,String.raw`x\succ_1 y\succeq_1 z\Rightarrow x\succ_1 z`,String.raw`x\succ_1 z\Rightarrow x\succeq z`],text:'这里用“严格接弱”。不能只写两段严格关系的传递性，因为后一段可能打平。'},
 {label:'第一项 x、y 打平，但 y 胜 z',ranks:[[2,2,1],[2,1,1]],premises:String.raw`x\sim_1 y,\ x\succeq_2 y,\ y\succ_1 z`,steps:[String.raw`x\sim_1 y\Rightarrow x\succeq_1 y`,String.raw`x\succeq_1 y\succ_1 z\Rightarrow x\succ_1 z`,String.raw`x\succ_1 z\Rightarrow x\succeq z`],text:'这里用“弱接严格”，即无差异接严格。原文此处称严格传递；证明应补明这一混合推理，不能凭空写x严格胜y。'},
 {label:'第一项两段都打平',ranks:[[1,1,1],[3,2,1]],premises:String.raw`x\sim_1 y\sim_1 z,\ x\succeq_2 y\succeq_2 z`,steps:[String.raw`x\sim_1 y,\ y\sim_1 z\Rightarrow x\sim_1 z`,String.raw`x\succeq_2 y,\ y\succeq_2 z\Rightarrow x\succeq_2 z`,String.raw`x\sim_1 z\land x\succeq_2 z\Rightarrow x\succeq z`],text:'先用第一项的无差异传递，再用第二项的弱传递。三种分支覆盖所有可能；它们是任意对象的论证，旁边电脑只是一个例子。'}
];
