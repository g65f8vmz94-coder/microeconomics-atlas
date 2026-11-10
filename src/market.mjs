// Chapter 9, Osborne–Rubinstein, printed pp. 121–134. Houses and people
// retain the same colors as Chapter 8; only the allocation mechanism changes.
export const houses=['A','B','C','D'];
export const example91=[[1,2,3,0],[0,1,2,3],[0,2,3,1],[0,3,1,2]];
export const example92=[[3,2,0,1],[0,3,2,1],[0,2,3,1],[1,2,3,0]];
export const identity=[0,1,2,3];
export const casesBySection={
 '9.1':['d91','e91','e92','d92','e93','e94','e95','d93','l91','q91'],
 '9.2':['d94','proc91','proc92','q92','e96','e97','wealth'],
 '9.3':['q93','q94','reopen94','policy94','p1','p2a','p2b','p2c','p3','p4a','p4b','p5','p6','p7'],
 '9.4':['q95','prices95','strict95']
};
export const cases={
 d91:{label:'定义9.1 市场与初始产权',page:121,kind:'model',note:'每人拥有一间初始房屋；产权受保护，只有自愿交易能改变配置。'},
 e91:{label:'例9.1 原书四人偏好',page:121,kind:'source1',note:'1号最不喜欢自己的A，却最想要2号的B；2号最爱1号的A。'},
 e92:{label:'例9.2 两个可能的交换结果',page:122,kind:'source2',note:'两组两人交换能到(C,D,A,B)；1、4、2三人交易环能到(D,A,C,B)。前者不是价格均衡。'},
 d92:{label:'定义9.2 价格均衡',page:123,kind:'source2',note:'每人从价格不高于初始房屋的预算集中选最爱，且全体选择构成一一配置。'},
 e93:{label:'例9.3 两人交换为何不够',page:124,kind:'source2',note:'(C,D,A,B)无法由任何房价支持；(D,A,C,B)可由p(A)=p(B)=p(D)>p(C)支持。'},
 e94:{label:'例9.4 同一偏好不交易',page:124,kind:'common',note:'所有人偏好完全相同；价格与偏好同序时，初始配置本身就是均衡。'},
 e95:{label:'例9.5 首选各异',page:124,kind:'distinct',note:'每人首选不同房屋；相同价格让大家同时得到各自首选房屋。'},
 d93:{label:'定义9.3 交易圈与划分',page:125,kind:'source2',note:'交易圈仅要求房屋沿圈轮转，不要求每人把下一个人的房屋排在首位。'},
 l91:{label:'引理9.1 唯一交易圈划分',page:126,kind:'source2',note:'从一个配置到另一个配置，因每栋房只有一个原持有人，指向关系唯一并分解成唯一的圈集。'},
 q91:{label:'命题9.1 圈内房价相等',page:126,kind:'source2',note:'均衡交易圈上人人买得起下一家的房；价格沿圈弱降又回起点，故圈内必相等。'},
 d94:{label:'定义9.4 顶部交易圈',page:127,kind:'source1',note:'每人指向自己在当前市场最爱的房屋的初始持有人；有限指向链必进入圈。'},
 proc91:{label:'程序9.1 寻找顶部交易圈',page:127,kind:'source1',note:'从任意人沿首选房屋所有者追踪，首次重访到的人就是圈起点。'},
 proc92:{label:'程序9.2 逐轮删除与定价',page:128,kind:'source1',note:'每轮执行一个顶部交易圈，删去圈内人及初始房屋，给该轮房屋同价，后轮价格严格更低。'},
 q92:{label:'命题9.2 市场均衡存在',page:129,kind:'source1',note:'顶部交易程序产出的配置是一一对应；每人得到全部可负担房屋中最爱的。'},
 e96:{label:'例9.6 配置唯一、价格不唯一',page:129,kind:'source1',note:'(1,2)先成圈；之后3与4的单人圈可换序，配置同为(B,A,C,D)，C、D价格先后可变。'},
 e97:{label:'例9.7 三人顶部交易圈',page:130,kind:'source2',note:'原书例9.7末句把(D,A,C,B)误印为(D,A,B,C)；交易过程与例9.2均支持前者。'},
 wealth:{label:'购买力：喜欢的人多就一定更贵吗？',page:130,kind:'source1',note:'本站构造：A有三人首选，D仅一人首选；一种均衡中D比A更贵。价格还可能随所选圈序改变。'},
 q93:{label:'命题9.3 均衡配置帕累托稳定',page:131,kind:'source2',note:'若改配让一部分人更好且无人变差，改进者必须得到更贵的房屋；总房价却不变，矛盾。'},
 q94:{label:'命题9.4 稳定初始产权不交易',page:132,kind:'stable',note:'每人都买得起自己的初始房；若初始配置已帕累托稳定，均衡中所有人仍持有原房。'},
 reopen94:{label:'市场重开：均衡结果成为新产权',page:132,kind:'stable',note:'前一次均衡成为新初始产权后，在本模型中再次达到均衡时不再换房。'},
 policy94:{label:'产权安排：实现稳定目标',page:132,kind:'stable',note:'先把目标稳定配置设为初始产权，再允许市场交易；模型中任何均衡都保留这一配置。'},
 q95:{label:'命题9.5 均衡配置唯一',page:133,kind:'source1',note:'严格偏好下配置唯一；先固定最高价圈的交换，删除后对余下市场归纳。价格排序可不同。'},
 prices95:{label:'同一分房，两套不同房价',page:133,kind:'constructed',note:'沿用教材例9.1的偏好，用本站选取的几组价格为同一套分房逐一核查预算。'},
 strict95:{label:'边界：允许打平，结果可能不唯一',page:133,kind:'constructed',note:'教材正文指出严格偏好不可省略；用本站两户构造说明，章末习题9.7另计。'},
 p1:{label:'习题9.1 非稳定配置有改善交易圈',page:134,kind:'p1',note:'若一个可行配置被帕累托改进，两个配置的轮换可分解为圈；至少一个圈内所有成员严格改善。'},
 p2a:{label:'习题9.2(a) 自己已占首选房',page:134,kind:'p2a',note:'首选房的原持有人在顶部交易程序中构成单人圈，均衡仍分配给他。'},
 p2b:{label:'习题9.2(b) 房价全不相同',page:134,kind:'p2b',note:'命题9.1说明任何非单人交易圈的原房屋价格相同；房价全异时均衡没有交易。'},
 p2c:{label:'习题9.2(c) 4号总得首选房',page:134,kind:'p2c',note:'给定四人初始产权与前三人的首选房，无论4号首选哪一间，4号都落在最初的顶部交易圈。'},
 p3:{label:'习题9.3 移除一人改变两人福祉',page:134,kind:'p3',note:'本站构造四人偏好：移除一人及其原房，剩余人中可有一人变好、另一人变差。'},
 p4a:{label:'习题9.4(a) 上调自己所得房',page:134,kind:'p4a',note:'只把1号在原均衡所得房排得更高，其他相对次序不变，TTC结果不变。'},
 p4b:{label:'习题9.4(b) 他人更喜欢我的原房',page:134,kind:'p4b',note:'只上调2号对1号原房A的偏好，1号在新均衡中不会更差；本站构造一个严格变好的实例。'},
 p5:{label:'习题9.5 偏好谎报无利可图',page:135,kind:'p5',note:'改变一人报告的严格排序，按其真实偏好评价：如实报告得到的房屋不会更差。'},
 p6:{label:'习题9.6 核心与自愿退市',page:135,kind:'p6',note:'任何联盟拿回自己原房屋并重配，都不能让所有联盟成员严格变好。'},
 p7:{label:'习题9.7 无差异可破坏结论',page:135,kind:'p7',note:'两人反例：1号A与B无差异，2号A优于B；有低效率均衡，且均衡配置不唯一。'}
};
export function permutations(a){if(!a.length)return [[]];return a.flatMap((v,i)=>permutations([...a.slice(0,i),...a.slice(i+1)]).map(t=>[v,...t]));}
export function tradingPartition(a,b,people=a.map((_,i)=>i).filter(i=>a[i]>=0)){
 const owner=new Map(people.map(i=>[a[i],i])),next=new Map(people.map(i=>[i,owner.get(b[i])]));
 if(people.some(i=>next.get(i)===undefined))throw Error('allocations use different houses');
 const left=new Set(people),cycles=[];
 while(left.size){const start=left.values().next().value,cycle=[];let i=start;do{if(!left.has(i))throw Error('not a permutation');left.delete(i);cycle.push(i);i=next.get(i)}while(i!==start);cycles.push(cycle)}return cycles;
}
// The textbook removes one top cycle at a time, unlike the all-cycles-at-once
// variant often called TTC elsewhere. Selection order affects prices, not allocation.
export function topTrading(prefs,e=identity,startOrder=e.map((_,i)=>i)){
 const active=new Set(startOrder),n=e.length,alloc=Array(n).fill(-1),price=Array(n).fill(null),rounds=[];
 if(active.size!==startOrder.length||startOrder.some(i=>e[i]===undefined))throw Error('invalid participants');
 while(active.size){const owners=new Map([...active].map(i=>[e[i],i])),pointers=new Map([...active].map(i=>{
  const h=prefs[i].find(h=>owners.has(h));if(h===undefined)throw Error('preference missing remaining house');return[i,owners.get(h)]}));
  let i=startOrder.find(j=>active.has(j)),path=[],seen=new Map();
  while(!seen.has(i)){seen.set(i,path.length);path.push(i);i=pointers.get(i)}
  const cycle=path.slice(seen.get(i));
  for(const member of cycle){alloc[member]=e[pointers.get(member)];active.delete(member)}
  const level=n-rounds.length;for(const member of cycle)price[e[member]]=level;
  rounds.push({active:[...owners.values()],pointers:Object.fromEntries(pointers),path,cycle:cycle.slice(),allocation:alloc.slice(),price:price.slice(),level});
 }
 return{allocation:alloc,price,rounds};
}
export function checkEquilibrium(prefs,e,allocation,price,people=e.map((_,i)=>i).filter(i=>allocation[i]>=0)){
 const housesInMarket=people.map(i=>e[i]);
 if(new Set(people.map(i=>allocation[i])).size!==people.length||people.some(i=>!housesInMarket.includes(allocation[i])))return false;
 return people.every(i=>{
  const affordable=housesInMarket.filter(h=>price[h]<=price[e[i]]);
  const best=prefs[i].find(h=>affordable.includes(h));
  return best===allocation[i]
 });
}
// An authored tour of the textbook housing market. Prices are ordinal budget
// cutoffs: leftover money has no value in this housing-only model.
export function marketIntroStory(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),e=identity.slice(),prefs=['d91','e91'].includes(k)?example91:example92;
 const a=[2,3,0,1],b=[3,0,2,1], prices=k==='d92'?[4,4,3,4]:k==='e93'?(t===3?[4,3,4,3]:t===4?[3,4,3,4]:t===5?[4,4,3,4]:null):null;
 const affordable=prices?e.map(h=>identity.filter(j=>prices[j]<=prices[h])):null;
 const choices=affordable?prefs.map((p,i)=>p.find(h=>affordable[i].includes(h))):null;
 let displayed, status;
 if(['d91','e91'].includes(k)){displayed=t<3?e:[1,0,2,3];status='当前住房';}
 else if(k==='e92'){displayed=t<2||t===3?e:t===2?a:b;status='当前住房';}
 else if(k==='d92'){displayed=e.map((h,i)=>t>=i+2?choices[i]:-1);status='当前选择';}
 else if(k==='e93'){displayed=t===5?b:a;status='候选配置';}
 else throw Error('Unknown market story '+k);
 const messages={
  d91:['四户人家各有一间房：1号有A，2号有B，3号有C，4号有D。房屋产权受到保护。','1号更喜欢2号的B，但不能因为自己喜欢就强迫2号让房。','2号也更喜欢1号的A；如果两人都同意，就可以交换。','1号和2号自愿换房：1号住B、2号住A，其他两人的房子没变。','每个人仍恰好拥有一间房，四间房也各有一位住户。','市场模型把原产权和偏好一起写下来；它不同于上一章允许强者强制夺房的丛林。'],
  e91:['来看原书的四人偏好表：1号有A，但A是他最不喜欢的房。','1号最喜欢B；B最初属于2号。','2号最喜欢A，A最初属于1号；两人的首选恰好相互对应。','两人同意后换房：1号得到B，2号得到A，各自拿到首选。','3号和4号在这一步没有参与交换，房屋C、D仍归原主人。','注意：两人都愿意交换是这个具体例子的结果；不是说任意两户都一定愿意换房。'],
  e92:['同样四户人家，每人原先分别拥有A、B、C、D；这次采用教材例9.2的偏好。','第一种商量方式：1号与3号互换，2号与4号互换。','两组同时互换得到(C,D,A,B)：1得C、2得D、3得A、4得B。','为了比较另一种方案，先回到原始产权(A,B,C,D)，这不是说大家实际又换了一次。','另一种方案由1、4、2三人约定同时轮转：1得D、4得B、2得A，3号保留C。','两种可行配置不同；是否能由同一套房价支持为市场均衡，还要检查每个人的预算与选择。'],
  d92:['现在给房屋标价：A、B、D各4，C是3。每户的预算是自己原先房屋的价格。','买得起的房屋价格不能高于自己原房的价格；不能把换房后可能得到的钱额外当作效用。','1号原有A，预算4；D买得起，也是他最喜欢的，于是选D。','2号原有B，预算4；A买得起，也是他最喜欢的，于是选A。','3号原有C，预算3，只买得起C，于是选C。','4号原有D，预算4；B买得起，也是他最喜欢的，于是选B。四人所选恰好各不相同，构成均衡配置。'],
  e93:['先检验两组双人换房得到的候选a=(C,D,A,B)；不能只凭大家自愿交换就断言它是价格均衡。','1用原房A换C，3用原房C换A。两人都要买得起，迫使A和C价格相等。','同理，2用B换D、4用D换B，迫使B和D价格相等。把两组价格分别记为x和y。','如果x不低于y，1号买得起最喜欢的D，就不会选候选中的C。图示x=4、y=3。','如果x低于y，2号买得起最喜欢的A，就不会选候选中的D。图示x=3、y=4。','两种情况穷尽，所以没有房价能支持候选a。另一个配置b=(D,A,C,B)可由A、B、D同价且高于C支持。']
 };
 return {step:t,initial:e,prefs,displayed:displayed.slice(),status,prices,affordable,choices,equilibrium:prices&&displayed.every(h=>h>=0)?checkEquilibrium(prefs,e,displayed,prices,identity):null,title:['先看原来的房','看清条件','第一步选择','继续比较','再看另一人','带走结论'][t],narration:messages[k][t]};
}
// The two preference examples and the source's transformation cycle. Prices
// shown here are an illustrative representation of the book's price ordering.
export function marketTheoryStory(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),e=identity.slice(),common=identity.map(()=>identity.slice()),distinct=[[1,0,2,3],[2,1,0,3],[3,2,0,1],[0,3,1,2]],cycleCase=['d93','l91','q91'].includes(k);
 const prefs=k==='e94'?common:k==='e95'?distinct:example92,prices=k==='e94'?[4,3,2,1]:k==='e95'?[2,2,2,2]:[4,4,3,4],affordable=e.map(h=>identity.filter(j=>prices[j]<=prices[h])),choices=prefs.map((p,i)=>p.find(h=>affordable[i].includes(h))),target=cycleCase?[3,0,2,1]:choices;
 const displayed=cycleCase?(t<5?e:target):e.map((h,i)=>t>=i+2?choices[i]:-1),partition=tradingPartition(e,target),arrows=cycleCase?[[0,3],[3,1],[1,0]].slice(0,Math.min(t,3)):[];
 const messages={
 e94:['四户人家对房子的喜好完全一样：都按A、B、C、D从喜欢到不喜欢排序。','示例房价也按这个顺序从高到低：4、3、2、1。每人用自己原房的价格作为预算。','1号原有A，买得起所有房；A本来就是他最喜欢的，于是保留A。','2号原有B，A太贵，预算内最好的是B；2号保留B。','3号原有C，A和B都太贵，预算内最好的是C；3号保留C。','4号也只需保留D；人人选择原房且不冲突。共同严格偏好下，任何均衡配置都必须是原配置。'],
 e95:['这次四户首选不同：1想要B、2想要C、3想要D、4想要A。','给四间房设相同的示例价格2：每一户都买得起每一间。','1号选自己的首选B。','2号选自己的首选C。','3号选自己的首选D。','4号选自己的首选A。四人的选择互不冲突，是一个均衡；实际上任何均衡配置都让每人得到首选。'],
 d93:['把最初分房(A,B,C,D)换成目标分房(D,A,C,B)。先别问喜好，只追踪房屋从谁到谁。','1号目标是D，而D原来属于4号，画箭头1→4。','4号目标是B，而B原来属于2号，接着画4→2。','2号目标是A，而A原来属于1号，画2→1，三人正好围成一个圈。','3号仍住自己原来的C，单独构成一个单人圈。','得到交易划分(1,4,2)和(3)。圈表示房屋如何轮转，本身不要求每人拿到首选。'],
 l91:['给定两套完整分房：原分房(A,B,C,D)和目标分房(D,A,C,B)。','1号目标D只可能来自原主人4号，所以1的下一位只能是4。','4号目标B只可能来自2号，所以4的下一位只能是2。','2号目标A只可能来自1号，路线回到起点，形成(1,4,2)。','3号的目标还是自己的C，形成单人圈(3)；所有人恰好属于一个圈。','原分房中每栋房都有唯一主人，所以每个箭头都被两套配置唯一确定；不计圈的先后及起点写法，划分唯一。'],
 q91:['接着看同一组均衡：原产权(A,B,C,D)，结果(D,A,C,B)，示例价格A、B、D都是4，C是3。','1号原有A、得到D；他买得起D，所以A的价格不低于D。','4号原有D、得到B；他买得起B，所以D的价格不低于B。','2号原有B、得到A；他买得起A，所以B的价格不低于A。','三个预算不等式首尾相接，所以A、D、B三间房的价格只能全部相等。','3号留在自己的C，是单人圈；不同圈的房价不必相同。本例C为3，其他三间为4。']
 };
 if(!messages[k])throw Error('Unknown market theory story '+k);
 return {step:t,initial:e,prefs,prices,affordable,choices,target,displayed:displayed.slice(),status:cycleCase?'当前住房':'当前选择',partition,arrows,showSelf:cycleCase&&t>=4,equilibrium:checkEquilibrium(prefs,e,target,prices,identity),title:['先看情境','找到第一步','跟着关系走','继续检查','补上剩余人','带走结论'][t],narration:messages[k][t]};
}
// The textbook removes one top cycle per round. Different eligible cycle
// orders may lead to different supporting prices without changing allocation.
export function marketTopStory(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),e=identity.slice(),wealthPrefs=[[0,1,2,3],[0,1,2,3],[0,2,1,3],[3,0,1,2]],prefs=k==='wealth'?wealthPrefs:k==='e97'?example92:example91,first=topTrading(prefs,e,k==='wealth'?[3,0,1,2]:k==='e97'?identity:[2,0,1,3]),alternate=topTrading(example91,e,[0,1,3,2]),r=first.rounds;
 if(!['d94','proc91','proc92','q92','e96','e97','wealth'].includes(k))throw Error('Unknown top-trading story '+k);
 let done=0,useAlt=false,arrows=[],circle=[];
 const pathPairs=r[0].path.map(i=>[i,r[0].pointers[i]]);
 if(k==='d94'||k==='proc91'){arrows=pathPairs.slice(0,Math.min(t,3));if(t>=3)circle=r[0].cycle;}
 else if(k==='proc92'||k==='q92'){if(t===1){arrows=pathPairs;circle=r[0].cycle;}done=t>=2?Math.min(t-1,3):0;}
 else if(k==='e96'){done=t===1?1:t===2?3:t===3?1:t>=4?3:0;useAlt=t>=4;}
 else if(k==='e97'){if(t===1){arrows=pathPairs;circle=r[0].cycle;}done=t>=2?Math.min(t-1,2):0;}
 else if(k==='wealth'){if(t===0)arrows=identity.map(i=>[i,r[0].pointers[i]]);if(t===1){arrows=pathPairs;circle=r[0].cycle;}done=t>=2?t-1:0;if(t>=4)done=4;}
 const chosen=useAlt?alternate:first,current=done?chosen.rounds[done-1]:null,allocation=current?current.allocation.slice():Array(4).fill(-1),prices=current?current.price.slice():Array(4).fill(null),complete=allocation.every(h=>h>=0);
 const messages={
 d94:['四户各有一间房。每个人指向自己最喜欢的房屋原主人；箭头只是喜好，还没有换房。','从3号开始：3号最喜欢A，而A属于1号，所以画3→1。','1号最喜欢B，B属于2号，接着画1→2。','2号最喜欢A，A属于1号，画2→1，箭头第一次回到已经走过的人。','真正的圈是1→2→1：圈内每人都指向自己最爱的房屋主人。','3号的箭头通向圈，却没有回到3号，所以3号不属于这个圈；指向圈的人不一定在圈里。'],
 proc91:['找圈可以从任意人出发；这次故意从3号开始，看看路线会不会有“尾巴”。','3号最喜欢1号的A，走到1号。','1号最喜欢2号的B，再走到2号。','2号最喜欢1号的A，又回到之前走过的1号。','从第一次出现的1号到现在，得到顶部交易圈(1,2)。','3→1只是进入圈的尾巴；有限人、每人都指向一个现有主人，继续追踪终会进入某个圈。'],
 proc92:['先把原产权固定：1、2、3、4分别有A、B、C、D；后续每轮只在剩余人和房里找圈。','从3号追踪，得到3→1→2→1；第一轮的圈是(1,2)，3号暂时不退出。','1、2交换得到B、A；给他们原有的A、B同一示例价格4，然后两人和这两间原房退出。','剩下3、4以及C、D。3号在剩余房中最喜欢C，形成单人圈；C定价3，3号与C退出。','最后4号得到D；D定价2。所有人都安排完毕，四间房也恰好各分配一次。','得到配置(B,A,C,D)，示例价格(A,B,C,D)=(4,4,3,2)。递减价格是构造方法，不是全部均衡价格的必要形式。'],
 q92:['为什么上面的逐轮方法一定能构造均衡？先把“每人都安排到房”和“每人选得最好”分开。','第一轮找一个顶部交易圈：圈内各人得到当时剩余房屋里自己最喜欢的一间。','给圈内原房同价并移走圈内人和房；因为按圈轮转，移走的人与分出的房一一对应。','对留下的人继续同样操作；人数有限，每轮至少移走一人，最终每人恰好得到一房。','对任一人看他所在的轮次：更早移走的房价格更高，买不起；当时剩余的房价格不高于他的原房，他拿到其中最喜欢的。','因此既满足一人一房，也满足每人在预算内选最好。价格和配置一起构成市场均衡；这是存在性的构造证明。'],
 e96:['教材例9.6：第一轮只有(1,2)，他们交换A、B，并给这两间房相同价格4。','先完成(1,2)；现在3、4各自都想保留剩余市场中的原房，形成两个可选的单人圈。','若先安排3、再安排4，得到配置(B,A,C,D)，示例价格(4,4,3,2)。','为了比较另一种运行顺序，回到第一轮之后；这是两次算法运行的对照，不是又发生了一次现实交易。','若先安排4、再安排3，配置仍是(B,A,C,D)，示例价格变成(4,4,2,3)。','两次配置相同，但C、D的相对价格不同。价格体系可以不唯一；不能因此说配置也一定不唯一。'],
  wealth:['这个四人例子由本站构造：1、2、3的首选都是A，只有4号首选D。','4号最喜欢自己的D，单独成圈；此时1号也单独成圈，我们先选择处理4号。','先安排4号得到D，并给D设示例价格4；4号和D退出。','接着处理1号的单人圈，1号得到A；给A设价格3，低于刚才的D。','剩下2、3依次选到B、C，所有人都安排完毕；这组价格和配置经模型核对是均衡。','A是三人的首选，D只是一人的首选，这组均衡中D却更贵。选择不同的成圈顺序，支持价格也可能改变；受欢迎人数不足以单独确定价格。'],
  e97:['换用教材例9.2的偏好：1最想要D，4最想要B，2最想要A。','按产权人追踪1→4→2→1，得到三人的顶部交易圈。','1、4、2分别得到D、B、A；他们原来的A、B、D统一定价4，然后退出。','剩下3号与C，形成单人圈；3号得到C，C定价3。','最终配置是(D,A,C,B)：1得D、2得A、3得C、4得B；价格与选择经模型核对构成均衡。','教材该例末句印成(D,A,B,C)，与前面逐人指定和住房唯一性冲突；这里按前文与例9.2一致的(D,A,C,B)展示。']
 };
 return {step:t,initial:e,prefs,allocation,prices,complete,done,arrows,circle,first,alternate,useAlt,title:['先看原产权','沿首选追踪','看清关系','继续推演','检查结果','带走结论'][t],narration:messages[k][t]};
}
// Welfare statements are ordinal: each comparison uses a person's own ranking.
export function marketWelfareStory(k,step=0){
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),e0=identity.slice(),prefs=k==='q94'?identity.map(()=>identity.slice()):example92,prices=k==='q94'?[4,3,2,1]:[4,4,3,4],current=k==='q94'?e0:[3,0,2,1],endowment=['reopen94','policy94'].includes(k)&&t>=2?current:e0;
 if(!['q93','q94','reopen94','policy94'].includes(k))throw Error('Unknown welfare story '+k);
 const candidate=k==='q93'&&t>=1?[3,2,0,1]:k==='q94'&&t>=2?[1,0,2,3]:current.slice(),changes=candidate.map((h,i)=>{const d=prefs[i].indexOf(h)-prefs[i].indexOf(current[i]);return d<0?'better':d>0?'worse':'same'}),priceSum=a=>a.reduce((v,h)=>v+prices[h],0),better=paretoImprovements(prefs,current,identity),eq=checkEquilibrium(prefs,endowment,current,prices,identity);
 const messages={
 q93:['先看一套市场均衡：四户住(D,A,C,B)，在各自预算内都选了最喜欢的房。','有人提议另一套完整分房(D,C,A,B)：1和4不动，2与3交换。','3号从C换到更喜欢的A，变好了；但2号从A换到更不喜欢的C，变差了，所以这不是共同改善。','看3号：原产权C的价格是3，想换到的A价格是4；在原均衡预算下，3号买不起A。','两套分房用的都是同一批房：按示例价格计算，房价总和都是15，重新分配不会凭空增加房屋总价。','一般证明：若有人变好、其他人都不变差，变好者的新房必须更贵；严格偏好下没变好的人住房不变。于是总房价必须增加，与同一批房总价不变矛盾。'],
 q94:['这次四户对房屋的喜欢顺序都相同：A、B、C、D；最初各自拥有A、B、C、D。','原配置已经帕累托稳定：没法让一人变好，又保证其余所有人都不变差。','试想1和2交换：2号从B换到更喜欢的A，但1号从A换到更不喜欢的B。','每户都买得起自己最初的房。若候选均衡让1号拿B，1号仍能选回更喜欢的A，因此这不是均衡。','一般证明：任何均衡中每人至少和原房一样满意。若配置不同，严格偏好使至少一人更好，于是构成对原配置的共同改善，矛盾。','因此如果初始产权配置已帕累托稳定，任何均衡都保留原配置；结论依赖本章住房市场的假设。'],
 reopen94:['第一轮市场从原产权(A,B,C,D)出发，得到均衡配置(D,A,C,B)。','上一命题说明，这套均衡配置帕累托稳定：不能让一户变好且所有其他户都不变差。','现在重新开市，把第一轮结果(D,A,C,B)作为第二轮的初始产权。','每户在新一轮都可以保留自己的原房；若某个均衡有不同住房，就会使至少一户变好且没有人变差。','但这会与新初始产权已经帕累托稳定矛盾，因此第二轮均衡不会改变住房配置。','示例中原房价仍可采用A、B、D为4、C为3；价格可能有其他支持方式，结论针对住房配置。'],
 policy94:['设想一个管理者想实现稳定目标(D,A,C,B)，但无法禁止人们以后自愿交易。','目标先要通过帕累托稳定检验；这里使用前面市场均衡得到的稳定目标作为例子。','管理者把初始产权安排成目标：1得D、2得A、3得C、4得B。','随后允许这些人进入本章的住房市场；每人都能保留自己的初始房。','因为初始产权已稳定，任何市场均衡都不会改变这套配置。例子使用房价(A,B,C,D)=(4,4,3,4)。','这说明稳定目标可通过适当初始产权实现；结论依赖模型中的产权保护、偏好与均衡假设，不是在断言现实政策没有成本。']
 };
 const titles={q93:['先认清均衡分房','提出另一套分房','有人高兴，有人吃亏','更喜欢，却买不起','同一批房，总价不变','用反证法推出一般结论'],q94:['大家喜欢的顺序相同','原分房已经稳定','试着让两户交换','原房始终买得起','不同均衡会导致矛盾','稳定产权不再交易'],reopen94:['第一轮已完成交易','结果已经帕累托稳定','把结果作为新产权','新一轮也能保留原房','再交易会与稳定矛盾','配置不变，价格不必唯一'],policy94:['先确定稳定目标','检验目标是否稳定','把目标设为初始产权','开放市场，保留选择权','任何均衡都保留目标','明确结论的适用条件']};
 return {step:t,prefs:prefs.map(p=>p.slice()),initial:e0,endowment:endowment.slice(),current:current.slice(),candidate,changes,prices,better,eq,sumCurrent:priceSum(current),sumCandidate:priceSum(candidate),title:titles[k][t],narration:messages[k][t]};
}
// Trace Proposition 9.5 using two actual equilibrium price systems. Each round
// removes the same owners and initial houses from both markets, not new trades.
export function equilibriumUniquenessTrace(prefs,e,p,q){
 const people=e.map((_,i)=>i),hs=e.slice();
 if(new Set(hs).size!==e.length||prefs.length!==e.length||prefs.some(r=>r.length!==hs.length||new Set(r).size!==hs.length||r.some(h=>!hs.includes(h))))throw Error('Strict complete house rankings required');
 if([p,q].some(v=>hs.some(h=>!Number.isFinite(v[h])||v[h]<0)))throw Error('Finite nonnegative prices required');
 const choose=prices=>people.map(i=>prefs[i].find(h=>prices[h]<=prices[e[i]])),a=choose(p),b=choose(q);
 if(!checkEquilibrium(prefs,e,a,p,people)||!checkEquilibrium(prefs,e,b,q,people))throw Error('Both price systems must support equilibrium');
 let active=people.slice();const rounds=[];
 while(active.length){
  const first=active.reduce((i,j)=>p[e[j]]>p[e[i]]?j:i),partition=tradingPartition(e,a,active),base=partition.find(c=>c.includes(first)),anchor=base.reduce((i,j)=>q[e[j]]>q[e[i]]?j:i),at=base.indexOf(anchor),cycle=base.slice(at).concat(base.slice(0,at)),remaining=active.filter(i=>!cycle.includes(i));
  const links=cycle.map((i,j)=>({person:i,next:cycle[(j+1)%cycle.length],house:a[i],qOwner:q[e[i]],qNext:q[a[i]],favorite:prefs[i].find(h=>active.some(j=>e[j]===h))}));
  if(links.some(v=>v.favorite!==v.house||b[v.person]!==v.house||v.qOwner!==v.qNext))throw Error('Cycle certificate failed');
  if(!checkEquilibrium(prefs,e,a,p,remaining)||!checkEquilibrium(prefs,e,b,q,remaining))throw Error('Restricted equilibrium failed');
  rounds.push({active:active.slice(),cycle,links,remaining:remaining.slice(),pLevel:p[e[first]],qLevel:q[e[anchor]]});active=remaining;
 }
 return {a,b,rounds};
}
export function marketUniquenessStory(k,step=0){
 if(!['q95','prices95','strict95'].includes(k))throw Error('Unknown uniqueness story '+k);
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),weak=k==='strict95',e=weak?[0,1]:identity.slice(),prefs=weak?null:example91.map(r=>r.slice()),p=weak?[2,1]:[4,4,3,2],q=weak?[1,1]:k==='prices95'?(t<2?p.slice():t<3?[4,4,2,3]:[8,8,4,6]):[4,4,2,3];
 let a,b,eqP,eqQ,certificate=null,ranks=null;
 if(weak){
  ranks=[[0,0],[0,1]];a=[0,1];b=[1,0];
  const valid=(allocation,price)=>new Set(allocation).size===2&&e.every(i=>price[allocation[i]]<=price[e[i]]&&e.filter(h=>price[h]<=price[e[i]]).every(h=>ranks[i][allocation[i]]<=ranks[i][h]));
  eqP=valid(a,p);eqQ=valid(b,q);
 }else{certificate=equilibriumUniquenessTrace(prefs,e,p,q);({a,b}=certificate);eqP=checkEquilibrium(prefs,e,a,p);eqQ=checkEquilibrium(prefs,e,b,q);}
 const revealed=k==='q95'?(t<2?[]:t===2?[0]:t===3?[0,1]:t===4?[0,1,2]:e):k==='strict95'?(t<3?[]:e):e,removed=k==='q95'?(t<4?[]:t===4?[0,1]:e):[],active=e.filter(i=>!removed.includes(i)),shownB=b.map((h,i)=>revealed.includes(i)?h:-1),affordable=price=>e.map(i=>e.filter(h=>price[h]<=price[e[i]]));
 const titles={q95:['先摆出两套均衡','找到第一套最高价圈','另一套价格，先锁定一户','沿圈锁定下一户','删掉同一圈，继续证明','所有人逐圈相同'],prices95:['同一分房，先看同价起点','预算取决于自己的原房','C降价，D涨价','所有价格再一起翻倍','逐户核对选择未变','唯一的是配置，不是房价'],strict95:['先改清楚一个条件','第一套价格：2号买不起A','第一套分房确实均衡','两房同价，再看另一套','两套均衡，住房不同','打平使唯一首选这步失效']};
 const narration={q95:['仍是原来四户，偏好和初始产权都不变。两套房价都支持均衡；第二套的问号表示还没讲到，并不是缺少真实住房。','第一套房价中A、B最高，1和2的交换圈处于最高价。两户都买得起所有房，因此分别拿到自己唯一的首选B、A。','转看第二套价格，在这个圈里选原房最贵的1号。B的价格不高于他的原房A，所以唯一首选B仍买得起，1号仍选B。','第二套也是均衡，所以1号买到B后，B与他的原房A必须同价。于是2号也能买到唯一首选A，这一圈的分房被逐户锁定。','把1、2和他们原有的A、B从两套市场同时删去。3、4保留自己的原房与选择；3号在剩下的C、D中首选C，可继续用同样方法锁定。','再锁定4号的D，所有人都相同。一般情况下逐圈删去，人数越来越少；只剩一人时只能拿唯一那间房，因此均衡配置唯一。'],prices95:['先把两套价格摆成一样：A、B为4，C为3，D为2。两边分房都是1住B、2住A、3住C、4住D。','买得起什么，取决于原房能换多少钱；再按自己的偏好从买得起的房里挑。这里只比较同一组人、同一初始产权。','把第二套价格改为C等于2、D等于3；A、B仍为4。C与D的贵便宜顺序反过来，但四户最优选择仍是B、A、C、D。','再把第二套所有价格一起翻倍成8、8、4、6。每户预算和房价一起翻倍，买得起的房没有变化，最优住房也没有变化。','两套价格都经过逐户预算最优和一人一房核对。房价不是只差一个倍数：C、D的相对贵便宜也可以不同。','命题9.5锁定的是每户最后得到哪间房，不会给出唯一房价。这个例子展示价格可变；普遍的配置唯一性仍要靠旁边的逐圈证明。'],strict95:['这次只有两户、两间房：1号觉得A和B一样好，2号严格更喜欢A；最初1有A、2有B。这里只放宽了严格偏好。','第一套房价A为2、B为1。2号预算只有1，买不起更喜欢的A，所以保留B；1号可以在并列最好中选A。','分房(A,B)一人一房，各自在预算内都是最好，所以它是均衡。1号的选择有并列，这已经超出命题9.5的严格偏好条件。','第二套把两房都标为1：2号买得起并选择A；1号对两房打平，可以选B。分房(B,A)同样是均衡。','初始产权和偏好都没变，两组价格分别支持(A,B)与(B,A)。因此允许打平后，均衡配置确实可能不唯一。','严格偏好的作用，是把“买得起的首选”锁成唯一一间。允许并列时，不能沿同一个首选把下一人的选择强制固定。这里没有额外规定打平时必须怎么选。']}[k][t];
 return {step:t,initial:e,prefs,ranks,p,q,a,b,shownB,revealed,removed,active,certificate,eqP,eqQ,budgetP:affordable(p),budgetQ:affordable(q),title:titles[k][t],narration};
}
export function strictDominates(prefs,b,a,people=a.map((_,i)=>i).filter(i=>a[i]>=0)){
 return people.every(i=>prefs[i].indexOf(b[i])<=prefs[i].indexOf(a[i]))&&people.some(i=>prefs[i].indexOf(b[i])<prefs[i].indexOf(a[i]));
}
export function paretoImprovements(prefs,a,people=a.map((_,i)=>i).filter(i=>a[i]>=0)){
 const h=people.map(i=>a[i]);return permutations(h).map(houses=>{const b=a.slice();people.forEach((i,k)=>b[i]=houses[k]);return b}).filter(b=>strictDominates(prefs,b,a,people));
}
