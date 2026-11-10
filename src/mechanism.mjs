// Chapter 17, Osborne--Rubinstein (2020.12.21 h), printed pp.281--288.
// Transfers are to individuals: a negative transfer is a payment.
export const cases={
 d171:{section:'17.1',label:'定义17.1 · 公共项目与二元决策',page:281,kind:'public',note:'项目只有实施或不实施；两种选择影响每位居民。'},
 d172:{section:'17.1',label:'定义17.2 · 私人估值与转移',page:282,kind:'valuation',note:'t_i 为个人收到的钱，负值为个人付钱；这里的估值已净去私人影响。'},
 d173:{section:'17.2',label:'定义17.3 · 直接机制',page:282,kind:'direct',note:'机制读取报告 x，而非直接观察私人真实估值 v。'},
 d174:{section:'17.2',label:'定义17.4 · 防策略操纵',page:283,kind:'strategy',note:'真诚报告是弱占优报告；允许其他人报出任意数字。'},
 e171:{section:'17.2',label:'例17.1 · 多数规则',page:283,kind:'majority',note:'严格超过一半报正数才实施；票数不反映估值大小。'},
 e172:{section:'17.2',label:'例17.2 · 求和规则的操纵',page:284,kind:'sum',note:'无转移的求和规则可通过夸大报告改变决定。'},
 d175:{section:'17.3',label:'定义17.5 · VCG 关键付款',page:285,kind:'vcg',note:'其他人报告之和为 S_i；关键人物在两种翻转方向都可能付款。'},
 e173:{section:'17.3',label:'例17.3 · 原书四行报告',page:285,kind:'examples',note:'按原书四行五人报告逐项计算决策与转移。'},
 p171:{section:'17.3',label:'命题17.1 · 诚实报告为何最优',page:285,kind:'proof',note:'证明延续至印刷286页；固定任意他人报告，比较两种决策的真实效用。'},
 nonexec:{section:'17.3',label:'讨论 · 未建成仍需付款',page:286,kind:'nonexecution',note:'不实施项目时，关键反对者仍可能付钱。'},
 rebate:{section:'17.3',label:'讨论 · 返还付款破坏激励',page:287,kind:'rebate',note:'讨论起于印刷286页；两人计算例在287页，平分收款后个人1可通过报-8获利。'},
 fairness:{section:'17.3',label:'讨论 · 货币估值与公平',page:287,kind:'fairness',note:'原书两名富人各100、99名穷人各-1；把各人的货币估值加总可判定总估值的正负；要讨论公平，还要说明怎样衡量每个人的得失。'},
 q171a:{section:'17.3',label:'习题17.1(a) · 九个报告组合',page:287,kind:'budgetGrid',note:'报告与估值仅取4、-1、-5；按全部九个组合核对。'},
 q171b:{section:'17.3',label:'习题17.1(b) · 平衡预算的障碍',page:287,kind:'budgetProof',note:'原题(b)只写 only if，字面结论有反例；证明须使用题首的 if and only if。'},
 q172a:{section:'17.3',label:'习题17.2(a) · 第二价格拍卖',page:288,kind:'second',note:'最高报价者胜；平手由最小编号胜；赢家支付其他人最高报价。'},
 q172b:{section:'17.3',label:'习题17.2(b) · 第一价格反例',page:288,kind:'first',note:'赢家支付自己的报价；最高估值者可能靠压低报价提高收益。'},
 q173:{section:'17.3',label:'习题17.3 · 有成本的公共项目',page:288,kind:'cost',note:'先扣除均摊成本 c=C/n，再对净估值应用关键付款。'}
};
export const casesBySection=Object.fromEntries(['17.1','17.2','17.3'].map(s=>[s,Object.keys(cases).filter(k=>cases[k].section===s)]));
export const bookProfiles=[[5,-1,-1,-1,-1],[-5,1,1,1,1],[-7,1,1,3,4],[-5,2,2,2,2]];
export const budgetValues=[4,-1,-5];
export function projectOutcome(reports,rule='vcg',cost=0){
 const n=reports.length,share=cost/n,net=reports.map(x=>x-share),total=net.reduce((a,b)=>a+b,0);
 const decision=rule==='majority'?+(reports.filter(x=>x>0).length>n/2):+(total>0);
 const others=net.map(x=>total-x),transfers=net.map((_,i)=>{const t=rule==='vcg'?decision*others[i]-Math.max(0,others[i]):0;return t===0?0:t});
 return {reports:[...reports],net,total,decision,others,transfers,share,positiveVotes:reports.filter(x=>x>0).length,revenue:-transfers.reduce((a,b)=>a+b,0)};
}
export function trueUtility(value,outcome,i=0){return outcome.decision*(value-outcome.share)+outcome.transfers[i]}
export function compareReport(value,others,report,rule='vcg',cost=0){
 const honest=projectOutcome([value,...others],rule,cost),current=projectOutcome([report,...others],rule,cost);
 return {honest,current,honestUtility:trueUtility(value,honest),currentUtility:trueUtility(value,current),gain:trueUtility(value,current)-trueUtility(value,honest)};
}
export function vcgUtilities(value,otherReports,cost=0){
 const n=otherReports.length+1,share=cost/n,S=otherReports.reduce((a,b)=>a+b-share,0),effective=value-share;
 const noProject=-Math.max(0,S),project=effective+Math.min(0,S);
 return {S,effective,threshold:share-S,noProject,project,difference:effective+S,truthfulDecision:+(effective+S>0)};
}
export function auctionOutcome(bids,values,rule='second'){
 const top=Math.max(...bids),winner=bids.findIndex(x=>x===top),otherMax=Math.max(...bids.filter((_,i)=>i!==winner)),payment=rule==='second'?otherMax:bids[winner];
 return {bids:[...bids],winner,payment,utility:values.map((v,i)=>i===winner?v-payment:0),otherMax};
}
export function budgetGrid(){return budgetValues.flatMap(x=>budgetValues.map(y=>({x,y,...projectOutcome([x,y])})))}
export function rebateExample(report=1){
 const value=1,other=10,base=projectOutcome([report,other]),rebate=base.revenue/2;
 return {base,rebate,utility:value*base.decision+base.transfers[0]+rebate};
}
