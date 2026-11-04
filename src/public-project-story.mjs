import {publicProjectContent} from './public-project-content.mjs';

export function publicProjectUtility(value,decision,transfer=0){if(decision!==0&&decision!==1)throw Error('Public decision must be 0 or 1');return decision*value+transfer;}
export function publicProjectPayoffs(values,decision,transfers=values.map(()=>0)){if(values.length!==transfers.length)throw Error('Each resident needs a transfer');return values.map((value,i)=>publicProjectUtility(value,decision,transfers[i]));}
export function compensatingTransfer(value){return -value;}
export function publicProjectStory(key,step=0){const c=publicProjectContent[key];if(!c)throw Error('Unknown §17.1 case');const k=Math.max(0,Math.min(5,Math.round(step)));let values=[8,-5,-1],transfers=[0,0,0],decision=0,focus=0,stage='共同决定',rule='本节尚未指定决策规则';
 switch(key){
 case 'intro':decision=k>=4?1:0;focus=Math.min(2,Math.max(0,k-1));stage=k<4?'听三位居民':'同一个项目影响所有人';break;
 case 'd171':decision=k>=2?1:0;focus=k<4?0:Math.min(2,k-3);stage=k<2?'不建：d=0':'建成：d=1';break;
 case 'valuation':values=[8,-5,0];decision=1;focus=k<2?0:k<4?1:2;stage=focus===0?'正估值：愿意付钱':focus===1?'负估值：需要补偿':'零估值：无差别';if(k===1)transfers[0]=-8;if(k===3)transfers[1]=5;break;
 case 'transfer':decision=k===2?0:1;focus=k<3?0:1;stage=k<2?'付出的钱记负':k===2?'不建也可有转移':k===3?'收到的钱记正':'决定与转移分开';if(k>=1)transfers[0]=-8;if(k>=3)transfers[1]=5;break;
 case 'd172':decision=k===0||k===3?0:1;focus=k===5?1:0;transfers[0]=k>=2&&k<=4?-2:0;if(k===5)transfers[1]=5;stage=k===5?'负估值与补偿':decision?'实施：vᵢ+tᵢ':'未实施：只有tᵢ';break;
 case 'boundary':decision=k>=3?1:0;focus=Math.min(2,Math.floor(k/2));stage=k<3?'先把对象和符号写清':'规则要由题目另给';break;
 }
 const utility=publicProjectPayoffs(values,decision,transfers),withoutTransfer=publicProjectPayoffs(values,decision);
 return {key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],values,transfers,decision,focus,stage,rule,utility,withoutTransfer,totalValue:values.reduce((a,b)=>a+b,0),positiveCount:values.filter(x=>x>0).length};
}
