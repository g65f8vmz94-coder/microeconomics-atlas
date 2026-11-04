import assert from 'node:assert/strict';
import {fairnessM,fairnessTeachingM} from './src/monopoly.mjs';
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
for(const [i,q1,q2,profit] of [[0,5,3,34],[1,4,4,32],[2,3,3,30],[3,5,5,30],[4,4,4,32]]){let f=fairnessTeachingM(i);near(f.q1,q1);near(f.q2,q2);near(f.profit,profit)}
for(let i=0;i<=400;i++){let f=fairnessTeachingM(i/100);near(f.p1,10-f.q1);near(f.p2,6-f.q2);near(f.cs1,f.q1**2/2);near(f.cs2,f.q2**2/2);near(f.profit,f.p1*f.q1+f.p2*f.q2);assert.ok(f.q1>=0&&f.q1<=10&&f.q2>=0&&f.q2<=6);if(i>0&&i<100)assert.notEqual(f.cs1,f.cs2);if(i>=100)near(f.cs1,f.cs2)}
let checks=0;for(const a2 of [.5,1,2,4,6])for(const ratio of [1,1.5,2.9,3,3.1,5,10]){const a1=a2*ratio,r=fairnessM(a1,a2);near(r.equal,Math.min(a2,(a1+a2)/4));near(r.cs,r.equal**2/2);near(r.profit,(a1-r.equal)*r.equal+(a2-r.equal)*r.equal);assert.ok(r.profit<=r.unrestricted.profit+1e-8);for(let j=0;j<=100;j++){const q=a2*j/100;assert.ok(r.profit+1e-8 >= (a1+a2)*q-2*q*q)}checks++}
near(fairnessM(12,4).equal,4);near(fairnessM(20,4).equal,4);near(fairnessM(8,0).equal,0);near(fairnessM(8,8).profit,fairnessM(8,8).unrestricted.profit);
console.log(JSON.stringify({passed:true,continuousStates:401,generalCases:checks,profitGridComparisons:checks*101,boundaryAndEqualMarkets:true}));
