import {distribute,sum,close,ruleNames} from './social-lab.mjs';
import {socialPropertiesContent,socialPropertiesKeys} from './social-properties-content.mjs';

const specifications={
 d194:{old:[2,3,6],oldRule:'equal-own',next:[2,3,6],nextRule:'social',focus:[0,1,2]},
 d195:{old:[4,4,8],oldRule:'social',next:[4,4,8],nextRule:'one-one',focus:[0,1]},
 d196:{old:[2,4,7],oldRule:'proportional',next:[2,4,7],nextRule:'one-one',focus:[1,2]},
 d197:{old:[7,3,13],oldRule:'equal-own',next:[3,13,7],nextRule:'equal-own',oldToNew:[2,0,1],focus:[0,1,2]},
 x197:{old:[2,3],oldRule:'book-symmetric-not-anonymous',next:[3,2],nextRule:'book-symmetric-not-anonymous',oldToNew:[1,0],focus:[0,1]},
 d198:{old:[2,3],oldRule:'min-own',next:[5,3],nextRule:'min-own',focus:[0]},
 d199:{old:[3,2],oldRule:'max-own',next:[3,4],nextRule:'max-own',focus:[0]}
};
function run(lambda,rule){
 const actual=rule==='book-symmetric-not-anonymous'?(lambda.every(x=>close(x,lambda[0]))?'equal-own':'dictator'):rule;
 const state=distribute(lambda,actual);
 if(!state.feasible||!close(sum(state.input),1)||!close(sum(state.output),sum(state.wealth)))throw Error('social property frame violates feasibility');
 return {...state,displayRule:rule==='book-symmetric-not-anonymous'?'原书：同本事平分，否则固定1号拿全部':ruleNames[rule]};
}
export function socialPropertiesFrame(key,step){
 if(!socialPropertiesKeys.includes(key))throw Error('unknown social property '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('social property step outside 0..5');
 const s=specifications[key],equalPrelude=key==='x197'&&step===0,old=equalPrelude?[4,4]:s.old,next=equalPrelude?[4,4]:s.next;
 const left=run(old,s.oldRule),right=run(next,s.nextRule),oldToNew=s.oldToNew||old.map((_,i)=>i),c=socialPropertiesContent[key];
 if(oldToNew.length!==old.length||new Set(oldToNew).size!==old.length||oldToNew.some(i=>i<0||i>=old.length))throw Error('invalid identity map');
 return {kind:'social-properties',key,step,identity:c.scenes[step][0],narration:c.scenes[step][1],left,right,oldToNew,focus:s.focus,showLeftWealth:step>=1,showRightProfile:step>=3,showRightWealth:step>=4,boundary:equalPrelude?'先验证原书分段制度在相同生产率时给同财富':key==='x197'?'现在换到生产率不同的档案；身份随后互换':'',sameRule:s.oldRule===s.nextRule,comparison:step===5};
}
export const socialPropertiesKeysWithModels=Object.keys(specifications);
