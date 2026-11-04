// Osborne–Rubinstein, Models in Microeconomic Theory (2020.12.21 h), Ch. 2, printed pp.17–29.
// Finite witnesses illustrate general claims; historical percentages are source reports, not forecasts.
export const caseSections={
 '2.1':['choiceproblem','rationalaction','utilitychoice','strictidentify','rationalmeaning'],
 '2.2':['rationalize','example1','median','restaurant','party'],
 '2.3':['alpha','rationalalpha','constructrank'],
 '2.4':['satisficing','satisficingrank'],
 '2.5':['moneypump'],
 '2.6':['attention','framing','mental',...Array.from({length:8},(_,i)=>'p'+(i+1))]
};
export const caseNames={
 utilitychoice:'§2.1 · 效用最大化与存在性',strictidentify:'§2.1 · 严格偏好不同如何揭示',rationalmeaning:'§2.1 · 理性的技术含义',
 choiceproblem:'定义2.1 · 菜单与选择函数',rationalaction:'§2.1 · 行为与偏好',
 rationalize:'定义2.2 · 可理性化',example1:'例2.1 · 24张选择表',median:'例2.2 · 中位选项',restaurant:'例2.3 · 牛排与三文鱼',party:'例2.4 · 聚会邀请',
 alpha:'定义2.3 · 性质 α',rationalalpha:'命题2.1 · 理性化推出 α',constructrank:'命题2.2 · α 构造排序',
 satisficing:'定义2.4 · 满意原则',satisficingrank:'命题2.3 · 满意原则可理性化',
 moneypump:'§2.5 · 金钱泵',attention:'§2.6.1 · 注意力效应',framing:'§2.6.2 · 表述效应',mental:'§2.6.3 · 心理账户',
 p1:'习题2.1 · 五种选择程序',p2:'习题2.2 · 两菜单交叉',p3:'习题2.3 · 满意原则与 α',p4:'习题2.4 · 满意原则变式',p5:'习题2.5 · 路径无关',p6:'习题2.6 · 关心朋友到某个限度',p7:'习题2.7 · 无限集合',p8:'习题2.8 · 2+3=6的交易者'
};
export const popcount=n=>n.toString(2).replace(/0/g,'').length;
export const menus=n=>Array.from({length:(1<<n)-1},(_,i)=>i+1).sort((a,b)=>popcount(a)-popcount(b)||a-b);
export const members=(mask,n)=>Array.from({length:n},(_,i)=>i).filter(i=>mask&(1<<i));
export const chooseByRank=(mask,rank)=>rank.find(i=>mask&(1<<i));
export function table24(index){
 if(!Number.isInteger(index)||index<0||index>=24)throw Error('选择表编号应在0到23之间');
 const t={1:0,2:1,4:2,3:(index&1)?1:0,5:(index&2)?2:0,6:(index&4)?2:1,7:[0,1,2][Math.floor(index/8)]};
 return t;
}
export function alphaFailures(table,n){
 const bad=[];for(const A of menus(n))for(const B of menus(n))if(B!==A&&(B&A)===B&&(B&(1<<table[A]))&&table[B]!==table[A])bad.push({A,B,large:table[A],small:table[B]});return bad;
}
export function rankFromAlpha(table,n){
 if(alphaFailures(table,n).length)return null;
 let set=(1<<n)-1,rank=[];while(set){let x=table[set];rank.push(x);set&=~(1<<x)}return rank;
}
export function medianChoice(mask,n){const xs=members(mask,n);return xs[Math.floor((xs.length-1)/2)];}
export function satisficingChoice(mask,values,threshold=0,order=Array.from({length:values.length},(_,i)=>i),fallback='last'){
 const xs=order.filter(i=>mask&(1<<i)),first=xs.find(i=>values[i]>=threshold);
 return first??(fallback==='best'?xs.reduce((a,b)=>values[b]>values[a]?b:a):xs[xs.length-1]);
}
export function satisficingRank(values,threshold=0,order=Array.from({length:values.length},(_,i)=>i),fallback='last'){
 const good=order.filter(i=>values[i]>=threshold),bad=order.filter(i=>values[i]<threshold);
 return [...good,...(fallback==='best'?bad.sort((a,b)=>values[b]-values[a]):bad.reverse())];
}
export const originalSatisficing={values:[-1,-2,1,3],threshold:0,order:[0,1,2,3]};
export function menuChoice(rule,mask){
 const X=members(mask,rule.u.length),uMax=X.reduce((a,b)=>rule.u[b]>rule.u[a]?b:a),vMax=X.reduce((a,b)=>rule.v[b]>rule.v[a]?b:a);
 if(rule.kind==='threshold-u')return rule.u[uMax]>=rule.threshold?uMax:vMax;
 if(rule.kind==='caring')return rule.v[uMax]>=rule.threshold?uMax:vMax;
 throw Error('未知规则');
}
export function pathChoice(mask,rank){return chooseByRank(mask,rank)}
export const frameData={
 A:[['白',.90,0],['红',.06,45],['绿',.01,30],['黄',.03,-15]],
 B:[['白',.90,0],['红',.07,45],['绿',.01,-10],['黄',.02,-15]],
 C:[['白',.90,0],['红',.06,45],['黑',.01,30],['绿',.01,-15],['黄',.02,-15]],
 D:[['白',.90,0],['红',.06,45],['黑',.01,45],['绿',.01,-10],['黄',.02,-15]]
};
export function outcomeDistribution(rows){const m=new Map();for(const [,p,v] of rows)m.set(v,(m.get(v)||0)+p);return [...m].sort((a,b)=>a[0]-b[0]);}
export const sourceRates={attention:{AB:[48,52],ABC:[30,68,2]},framing:{A:51,D:93},mental:{ticket:65,cash:79}};
export const problem1Witnesses={
 a:{A:15,B:13,large:0,small:2,description:'字母顺序 a,b,c,d；质量 2,1,3,0。全菜单停在 a，删去 b 后停在 c。'},
 b:{A:7,B:5,large:0,small:2,description:'循环赛 a 胜 b、b 胜 c、c 胜 a；全菜单一胜平手按低编号选 a，{a,c} 选 c。'},
 e:{A:7,B:5,large:2,small:0,description:'a 为红色，b、c 为蓝色；全菜单蓝色居多选 c，{a,c} 平票按红色选 a。'}
};
