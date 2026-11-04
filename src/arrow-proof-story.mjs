import {aggregate,aggregationAudit} from './final-topics.mjs';
import {arrowDemoProfiles,arrowProof} from './arrow-proof-content.mjs';
const arrowClone=p=>p.map(row=>[...row]);
export const arrowProofFrame=(step=0)=>{
 const index=Math.max(0,Math.min(5,Math.round(Number(step)||0))),profile=arrowClone(arrowDemoProfiles[index]);
 const result=aggregate(profile,'dictator',[2,1,0],1),bAtTop=profile.map(row=>row[0]===1),bAtBottom=profile.map(row=>row[2]===1);
 const social=[...profile[1]],previous=index?aggregate(arrowDemoProfiles[index-1],'dictator',[2,1,0],1):null;
 return {step:index,profile,result,social,previousSocial:previous?arrowDemoProfiles[index-1][1]:null,bAtTop,bAtBottom,supportCount:bAtTop.filter(Boolean).length,socialBPosition:social.indexOf(1),pair:index===4?[0,2]:index===5?[0,1]:null,scene:arrowProof.scenes[index],isConstructedExample:true,rule:'固定2号完整排序',source:'本站构造的三人见证，不代替一般证明'};
};
export const arrowProofAudit=()=>{
 const dictatorial=aggregationAudit('dictator',[2,1,0],1),borda=aggregationAudit('borda',[2,1,0],0);
 return {dictatorial,borda,dictatorialPassesPareto:!dictatorial.witnesses.pareto,dictatorialPassesIIA:!dictatorial.witnesses.iia,bordaFailsIIA:!!borda.witnesses.iia,profileCount:dictatorial.profiles};
};
