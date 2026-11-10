// Original interactive models based on Osborne--Rubinstein, Models in
// Microeconomic Theory (2020.12.21 h), chapter 19, printed pp.301--311.
// No book pages or extended passages are included in the public bundle.
export const cases={
 d191:{section:'19.1',label:'定义19.1 · 社会、投入与生产率',page:301,rule:'equal-own',profile:[3,6,9],kind:'flow'},
 d192:{section:'19.1',label:'定义19.2 · 可行财富配置',page:302,rule:'equal-equal',profile:[3,6,9],kind:'feasible'},
 d193:{section:'19.1',label:'定义19.3 · 制度是整套状态的规则',page:302,rule:'social',profile:[3,6,9],kind:'system'},
 e191:{section:'19.1',label:'例19.1 · 平分投入，各取所产',page:303,rule:'equal-own',profile:[3,6,9],kind:'flow'},
 e192:{section:'19.1',label:'例19.2 · 最强者投入，各取所产',page:303,rule:'max-own',profile:[3,6,9],kind:'flow'},
 e193:{section:'19.1',label:'例19.3 · 平分投入，平分财富',page:303,rule:'equal-equal',profile:[3,6,9],kind:'flow'},
 e194:{section:'19.1',label:'例19.4 · 最高产出，平分财富',page:303,rule:'social',profile:[3,6,9],kind:'flow'},
 e195:{section:'19.1',label:'例19.5 · 固定生产者与受益者',page:304,rule:'one-one',profile:[3,6,9],kind:'flow'},
 e196:{section:'19.1',label:'例19.6 · 最高产出，按生产率分配',page:304,rule:'proportional',profile:[3,6,9],kind:'flow'},
 d194:{section:'19.2',label:'定义19.4 · 效率与总产出上界',page:304,rule:'equal-own',profile:[2,3,6],kind:'efficiency'},
 d195:{section:'19.2',label:'定义19.5 · 同状态的对称性',page:305,rule:'social',profile:[4,4,8],kind:'symmetry'},
 d196:{section:'19.2',label:'定义19.6 · 相对单调性',page:305,rule:'proportional',profile:[2,4,7],kind:'relative'},
 d197:{section:'19.2',label:'定义19.7 · 跨状态的匿名性',page:306,rule:'social',profile:[3,6,9],kind:'anonymity'},
 d198:{section:'19.2',label:'定义19.8 · 自身生产率单调',page:307,rule:'min-own',profile:[2,3,6],kind:'own',who:0,delta:3},
 d199:{section:'19.2',label:'定义19.9 · 他人生产率单调',page:307,rule:'max-own',profile:[3,2,1],kind:'others',who:1,delta:2},
 p191:{section:'19.3',label:'命题19.1 · 四公理刻画平分最大产出',page:307,rule:'social',profile:[3,6,9],kind:'proof'},
 p192:{section:'19.3',label:'命题19.2 · 四公理独立性',page:308,rule:'min-equal',profile:[2,4,6],kind:'independence'},
 q191a:{section:'19.3',label:'习题19.1(a) · 匿名性蕴含对称性',page:310,rule:'social',profile:[4,4,8],kind:'anonymity'},
 q191b:{section:'19.3',label:'习题19.1(b) · 自身单调且对称，不必相对单调',page:310,rule:'cross',profile:[2,4],kind:'cross'},
 q191c:{section:'19.3',label:'习题19.1(c) · 检查社会主义的四公理',page:310,rule:'social',profile:[3,6,9],kind:'proof'},
 q192a:{section:'19.3',label:'习题19.2(a) · 最强者规则的强自身单调',page:310,rule:'max-own',profile:[4,4,2],kind:'strong-own',who:0,delta:1},
 q192b:{section:'19.3',label:'习题19.2(b) · 强自身单调并不唯一',page:310,rule:'proportional',profile:[1,3,6],kind:'strong-own',who:1,delta:2},
 q193a:{section:'19.3',label:'习题19.3(a) · Shapley值：两人(1,3)',page:311,rule:'shapley',profile:[1,3],kind:'shapley'},
 q193b:{section:'19.3',label:'习题19.3(b) · Shapley值：四人(1,3,6,10)',page:311,rule:'shapley',profile:[1,3,6,10],kind:'shapley'},
 q193c:{section:'19.3',label:'习题19.3(c) · 24种到达顺序的边际贡献',page:311,rule:'shapley',profile:[1,3,6,10],kind:'arrival'},
 q193d:{section:'19.3',label:'习题19.3(d) · 四条Shapley公理各自独立',page:311,rule:'min-equal',profile:[1,3,6],kind:'shapley-independence'}
};
export const casesBySection=Object.fromEntries(['19.1','19.2','19.3'].map(s=>[s,Object.keys(cases).filter(k=>cases[k].section===s)]));
export const ruleNames={
 'equal-own':'平分投入，各取所产','max-own':'最强者投入，各取所产','equal-equal':'平分投入，平分财富',
 social:'最高产出，平分财富','one-one':'1号生产，2号取得','proportional':'最高产出，按生产率分',
 'min-equal':'最低产出，平分财富','dictator':'最高产出，固定1号取得',
 'low-share':'最高产出，最低生产率者平分','high-share':'最高产出，最高生产率者平分',
 'min-own':'最低生产率者投入，各取所产','cross':'平分投入，交换所产',
 shapley:'Shapley边际贡献值','priority-shapley':'按编号优先分配每层增量'
};
const eps=1e-9;
export const sum=a=>a.reduce((x,y)=>x+y,0);
export const close=(a,b)=>Math.abs(a-b)<eps;
export function proofProfile(lambda,step){
 const M=Math.max(...lambda),below=lambda.map((v,i)=>v<M?i:-1).filter(i=>i>=0);
 return lambda.map((v,i)=>below.indexOf(i)>=0&&below.indexOf(i)<Math.min(step,lambda.length-1)?M:v);
}
export function shapleyLayers(lambda,priority=false){
 const n=lambda.length,levels=[0,...new Set(lambda.filter(x=>x>0).sort((a,b)=>a-b))],wealth=Array(n).fill(0),layers=[];
 for(let k=1;k<levels.length;k++){
  const delta=levels[k]-levels[k-1],active=lambda.map((v,i)=>v>=levels[k]?i:-1).filter(i=>i>=0),shares=Array(n).fill(0);
  if(priority)shares[active[0]]=delta;
  else active.forEach(i=>shares[i]=delta/active.length);
  shares.forEach((v,i)=>wealth[i]+=v);
  layers.push({from:levels[k-1],to:levels[k],delta,active,shares,wealth:wealth.slice()});
 }
 return{wealth,layers};
}
export function distribute(lambda,rule='social'){
 if(!lambda.length||lambda.some(x=>!Number.isFinite(x)||x<0))throw Error('生产率必须是非负有限数');
 const n=lambda.length,M=Math.max(...lambda),m=Math.min(...lambda),maxIds=lambda.map((x,i)=>close(x,M)?i:-1).filter(i=>i>=0),minIds=lambda.map((x,i)=>close(x,m)?i:-1).filter(i=>i>=0),input=Array(n).fill(0),wealth=Array(n).fill(0);
 const even=ids=>ids.forEach(i=>input[i]=1/ids.length);
 const share=(total,ids)=>ids.forEach(i=>wealth[i]=total/ids.length);
 if(['equal-own','equal-equal','cross'].includes(rule))even(lambda.map((_,i)=>i));
 else if(['min-equal','min-own'].includes(rule))even(minIds);
 else if(rule==='one-one')input[0]=1;
 else even(maxIds);
 const output=lambda.map((x,i)=>x*input[i]),total=sum(output);
 if(rule==='equal-own'||rule==='max-own'||rule==='min-own')output.forEach((v,i)=>wealth[i]=v);
 else if(rule==='equal-equal'||rule==='social'||rule==='min-equal')share(total,lambda.map((_,i)=>i));
 else if(rule==='one-one')wealth[Math.min(1,n-1)]=total;
 else if(rule==='proportional')lambda.forEach((v,i)=>wealth[i]=sum(lambda)>eps?M*v/sum(lambda):0);
 else if(rule==='dictator')wealth[0]=total;
 else if(rule==='low-share')share(total,minIds);
 else if(rule==='high-share')share(total,maxIds);
 else if(rule==='cross'){
  if(n!==2)throw Error('交换所产反例只用于两人');
  wealth[0]=output[1];wealth[1]=output[0];
 }else if(rule==='shapley'||rule==='priority-shapley'){
  const s=shapleyLayers(lambda,rule==='priority-shapley');s.wealth.forEach((v,i)=>wealth[i]=v);
 }else throw Error('未知制度 '+rule);
 return{lambda:lambda.slice(),rule,input,output,wealth,total,max:M,efficient:close(total,M),feasible:close(sum(wealth),total)&&input.every(x=>x>=0)&&wealth.every(x=>x>=0)};
}
export function permutationAudit(lambda,rule,order){
 const before=distribute(lambda,rule),next=order.map(i=>lambda[i]),after=distribute(next,rule),expected=order.map(i=>before.wealth[i]);
 return{before,after,next,expected,anonymous:expected.every((v,i)=>close(v,after.wealth[i]))};
}
export function changeAudit(lambda,rule,who,delta){
 const before=distribute(lambda,rule),next=lambda.slice();next[who]+=delta;const after=distribute(next,rule);
 return{before,after,next,who,delta,own:after.wealth[who]+eps>=before.wealth[who],others:after.wealth.every((v,i)=>i===who||v+eps>=before.wealth[i]),gains:after.wealth.map((v,i)=>v-before.wealth[i])};
}
export function arrivals(lambda){
 const ids=lambda.map((_,i)=>i),orders=[];
 function walk(prefix,rest){if(!rest.length){orders.push(prefix);return}rest.forEach((i,k)=>walk([...prefix,i],rest.filter((_,j)=>j!==k)))}
 walk([],ids);
 const values=orders.map(order=>{let prior=0;return order.map(i=>{const v=Math.max(prior,lambda[i])-prior;prior=Math.max(prior,lambda[i]);return[i,v]})});
 const average=ids.map(i=>sum(values.map(a=>a.find(([j])=>j===i)[1]))/orders.length);
 return{orders,values,average};
}
export function axiomWitness(rule){
 const map={
  'min-equal':{miss:'效率',lambda:[2,4,6],detail:'全员各得最低生产率除以人数；最大可生产量仍是6。'},
  dictator:{miss:'对称性',lambda:[4,4,4],detail:'相同生产率下1号得到全部，其他人得到0。'},
  'low-share':{miss:'自身单调',lambda:[2,3,6],who:0,delta:2,detail:'1号从最低生产率上升后，丢失“最低者”资格。'},
  'high-share':{miss:'他人单调',lambda:[3,2,1],who:1,delta:2,detail:'2号超过原最高者后，原最高者失去财富。'}
 };return map[rule];
}
export function shapleyAxiomWitness(rule){
 const map={
  'min-equal':{miss:'效率',lambda:[1,3,6],detail:'只生产最低者可产的1单位并平分；最大可生产量为6。'},
  'priority-shapley':{miss:'对称性',lambda:[1,1],detail:'同等生产率时，编号靠前者取得共同的第一层增量。'},
  social:{miss:'零贡献',lambda:[0,2],detail:'0生产率者仍分得最高产出的半数。'},
  proportional:{miss:'边际贡献',lambda:[1,2],delta:1,who:1,detail:'提高最高生产率者后，把他实际增加的财富与单独分配增量经济所得的财富比较，两项数值不同。'}
 };return map[rule];
}
