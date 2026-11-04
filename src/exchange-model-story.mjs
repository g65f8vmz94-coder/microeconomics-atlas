export const exchangeModelKeys=['goods101','preferences101','budget101','trade101','scale101','zero101','allocation101','optimal101'];
const emVector=x=>Array.isArray(x)&&x.length===2&&x.every(v=>Number.isFinite(v)&&v>=0);
export const exchangeModelDot=(p,x)=>p[0]*x[0]+p[1]*x[1];
export function exchangeModelBudget(prices,endowment){
 const valid=emVector(prices)&&prices.some(v=>v>0)&&emVector(endowment);
 if(!valid)return {valid:false,reason:'价格须非负且不能同时为零，禀赋须是非负有限消费束。'};
 const wealth=exchangeModelDot(prices,endowment);
 return {valid:true,prices:prices.slice(),endowment:endowment.slice(),wealth,cost:x=>exchangeModelDot(prices,x),affordable:x=>emVector(x)&&exchangeModelDot(prices,x)<=wealth};
}
export function exchangeModelAssignment(endowments,assignment){
 const economyValid=Array.isArray(endowments)&&endowments.length>0&&endowments.every(emVector);
 const totals=economyValid?[0,1].map(k=>endowments.reduce((s,e)=>s+e[k],0)):null;
 const sourceValid=economyValid&&totals.every(v=>v>0);
 const assignmentValid=sourceValid&&Array.isArray(assignment)&&assignment.length===endowments.length&&assignment.every(emVector);
 const used=assignmentValid?[0,1].map(k=>assignment.reduce((s,a)=>s+a[k],0)):null;
 return {sourceValid,assignmentValid,totals,used,gap:used&&used.map((v,k)=>v-totals[k]),allocation:assignmentValid&&used.every((v,k)=>v===totals[k])};
}
// Only clips the drawn viewport. It does not bound an individual's economic budget.
export function exchangeModelBudgetPlot(prices,endowment,limit=20){
 const b=exchangeModelBudget(prices,endowment);if(!b.valid)return {valid:false,polygon:[],boundary:[],unbounded:[]};
 let polygon=[[0,0],[limit,0],[limit,limit],[0,limit]];const out=[],value=z=>exchangeModelDot(prices,z)-b.wealth;
 for(let i=0;i<polygon.length;i++){const a=polygon[i],z=polygon[(i+1)%polygon.length],va=value(a),vz=value(z);if(va<=0)out.push(a);if((va<=0)!==(vz<=0)){const t=va/(va-vz);out.push([a[0]+t*(z[0]-a[0]),a[1]+t*(z[1]-a[1])]);}}
 const candidates=[];if(prices[1]>0)for(const x of [0,limit])candidates.push([x,(b.wealth-prices[0]*x)/prices[1]]);if(prices[0]>0)for(const y of [0,limit])candidates.push([(b.wealth-prices[1]*y)/prices[0],y]);
 const boundary=candidates.filter(z=>z.every(v=>v>=-1e-10&&v<=limit+1e-10)).filter((z,i,a)=>a.findIndex(w=>Math.hypot(z[0]-w[0],z[1]-w[1])<1e-10)===i);
 return {valid:true,polygon:out,boundary,unbounded:[prices[0]===0?'x1':null,prices[1]===0?'x2':null].filter(Boolean)};
}
export function exchangeModelStory(key,step=0){
 if(!exchangeModelKeys.includes(key))throw Error('Unknown exchange-model story');
 const t=Math.max(0,Math.min(5,Math.floor(Number(step)||0))),f={key,step:t,endowments:[[8,2],[2,8]],assignment:[[8,2],[2,8]],prices:[2,1],factor:1,point:null,baselinePoint:null,utility:null,kind:'资源与个人机会的模型介绍'};
 if(key==='goods101'){
  const pairs=[[[8,2],[2,8]],[[7.5,2.5],[2.5,7.5]],[[6,4],[4,6]],[[7.75,2.25],[2.25,7.75]],[[6,4],[4,6]],[[0,0],[10,10]]];f.assignment=pairs[t].map(v=>v.slice());if(t===5)f.endowments=f.assignment.map(v=>v.slice());f.kind=t===5?'另一个合法的初始禀赋':'固定总资源：大米10千克、豆子10千克';
 }else if(key==='preferences101'){
  const points=[[2,2],[3,2],[3,3],[3.1,3.1],[3.1,3.1],[3.1,3.1]];f.point=points[t];f.baselinePoint=[2,2];f.utility=Math.min(...f.point);f.kind='只比较甲的消费喜好，不安排全市场配置';
 }else if(key==='budget101'){
  f.prices=t<2?[1,1]:[2,1];f.point=t===1?[6,4]:t===3?[6,6]:t===4?[10,1]:[8,2];f.baselinePoint=[8,2];f.kind='甲的个人预算；价格改变时原禀赋也重估';
 }else if(key==='trade101'){
  if(t>=3)f.assignment=[[6,6],[4,4]];f.soldRice=t?2:0;f.money=t?4:0;f.boughtBeans=t>=2?4:0;f.kind='按给定价格记账，尚未检验双方是否愿意交换';
 }else if(key==='scale101'){
  f.factor=[1,2,.5,10,1,1][t];f.prices=[2*f.factor,f.factor];f.point=[6,6];f.baselinePoint=[8,2];f.kind='计价数字变了，可负担消费束没有变';
 }else if(key==='zero101'){
  f.prices=[[2,1],[0,1],[0,1],[1,0],[0,0],[0,1]][t];f.point=null;f.baselinePoint=[8,2];f.kind=t===4?'两种价格同时为零：不属于价格体系':'零价格预算集合；图中只显示一部分';
 }else if(key==='allocation101'){
  f.assignment=[[[8,2],[2,8]],[[6,4],[4,6]],[[8,4],[4,6]],[[6,4],[4,6]],[[4,4],[4,6]],[[0,0],[10,10]]][t].map(v=>v.slice());f.kind=t===2?'指派超出资源：大米缺2千克':t===4?'指派未分完资源：大米剩2千克':'逐种商品核对是否分配完整';
 }else{
  f.point=t<2?[3,3]:t===2?[6,6]:t===3?[0,18]:t===4?[6,6]:[0,18];f.baselinePoint=[3,3];f.utility=f.point[0]+f.point[1];f.kind='甲的个人最优性；不把个人预算当全市场资源';
 }
 f.resources=exchangeModelAssignment(f.endowments,f.assignment);f.budget=exchangeModelBudget(f.prices,f.endowments[0]);f.plot=exchangeModelBudgetPlot(f.prices,f.endowments[0]);
 f.pointCost=f.point&&f.budget.valid?f.budget.cost(f.point):null;f.affordable=f.point&&f.budget.valid?f.budget.affordable(f.point):null;
 return f;
}
