import {examples,analysis,gs,blockers,capacityPrefs,capacityGS,capacityBlockers,roomPrefs,roomAssignments,roomBlockers} from './matching-lab.mjs';
import {matchingStabilityContent,matchingStabilityKeys} from './matching-stability-content.mjs';

const blank=n=>Array(n).fill(-1);
const unstable=analysis(examples.unstable.X,examples.unstable.Y).serial;
const stableUnstable=gs(examples.unstable.X,examples.unstable.Y,'X').matching;
const multiX=gs(examples.multiple.X,examples.multiple.Y,'X').matching;
const multiY=gs(examples.multiple.X,examples.multiple.Y,'Y').matching;
const weakX=gs(examples.weakPareto.X,examples.weakPareto.Y,'X').matching;
const weakAlternative=[1,2,0];
const same=gs(examples.sameX.X,examples.sameX.Y,'X');
const unequalA=gs(examples.unequal.X,examples.unequal.Y,'X').matching;
const unequalB=gs(examples.unequal.X,examples.unequal.Y,'Y').matching;
const single=gs(examples.oneA.X,examples.oneA.Y,'X').matching;
const capacity=capacityGS(capacityPrefs.students,capacityPrefs.programs,2);
const truthful=gs(examples.manipulate.X,examples.manipulate.Y,'X');
const reportedY=[[1,2,0],...examples.manipulate.Y.slice(1)];
const lied=gs(examples.manipulate.X,reportedY,'X');
export const matchingStabilityModels={unstable,stableUnstable,multiX,multiY,weakX,weakAlternative,same,unequalA,unequalB,single,capacity,truthful,lied,reportedY};

const plans={
 d184:{profile:'unstable',matches:[unstable,unstable,unstable,unstable,unstable,unstable],focus:[null,null,null,[1,0],[1,0],[1,0]]},
 e185:{profile:'unstable',matches:[blank(3),[0,-1,-1],[0,1,-1],unstable,unstable,unstable],focus:[null,null,null,null,[1,0],[1,0]]},
 p182:{profile:'unstable',matches:[unstable,stableUnstable,stableUnstable,stableUnstable,stableUnstable,stableUnstable],focus:[[1,0],null,null,null,null,null]},
 p183:{profile:'multiple',matches:[blank(3),multiX,multiY,multiX,multiX,multiX],focus:[null,null,null,null,null,null]},
 p184:{profile:'multiple',matches:[multiX,multiX,multiY,multiY,multiX,multiX],focus:[null,null,null,null,null,null]},
 q181:{profile:'unstable',matches:[unstable,unstable,unstable,unstable,unstable,unstable],focus:[[1,0],[1,0],[1,0],[1,0],[1,0],[1,0]]},
 q182:{profile:'weakPareto',matches:[weakX,weakAlternative,weakAlternative,weakAlternative,weakX,weakX],focus:[null,null,null,null,null,null]},
 q183:{profile:'sameX',matches:[blank(3),[-1,-1,0],[1,-1,0],[1,2,0],[1,2,0],[1,2,0]],focus:[null,null,null,null,null,null]},
 q184:{profile:'unequal',matches:[single,single,unequalA,unequalB,unequalB,unequalB],focus:[null,null,null,null,null,null]},
 q185:{profile:'capacity',matches:[0,1,2,3,3,3].map(i=>capacity.trace[i].matching),focus:[null,null,null,null,null,null]},
 q186:{profile:'manipulate',matches:[truthful.matching,truthful.matching,truthful.matching,lied.trace[2].matching,lied.matching,lied.matching],focus:[null,null,null,null,null,null]},
 q187:{profile:'roommate',matches:[roomAssignments[0],roomAssignments[1],roomAssignments[2],roomAssignments[0],roomAssignments[1],roomAssignments[2]],focus:[[1,2],[0,1],[0,2],[1,2],[0,1],[0,2]]}
};
export function matchingStabilityFrame(key,step){
 if(!matchingStabilityKeys.includes(key))throw Error('unknown stability case '+key);
 if(!Number.isInteger(step)||step<0||step>5)throw Error('stability film step outside 0..5');
 const c=matchingStabilityContent[key],plan=plans[key],profile=plan.profile==='capacity'?{X:capacityPrefs.students,Y:capacityPrefs.programs}:plan.profile==='roommate'?null:key==='q184'&&step<2?examples.oneA:examples[plan.profile];
 const matching=plan.matches[step].slice();
 const complete=plan.profile==='roommate'||matching.every(y=>y>=0);
 const blocking=!complete?[]:plan.profile==='roommate'?roomBlockers(roomPrefs,matching):plan.profile==='capacity'?capacityBlockers(capacityPrefs.students,capacityPrefs.programs,2,matching):profile?blockers(profile.X,profile.Y,matching):[];
 const focus=plan.focus[step];
 const highlight=focus&&blocking.some(pair=>pair[0]===focus[0]&&pair[1]===focus[1])?focus:null;
 return {kind:plan.profile,key,step,title:c.title,identity:c.scenes[step][0],narration:c.scenes[step][1],profile,matching,complete,blocking,focus:highlight,source:c.source,report:key==='q186'&&step>=2?reportedY:null,capacity:key==='q185'?2:null};
}
