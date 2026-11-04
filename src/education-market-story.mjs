import {signal,workerChoice,certificate,schools,schoolChoice} from './signaling-lab.mjs';
import {educationMarketContent} from './education-market-content.mjs';

const base={vL:4,vH:10,betaL:3,betaH:1,alphaL:.65};
const offer=(id,t,w)=>({id,t,w});

export function evaluateEducationOffers(contracts,{vL=4,vH=10,betaL=3,betaH=1,alphaL=.65}={}){
  if(!Array.isArray(contracts)||contracts.some(c=>c.t<0||c.w<0)||!(vH>vL&&vL>0&&betaL>betaH&&betaH>0&&alphaL>=0&&alphaL<=1))throw Error('invalid education offers');
  const active={L:alphaL>0,H:alphaL<1};
  const choice={L:active.L?workerChoice(contracts,betaL):{id:'absent'},H:active.H?workerChoice(contracts,betaH):{id:'absent'}};
  const details=contracts.map(c=>{
    const attendees=Object.entries(choice).filter(([,picked])=>picked.id===c.id).map(([type])=>type);
    const totalShare=attendees.reduce((n,type)=>n+(type==='L'?alphaL:1-alphaL),0);
    const expectedOutput=totalShare?attendees.reduce((n,type)=>n+(type==='L'?alphaL*vL:(1-alphaL)*vH),0)/totalShare:null;
    return {...c,attendees,profit:expectedOutput===null?0:expectedOutput-c.w};
  });
  return {choice,details};
}

function contractScene(key,step){
  const alphaL=key==='threshold'?(step===3?.2:step===4?1/3:.65):key==='boundaryShare'?0:.65;
  const params={...base,alphaL},r=alphaL===0?null:signal(params);
  let contracts=[offer('L',0,4),offer('H',2,10)],entry=null,mode='separate';
  if(key==='baseline142'){mode='pool';contracts=[offer('混同',0,6.1)];if(step>=4)entry=r.poolingWitness.contract;}
  if(['d141','d142','fig141'].includes(key))mode='income';
  if(key==='fig141'){contracts=[offer('a',1,7),offer('b',2,10)];if(step>=4)entry=offer('c',2,1);}
  if(key==='d142'){contracts=[offer('a',1,7),offer('b',2,10)];}
  if(key==='d143'){mode='payoff';contracts=[offer('混同',0,6.1)];if(step===2)contracts=[offer('L',0,4),offer('H',2,9)];if(step===3)contracts=[offer('L',0,4),offer('H',2,10)];}
  if(key==='d144'){mode='rules';if(step===3){contracts=[offer('混同',0,6.1)];entry=r.poolingWitness.contract;}}
  if(key==='q141'){mode=step===0?'unemployment':step===1?'pool':'separate';if(step===0)contracts=[];if(step===1)contracts=[offer('混同',0,6.1)];}
  if(key==='pool'||key==='proof2'){mode='pool';contracts=[offer('混同',0,6.1)];if(step>=2)entry=r.poolingWitness.contract;}
  if(key==='proof1'){mode='unemployment';contracts=[];if(step>=1)entry=offer('新合同',0,2);}
  if(key==='proof3'){mode='profit';if(step===1)contracts=[offer('L',0,5),offer('H',2,10)];if(step===2)contracts=[offer('L',0,4),offer('H',3,11)];}
  if(key==='proof4'){mode='low-contract';if(step<=2){contracts=[offer('L',0,3),offer('H',3,10)];if(step>=1)entry=offer('新合同',0,3.5);}else if(step<=4){contracts=[offer('L',1,4),offer('H',3,10)];entry=offer('新合同',0,3.5);}}
  if(key==='proof5'){mode='high-contract';if(step<=2){contracts=[offer('L',0,4),offer('H',2,9)];if(step>=2)entry=offer('新合同',2,9.5);}else if(step<=4){contracts=[offer('L',0,4),offer('H',3,10)];entry=offer('新合同',2.5,9.8);}}
  if(key==='threshold'){mode='threshold';if(step===3)entry=offer('混同进入',0,(r.avg+r.m)/2);}
  if(key==='boundaryShare'){mode='boundary';contracts=[offer('H',0,10)];if(step===2)entry=offer('低报',0,9);if(step>=3)entry=offer('高报',0,11);}
  const current=evaluateEducationOffers(contracts,params),after=entry?evaluateEducationOffers([...contracts,entry],params):null;
  return {view:'signal',mode,params,model:r,contracts,entry,current,after,showLines:key==='proof1'?false:key==='baseline142'?step>=4:step>=1||['fig141','d142','pool','proof2','threshold'].includes(key),showAverage:['baseline142','d143','d144','pool','proof2','threshold'].includes(key)&&step>=1,showCandidate:step>=2||['proof1','proof3','proof4','proof5'].includes(key)};
}

function certificateScene(step){
  const prices=[{pPlus:15,pMinus:15},{pPlus:15,pMinus:15},{pPlus:19.5,pMinus:15},{pPlus:15,pMinus:0},{pPlus:15,pMinus:5},{pPlus:20,pMinus:10}][step];
  return {view:'certificate',prices,model:certificate(prices),stage:step};
}

function schoolScene(key,step){
  let args,hypothetical=null;
  if(key==='p2empty'){args={mode:'empty'};if(step===1||step===2)hypothetical={id:'新校',style:'A',d:0};if(step===3||step===4)hypothetical={id:'新校',style:'B',d:0};}
  if(key==='p2single'){args={mode:'single',dA:step>=3&&step<=4?5:4};if(step===2)hypothetical={id:'新校',style:'B',d:0};if(step===4)hypothetical={id:'新校',style:'B',d:0};}
  if(key==='p2pair'){args={mode:'pair',dA:step<=2?7:step<=4?6:5,dB:step>=3&&step<=4?1:0};if(step===2)hypothetical={id:'新校',style:'A',d:6};if(step===4)hypothetical={id:'新校',style:'B',d:.5};}
  const model=schools(args),after=hypothetical?{choice1:schoolChoice([...model.current,hypothetical],1),choice2:schoolChoice([...model.current,hypothetical],2)}:null;
  return {view:'school',args,model,hypothetical,after};
}

export function educationMarketStory(key,step){
  const content=educationMarketContent[key];if(!content||!Number.isInteger(step)||step<0||step>5)throw Error('unknown education-market frame');
  const scene=content.view==='certificate'?certificateScene(step):content.view==='school'?schoolScene(key,step):contractScene(key,step);
  return {key,step,identity:content.steps[step][0],narration:content.steps[step][1],...scene};
}
