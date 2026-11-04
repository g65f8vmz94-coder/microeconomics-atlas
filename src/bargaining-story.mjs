import {bargainingStoryContent} from './bargaining-story-content.mjs';

const unit=x=>Math.max(0,Math.min(1,x));
export function splitForPlayer2(share){const b=unit(share);return [1-b,b];}
export function finiteBargaining(T){if(!Number.isInteger(T)||T<1)throw Error('T must be a positive integer');const lastProposer=T%2?1:2;return {T,lastProposer,allocation:lastProposer===1?[1,0]:[0,1],timeline:Array.from({length:T},(_,i)=>({period:i+1,proposer:i%2?2:1}))};}
export function oneSidedImmediate(share2,offer2){const target=splitForPlayer2(share2),offer=splitForPlayer2(offer2);return {target,offer,accept:offer[1]+1e-12>=target[1],responderContinuation:target[1],proposerContinuation:target[0]};}
export function oneSidedDeadlock(offers){const allHard=offers.every(x=>Math.abs(x[0]-1)<1e-12&&Math.abs(x[1])<1e-12);const current=offers.at(-1);return {allHard,offer:current,accept:!allHard&&Math.abs(current[0])<1e-12&&Math.abs(current[1]-1)<1e-12,continuation:allHard?[1,0]:[0,1],pathPayoff:allHard?[0,0]:[0,1]};}
export function discountedOneSided(beta,M,offer2){if(!(beta>0&&beta<1)||M<0||M>1)throw Error('invalid discount case');return {beta,M,waitUpper:beta*M,offer:splitForPlayer2(offer2),strictAccept:offer2>beta*M,forcedM:0};}
export function alternatingBargaining(alpha,beta){if(!(alpha>0&&alpha<1&&beta>0&&beta<1))throw Error('discount factors must be in (0,1)');const d=1-alpha*beta,x=[(1-beta)/d,beta*(1-alpha)/d],y=[alpha*(1-beta)/d,(1-alpha)/d];return {alpha,beta,x,y,player2Threshold:beta*y[1],player1Threshold:alpha*x[0],denominator:d};}
export function bargainingStory(key,step=0){const c=bargainingStoryContent[key];if(!c)throw Error('Unknown §16.4 case');const k=Math.max(0,Math.min(5,Math.round(step))),a=alternatingBargaining(.8,.6),f3=finiteBargaining(3),f4=finiteBargaining(4),equal=alternatingBargaining(k<3?.5:.9,k<3?.5:.9);let offer=[.7,.3],next=[.7,.3],decision='接受',period=1,proposer=1,focus='报价',emphasis='当前报价';
 switch(key){
 case 'intro': offer=k<2?[.5,.5]:k<4?[1,0]:a.x;next=k<4?[1,0]:a.y;focus=['分饼','规则','最后通牒','有限轮','无限轮','等待缩水'][k];break;
 case 'ultimatum': offer=k<3?[.5,.5]:k<5?[.99,.01]:[1,0];next=[0,0];decision=k===2?'无差别':'接受';focus=k<3?'回应者比较':'报价者选择';break;
 case 'ultimatumProof':offer=k<2?[1,0]:k<4?[.99,.01]:[1,0];next=k<4?[.99,.01]:[1,0];decision=k<2?'假设拒绝':'接受';focus=k<4?'ε 偏离':'唯一SPE';break;
 case 'finite':{const f=k<3?f3:f4;period=k<3?Math.max(1,3-k):Math.max(1,4-(k-3));proposer=f.timeline[period-1].proposer;offer=f.allocation;next=f.allocation;decision=period===f.T?'末轮接受':'可等末轮';focus=`T=${f.T}：末轮由玩家${f.lastProposer}报价`;break;}
 case 'finiteBack':period=Math.max(1,3-k);proposer=period%2?1:2;offer=f3.allocation;next=f3.allocation;decision='末轮报价者拿整块';focus='从末轮倒推';break;
 case 'one':offer=k<3?[.7,.3]:[.8,.2];next=[.7,.3];decision=k<3?'接受':'拒绝后再谈';period=k<3?1:2;focus='无限单方报价';break;
 case 'oneImmediate':offer=k<2?[.7,.3]:k<4?[.8,.2]:[.6,.4];next=[.7,.3];decision=oneSidedImmediate(.3,offer[1]).accept?'接受':'拒绝；下期仍为七三';focus='回应门槛 0.3';break;
 case 'stalemate':offer=k<2?[1,0]:k<4?[.7,.3]:[0,1];next=k<2?[1,0]:[0,1];decision=k<2?'拒绝':k<4?'拒绝；触发让步':'只接受给2整块';focus=k<2?'强硬路径':'偏离后的续局';period=k<2?k+1:k<4?1:2;break;
 case 'discountOne':offer=k<3?[.7,.3]:[1,0];next=k<3?[.7,.3]:[1,0];decision=k<3?'明天同份额只值 β 倍':'唯一SPE';focus='折现 β=0.6';break;
 case 'discountProof':{const M=k<4?.3:0,q=k<4?.181:0;offer=splitForPlayer2(q);next=splitForPlayer2(M);decision=k<4?'高于 βM 就必须接受':'M=0，接受零份额';focus=k<4?'假设上界 M=0.3':'上界收缩到零';break;}
 case 'alternating':offer=k<3||k===5?a.x:a.y;next=k<3||k===5?a.y:a.x;period=k<3||k===5?1:2;proposer=k<3||k===5?1:2;decision='达到折现后的门槛';focus=k<3?'1报价，2回应':'2报价，1回应';break;
 case 'alternatingProof':offer=k<4||k===5?a.x:a.y;next=k<4||k===5?a.y:a.x;period=k<4||k===5?1:2;proposer=k<4||k===5?1:2;decision=k<5?'两条门槛联立':'上下界保证唯一';focus='命题16.8';break;
 case 'patience':offer=equal.x;next=equal.y;decision=k<3?'δ=0.5':'δ=0.9';focus='同样耐心时的先动优势';break;
 case 'boundary':offer=[.7,.3];next=a.x;decision='先写规则，再求门槛';focus=['行动顺序','期限','等待成本','接受门槛','偏离','结论边界'][k];break;
 }
 return {key,step:k,identity:c.steps[k][0],narration:c.steps[k][1],offer,next,decision,period,proposer,focus,emphasis,finite3:f3,finite4:f4,alternating:a,equal,oneImmediate:oneSidedImmediate(.3,offer[1]),oneDiscount:discountedOneSided(.6,k<4?.3:0,k<4?.181:0)};
}
