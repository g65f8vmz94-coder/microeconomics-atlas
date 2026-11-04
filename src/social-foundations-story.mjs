import {distribute,ruleNames,sum,close} from './social-lab.mjs';
import {socialFoundationsContent,socialFoundationsKeys} from './social-foundations-content.mjs';

const normal=[3,6,9];
const sourceRule={d191:'equal-own',d192:'equal-equal',d193:'social',e191:'equal-own',e192:'max-own',e193:'equal-equal',e194:'social',e195:'one-one',e196:'proportional'};
const reveals={d191:[0,0,1,2,3,3],d192:[1,2,3,4,4,4],d193:[0,1,4,0,1,4]};
const standard=[0,1,2,3,4,4];
export function socialFoundationsFrame(key,step){
 if(!socialFoundationsKeys.includes(key))throw Error('unknown social foundations case '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('social foundations film step outside 0..5');
 let lambda=normal.slice(),rule=sourceRule[key],reveal=(reveals[key]||standard)[step],boundary='';
 if(key==='d193'&&step>=3){lambda=[3,6,12];boundary='只变3号生产率：12；规则不变';}
 if(key==='d192'&&step===5){rule='social';reveal=4;boundary='同一档案，改投入方案实现(3,3,3)';}
 if(key==='e192'&&step===5){lambda=[3,9,9];boundary='并列最高：2号与3号各得一半投入';}
 if(key==='e196'&&step===5){lambda=[0,0,0];boundary='全零档案：原书分式无定义，本站按可行性补0';}
 const model=distribute(lambda,rule),c=socialFoundationsContent[key];
 if(!model.feasible||!close(sum(model.input),1)||!close(sum(model.output),sum(model.wealth)))throw Error('infeasible social foundations frame');
 return {kind:'social-foundations',key,step,identity:c.scenes[step][0],narration:c.scenes[step][1],lambda,rule,ruleName:ruleNames[rule],input:model.input.slice(),output:model.output.slice(),wealth:model.wealth.slice(),total:model.total,max:model.max,reveal,visibleInput:reveal>=1,visibleOutput:reveal>=2,visibleTotal:reveal>=3,visibleWealth:reveal>=4&&key!=='d191',boundary,formulaOverride:key==='e196'&&step===5?String.raw`\sum_i\lambda_i=0\quad\Rightarrow\quad F_i=0`:null};
}
export const socialFoundationsKeysWithRules=Object.keys(sourceRule);
