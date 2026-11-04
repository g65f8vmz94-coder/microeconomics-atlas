/* Section 3.4: Theory and experiments (Allais paradox), authored from Osborne–Rubinstein 2020.12.21(h), printed pp.38–39 (PDF pp.57–58).
 * Every lottery distribution and compound mixture is verified through the pure model functions in uncertainty.mjs.
 */
import {lottery,mixture,expected,allais} from './uncertainty.mjs';

export const allaisZero=[1,0,0];
export const allaisWeight=.25;

export function allaisDecompose(){
 const l1FromL2=mixture(allaisWeight,allais.L2,allaisZero);
 const r1FromR2=mixture(allaisWeight,allais.R2,allaisZero);
 return {l1FromL2,r1FromR2};
}

export function allaisEuComparison(v3000,v0=0,v4000=1){
 if(!(v4000>v0))throw Error('须有 v($4000) > v($0)');
 const v=[v0,v3000,v4000];
 const uL1=expected(allais.L1,v),uR1=expected(allais.R1,v);
 const uL2=expected(allais.L2,v),uR2=expected(allais.R2,v);
 const diff1=uL1-uR1,diff2=uL2-uR2;
 const rel=d=>Math.abs(d)<1e-10?'∼':d>0?'≻':'≺';
 return {v,uL1,uR1,uL2,uR2,diff1,diff2,rel1:rel(diff1),rel2:rel(diff2),threshold:.8*v4000+.2*v0};
}

export const allaisStories=(()=>{
 const scene=(title,narration,pair,v3000,formula,source,extra={})=>({title,narration,pair,v3000,formula,source,...extra});
 return {
  allais:{
   intro:'给你两道抽奖选择题：一道题里有一张“稳拿 3,000 美元”的保底票，另一道题里两张票都有近八成机会空手而归。你会怎么选？为什么原书作者自己的选择也会撞上独立性公理？',
   end:'§3.4 通过 Allais 两组选择展示期望效用模型与人类行为的张力：L₁=0.25L₂⊕0.75[$0]、R₁=0.25R₂⊕0.75[$0]，独立性要求两组排序同向（7,932 名受试者中占 51%），而最常见的 (L₁, R₂) 占 44%，直接违反独立性。',
   labels:['$0','$3,000','$4,000'],
   frames:[
    scene('第一组选择：L₁ 与 R₁ 的低中奖率权衡','先看问题一：L₁ 以 0.20 概率得 $4,000、0.80 概率得 $0；R₁ 以 0.25 概率得 $3,000、0.75 概率得 $0。两张票都有很大概率拿 $0，中奖率 0.20 与 0.25 相差不大，但奖金差了 $1,000。','pair1',.75,String.raw`L_1=0.2\cdot[\$4000]\oplus0.8\cdot[\$0],\quad R_1=0.25\cdot[\$3000]\oplus0.75\cdot[\$0]`,'原书§3.4问题一 · 印刷38—39页',{focus:'q1'}),
    scene('第二组选择：L₂ 与 R₂ 的确定性对照','再看问题二：L₂ 以 0.80 概率得 $4,000、0.20 概率得 $0；R₂ 则以 100% 确定性拿到 $3,000。这里 R₂ 完全消除了空手而归的风险，而 L₂ 仍有 0.20 概率拿 $0。','pair2',.85,String.raw`L_2=0.8\cdot[\$4000]\oplus0.2\cdot[\$0],\quad R_2=[\$3000]`,'原书§3.4问题二 · 印刷38—39页',{focus:'q2'}),
    scene('关键拆解：第一组只是第二组同掺入 75% 的 $0','把第二组的 L₂、R₂ 都乘以 0.25，再共同混入 0.75 的退化彩票 [$0]，压平后恰好得到第一组的 L₁ 与 R₁！也就是说，两组问题唯一的区别就是那 75% 的共同 [$0] 分支。','both',.75,String.raw`L_1=0.25\cdot L_2\oplus0.75\cdot[\$0],\quad R_1=0.25\cdot R_2\oplus0.75\cdot[\$0]`,'原书§3.4代数拆解 · 印刷39页',{focus:'decompose'}),
    scene('独立性公理的刚性要求：两组排序必须同向','若偏好满足独立性，混入同一个 0.75·[$0] 分支绝不能改变比较方向：L₁ 相对 R₁ 的排序必须与 L₂ 相对 R₂ 的排序完全相同。在期望效用下，U(L₁)−U(R₁)=0.25[U(L₂)−U(R₂)]，两者正负号永远一致。','both',.75,String.raw`U(L_1)-U(R_1)=0.25\bigl(U(L_2)-U(R_2)\bigr)\implies(L_1\succeq R_1\iff L_2\succeq R_2)`,'原书§3.4独立性推导 · 印刷39页',{focus:'eu-same'}),
    scene('何时选 (R₁, R₂)：当 v($3000) 高于临界值 0.8','归一化令 v($0)=0、v($4000)=1。若个人对 $3,000 的伯努利效用较高（如 v($3000)=0.85>0.80），则期望效用要求在两组中同时选 R₁ 与 R₂；但只要用同一函数 v，绝不可能一边选 L₁、另一边选 R₂。','both',.85,String.raw`v(\$0)=0,\ v(\$4000)=1:\quad R_2\succ L_2\iff v(\$3000)>0.80\iff R_1\succ L_1`,'原书§3.4条件推演 · 自主归一化展示',{focus:'eu-r'}),
    scene('历史实验数据：7,932 名学生的联合回答表','原书汇总了在线调查中 7,932 名学生的选择：同向组合 (L₁,L₂) 占 20%、(R₁,R₂) 占 31%，合计约 51% 的回答在这两道题上符合期望效用要求；仅凭两题不能断定他们的全部偏好都能用期望效用表示。而最热门的回答恰是交叉组合 (L₁,R₂)，高达 44%（另有 5% 选 R₁,L₂），此冲突即 Allais 悖论。','both',.85,String.raw`\text{同向}:20\%+31\%=51\%;\quad\text{反向}:44\%+5\%=49\%`,'原书表与统计 · 印刷38—39页（历史实验数据，非本站采集）',{focus:'table'}),
    scene('心理机制解释：确定性吸引力 vs 相似概率下的奖金差','原书第39页分析为何 (L₁,R₂) 最普遍（包括本书两位作者自己）：面对 L₂ 与 R₂，多赢 $1,000 的机会不值得去冒失去“确定 $3,000”的风险；面对 L₁ 与 R₁，0.25 与 0.20 看着差不多，但 $4,000 比 $3,000 多很多，注意力转向奖金差而选 L₁。','both',.85,String.raw`R_2\text{ 保住确定性 }[\$3000];\quad L_1\text{ vs }R_1:\ 0.20\approx0.25\text{ 而 }\$4000\gg\$3000`,'原书行为解释 · 印刷39页',{focus:'psychology'}),
    scene('实验方法与理论边界：受试者没有错，单一理论各有局限','实验者通常将两题随机分给不同人群（防止受试者猜出实验意图后刻意保持前后一致），但即使让同一人答两题结果仍相似。原书强调：选 (L₁,R₂) 的人没有任何错，它只说明人类行为常偏离独立性；各种替代偏好模型也至多在部分情境下拟合部分人的行为。','both',.85,String.raw`\text{组间随机分配 }\approx\text{ 同人作答};\quad (L_1,R_2)\text{ 违反独立性而非受试者“犯错”}`,'原书方法论与结论 · 印刷39页',{focus:'method'})
   ]
  }
 };
})();

export function allaisFrame(mode,phase){
 const story=allaisStories[mode];
 if(!story||!Number.isInteger(phase)||phase<0||phase>=story.frames.length)throw Error('3.4 分镜越界');
 const frame=story.frames[phase];
 lottery(allais.L1);lottery(allais.R1);lottery(allais.L2);lottery(allais.R2);
 const {l1FromL2,r1FromR2}=allaisDecompose();
 if(l1FromL2.some((x,i)=>Math.abs(x-allais.L1[i])>1e-12)||r1FromR2.some((x,i)=>Math.abs(x-allais.R1[i])>1e-12)){
  throw Error('Allais 复合分解不一致');
 }
 return frame;
}

export function allaisReadout(frame){
 const eu=allaisEuComparison(frame.v3000);
 const consistent=allais.responses.L1L2+allais.responses.R1R2;
 const paradox=allais.responses.L1R2+allais.responses.R1L2;
 return {...eu,consistent,paradox,responses:allais.responses};
}
