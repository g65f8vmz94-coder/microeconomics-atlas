// Source: Osborne–Rubinstein, Models in Microeconomic Theory (2020.12.21 h), Chapter 1, printed pp. 3–15.
// Finite witnesses illustrate the claims; they do not replace unrestricted proofs.
export const caseSections={
 '1.1':['encoding','relationlab','derived','ordinal','complete','transitive','preference','symmetry','equivalence'],
 '1.2':['value','distance','lexformation','unanimity','majority'],
 '1.3':['vacation','questionnaire','consistency','survey'],
 '1.4':['utility','example1','extrema','finitelemma','construct','cinema','infiniteutility','leximpossible','transform','p1','p2','p3','p4','p5','p6','p7','p8','p9']
};
export const caseNames={
 encoding:'§1.1 · 三种回答与二元编码',relationlab:'§1.1 · 可编辑关系工作台',derived:'§1.1 · 传递性与等价类分步证明',ordinal:'§1.1 · 排序不记录喜欢强度',
 complete:'定义1.1 · 完备关系',transitive:'定义1.2 · 传递关系',preference:'定义1.3 · 偏好关系',symmetry:'定义1.4 · 对称与反对称',equivalence:'定义1.5 · 等价类',
 value:'§1.2 · 价值函数',distance:'§1.2 · 与理想点的距离',lexformation:'§1.2 · 字典式优先',unanimity:'§1.2 · 一致同意',majority:'§1.2 · 多数规则的循环',
 vacation:'§1.3 · 度假套餐的表述顺序',questionnaire:'§1.3 · 九套餐36对比较',consistency:'§1.3 · 简单规则与个人答卷',survey:'§1.3 · 2018历史调查与计数',infiniteutility:'§1.4 · 无限集也可以有实值效用',utility:'定义1.6 · 效用表示',example1:'例1.1 · 四个选项的同序数字',extrema:'定义1.7 · 极大与极小',finitelemma:'引理1.1 · 有限集合有极值',construct:'命题1.1 · 逐层剥离构造效用',cinema:'例1.2 · 影院座位',leximpossible:'命题1.2 · 字典序不能实值表示',transform:'命题1.3 · 严格递增变换',
 p1:'习题1.1 · 严格偏好的传递性',p2:'习题1.2 · 极小元与无限集',p3:'习题1.3 · 相似不一定传递',p4:'习题1.4 · 奇偶等价类',p5:'习题1.5 · 公理之间独立',p6:'习题1.6 · 看似上升的循环',p7:'习题1.7 · 8是最爱',p8:'习题1.8 · 偶数总比奇数好',p9:'习题1.9 · 加性效用的矛盾'
};
export function relationStats(pairs,n=3){
 const R=(i,j)=>!!pairs[i*n+j];let miss=[],viol=[];
 for(let i=0;i<n;i++)for(let j=i;j<n;j++)if(!R(i,j)&&!R(j,i))miss.push([i,j]);
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++)if(R(i,j)&&R(j,k)&&!R(i,k))viol.push([i,j,k]);
 const reflexive=Array.from({length:n},(_,i)=>R(i,i)).every(Boolean);
 const symmetric=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>R(i,j)===R(j,i)).every(Boolean)).every(Boolean);
 const antisymmetric=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j||!R(i,j)||!R(j,i)).every(Boolean)).every(Boolean);
 return {complete:!miss.length,transitive:!viol.length,reflexive,symmetric,antisymmetric,equivalence:reflexive&&symmetric&&!viol.length,miss,viol};
}
export function relationWitness(kind,step=0){
 const pairs=Array(9).fill(false);const put=(i,j)=>{pairs[i*3+j]=true};
 for(let i=0;i<3;i++)put(i,i);
 if(kind==='complete'){put(0,1);put(1,0);put(1,2);put(2,1);if(step>=1){put(0,2);put(2,0)}}
 else if(kind==='transitive'||kind==='p1'){put(0,1);put(1,2);if(step>=1)put(0,2);if(kind==='p1'&&step>=2)put(1,0)}
 else if(kind==='p5'){if(step===0){put(0,1);put(1,2);put(0,2)}else if(step>=2){put(0,1);put(1,0);put(0,2);put(2,0);put(1,2);put(2,1)}}
 else if(kind==='symmetry'){put(0,1);if(step>=1)put(1,0);if(step>=2){put(0,2);put(2,0);put(1,2);put(2,1)}}
 else if(kind==='equivalence'||kind==='p4'){put(0,1);put(1,0);if(step>=1){put(1,2);put(2,1)}if(step>=2){put(0,2);put(2,0)}}
 else {put(0,1);put(1,2);put(0,2);if(step>=1){put(1,0);put(0,2)}}
 return {pairs,stats:relationStats(pairs)};
}
export const majorityOrders=[[0,1,2],[1,2,0],[2,0,1]];
export function majorityPair(a,b,orders=majorityOrders){return orders.filter(order=>order.indexOf(a)<order.indexOf(b)).length;}
export function similarity(v=[0,.8,1.6]){const cmp=(a,b)=>v[a]-v[b]>1?1:v[b]-v[a]>1?-1:0;return {values:v,ab:cmp(0,1),bc:cmp(1,2),ac:cmp(0,2)};}
export function layers(values){return [...new Set(values)].sort((a,b)=>a-b).map((v,i)=>({level:i+1,items:values.map((x,j)=>x===v?j:null).filter(x=>x!==null)}));}
export function cinemaUtility(row,column){if(!Number.isInteger(row)||row<1||row>40||!Number.isInteger(column)||column<1||column>50)throw Error('座位须在40×50范围内');return 50*row-column+1;}
export function favoriteEight(n,mode='higher'){
 if(!Number.isInteger(n)||n<1)throw Error('正整数');
 return n===8?2:mode==='closer'?1/(1+Math.abs(n-8)):1-1/n;
}
export function parityUtility(n){if(!Number.isInteger(n)||n<1)throw Error('正整数');return n%2===0?2-1/n:1-1/n;}
export function additiveContradiction(){
 // From (5,12)>(4,20), (4,5)>(2,12), (2,20)>(5,5).
 return {first:'f(5)−f(4)>g(20)−g(12)',second:'f(4)−f(2)>g(12)−g(5)',sum:'f(5)−f(2)>g(20)−g(5)',third:'g(20)−g(5)>f(5)−f(2)'};
}
