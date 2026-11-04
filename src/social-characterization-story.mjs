import {distribute,shapleyLayers,arrivals,proofProfile,sum,close,ruleNames} from './social-lab.mjs';
import {socialCharacterizationContent,socialCharacterizationKeys} from './social-characterization-content.mjs';

const state=(lambda,rule,label,barLabel='最终财富')=>{
 const model=distribute(lambda,rule);
 if(!model.feasible||!close(sum(model.wealth),model.total))throw Error('infeasible chapter 19 model');
 return {lambda:model.lambda,wealth:model.wealth,rule,ruleLabel:ruleNames[rule],label,barLabel,total:model.total,max:model.max,complete:true};
};
const partial=(lambda,wealth,label,barLabel,total)=>({lambda,wealth,rule:'shapley',ruleLabel:'边际增量计算',label,barLabel,total,max:Math.max(...lambda),complete:false});

export function socialCharacterizationFrame(key,step){
 if(!socialCharacterizationKeys.includes(key))throw Error('unknown chapter 19 characterization '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('film step outside 0..5');
 const c=socialCharacterizationContent[key];let model;
 if(key==='p191'){
  const lambda=step<2?[3,6,9]:step===2?[3,9,9]:[9,9,9];
  model=state(lambda,'social','本站参照规则：最大产出平分','参照财富');
 }else if(key==='p192'){
  const entries=[[[2,4,6],'min-equal'],[[4,4,4],'dictator'],[[2,3,6],'low-share'],[[4,3,6],'low-share'],[[3,2,1],'high-share'],[[3,4,1],'high-share']];
  const [lambda,rule]=entries[step];model=state(lambda,rule,`原书反例规则：${ruleNames[rule]}`);
 }else if(key==='q191a')model=state([4,4,8],'social',step<2?'相同生产率的一对':'交换同本事两人的身份后，输入仍相同');
 else if(key==='q191b')model=state(step===0?[2,2]:step===2?[3,4]:[2,4],'cross','本站构造：平分投入并交换产出');
 else if(key==='q191c')model=state(step>=3?[3,6,12]:[3,6,9],'social','原书例19.4：最高产出平分');
 else if(key==='q192a')model=state(step>=2?[5,4,2]:[4,4,2],'max-own','原题制度：并列最高者平分投入与所得');
 else if(key==='q192b')model=state(step>=2?[1,5,6]:[1,3,6],'proportional','原书例19.6：最高产出按生产率比例分');
 else if(key==='q193a'||key==='q193b'){
  const lambda=key==='q193a'?[1,3]:[1,3,6,10],sh=shapleyLayers(lambda),completed=Math.min(sh.layers.length,key==='q193a'?[0,0,1,1,2,2][step]:[0,1,2,3,4,4][step]);
  const wealth=completed?sh.layers[completed-1].wealth:Array(lambda.length).fill(0);
  model=completed===sh.layers.length?state(lambda,'shapley','原题最终Shapley财富'):partial(lambda,wealth,`只算完 ${completed}/${sh.layers.length} 层；尚非最终财富`,'已分层累计',sum(wealth));
  model.layers=sh.layers;model.layersCompleted=completed;
 }else if(key==='q193c'){
  const lambda=[1,3,6,10],a=arrivals(lambda),order=[0,2,1,3],sequence=order.map(i=>a.values.find(v=>v.map(x=>x[0]).join(',')===order.join(','))?.find(x=>x[0]===i));
  if(sequence.some(x=>!x))throw Error('textbook arrival order missing');
  const count=Math.min(4,step),wealth=Array(4).fill(0);sequence.slice(0,count).forEach(([i,v])=>wealth[i]=v);
  model=step===5?state(lambda,'shapley','24种到达顺序逐人平均的最终财富'):partial(lambda,wealth,`原题顺序(1,3,2,4)：已到 ${count}/4 人`,'本顺序已到贡献',sum(wealth));
  model.order=order;model.arrivalContribution=wealth;model.average=a.average;model.orders=a.orders.length;
 }else if(key==='q193d'){
  const entries=[[[1,3,6],'min-equal'],[[1,1],'priority-shapley'],[[0,2],'social'],[[1,2],'proportional'],[[1,3],'proportional'],[[0,1],'proportional']];
  const [lambda,rule]=entries[step];model=state(lambda,rule,`本站构造的反例规则：${ruleNames[rule]}`);
 }
 return {kind:'social-characterization',key,step,identity:c.scenes[step][0],narration:c.scenes[step][1],...model};
}
export const socialCharacterizationKeysWithModels=socialCharacterizationKeys;
