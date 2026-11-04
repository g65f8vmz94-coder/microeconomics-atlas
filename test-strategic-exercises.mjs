import assert from 'node:assert/strict';
import {exercise15Cases,p15Finite,p15Centipede,p15Demand,p15Mixed,p15Pay,p15Taper,p15TaperEq,p15GuessBounds,p15GuessPay,p15Attack,p15Committee,p15Matrix23,p15Hawk,p15Oneill} from './src/strategic-exercises.mjs';
let checks=0;const ok=(v,s)=>{checks++;assert.ok(v,s)},near=(a,b,s)=>ok(Math.abs(a-b)<1e-8,s);
ok(Object.keys(exercise15Cases).length===23,'23 original subparts');
const cent=p15Finite('centipede');assert.deepEqual(cent.ne,[[0,0]]);checks++;
for(let a=0;a<=50;a++)for(let b=0;b<=50;b++){const expected=a===50&&b===50?[50,50]:a<=b?[a,a]:[b-1,b+2];assert.deepEqual(p15Centipede(a,b),expected);checks++}
const d=p15Finite('demand');ok(d.ne.length===12,'demand extra zero-payoff NE');ok(d.ne.every(([a,b])=>a+b===10||a===10&&b===10),'exact demand set');
assert.deepEqual(p15Finite('demand-priority').ne,[[5,5],[5,6],[6,5],[6,6]]);checks++;ok(p15Finite('cheap').ne.length===6,'cheap six NE');
for(let V=1;V<=12;V++)for(let k=0;k<=500;k++){const x=2*V*k/500,e=V/4;ok(p15Pay('war',x,e,V)[0]<=e+1e-8,'war best response');}
for(let v1=1;v1<=5;v1++)for(let v2=1;v2<=5;v2++){
 for(let k=0;k<=100;k++){const x=10*k/100,u=p15Pay('attrition',0,v1,v1,v2);ok(p15Pay('attrition',x,v1,v1,v2)[0]<=u[0]+1e-8,'attrition yield equilibrium');ok(p15Pay('attrition',0,x,v1,v2)[1]<=u[1]+1e-8,'attrition wait equilibrium')}
}
for(let k=2;k<=5;k++){const t=1/(k+2),u=p15Pay('smooth-demand',t,t,k)[0];for(let x=0;x<=1000;x++)ok(p15Pay('smooth-demand',x/1000,t,k)[0]<=u+1e-8,'smooth demand global maximum');near(p15Pay('smooth-demand',1,1,k)[0],0,'corner NE');}
for(let e=.02;e<=.901;e+=.02){const t=p15TaperEq(e),u=t*p15Taper(2*t,e);ok(2*t>=1-e-1e-9&&2*t<1,'taper bounds');for(let k=0;k<=1000;k++){const x=k/1000;ok(x*p15Taper(x+t,e)<=u+1e-8,'taper global response '+e)} }
ok(p15GuessBounds().at(-1)===1,'guess bound converges');let guessNE=[];
for(let a=1;a<=100;a++)for(let b=1;b<=100;b++){const u=p15GuessPay([a,b]).winners;if(u[0]===1&&u[1]===1)guessNE.push([a,b]);else{const fixed=u[0]===0?b:a;ok(Array.from({length:100},(_,i)=>p15GuessPay([i+1,fixed]).winners[0]).some(Boolean),'a winner always available')}}assert.deepEqual(guessNE,[[1,1]]);checks++;
for(let a2=2.1;a2<=6;a2+=.1)for(let k=0;k<=100;k++){const x=8*k/100,c=a2-1,u=p15Pay('contribution',0,c,a2);ok(p15Pay('contribution',x,c,a2)[0]<=u[0]+1e-8,'player1 stays zero');ok(p15Pay('contribution',0,x,a2)[1]<=u[1]+1e-8,'player2 optimizes');}
for(let p=0;p<=1.001;p+=.01){const a=p15Mixed(p15Matrix23,[p,1-p],[0,0,1]);ok((Math.max(...a.gains)<1e-8)===(p<=.50000001),'complete mixed23 family');}
for(let c=.05;c<=3;c+=.05){const p=1/(1+2*c),a=p15Mixed(p15Hawk(c),[p,1-p],[p,1-p]);near(a.gains[0],0,'hawk regret');near(a.u[0],c/(1+2*c),'hawk payoff');}
for(let v2=4;v2<=5.5;v2+=.1)for(let v3=.1;v3<4;v3+=.1){const a=p15Attack([6,v2,v3]);near(a.p.reduce((a,b)=>a+b),1,'attack simplex');near(a.q.reduce((a,b)=>a+b),1,'defend simplex');ok(a.p[0]>0&&a.p[1]>0,'first two attacked');ok(Math.max(...a.audit.gains)<1e-8,'attack full three-action regret')}
function committeePay(actions,c){const votesA=actions[0]+actions[1],votesB=actions[2],PA=votesA===votesB?.5:votesA>votesB?1:0;return[PA-c*actions[0],PA-c*actions[1],1-PA-c*actions[2]]}
for(let c=-.2;c<.5;c+=.01){const a=p15Committee(c),p=a.attendance,expected=[0,0,0],conditional=Array.from({length:3},()=>[0,0]);for(let mask=0;mask<8;mask++){const actions=[0,1,2].map(i=>+(!!(mask&(1<<i)))),prob=actions.reduce((v,x,i)=>v*(x?p[i]:1-p[i]),1),u=committeePay(actions,c);u.forEach((v,i)=>expected[i]+=v*prob);for(let i=0;i<3;i++){const otherProb=actions.reduce((v,x,j)=>j===i?v:v*(x?p[j]:1-p[j]),1);conditional[i][actions[i]]+=otherProb*u[i]}}
 expected.forEach((v,i)=>near(v,a.payoffs[i],'committee full8 payoff'));conditional.forEach((v,i)=>ok(Math.max(...v)-expected[i]<1e-8,'committee individual deviation'));
}
const one=p15Mixed(p15Oneill,[.2,.2,.2,.4],[.2,.2,.2,.4]);near(one.u[0],.4,'oneill win rate');ok(one.gains.every(v=>v<1e-8),'oneill full4-action regret');
for(const high of [.5,.7,1,1.5])for(let k=1;k<=300;k++){const lambda=k/100,u=p15Pay('kantian-price',.5,high),v=p15Pay('kantian-price',.5*lambda,high*lambda);ok(v[0]<=u[0]+1e-8&&v[1]<=u[1]+1e-8,'unbounded positive-price Kantian family')}
for(let k=1;k<=100;k++){const l=k/100;ok(p15Pay('kantian-price',.2*l,l)[0]<=p15Pay('kantian-price',.2,1)[0]+1e-8,'bounded corner KE')}
ok(p15Pay('kantian-price',.4,2)[0]>p15Pay('kantian-price',.2,1)[0],'same corner not unbounded KE');
assert.deepEqual(p15Finite('comparative',2).ne,[[0,0]]);checks++;
console.log(JSON.stringify({passed:true,checks,subpartCases:23,originalProblems:18,centipedeProfiles:2601,guessTwoPlayerProfiles:10000}));
