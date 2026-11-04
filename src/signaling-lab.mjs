// Chapter 14, printed pp. 203–213. Source functions are kept separate from UI.
export const casesBySection={
 '14.1':['simple','simpleEntry'],
 '14.2':['baseline142','d141','d142','fig141','d143','d144','pool','q141','proof1','proof2','proof3','proof4','proof5','threshold','boundaryShare','p1','p2empty','p2single','p2pair']
};
export const cases={
 simple:{label:'§14.1 同质工人的报价集合',page:203,kind:'simple',note:'生产率固定且自由进入；均衡是工资报价集合，不是单个雇佣配对。'},
 simpleEntry:{label:'§14.1 低工资、亏损与进入',page:204,kind:'simple',note:'原书三项条件分别检查工人是否接受、现有雇主是否亏损、进入者能否获利。'},
 baseline142:{label:'§14.2 教育出现前的统一工资',page:204,kind:'pool',note:'只允许工资时，竞争工资等于人口加权平均生产率；开放教育合同后要重查进入。'},
 d141:{label:'定义14.1 两类生产率与教育成本',page:205,kind:'signal',note:'教育只改变求职者的成本，不改变生产率；本站滑块保留两类均有正比例。'},
 d142:{label:'定义14.2 最优合同与少教育平局',page:205,kind:'signal',note:'工人最大化工资减教育成本；净收入相同时选教育量更少的合同。'},
 fig141:{label:'图14.1 两类工人的等净收入线',page:206,kind:'signal',note:'L的等净收入线斜率β_L比H的β_H大；图中具体a、b、c坐标为本站辅助例。'},
 d143:{label:'定义14.3 雇主的真实利润',page:207,kind:'signal',note:'只有H来时利润为v_H−w，只有L来时为v_L−w；两类都来时按人口比例计算。'},
 d144:{label:'定义14.4 合同集合的三项均衡条件',page:207,kind:'signal',note:'逐项检查被选择、雇主非负利润、没有严格盈利的新增合同。'},
 pool:{label:'图14.2(a) 混同合同被H专属报价打破',page:207,kind:'pool',note:'两类均为正比例时，混同报价(0,平均生产率)可被H专属盈利合同打破。'},
 q141:{label:'命题14.1 唯一可能的分离形状',page:208,kind:'signal',note:'命题刻画“如果存在均衡”的合同形状；是否存在还要核查混同进入。'},
 proof1:{label:'命题14.1 证明① 无人失业',page:208,kind:'proof',note:'有类型失业时，可给正但低于其生产率的工资使进入者获利。'},
 proof2:{label:'命题14.1 证明② 排除混同',page:208,kind:'pool',note:'两类有正比例时，沿成本斜率之间给出H专属报价。'},
 proof3:{label:'命题14.1 证明③ 工资不超生产率',page:209,kind:'proof',note:'分离后每份合同的雇主利润必须非负。'},
 proof4:{label:'命题14.1 证明④ 低类型合同',page:209,kind:'proof',note:'低类型合同最终为(0,v_L)；任何正教育或低工资留下盈利进入机会。'},
 proof5:{label:'命题14.1 证明⑤ 高类型合同',page:209,kind:'proof',note:'高类型工资为v_H；低类型的激励约束绑定，净收入平局时选低教育合同。'},
 threshold:{label:'图14.5 分离存在与混同进入',page:212,kind:'threshold',note:'本站推导包含原图未讨论的等号边界；等号时没有严格盈利的混同进入。'},
 boundaryShare:{label:'定义14.1 的零比例边界',page:205,kind:'edge',note:'原定义写α_L,α_H≥0；若α_L=0，原书后续“无混同均衡”的陈述需要正比例前提。'},
 p1:{label:'习题14.1 质量证书的全部均衡',page:211,kind:'certificate',note:'原题高质量转售价20、低质量10，证书成本分别4和12，类型各半；无差异选不出证书。'},
 p2empty:{label:'习题14.2 无学校也是均衡',page:212,kind:'schoolEmpty',note:'按题面字面规则：独自开办任一风格学校会吸引两类学生，违反新学校只收合适类型的条件。'},
 p2single:{label:'习题14.2 单一A校的边界',page:213,kind:'schoolSingle',note:'A校若距城d<5，B校无法只吸引2型；d≥5时存在B校进入位置。'},
 p2pair:{label:'习题14.2 两校分离与全部均衡',page:213,kind:'schoolPair',note:'按题面字面规则，两校并存的唯一均衡为A距城5、B距城0。'}
};
const eps=1e-9;
export function simpleWage({v=8,w=5,entry=6}={}){
 if(!(v>0&&w>=0&&entry>=0))throw Error('invalid wage model');
 const currentProfit=v-w,entryChosen=entry>w+eps,entryProfit=entryChosen?v-entry:0;
 return{v,w,entry,currentProfit,entryChosen,entryProfit,
  currentViable:w<=v+eps,uniqueEquilibrium:w===v,
  entrantWitness:w<v?(w+v)/2:null};
}
export function workerChoice(contracts,beta){
 const options=contracts.map(c=>({...c,income:c.w-beta*c.t})).filter(c=>c.income>=-eps);
 options.sort((a,b)=>b.income-a.income||a.t-b.t||String(a.id).localeCompare(String(b.id)));
 return options[0]||{id:'φ',t:0,w:0,income:0};
}
export function signal({vL=4,vH=10,betaL=3,betaH=1,alphaL=.65}={}){
 if(!(vL>0&&vH>vL&&betaL>betaH&&betaH>0&&alphaL>0&&alphaL<1))throw Error('invalid signaling parameters');
 const alphaH=1-alphaL,delta=vH-vL,tH=delta/betaL,m=vH-betaH*tH;
 const avg=alphaL*vL+alphaH*vH,threshold=betaH/betaL;
 const cL={id:'L',t:0,w:vL},cH={id:'H',t:tH,w:vH},pool={id:'混同',t:0,w:avg};
 const choices={L:workerChoice([cL,cH],betaL),H:workerChoice([cL,cH],betaH)};
 const hIncome=vH-betaH*tH;
 const poolT=(vH-avg)/(betaH+betaL),poolW=(vH+avg)/2;
 const poolEntrant={id:'H专属',t:poolT,w:poolW};
 const poolingWitness={contract:poolEntrant,profit:vH-poolW,
  H:workerChoice([pool,poolEntrant],betaH).id,L:workerChoice([pool,poolEntrant],betaL).id};
 const separatingWitness=avg>m+eps?{id:'新混同',t:0,w:(avg+m)/2,profit:(avg-m)/2}:null;
 return{vL,vH,betaL,betaH,alphaL,alphaH,delta,tH,m,avg,threshold,cL,cH,pool,choices,hIncome,
  equilibrium:avg<=m+eps,poolingWitness,separatingWitness};
}
function certChoice(pPlus,pMinus,cost){
 const plus=pPlus===null?-Infinity:pPlus-cost,minus=pMinus===null?-Infinity:pMinus;
 if(Math.max(plus,minus)<-eps)return'φ';
 return plus>minus+eps?'+':'-';
}
export function certificate({pPlus=20,pMinus=10}={}){
 if(!(pPlus>=0&&pMinus>=0))throw Error('negative certificate offer');
 const choiceH=certChoice(pPlus,pMinus,4),choiceL=certChoice(pPlus,pMinus,12);
 const participants=sign=>[choiceH,choiceL].map((c,i)=>c===sign?['H','L'][i]:null).filter(Boolean);
 const profit=sign=>{const people=participants(sign);if(!people.length)return 0;
  return people.reduce((sum,type)=>sum+(type==='H'?20:10),0)/people.length-(sign==='+'?pPlus:pMinus)};
 return{pPlus,pMinus,choiceH,choiceL,profitPlus:profit('+'),profitMinus:profit('-'),
  attendeesPlus:participants('+'),attendeesMinus:participants('-'),uniqueEquilibrium:pPlus===20&&pMinus===10};
}
export function schoolChoice(schools,type){
 if(!schools.length)return'φ';
 const bonus=type===1?10:5;
 return[...schools].sort((a,b)=>{
  const ua=(a.style==='A'?bonus:0)-a.d,ub=(b.style==='A'?bonus:0)-b.d;
  return ub-ua||a.d-b.d||a.style.localeCompare(b.style);
 })[0].id;
}
export function schools({mode='single',dA=4,dB=0}={}){
 if(!(dA>=0&&dB>=0))throw Error('negative distance');
 const current=mode==='empty'?[]:mode==='single'?[{id:'A',style:'A',d:dA}]:mode==='pair'?[{id:'A',style:'A',d:dA},{id:'B',style:'B',d:dB}]:[];
 if(!['empty','single','pair'].includes(mode))throw Error('invalid school mode');
 const choice1=schoolChoice(current,1),choice2=schoolChoice(current,2),gap=dA-dB;
 let equilibrium=false,witness=null;
 if(mode==='empty')equilibrium=true;
 if(mode==='single'){
  equilibrium=dA<5-eps;
  if(!equilibrium)witness={style:'B',d:Math.max(0,dA-7.5)};
 }
 if(mode==='pair'){
  equilibrium=Math.abs(dA-5)<eps&&Math.abs(dB)<eps;
  if(!equilibrium&&gap>=5-eps&&gap<10-eps){
   if(gap>5+eps)witness={style:'A',d:(dA+dB+5)/2};
   else if(dB>eps)witness={style:'B',d:dB-Math.min(dB/2,2)};
  }
 }
 const entry=witness?{id:'新校',...witness}:null;
 const new1=entry?schoolChoice([...current,entry],1):null,new2=entry?schoolChoice([...current,entry],2):null;
 return{mode,dA,dB,gap,current,choice1,choice2,equilibrium,witness,new1,new2,
  entrantOnlyFits:!!entry&&((entry.style==='A'&&new1==='新校'&&new2!=='新校')||(entry.style==='B'&&new2==='新校'&&new1!=='新校'))};
}
