import assert from 'node:assert/strict';
import {arrowProof,arrowDemoProfiles} from './src/arrow-proof-content.mjs';
import {arrowProofFrame,arrowProofAudit} from './src/arrow-proof-story.mjs';
import {allProfiles,aggregate,aggregationAudit} from './src/final-topics.mjs';
let checked=0;const ok=(x,msg)=>{assert.ok(x,msg);checked++;};
ok(arrowProof.scenes.length===6,'six staged proof scenes');
ok(arrowProof.proof.length===6,'five steps and reverse direction');
for(let step=0;step<6;step++){const f=arrowProofFrame(step);ok(f.step===step,'step preserved '+step);ok(f.profile.length===3&&f.profile.every(row=>row.length===3&&new Set(row).size===3),'strict complete rankings '+step);ok(JSON.stringify(f.profile)===JSON.stringify(arrowDemoProfiles[step]),'source profile '+step);ok(JSON.stringify(f.social)===JSON.stringify(f.profile[1]),'constructed dictator example '+step);ok(f.socialBPosition===f.social.indexOf(1),'b position '+step);ok(f.supportCount===f.bAtTop.filter(Boolean).length,'support '+step);ok(f.scene[0].length>0&&f.scene[1].length>0,'scene explanation '+step);}
ok(arrowProofFrame(0).socialBPosition===2,'b starts last');
ok(arrowProofFrame(1).socialBPosition===2,'one person not pivotal');
ok(arrowProofFrame(2).socialBPosition===0,'person2 pivotal in constructed example');
const audit=arrowProofAudit();ok(audit.profileCount===216,'all three-person profiles checked');ok(audit.dictatorialPassesPareto&&audit.dictatorialPassesIIA&&audit.bordaFailsIIA,'property boundary');
for(const p of allProfiles){const r=aggregate(p,'dictator',[2,1,0],1);for(let a=0;a<3;a++)for(let b=0;b<3;b++){ok(r.R[a][b]===(p[1].indexOf(a)<=p[1].indexOf(b)),'pair equals fixed individual');if(p.every(row=>row.indexOf(a)<row.indexOf(b)))ok(r.R[a][b]&&!r.R[b][a],'Pareto');}}
ok(!!aggregationAudit('borda',[2,1,0],0).witnesses.iia,'Borda IIA witness');
console.log({passed:true,checked,frames:6,profiles:216});
