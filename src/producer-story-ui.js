// Chapter 6 Producer Theory film-mode UI renderer
// Visualizes production technologies, profit/output maximization, comparative statics,
// cost functions, AC/MC duality, competitive supply, Robinson Crusoe economy, and social goals

import { producerStories, producerFrame, producerReadout } from './producer-story.mjs';
import { powerP, shiftedP, objectivesP, technologyP, finitePlansP, priceProofP, inverseP, costsP, acP, costStaticsP, factoriesP, firingP, jumpCostP, crusoeP, producerGoalsP } from './producer.mjs';

const pEl = id => document.getElementById(id);
const pInk = '#334b40', pMuted = '#65796e', pRule = '#cbd7cf', pGold = '#a27619', pGreen = '#177468', pPurple = '#7a6594', pRed = '#c35f43';
const pEsc = s => String(s).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
const pNum = (n, d = 2) => (typeof n === 'number' && Number.isFinite(n) ? Number(n.toFixed(d)).toString() : String(n ?? ''));
const pText = (x, y, s, size = 14, color = pInk, anchor = 'start') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${pEsc(s)}</text>`;
const pLine = (a, b, c, d, color = pRule, width = 1, dash = '') => `<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;

export const producerScenarios = [
 { value: 'technology', label: '§6.1 定义6.1 技术、凹性与边际产量' },
 { value: 'objectives', label: '§6.1 四种企业目标与利润/产量权衡' },
 { value: 'output', label: '§6.2 命题6.1 保本边界的最大产量' },
 { value: 'statics', label: '§6.2 命题6.2 价格与技术的比较静态' },
 { value: 'existence', label: '§6.2 命题6.6边界：成本跳跃与最大产量不存在' },
 { value: 'profit', label: '§6.3 命题6.3 最大利润与零投入角点' },
 { value: 'priceproof', label: '§6.3 命题6.4 显示盈利性与两次最优不等式相加' },
 { value: 'techchange', label: '§6.3 图6.2b 技术改善投入产出反而下降' },
 { value: 'firing', label: '§6.3 习题6.3 裁员摩擦成本与劳动需求刚性' },
 { value: 'crusoe', label: '§6.3 习题6.4(a)-(c) 鲁滨逊一体决策最优' },
 { value: 'harmony', label: '§6.3 习题6.4(d)-(g) 两部门分权与市场协调' },
 { value: 'inverse', label: '§6.4 从生产技术推导成本函数与逆映射' },
 { value: 'costs', label: '§6.4 定义6.4 总成本、平均成本与边际成本' },
 { value: 'acproof', label: '§6.4 命题6.5 割线切线与平均成本导数恒等式' },
 { value: 'supply', label: '§6.4 命题6.6—6.7 竞争性供给曲线与停产决策' },
 { value: 'coststatic', label: '§6.4 习题6.1 价格与边际成本变动' },
 { value: 'factories', label: '§6.4 习题6.2 双工厂启用成本与最优分工' },
 { value: 'goals', label: '§6.5 生产者偏好、企业社会责任与目标假说' }
];

function pChart(mode, frame, small) {
 const W = small ? 330 : 640, H = small ? 340 : 370;
 const left = small ? 42 : 55, right = W - (small ? 18 : 35), bottom = H - (small ? 42 : 50), top = small ? 35 : 42;
 const state = frame.state || {};

 let maxX = 12, maxY = 12, minY = 0;
 if (mode === 'technology') { maxX = 12; maxY = 8; }
 else if (['objectives', 'output', 'profit'].includes(mode)) { maxX = 18; maxY = 20; }
 else if (mode === 'statics') {
  const A=state.A ?? 2, p=state.p ?? 2, w=state.w ?? 1;
  const old=shiftedP({A,b:0,p,w}), next=shiftedP({A:state.newA ?? A,b:0,p:state.newP ?? p,w});
  maxX=Math.max(36,old.aOutput,next.aOutput)*1.1;maxY=Math.max(20,w*maxX)*1.05;
 }
 else if (mode === 'priceproof') { maxX = 5; maxY = 8; }
 else if (mode === 'techchange') { maxX = 10; maxY = 6; }
 else if (mode === 'inverse') { maxX = state.kind === 'saturating' ? 2.2 : 6; maxY = 10; }
 else if (mode === 'costs' && state.limit) { maxX = 2.5; maxY = 4; }
 else if (mode === 'costs' && !state.curves && !state.convex) { maxX = 5; maxY = 20; }
 else if (['costs', 'acproof', 'supply'].includes(mode)) { maxX = 10; maxY = 16; }
 else if (mode === 'coststatic') { maxX = 16; maxY = 18; }
 else if (mode === 'factories') { maxX = 6; maxY = 24; }
 else if (mode === 'firing') { maxX = 10; minY = -4; maxY = 2; }
 else if (['crusoe', 'harmony'].includes(mode)) { maxX = 1.1; maxY = 2.0; }
 else if (mode === 'goals') { maxX = 220; minY = -8.5; maxY = 3.0; }
 else if (mode === 'existence') { maxX = 2.5; maxY = 6; }

 const sx = v => left + Math.max(0, Math.min(maxX, v)) / maxX * (right - left);
 const sy = v => bottom - (Math.max(minY, Math.min(maxY, v)) - minY) / (maxY - minY) * (bottom - top);

 let svg = `<rect width="${W}" height="${H}" fill="#fffdf7"/>`;
 svg += pText(W / 2, 24, frame.title, small ? 13 : 15, pInk, 'middle');

 // Grid and axes
 const xSteps = mode === 'goals' ? [0, 50, 100, 150, 196] : mode === 'crusoe' || mode === 'harmony' ? [0, 0.25, 0.5, 0.75, 1.0] : [0, maxX * 0.25, maxX * 0.5, maxX * 0.75, maxX].map(v => Math.round(v * 10) / 10);
 const ySteps = mode === 'firing' ? [-4, -2, 0, 2] : mode === 'goals' ? [-8, -6, -4, -2, 0, 2] : [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map(v => Math.round(v * 10) / 10);

 xSteps.forEach(v => {
  svg += `<path d="M${sx(v)} ${sy(0)}V${sy(maxY)}" stroke="#e6ece2" stroke-width="1"/>`;
  svg += pText(sx(v), sy(0) + 16, pNum(v, 1), small ? 10 : 11, pMuted, 'middle');
 });
 ySteps.forEach(v => {
  if (v !== 0) {
   svg += `<path d="M${sx(0)} ${sy(v)}H${sx(maxX)}" stroke="#e6ece2" stroke-width="1"/>`;
   svg += pText(sx(0) - 6, sy(v) + 4, pNum(v, 1), small ? 10 : 11, pMuted, 'end');
  }
 });

 svg += pLine(sx(0), sy(0), sx(maxX) + 8, sy(0), pInk, 1.5);
 svg += pLine(sx(0), sy(minY), sx(0), sy(maxY) - 8, pInk, 1.5);

 const xLabel = ['crusoe', 'harmony'].includes(mode) ? '休闲 l' : mode === 'goals' ? '保留员工 N' : mode === 'firing' ? '劳动力 a' : ['inverse', 'costs', 'acproof', 'supply', 'coststatic', 'factories', 'existence'].includes(mode) ? '产量 y' : '投入 a';
 const yLabel = mode === 'factories' ? '总成本（元）' : ['acproof','supply'].includes(mode) ? '元／杯' : ['crusoe', 'harmony'].includes(mode) ? '消费 c' : mode === 'goals' ? '年利润 ($M)' : mode === 'firing' ? '利润 / 主观目标' : ['inverse', 'costs', 'acproof', 'supply', 'coststatic', 'factories'].includes(mode) ? '金额 / 成本' : ['technology', 'techchange', 'priceproof'].includes(mode) ? '产出 y' : '收益 / 成本';
 svg += pText(sx(maxX) - 4, sy(0) - 8, xLabel, small ? 11 : 13, pInk, 'end');
 svg += pText(sx(0) + 4, sy(maxY) + 14, yLabel, small ? 10 : 12, pMuted);

 function drawPoint(x, y, label, color = pGreen, r = 6, key = 'pt', hollow = false) {
  const cx = sx(x), cy = sy(y);
  let res = `<circle data-motion="${key}" cx="${cx}" cy="${cy}" r="${r}" fill="${hollow ? '#fffdf7' : color}" stroke="${hollow ? color : '#fffdf7'}" stroke-width="2"/>`;
  if (label) res += pText(cx + 8, cy - 8, label, small ? 11 : 13, color);
  return res;
 }

 function drawCurve(fn, color = pGreen, width = 2, dash = '', x0 = 0, x1 = maxX, N = 80) {
  const pts = [];
  for (let i = 0; i <= N; i++) {
   const x = x0 + (x1 - x0) * i / N;
   const y = fn(x);
   if (Number.isFinite(y) && y >= minY && y <= maxY) pts.push([sx(x), sy(y)]);
  }
  if (pts.length < 2) return '';
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
  return `<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
 }

 if (mode === 'technology') {
  const A = state.A ?? 2, r = state.r ?? 0.5, a = state.a ?? 4;
  const m = powerP(A, r);
  svg += drawCurve(m.f, pGreen, 2.5);
  if (state.tangent) svg += drawCurve(x => m.f(a) + m.mp(a) * (x - a), pGold, 2, '5 4');
  if (state.secant) svg += pLine(sx(0), sy(0), sx(a), sy(m.f(a)), pPurple, 2, '5 4');
  svg += drawPoint(a, m.f(a), `a=${pNum(a)}, y=${pNum(m.f(a))}`, pGreen, 6, 'pt-current');
  if (state.tangent || state.secant) svg += pText(W / 2, H - 10, state.tangent ? '金色：该点的切线' : '紫色：从原点到该点的割线', small ? 11 : 13, pMuted, 'middle');
 } else if (['objectives', 'output', 'profit'].includes(mode)) {
  const p = state.p ?? 2, w = state.w ?? 1, A = state.A ?? 2;
  const f = a => A * (Math.sqrt(a + (state.b ?? 0)) - Math.sqrt(state.b ?? 0));
  const rev = a => p * f(a);
  const cost = a => w * a;
  svg += drawCurve(rev, pGreen, 2.5);
  svg += drawCurve(cost, pRed, 2.0);

  // Profit maximizing point: pf'(a) = w => 2*2*(1/(2*sqrt(a))) = 1 => 2/sqrt(a) = 1 => a = 4
  const model = shiftedP({ A, b: state.b ?? 0, p, w });
  const aStar = model.aProfit;
  // Breakeven output point: pf(a) = wa => p*2*sqrt(a) = wa => a = (2p/w)^2 = 16
  const aBreak = model.aOutput;

  if (mode === 'profit') {
   if(Number.isFinite(state.trial)){
    const a=state.trial;svg+=pLine(sx(a),sy(cost(a)),sx(a),sy(rev(a)),pGold,2,'4 4');
    svg+=drawPoint(a,rev(a),'',pGreen,6,'pt-trial-revenue');svg+=drawPoint(a,cost(a),'',pRed,5,'pt-trial-cost');
    svg+=pText(W/2,H-10,`当前投入 ${pNum(a,2)}；利润 ${pNum(model.profit(a),2)}`,small?10:12,pInk,'middle');
   }
   if(state.showOpt)svg += `<circle data-motion="pt-profit" cx="${sx(aStar)}" cy="${sy(rev(aStar))}" r="10" fill="none" stroke="${pPurple}" stroke-width="2"/>`;
   if (state.tangent && aStar > 0) svg += drawCurve(a => rev(aStar) + w * (a - aStar), pPurple, 1.8, '4 4');
   if (state.compare) svg += drawPoint(aBreak, rev(aBreak), '', pGold, 7, 'pt-output');
  } else if (mode === 'output') {
   svg += drawPoint(aBreak, rev(aBreak), '', pPurple, 7, 'pt-output');
   if(Number.isFinite(state.trial)){
    const a=state.trial;svg+=pLine(sx(a),sy(cost(a)),sx(a),sy(rev(a)),pGold,2,'4 4');
    svg+=drawPoint(a,rev(a),'',pGreen,6,'pt-trial-revenue');
    svg+=drawPoint(a,cost(a),'',pRed,5,'pt-trial-cost');
    svg+=pText(W/2,H-10,`试投入 ${pNum(a,2)}；最大保本投入 ${pNum(aBreak,2)}`,small?10:12,pInk,'middle');
   }else svg+=pText(W/2,H-10,'本例最大保本投入为 0',small?10:12,pInk,'middle');
  } else {
   const result = objectivesP({ A: state.A ?? 2, b: 0, p, w, lower: state.lower ?? 5, minimum: state.minimum ?? 1 });
   const index = { profit: 0, output: 1, floor: 2, coop: 3 }[state.objective] ?? 0;
   const selected = result.rows[index];
   svg += drawPoint(selected.a, rev(selected.a), '', pPurple, 7, 'pt-selected');
   svg += pText(W / 2, H - 10, `本例：${selected.label}，投入 ${pNum(selected.a)}，产出 ${pNum(selected.y)}`, small ? 10 : 12, pPurple, 'middle');
  }
 } else if (mode === 'statics') {
  const A=state.A ?? 2, p=state.p ?? 2, w=state.w ?? 1, newA=state.newA ?? A, newP=state.newP ?? p;
  const old=shiftedP({A,b:0,p,w}), next=shiftedP({A:newA,b:0,p:newP,w});
  svg += drawCurve(a => p * old.f(a), pMuted, 1.5, '4 4');
  svg += drawCurve(a => newP * next.f(a), pGreen, 2.5);
  svg += drawCurve(a => w * a, pRed, 2.0);
  svg += drawPoint(old.aOutput, w * old.aOutput, '', pMuted, 5, 'pt-old');
  svg += drawPoint(next.aOutput, w * next.aOutput, '', pGreen, 7, 'pt-new');
  svg += pText(W / 2, H - 10, `保本投入：原 ${pNum(old.aOutput)} → 新 ${pNum(next.aOutput)}`, small ? 11 : 13, pGreen, 'middle');
 } else if (mode === 'priceproof') {
  const z=priceProofP({p:state.p ?? 1,w:state.w ?? 1,other:state.newPrice ?? 2.1,which:state.which ?? 'w',i:3,j:0});
  finitePlansP.forEach((plan, i) => {
   const isOld=z.before.winners.includes(i),isCurrent=z.after.winners.includes(i);
   if(isOld)svg += drawPoint(plan.a,plan.y,'',pGold,10,`old-plan-${i}`,true);
   svg += drawPoint(plan.a,plan.y,`${i}`,isCurrent?pPurple:pMuted,isCurrent?7:5,`pt-plan-${i}`);
  });
  svg += pText(W / 2, H - 10, `当前工资约 ${pNum(state.newPrice ?? 2.1,4)}；最优方案 ${z.after.winners.join('、')}`, small ? 10 : 12, pInk, 'middle');
 } else if (mode === 'techchange') {
  const z=technologyP({p:state.p ?? 1,w:state.w ?? .29,delta:state.delta ?? .7,kind:state.kind ?? 'early'});
  svg += drawCurve(z.f, pMuted, 2.0, '4 4');
  svg += drawCurve(z.g, pGreen, 2.5);
  svg += drawPoint(z.af, z.yf, '', pMuted, 6, 'pt-old');
  svg += drawPoint(z.ag, z.yg, '', pGreen, 7, 'pt-new');
  svg += pText(W / 2, H - 10, `最优投入：原 ${pNum(z.af)} → 新 ${pNum(z.ag)}`, small ? 11 : 13, pGreen, 'middle');
 } else if (mode === 'inverse') {
  const z = inverseP(state.kind ?? 'sqrt', state.A ?? 2, state.w ?? 1, state.y ?? 2);
  svg += drawCurve(z.C, pGreen, 2.5, '', 0, maxX);
  svg += drawPoint(z.y, z.cost, '', pGreen, 7, 'pt-cost');
  if (state.kind === 'saturating') svg += pLine(sx(z.ceiling), sy(0), sx(z.ceiling), sy(maxY), pMuted, 1.5, '4 4');
  svg += pText(W / 2, H - 10, `产量 ${pNum(z.y)}：投入 ${pNum(z.a)}，成本 ${pNum(z.cost)}`, small ? 10 : 12, pInk, 'middle');
 } else if (mode === 'coststatic') {
  const z=costStaticsP({p:state.p ?? 4,newP:state.effectiveP ?? (state.case==='price' ? state.newP : state.p ?? 4),c:state.c ?? 1,k:state.k ?? 1,F:0,factor:state.effectiveFactor ?? (state.case==='tech' ? state.factor : 1)});
  svg += drawCurve(z.before.AC, pMuted, 1.7, '4 4', .05, maxX);
  svg += drawCurve(z.before.MC, pMuted, 1.7, '4 4', 0, maxX);
  svg += drawCurve(z.after.AC, pGreen, 2.5, '', .05, maxX);
  svg += drawCurve(z.after.MC, pRed, 2.5, '', 0, maxX);
  svg += pLine(sx(0),sy(z.before.p),sx(maxX),sy(z.before.p),pMuted,1.5,'4 4');
  svg += pLine(sx(0),sy(z.after.p),sx(maxX),sy(z.after.p),pPurple,2,'5 5');
  svg += drawPoint(z.after.qProfit,z.after.p,'',pPurple,7,'pt-profit');
  if (z.after.qOutput !== null) svg += drawPoint(z.after.qOutput,z.after.p,'',pGreen,7,'pt-output');
  svg += pText(W/2,H-10,`利润目标 ${pNum(z.after.qProfit)} 杯；产量目标 ${pNum(z.after.qOutput)} 杯`,small?10:12,pInk,'middle');
 } else if (mode === 'acproof') {
  const z=costsP({F:4,c:1,k:1}),y=state.y ?? 1,avg=z.AC(y),marginal=z.MC(y),near=Math.abs(avg-marginal)<1e-7;
  svg += drawCurve(z.AC,pGreen,2.5,'',.3,maxX);
  svg += drawCurve(z.MC,pRed,2.5,'',0,maxX);
  svg += pLine(sx(y),sy(avg),sx(y),sy(marginal),pGold,1.5,'3 3');
  if(near)svg += drawPoint(y,(avg+marginal)/2,'',pGold,7,'pt-current');
  else {svg += drawPoint(y,avg,'',pGreen,7,'pt-average');svg += drawPoint(y,marginal,'',pRed,7,'pt-marginal');}
  svg += pText(W/2,H-10,`产量 ${pNum(y)} 杯：平均 ${pNum(avg)}，边际 ${pNum(marginal)} 元／杯`,small?10:12,pInk,'middle');
 } else if (mode === 'supply') {
  const z=costsP({F:4,c:1,k:1,p:state.p ?? 5}),stage=state.stage ?? 'setup';
  svg += drawCurve(z.AC,pGreen,2.5,'',.3,maxX);
  svg += drawCurve(z.MC,pRed,2.5,'',0,maxX);
  svg += pLine(sx(0),sy(z.p),sx(maxX),sy(z.p),pPurple,2,'5 5');
  svg += pText(sx(maxX)-8,sy(z.p)-8,`售价 ${pNum(z.p)}`,small?10:12,pPurple,'end');
  if(Math.abs(z.p-z.minAC)<1e-10 && stage!=='setup'){
   svg += drawPoint(z.minACAt,z.minAC,'',pGold,7,'pt-tie');
   svg += pText(W/2,H-10,'保本点：利润目标与停产并列',small?10:12,pInk,'middle');
  }else{
   if(stage!=='setup'&&z.qProfit>0)svg += `<g opacity="${state.revealProfit ?? 1}">`+drawPoint(z.qProfit,z.p,'',pPurple,7,'pt-profit')+'</g>';
   if(stage!=='setup'&&stage!=='profit'&&z.qOutput!==null)svg += `<g opacity="${state.revealOutput ?? 1}">`+drawPoint(z.qOutput,z.p,'',pGreen,7,'pt-output')+'</g>';
   if(stage!=='setup'&&z.qOutput===null)svg += pText(W/2,H-10,'任何正产量都亏损：两个目标都停产',small?10:12,pInk,'middle');
  }
 } else if (mode === 'costs') {
  const z = costsP({F:state.F ?? 4,c:state.c ?? 1,k:state.k ?? 1,p:state.p ?? 5});
  if (mode === 'costs' && !state.curves && !state.convex) {
   svg += drawCurve(z.C, pGreen, 2.5, '', .01, maxX);
   svg += drawPoint(0, 0, '', pGreen, 5, 'pt-zero');
   if (z.F > 0) svg += drawPoint(0, z.F, '', pGreen, 5, 'pt-open', true);
   if(Number.isFinite(state.trial)){
    const y=state.trial;svg+=pLine(sx(y),sy(0),sx(y),sy(z.C(y)),pGold,1.5,'4 4');
    svg+=drawPoint(y,z.C(y),'',pGreen,7,'pt-total-current');
    svg+=pText(W/2,H-10,`做 ${pNum(y,2)} 杯：总成本 ${pNum(z.C(y),2)} 元`,small?10:12,pInk,'middle');
   }
  } else {
   svg += drawCurve(z.AC, pGreen, 2.5, '', .05, maxX);
   svg += drawCurve(z.MC, pRed, 2.5, '', 0, maxX);
   if (z.F > 0) svg += drawPoint(z.minACAt, z.minAC, '', pGold, 7, 'pt-min-ac');
   if (state.limit) {
    const y=state.y;
    svg += pLine(sx(y),sy(z.AC(y)),sx(y),sy(z.MC(y)),pMuted,1.5,'4 3');
    svg += drawPoint(y,z.AC(y),'',pGreen,6,'pt-limit-ac');
    svg += drawPoint(y,z.MC(y),'',pRed,6,'pt-limit-mc');
    svg += drawPoint(0,z.MC(0),'',pGold,5,'pt-mc-zero');
    svg += pText(W/2,H-10,`正产量 ${pNum(y,3)} 杯；零点边际成本 1 元／杯`,small?10:12,pInk,'middle');
   }
   if (mode === 'supply') {
    svg += pLine(sx(0), sy(z.p), sx(maxX), sy(z.p), pPurple, 2, '5 5');
    svg += pText(sx(maxX) - 8, sy(z.p) - 8, `价格 ${pNum(z.p)}`, small ? 10 : 12, pPurple, 'end');
    if (mode === 'supply') {
     if (state.goal !== 'profit' && z.qOutput !== null) svg += drawPoint(z.qOutput, z.p, '', pGreen, 7, 'pt-output');
     if (state.goal !== 'output' && z.qProfit > 0) svg += drawPoint(z.qProfit, z.p, '', pPurple, 7, 'pt-profit');
     svg += pText(W / 2, H - 10, `利润目标 ${pNum(z.qProfit)}；产量目标 ${pNum(z.qOutput)}`, small ? 10 : 12, pInk, 'middle');
    }
   }
  }
 } else if (mode === 'factories') {
  const k=state.k ?? 2,y=state.y ?? 1,z=factoriesP(y,k,.5),threshold=z.threshold;
  svg += drawCurve(x=>factoriesP(x,k,.5).one,pPurple,2,'4 4',.01,maxX);
  svg += drawCurve(x=>factoriesP(x,k,.5).two,pRed,2,'4 4',.01,maxX);
  svg += drawCurve(z.C,pGreen,3,'',.01,maxX);
  svg += drawPoint(0,0,'',pGreen,5,'pt-zero');
  svg += drawPoint(0,k,'',pPurple,5,'pt-one-limit',true);
  svg += drawPoint(0,2*k,'',pRed,5,'pt-two-limit',true);
  if(y>0){
   svg += pLine(sx(y),sy(z.one),sx(y),sy(z.two),pGold,1.5,'3 3');
   if(Math.abs(y-threshold)<1e-7)svg += drawPoint(y,z.one,'',pGold,7,'pt-tie');
   else {svg += drawPoint(y,z.cost,'',pGreen,10,'pt-min',true);svg += drawPoint(y,z.one,'',pPurple,6,'pt-one');svg += drawPoint(y,z.two,'',pRed,6,'pt-two');}
  }
  svg += pText(W/2,H-10,y===0?'0杯不开厂，空心点是右侧极限':`产量 ${pNum(y)} 杯；一家 ${pNum(z.one)} 元，两家 ${pNum(z.two)} 元`,small?10:12,pInk,'middle');
 } else if (mode === 'firing') {
  const z=firingP({A:state.A ?? 2,b:state.b ?? 0,p:state.p ?? 1,w:state.w ?? 1,a0:state.a0 ?? 4,loss:state.loss ?? .6});
  svg += drawCurve(z.m.profit, pMuted, 2.0, '4 4');
  svg += drawCurve(z.subjective, pGreen, 2.5);
  svg += drawPoint(z.ordinary, z.m.profit(z.ordinary), '', pMuted, 6, 'pt-free');
  svg += drawPoint(z.chosen, z.subjective(z.chosen), '', pGreen, 7, 'pt-fric');
  svg += pText(W / 2, H - 10, `雇用：只看现金 ${pNum(z.ordinary)}；计入裁员成本 ${pNum(z.chosen)}`, small ? 10 : 12, pMuted, 'middle');
 } else if (['crusoe', 'harmony'].includes(mode)) {
  const z=crusoeP({A:state.A ?? 1,r:state.r ?? .5,theta:state.theta ?? 1,leisure:state.leisure ?? .5,w:state.w ?? 1,goal:state.goal ?? 'profit'});
  svg += drawCurve(z.frontier, pGreen, 2.5, '', 0, 1);
  if (mode === 'crusoe') {
   svg += drawPoint(z.leisure, z.currentC, '', pPurple, 7, 'pt-crusoe-current');
   svg += drawCurve(l => l > 0 ? z.currentU / l ** (state.theta ?? 1) : NaN, pPurple, 2.0, '4 4', .05, 1);
   svg += pText(W / 2, H - 10, `当前休闲 ${pNum(z.leisure)}；最优休闲 ${pNum(z.lStar)}`, small ? 11 : 13, pMuted, 'middle');
  } else {
   svg += drawCurve(l => z.w * (1 - l) + z.profit, pPurple, 2.0, '4 4', 0, 1);
   svg += drawPoint(z.lConsumer, z.cConsumer, '', pPurple, 8, 'pt-consumer');
   if (z.firmX <= 1) svg += drawPoint(1-z.firmX, z.firmY, '', pGreen, 5, 'pt-firm', true);
   svg += pText(W / 2, H - 10, `劳动供给 ${pNum(z.laborSupply)}；企业需求 ${pNum(z.firmX)}`, small ? 10 : 12, pMuted, 'middle');
  }
 } else if (mode === 'goals') {
  const z=producerGoalsP(state.lambda ?? 0);
  z.plans.forEach((plan,i) => {
   const selected=z.winners.includes(plan);
   svg += drawPoint(plan.N,plan.profit,'',selected?pPurple:pMuted,selected?8:5,`pt-goal-${i}`);
  });
  svg += pText(W/2,H-10,`本例选留 ${z.winners.map(x=>x.N).join('或')} 人；纵轴为预计利润`,small?10:12,pInk,'middle');
 } else if (mode === 'existence') {
  const J = state.J ?? 2, y=state.y ?? .5, z=jumpCostP(J,y);
  const rev = y => 2 * y;
  svg += drawCurve(rev, pGreen, 2.0, '', 0, 2.5);
  svg += drawCurve(y => y * y, pRed, 2.0, '', 0, 0.99);
  svg += drawCurve(y => y * y + J, pRed, 2.0, '', 1.0, 2.5);
  svg += drawPoint(1.0, 1.0, '', pRed, 5, 'pt-jump-hole', true);
  svg += drawPoint(1.0, 1.0+J, '', pRed, 5, 'pt-jump');
  svg += pLine(sx(y),sy(z.C(y)),sx(y),sy(rev(y)),pGold,1.5,'4 3');
  svg += drawPoint(y,rev(y),'',pGreen,7,'pt-revenue');
  svg += drawPoint(y,z.C(y),'',pRed,7,'pt-cost');
  svg += pText(W/2,H-10,`尝试 ${pNum(y,4)} 杯：${z.feasible?'不亏钱':'亏损'}`,small?10:12,pInk,'middle');
 }

 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${pEsc(frame.title)}图解" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

export const producerProofs = {
 technology: String.raw`<details class="sd-proof" open><summary>定义6.1：先区分一般条件与例子</summary><ol>
<li><strong>原点无免费午餐</strong>：<span class="equation">f(0) = 0</span> 且 <span class="equation">f</span> 连续，保证不投入任何资源无法凭空创造产出。</li>
<li><strong>非递减性</strong>：若投入增加，产出绝不减少，即当 <span class="equation">a_1 \le a_2</span> 时有 <span class="equation">f(a_1) \le f(a_2)</span>。</li>
<li><strong>凹性（边际报酬不增）</strong>：对任意两投入组合及 <span class="equation">\lambda \in [0,1]</span>，有 <span class="equation">f(\lambda a_1 + (1-\lambda) a_2) \ge \lambda f(a_1) + (1-\lambda) f(a_2)</span>。当二阶导存在时等价于 <span class="equation">f''(a) \le 0</span>。</li>
<li><strong>远端单单位增产趋零</strong>：<span class="equation">\lim_{a \to \infty} [f(a+1) - f(a)] = 0</span>。对本章的非递减凹函数，这是教材所述“任意小正数都能超过某处单位增量”的等价表述。利润最大值存在还需投入价格等条件。</li>
</ol></details>`,

 objectives: String.raw`<details class="sd-proof" open><summary>四种生产目标的决策方程与拉格朗日比较</summary><ol>
<li><strong>先看价格是不是由店主决定</strong>：本章假设生产者接受市场给定的投入和产出价格。小摊增减产量也不改变价格；若企业足够大、自己的产量会影响售价，就需要换成另一种模型。</li>
<li><strong>利润最大化目标</strong>：<span class="equation">\max pf(a) - wa</span>。一阶必要内点条件为 <span class="equation">p f'(a^*) = w</span>，即投入的边际产出价值等于投入价格。</li>
<li><strong>保本产量最大化</strong>：<span class="equation">\max_{a\ge0} f(a)\text{ s.t. }pf(a)\ge wa</span>。本例存在正的保本最右边界；一般先检查正产量可行性与最优解存在性。</li>
<li><strong>最低产量约束利润最大化</strong>：先检查最低产量可达，再在满足 <span class="equation">f(a)\ge\bar{y}</span> 的投入中比较利润。本例的严格递增技术可用反函数求边界。</li>
<li><strong>合作社人均净收益目标</strong>：<span class="equation">\max_{a>0}\frac{pf(a)-wa}{a}</span>。本图额外给定最少一名成员；没有最小人数限制时，最大值未必取得。</li>
</ol></details>`,

 output: String.raw`<details class="sd-proof" open><summary>命题6.1 产量最大化保本边界严格证明</summary><ol>
<li><strong>可行集紧性与非空性</strong>：因为 <span class="equation">f(0) = 0</span>，零投入 <span class="equation">a=0</span> 始终满足 <span class="equation">pf(0) \ge w\cdot 0</span>，故保本集非空。</li>
<li><strong>大投入亏损排除</strong>：在本章正价格 <span class="equation">p>0,\ w>0</span> 下，定义6.1的非递减、凹性与远端单位增量趋零共同推出 <span class="equation">f(a)/a\to0</span>；因此充分大的投入亏损，可行投入集有界且闭。</li>
<li><strong>连续函数紧集极值</strong>：连续函数在紧集上必达到最大值，且最右边界点满足零利润方程 <span class="equation">pf(\bar{a}) = w\bar{a}</span>。书中进一步要求严格凹性，得到全亏损时选零、否则选唯一正保本投入。</li>
<li><strong>不严格凹时要小心</strong>：自主反例 <span class="equation">f(a)=\min\{a,1\},\ p=10,\ w=1</span>。投入1至10都能达到最大产量1，投入1时利润是9而非零；最右保本点仍是10，但不是唯一的产量最优选择。</li>
</ol></details>`,

 statics: String.raw`<details class="sd-proof" open><summary>命题6.2 产量目标比较静态：可行集单调扩张</summary><ol>
<li><strong>投入价格下降</strong>：设 <span class="equation">w' < w</span>。对每个旧的非亏损投入 <span class="equation">a\ge0</span>，都有 <span class="equation">pf(a)\ge wa\ge w'a</span>。旧可行集包含于新可行集；零投入处可取等号。</li>
<li><strong>产出价格上升</strong>：若 <span class="equation">p'>p</span> 且 <span class="equation">f(a)\ge0</span>，则 <span class="equation">p'f(a)\ge pf(a)\ge wa</span>，旧可行投入仍可行。</li>
<li><strong>技术逐点不下降</strong>：若 <span class="equation">g(a)\ge f(a)</span>，则旧的非亏损投入仍可行，最大产出和最右侧可行投入不减；可行集包含不必是严格包含。</li>
<li><strong>投入有平局时</strong>：教材命题6.2明确写旧技术严格凹，但没有明确写新技术也严格凹。自主反例取 <span class="equation">f(a)=1-e^{-a},\ g(a)=\min\{2a,1\},\ p=1,\ w=0.1</span>。新技术逐点不低于旧技术；旧技术下投入5仍可行，而新技术投入0.5就可达到最大产出1。新技术的产量最优投入不唯一，因此比较所选投入时可补充新技术严格凹，或约定选最右侧可行投入。最大产出不减不依赖这个平局规则。</li>
</ol></details>`,

 profit: String.raw`<details class="sd-proof" open><summary>命题6.3 利润最大化内点与停产角点综合证明</summary><ol>
<li><strong>先列本例的账</strong>：投入 <span class="equation">a\ge0</span>，收入 <span class="equation">R(a)=4\sqrt a</span>，成本 <span class="equation">C(a)=a</span>，所以 <span class="equation">\pi(a)=4\sqrt a-a</span>。正投入处求导得 <span class="equation">\pi'(a)=2/\sqrt a-1</span>，令其为零得 <span class="equation">a=4</span>。</li>
<li><strong>再核对是否真是最大</strong>：本例利润函数严格凹，正内点 <span class="equation">a=4</span> 是全局最大，利润4元；停产利润0元，投入16时利润也为0。不能因为收入更高，就认定利润更高。</li>
<li><strong>正内点条件</strong>：在正投入内点可导时，一阶必要条件为 <span class="equation">pf'(a^*)-w=0</span>；凹目标下它也是全局最优的充分条件。严格凹性可进一步保证唯一性。</li>
<li><strong>零投入角点</strong>：若有限右导数满足 <span class="equation">p f'_+(0) \le w</span>，凹性保证零投入是一个最优选择；要断言它唯一或所有正投入严格亏损，还需严格性等条件。</li>
</ol></details>`,

 priceproof: String.raw`<details class="sd-proof" open><summary>做题：两次最优选择怎么相加？</summary><ol>
<li><strong>先看例子：</strong>旧工资1时，方案A利润3，方案B利润0；新工资2.1时，B利润0，A利润−0.3。旧价下用旧价算，新价下用新价算。工资等于2时，方案0、1、3都并列，不要只保留一个。</li>
<li><strong>旧价格最优性</strong>：在价格 <span class="equation">(p, w)</span> 下，最优计划 <span class="equation">A=(a_1, y_1)</span> 的利润不低于 <span class="equation">B=(a_2, y_2)</span>：
<span class="equation">py_1 - wa_1 \ge py_2 - wa_2 \implies p(y_1 - y_2) - w(a_1 - a_2) \ge 0</span></li>
<li><strong>新价格最优性</strong>：在价格 <span class="equation">(p', w')</span> 下，最优计划 <span class="equation">B</span> 的利润不低于 <span class="equation">A</span>：
<span class="equation">p'y_2 - w'a_2 \ge p'y_1 - w'a_1 \implies p'(y_2 - y_1) - w'(a_2 - a_1) \ge 0</span></li>
<li><strong>两式相加抵消公共项</strong>：将上述两式同向相加：
<span class="equation">(p' - p)(y_2 - y_1) - (w' - w)(a_2 - a_1) \ge 0</span></li>
<li><strong>单价格变化推论</strong>：
若仅工资变动（<span class="equation">p'=p, w'>w</span>），则 <span class="equation">-(w' - w)(a_2 - a_1) \ge 0 \implies a_2 \le a_1</span>（劳动需求不增）。
若仅产出价格上涨（<span class="equation">p'>p, w'=w</span>），则 <span class="equation">(p' - p)(y_2 - y_1) \ge 0 \implies y_2 \ge y_1</span>（产品供给不减）。若生产函数非递减且投入价格为正，还能推出 <span class="equation">a_2\ge a_1</span>：否则较小投入却不能有更少产量，只能产量相等；此时原价格下较小投入成本更低，与原方案最优矛盾。反过来，产出价格下降时最优投入不增。两个价格同时变化时，不能不加条件地单独推出某个投入或产出方向。两次比较的可行方案集合要相同，最优解也必须存在。</li>
</ol></details>`,

 techchange: String.raw`<details class="sd-proof" open><summary>图6.2b 技术整体提升但投入产出反而下降反例分析</summary><ol>
<li><strong>反例构造</strong>：旧技术 <span class="equation">f(a) = \sqrt{a}</span>；新技术 <span class="equation">g(a) = \sqrt{a} + \delta a e^{-a}</span>（取 <span class="equation">\delta = 0.7</span>）。显然对任意 <span class="equation">a > 0</span>，<span class="equation">g(a) > f(a)</span>，新技术整体严格更优。</li>
<li><strong>边际产出局部下降</strong>：新技术导数为 <span class="equation">g'(a) = \frac{1}{2\sqrt{a}} + \delta (1-a)e^{-a}</span>。当 <span class="equation">a > 1</span> 时，<span class="equation">1-a < 0</span>，额外增量产生负导数修正，导致局部边际产出低于旧技术：<span class="equation">g'(a) < f'(a)</span>。</li>
<li><strong>自主数值反例</strong>：当 <span class="equation">w=0.29, p=1</span> 时，模型计算旧技术选择 <span class="equation">a_f \approx 2.97, y_f \approx 1.72</span>；新技术选择 <span class="equation">a_g \approx 1.73, y_g \approx 1.53</span>。最大利润约从0.862增至1.028。数值不是教材原题数据。</li>
<li><strong>再看充分条件</strong>：最后换为 <span class="equation">g(a)=1.7\sqrt a</span>，其正投入边际产出不低于旧技术；本例最优投入约为8.59。一般推论可结合两技术在零点相同、正投入处可导和严格凹、价格为正且最优解存在等条件；它们是一组充分条件，不是唯一可能条件。</li>
</ol></details>`,

 inverse: String.raw`<details class="sd-proof" open><summary>做题：从订单反推原料和成本</summary><ol>
<li><strong>先写条件：</strong>一种投入，单位价格 <span class="equation">w>0</span>，没有其他成本；技术严格递增，目标产量可达到。此时最少投入为 <span class="equation">a=f^{-1}(y)</span>，成本为 <span class="equation">C(y)=wf^{-1}(y)</span>。</li>
<li><strong>代入本例：</strong> <span class="equation">y=2\sqrt a</span> 两边平方得 <span class="equation">a=(y/2)^2</span>。每单位原料1元，所以 <span class="equation">C(y)=y^2/4</span>；例如2杯成本1元，3杯成本2.25元。</li>
<li><strong>检查范围：</strong>不同技术的可达产量不同。自主对照 <span class="equation">y=2(1-e^{-a})</span> 在有限非负投入下只能达到 <span class="equation">0\le y<2</span>；不能把2杯代入其有限成本。</li>
<li><strong>凸性证明：</strong>另外若生产函数凹，对任意两项可达产量 <span class="equation">y_1,y_2</span> 及相应最小投入 <span class="equation">a_1,a_2</span>：
<span class="equation">f(\lambda a_1 + (1-\lambda)a_2) \ge \lambda f(a_1) + (1-\lambda)f(a_2) = \lambda y_1 + (1-\lambda)y_2</span>
其中 <span class="equation">0\le\lambda\le1</span>。生产混合产量所需的最小投入不超过 <span class="equation">\lambda a_1+(1-\lambda)a_2</span>；乘以正投入价格即得 <span class="equation">C(\lambda y_1+(1-\lambda)y_2)\le\lambda C(y_1)+(1-\lambda)C(y_2)</span>。这是在上述可达范围内的凸性。</li>
</ol></details>`,

 costs: String.raw`<details class="sd-proof" open><summary>做题：先分清总成本、平均成本和边际成本</summary><ol>
<li><strong>先看题设：</strong>这个自主例子中，只有开工才付启动费 <span class="equation">F</span>；正产量时 <span class="equation">C(y)=F+cy+\frac{1}{2}ky^2</span>，停产时 <span class="equation">C(0)=0</span>。第一、二幅取 <span class="equation">F=4,c=1,k=1</span>；第三幅把 <span class="equation">F</span> 改为0。</li>
<li><strong>平均和边际：</strong>只对 <span class="equation">y>0</span>，平均成本是 <span class="equation">AC(y)=\frac{F}{y}+c+\frac{1}{2}ky</span>；本例正产量边际成本是 <span class="equation">MC(y)=c+ky</span>。零产量的平均成本没有定义。</li>
<li><strong>先判断，再推广：</strong>本例 <span class="equation">F>0,k>0</span> 时，启动费随产量分摊，平均成本先降后升；这并不是所有带固定成本的函数都一定呈U形。教材命题6.5a还说明：当 <span class="equation">C(0)=0</span> 且成本函数凸时，平均成本不下降。</li>
<li><strong>接近零时：</strong>如果无固定成本、<span class="equation">C(0)=0</span> 且在零点有右导数，那么 <span class="equation">\lim_{y\to0^+}AC(y)=C'_+(0)=MC(0)</span>。这里说的是正产量平均成本的极限，不是给零产量定义平均成本。</li>
</ol></details>`,

 acproof: String.raw`<details class="sd-proof" open><summary>做题：平均成本何时升、何时降？</summary><ol>
<li><strong>先列成本：</strong>本例启动费用可避免，停产成本为零；做正数量时总成本为下式。产量可以连续变化，数字是自主举例。<div class="equation">C(y)=4+y+\frac{y^2}{2},\quad y>0</div></li>
<li><strong>分清两笔账：</strong>平均成本是总成本除以杯数；边际成本是当前产量附近多做极少一点时的单位增量成本。<div class="equation">AC(y)=\frac4y+1+\frac y2,\quad MC(y)=1+y</div>边际成本是导数，通常不等于从整数杯数多做整整一杯的成本差。</li>
<li><strong>判断方向：</strong>对平均成本求导，正产量时分母为正，所以符号由边际成本与平均成本的差决定。<div class="equation">AC'(y)=\frac{MC(y)-AC(y)}y</div>边际低于平均，平均下降；边际高于平均，平均上升。</li>
<li><strong>求本例最低：</strong>令两者相等得正解，检查其左侧边际低、右侧边际高，所以这是本例的全局最低点。<div class="equation">1+y=\frac4y+1+\frac y2,\quad y=\sqrt8</div>一般情形下，等号只给出驻点；还要比较边界和其他候选。</li>
<li><strong>教材条件：</strong>命题6.5在无固定成本的设定下陈述；本图有可避免的启动成本，是该正产量导数恒等式的自主延伸。停产点不能代入平均成本。</li>
</ol></details>`,

 supply: String.raw`<details class="sd-proof" open><summary>做题：先认目标，再算停产与保本</summary><ol>
<li><strong>写清条件：</strong>本例正产量总成本为下式，停产成本为0，售价5元／杯；启动费用只有开摊才发生。<div class="equation">C(y)=4+y+\frac{y^2}{2}\quad(y>0),\qquad C(0)=0</div></li>
<li><strong>利润目标：</strong>正产量利润为收入减成本。本例利润函数在正产量区间是凹的；先解边际成本等于价格，再与停产利润比较。<div class="equation">MC(y)=1+y=5,\quad y_{\pi}=4,\quad \pi(4)=4>\pi(0)=0</div></li>
<li><strong>产量目标：</strong>先找不亏损的产量，再取最大的。此例解出两个保本点，右边是最大产量。<div class="equation">AC(y)=5\iff y=4\pm\sqrt8,\quad y_{\text{产量}}=4+\sqrt8</div></li>
<li><strong>检查临界价格：</strong>最低平均成本为1+√8。高于它时本例有正利润；等于它时，利润目标在停产与正产量间并列，而产量目标选正产量；低于它两者都停产。</li>
<li><strong>推广要查什么：</strong>固定成本是否能通过停产避免、价格是否给定、成本是否连续以及最优值是否存在，都要先核对。教材命题6.7的凸且可微成本假设与这里正产量含启动费用的例子不同；这里通过直接比较利润验证。书中图6.5(b)的平均成本画成先降后升，而全域凸且 <span class="equation">C(0)=0</span> 的成本函数，其平均成本不会下降；图形与命题条件要分开看。</li>
<li><strong>找不到保本交点不等于一定停产：</strong>教材命题6.6没有明确补充成本连续或最大值存在条件。允许内部跳跃时，可能存在正的非亏损产量却没有最大的那个；应先检查可行集与最优值，参见同节“成本跳跃”自主反例。</li>
</ol></details>`,

 coststatic: String.raw`<details class="sd-proof" open><summary>做题：价格或成本变化时怎么比较？</summary><ol>
<li><strong>先认目标，再算本例：</strong>利润目标比较 <span class="equation">py-C(y)</span>，本例正内点满足 <span class="equation">MC=p</span>；产量目标找不亏钱的最右产量，本例正边界满足 <span class="equation">AC=p</span>。原成本 <span class="equation">C=y+y^2/2</span>，售价4时分别为3杯与6杯。</li>
<li><strong>价格上涨的一般比较：</strong>令原、新利润最优产量为 <span class="equation">y,y'</span>，将两次最优性不等式相加，得到 <span class="equation">(p'-p)(y'-y)\ge0</span>。所以当价格严格上涨，新利润最优产量不低于旧产量；产量目标则因为非亏损集合扩大而不下降。还须考虑停产和最优解是否存在。</li>
<li><strong>边际成本下降：</strong>若两种技术的成本从零开始且绝对连续、边际成本可积（即成本变化可由边际成本累加得到），并且每个正产量处新边际成本严格降低，累计节省的成本随产量严格增加；不亏损集合扩大，而比较利润最优条件可得新利润最优产量不低于旧值。本例价格恢复4元后将成本减半，分别得7杯和14杯。</li>
<li><strong>别漏掉启动费：</strong>若新技术的可避免启动费同时变大，边际成本下降未必让企业多生产。例如本例原利润最优是3杯；新可变成本虽减半，若每次开工另付100元，最优改为停产。条件不足时不能直接套结论。</li>
</ol></details>`,

 factories: String.raw`<details class="sd-proof" open><summary>做题：怎么判断开一家还是两家？</summary><ol>
<li><strong>写题设：</strong>两家生产函数都是投入的平方根，单位投入1元，每家启用费为正数k；不用的工厂不收启动费，零产量可两家都不开。</li>
<li><strong>先算一家：</strong>生产y需要投入y²，因此正产量时一家总成本为下式。<div class="equation">C_1(y)=k+y^2\quad(y>0)</div></li>
<li><strong>再算两家：</strong>两厂总产量为y，分别做y₁、y₂。平方项在均分时最小；正产量时均分使两家产量都为正。<div class="equation">y_1^2+y_2^2=\frac{y^2+(y_1-y_2)^2}{2}\ge\frac{y^2}{2}</div><div class="equation">C_2(y)=2k+\frac{y^2}{2}\quad(y>0)</div></li>
<li><strong>比较两笔账：</strong>令两式相等得到门槛；低于门槛开一家，高于门槛两家均分，恰好相等时并列。<div class="equation">k+y^2=2k+\frac{y^2}{2},\quad y=\sqrt{2k}</div></li>
<li><strong>检查零产量：</strong>不开厂成本为零；两条正产量成本曲线在零右侧的极限分别是k和2k，它们不是C(0)。</li>
</ol></details>`,

 firing: String.raw`<details class="sd-proof" open><summary>做题：裁员代价如何改变选择？</summary><ol>
<li><strong>先写两笔账：</strong>现金利润是 <span class="equation">pf(a)-wa</span>；计入每单位裁员的主观代价 <span class="equation">\ell</span> 后，目标是 <span class="equation">U(a)=pf(a)-wa-\ell\max\{a_0-a,0\}</span>。这里的代价是老板主观感受，不一定是实际现金支出。</li>
<li><strong>分段找候选：</strong>在 <span class="equation">0&lt;a&lt;a_0</span> 的可导内点，条件是 <span class="equation">pf'(a)=w-\ell</span>；在 <span class="equation">a>a_0</span> 的可导内点，条件是 <span class="equation">pf'(a)=w</span>。还要检查 <span class="equation">a=0</span>、<span class="equation">a=a_0</span> 及其他边界；方程无解时不能强行套用。</li>
<li><strong>本例怎么算：</strong> <span class="equation">p=w=1,\ f(a)=2\sqrt a,\ a_0=4</span>。不计代价时最优为1；代价0.3时内点为 <span class="equation">1/(1-0.3)^2\approx2.04</span>。劳动力连续是模型假设。</li>
<li><strong>何时保留原编制：</strong>若目标凹且在正的 <span class="equation">a_0</span> 两侧可导，<span class="equation">w-\ell\le pf'(a_0)\le w</span> 使左侧斜率非负、右侧非正；原编制最优。等号或非严格凹时还要检查并列解。本例 <span class="equation">pf'(4)=0.5</span>，代价达到0.5后保留4单位最优。</li>
</ol></details>`,

 crusoe: String.raw`<details class="sd-proof" open><summary>习题6.4(a)-(c) 鲁滨逊经济一体决策全局最优求解</summary><ol>
<li><strong>生产边界约束</strong>：总时间归一化为 1。休闲为 <span class="equation">l</span>，劳动时间为 <span class="equation">1-l</span>。消费最多等于产出：<span class="equation">c \le f(1-l) = A(1-l)^r</span>。</li>
<li><strong>效用极大化问题</strong>：<span class="equation">\max_{0 \le l \le 1} l^\theta \cdot A(1-l)^r</span>。</li>
<li><strong>一阶导数与封闭解</strong>：对对数目标 <span class="equation">\theta \ln l + \ln A + r \ln(1-l)</span> 求导并置零：
<span class="equation">\frac{\theta}{l} - \frac{r}{1-l} = 0 \implies \theta(1-l) = rl \implies l^* = \frac{\theta}{\theta + r}</span>
对应最优消费为 <span class="equation">c^* = A\left(\frac{r}{\theta + r}\right)^r</span>。内点切线处满足边际替代率等于边际产出：<span class="equation">MRS_{l,c} = f'(1-l)</span>。</li>
</ol></details>`,

 harmony: String.raw`<details class="sd-proof" open><summary>习题6.4(d)-(g) 部门分权与第一福利定理微观协调证明</summary><ol>
<li><strong>生产部门利润最大化</strong>：给定外生工资 <span class="equation">w</span>，选择投入最大化 <span class="equation">f(x)-wx</span>；在可导正内点才使用 <span class="equation">f'(x)=w</span>，并向家庭部门派发利润 <span class="equation">\pi=f(x)-wx</span>。</li>
<li><strong>消费部门效用最大化</strong>：家庭部门预算为 <span class="equation">c = w(1-l) + \pi</span>。求解内点切点给出 <span class="equation">MRS_{l,c} = \frac{\theta c}{l} = w</span>。</li>
<li><strong>市场出清与一体最优等价性</strong>：当劳动力市场出清时 <span class="equation">x = 1-l</span>，消费恰等于产出 <span class="equation">c = f(x)</span>。将两者结合：
<span class="equation">MRS_{l,c} = w = f'(1-l)</span>
在原题的函数例子中，两部门的协调配置与一体化最优一致；一般论证仍需检查偏好、技术、价格和内点条件。</li>
</ol></details>`,

 goals: String.raw`<details class="sd-proof" open><summary>§6.5 生产者偏好、企业社会责任与目标假说反思</summary><ol>
<li><strong>七离散方案权衡</strong>：教材第75页开篇展示快递公司在衰退期的7个可行方案。纯利润最大化对应留100人（裁96人），利润200万美元；不裁员（留196人）利润降至40万美元。</li>
<li><strong>自主权衡例子</strong>：用 <span class="equation">U = \pi - \lambda (196 - N)</span> 表示考虑裁员人数的偏好，逐一比较七个方案。这里的得分和权重不是教材给定数据，也不是现金支出。<span class="equation">\lambda</span> 增加时，最优留用人数弱不下降；并列方案都应保留。</li>
<li><strong>做题先比较，再找分界</strong>：留100人与144人得分相等时，<span class="equation">2-96\lambda=1.6-52\lambda</span>，所以 <span class="equation">\lambda=0.4/44</span>。留144、170和196人的得分在 <span class="equation">\lambda=1.2/52</span> 时相等。还须比较其他方案，不能只看两条得分相等就断言它们最优。</li>
<li><strong>为什么留用人数不会减少？</strong>把较低权重下的最优人数记为 <span class="equation">N_1</span>，较高权重下记为 <span class="equation">N_2</span>。各自最优的不等式相加后得到 <span class="equation">(\lambda_2-\lambda_1)(N_2-N_1)\ge0</span>；权重严格增加时，<span class="equation">N_2\ge N_1</span>。这是自主账本的结论，并非要求所有企业都采用这种偏好。</li>
<li><strong>“应该”还是“实际上”？</strong>规范说法是“企业应该追求利润”；描述说法是“企业实际上倾向追求利润”；分析上的理由是“这个假设便于研究”。三者不是同一句话。教材报告不同学科学生选择有差异，但差异本身不能证明原因是入学前自我选择还是学习经历。</li>
<li><strong>原书文字与表格</strong>：第85页把不裁员描述成“放弃所有利润”，但第75页的预测表仍给出40万美元利润；本图按预测表计算。</li>
</ol></details>`,

 existence: String.raw`<details class="sd-proof" open><summary>命题6.6正则性边界与半开可行区间上确界反例</summary><ol>
<li><strong>反例设定</strong>：成本函数在 <span class="equation">y=1</span> 处跳升：<span class="equation">y < 1</span> 时 <span class="equation">C(y) = y^2</span>；<span class="equation">y \ge 1</span> 时 <span class="equation">C(y) = y^2 + 2</span>。</li>
<li><strong>保本区间分析</strong>：在价格 <span class="equation">p=2</span> 下，当 <span class="equation">0&lt;y&lt;1</span> 时，利润 <span class="equation">\pi(y) = 2y - y^2 > 0</span>；零产量利润为0。当 <span class="equation">y \ge 1</span> 时，跳跃使利润 <span class="equation">\pi(y) = 2y - y^2 - 2 \le -1 < 0</span>。保本区间恰为半开区间 <span class="equation">[0, 1)</span>。</li>
<li><strong>最大值不存在：</strong>任取可行产量 <span class="equation">y<1</span>，还可以选 <span class="equation">(1+y)/2</span>，它更大但仍不到1，仍然不亏钱；而1杯本身亏损。因此上确界为1，最大值不存在。</li>
<li><strong>使用结论前：</strong>要先确认所求最大值存在；例如正产量处成本连续、非亏损集合有界是一组足以保证最大值存在的条件，并非唯一可能。教材定义允许成本跳跃，不能只凭“没找到正的保本交点”就断言最优产量为0。</li>
</ol></details>`
};

export function renderProducerStory(meta, requested, phase = 0) {
 const mode = requested && producerStories[requested] ? requested : (meta.scenarios?.[0]?.value || 'technology');
 const story = producerStories[mode] || producerStories.technology;
 const pIdx = Math.max(0, Math.min(story.frames.length - 1, Number(phase) || 0));
 const frame = producerFrame(mode, pIdx);
 const readout = producerReadout(mode, frame);
 const plot = pEl('plot');
 const small = plot.clientWidth < 500;

 const guides=['先看题设：启动费用、成本函数和数量能否连续。','追踪同一产量下平均成本和边际成本的高低。','相等只是驻点；再看两侧及其他产量，判断是否最低。'];
 const supplyGuides=['先读售价、启动费用、成本函数和两位阿姨的目标。','利润目标看收入与成本的差；产量目标找不亏钱范围的右端。','价格碰到最低平均成本时检查并列；更低时比较停产。'];
 const factoryGuides=['先看两家技术、投入单价与各自启动费。','同一产量比较一家和两家平分的总成本。','等成本处并列；零产量不开厂，不能把启动费画成实际成本。'];
 const technologyGuides=['先认横轴原料、纵轴豆浆，例子中的数量允许连续。','跟着同一个点增加原料，比较切线斜率如何变化。','切线是局部边际产出，原点割线是平均产出；例子不代替一般条件。'];
 const objectiveGuides=['先固定同一技术、价格和四位店主各自的目标。','逐项计算收入、成本、产量和利润；注意最低产量和成员人数限制。','目标变了，选择可能不同；本例数值与额外条件不可直接推广。'];
 const outputGuides=['先辨认两家摊使用的是不同技术和价格，数量可连续。','同一投入比较收入与原料成本；收入不低于成本才可选。','不亏钱的最大产量与利润最大是两种目标；先检查严格凹和最优解存在。'];
 const profitGuides=['先确认技术、售价和原料单价，利润等于收入减成本。','跟着同一投入增加，比较收入点和成本点之间的距离。','正内点可用边际条件；别忘了停产、可导性和全局比较。'];
 const costGuides=['先分清不开摊与做正数量时，启动费是否发生。','先看总账，再分别比较每杯平均成本和多做一点的成本。','零产量没有平均成本；换成无启动费例子时重新核对条件。'];
 const inverseGuides=['先确认生产技术、原料单价以及订单数量是否可达到。','从订单反推最少原料，再乘单位原料价格。','换技术先换公式；有上限时不能把不可达产量当作有限成本。'];
 const costStaticGuides=['先看相同成本、原售价和两位阿姨的不同目标。','先改售价，恢复后再单独改变可变成本。','检查固定费用、停产和最优解存在，别只看边际成本。'];
 const crusoeGuides=['先把一天分成休闲和劳动，消费不能超过劳动产出。','沿同一条生产边界比较休闲与消费的组合。','本题例子先算内点，再检查端点；一般结论要核对条件。'];
 const harmonyGuides=['先分清企业、家庭、工资和利润分红。','分别计算企业劳动需求和家庭劳动供给，再检查是否相等。','比较利润目标与产量目标；工资和生产选择都要重新求。'];
 const staticsGuides=['先记住原售价、原料单价、技术和原保本投入。','售价还原后再改善技术，每次只改变一个条件。','旧计划仍可行只说明不减；推广时核对教材的严格凹等条件。'];
 const goalGuides=['先认清七个离散方案：留下多少人、预计利润是多少。','再试着把裁员的主观代价加入账本，比较七项的得分。','利润是预测值，主观权重是自主假设；调查差异不能单独说明原因。'];
 for(let i=0;i<3;i++){const el=pEl(`guide-${i}`);if(!el)continue;if(!el.dataset.originalGuide)el.dataset.originalGuide=el.textContent;el.textContent=mode==='technology'?technologyGuides[i]:mode==='objectives'?objectiveGuides[i]:mode==='output'?outputGuides[i]:mode==='statics'?staticsGuides[i]:mode==='profit'?profitGuides[i]:mode==='crusoe'?crusoeGuides[i]:mode==='harmony'?harmonyGuides[i]:mode==='costs'?costGuides[i]:mode==='inverse'?inverseGuides[i]:mode==='coststatic'?costStaticGuides[i]:mode==='acproof'?guides[i]:mode==='supply'?supplyGuides[i]:mode==='factories'?factoryGuides[i]:mode==='goals'?goalGuides[i]:el.dataset.originalGuide;}
 let situation=pEl('acproof-situation');
 if(mode==='acproof'){
  if(!situation){situation=document.createElement('section');situation.id='acproof-situation';situation.setAttribute('aria-label','豆浆摊情境与问题');pEl('legend').before(situation)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨开豆浆摊，开摊一次花4元；做正数量时总成本 C(y)=4+y+y²/2 元，停产时成本为0。这里为便于分析，杯数可以连续变化，成本函数和数字是自主举例。</p><p class="reading"><strong>这张图要回答：</strong>多做一点豆浆，平均每杯成本什么时候会下降、什么时候会上升？平均成本和边际成本相等时，就一定是最低点吗？</p>';
  if(situation.dataset.signature!==html){situation.dataset.signature=html;situation.innerHTML=html;}
 }else situation?.remove();

 let supplySituation=pEl('supply-situation');
 if(mode==='supply'){
  if(!supplySituation){supplySituation=document.createElement('section');supplySituation.id='supply-situation';supplySituation.setAttribute('aria-label','豆浆摊的条件与两种目标');pEl('legend').before(supplySituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>两位阿姨有同样的豆浆摊。正产量时 C(y)=4+y+y²/2 元，停产成本为0；4元启动费用可通过停产避免。每杯售价先是5元，再降到保本门槛附近和3元。数量可连续；场景和数字为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>一位要利润最多，另一位要在不亏钱的前提下尽量多做。她们分别做多少杯？价格降低时，什么时候会停产？</p>';
  if(supplySituation.dataset.signature!==html){supplySituation.dataset.signature=html;supplySituation.innerHTML=html;}
 }else supplySituation?.remove();

 let factorySituation=pEl('factories-situation');
 if(mode==='factories'){
  if(!factorySituation){factorySituation=document.createElement('section');factorySituation.id='factories-situation';factorySituation.setAttribute('aria-label','两家工厂的题设与问题');pEl('legend').before(factorySituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨有两家相同的豆浆厂。每家厂产量等于投入的平方根；每单位投入1元，每开一家要另付启动费 k。先用 k=2 元比较1、2、3杯；产量可连续，阿姨的故事和数字为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>什么时候值得多付一份启动费、开第二家厂？两家同时开时如何分配产量最省？零产量要不要付启动费？</p>';
  if(factorySituation.dataset.signature!==html){factorySituation.dataset.signature=html;factorySituation.innerHTML=html;}
 }else factorySituation?.remove();

 let costSituation=pEl('costs-situation');
 if(mode==='costs'){
  if(!costSituation){costSituation=document.createElement('section');costSituation.id='costs-situation';costSituation.setAttribute('aria-label','成本图的题设与问题');pEl('legend').before(costSituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>先看开工需付4元、停产可避免启动费的豆浆摊；正产量总成本为 C(y)=4+y+y²/2 元，不开摊成本为0。随后明确换成没有启动费的例子：正产量成本 C(y)=y+y²/2 元。杯数可连续，故事和函数为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>开摊费怎样进入总账？什么是平均成本和边际成本？当正产量越来越接近零，两笔成本靠近哪里？</p>';
  if(costSituation.dataset.signature!==html){costSituation.dataset.signature=html;costSituation.innerHTML=html;}
 }else costSituation?.remove();

 let inverseSituation=pEl('inverse-situation');
 if(mode==='inverse'){
  if(!inverseSituation){inverseSituation=document.createElement('section');inverseSituation.id='inverse-situation';inverseSituation.setAttribute('aria-label','豆浆订单的题设与问题');pEl('legend').before(inverseSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨用一种原料做豆浆，投入可连续，原料每单位1元且没有其他成本。先采用自主技术 y=2√a，订单从2杯增加到3杯；最后换成另一种有上限的技术。</p><p class="reading"><strong>这张图要回答：</strong>知道订单量，怎样反过来算最少原料和成本？换一种技术后，哪些产量根本做不到？</p>';
  if(inverseSituation.dataset.signature!==html){inverseSituation.dataset.signature=html;inverseSituation.innerHTML=html;}
 }else inverseSituation?.remove();

 let staticSituation=pEl('coststatic-situation');
 if(mode==='coststatic'){
  if(!staticSituation){staticSituation=document.createElement('section');staticSituation.id='coststatic-situation';staticSituation.setAttribute('aria-label','两种目标与成本变化的题设');pEl('legend').before(staticSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>两位阿姨成本相同：C(y)=y+y²/2 元，停产成本为0，没有启动费，杯数可连续。一位追求利润最大，另一位在不亏钱时尽量多做。售价先从4元升到6元，再回到4元，观察可变成本减半；场景和数字为自主例子。</p><p class="reading"><strong>这张图要回答：</strong>售价上涨或生产更省料后，她们分别会做多少？为什么比较技术时还要看启动费？</p>';
  if(staticSituation.dataset.signature!==html){staticSituation.dataset.signature=html;staticSituation.innerHTML=html;}
 }else staticSituation?.remove();

 let existenceSituation=pEl('existence-situation');
 if(mode==='existence'){
  if(!existenceSituation){existenceSituation=document.createElement('section');existenceSituation.id='existence-situation';existenceSituation.setAttribute('aria-label','不亏钱的最大产量题设');pEl('legend').before(existenceSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨只想不亏钱地多卖，售价每杯2元，产量可连续。不到1杯时成本为 y² 元；达到或超过1杯时多付2元，即成本 y²+2 元。豆浆故事与跳跃成本为自主反例。</p><p class="reading"><strong>这张图要回答：</strong>如果不到1杯总能再多做一点，恰好1杯却亏损，到底有没有“不亏钱的最大产量”？</p>';
  if(existenceSituation.dataset.signature!==html){existenceSituation.dataset.signature=html;existenceSituation.innerHTML=html;}
 }else existenceSituation?.remove();

 let firingSituation=pEl('firing-situation');
 if(mode==='firing'){
  if(!firingSituation){firingSituation=document.createElement('section');firingSituation.id='firing-situation';firingSituation.setAttribute('aria-label','豆浆店裁员决策的条件与问题');pEl('legend').before(firingSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨已有4位员工。自主例子设产出 f(a)=2√a，售价和每单位工资均为1，劳动力 a 可连续；每减少1单位原有劳动力，老板承受主观代价 ℓ。零代价仅为对照。</p><p class="reading"><strong>这张图要回答：</strong>如果只看现金利润，和把裁员带来的主观感受算进去，老板分别会保留多少劳动力？</p>';
  if(firingSituation.dataset.signature!==html){firingSituation.dataset.signature=html;firingSituation.innerHTML=html;}
 }else firingSituation?.remove();

 let priceSituation=pEl('priceproof-situation');
 if(mode==='priceproof'){
  if(!priceSituation){priceSituation=document.createElement('section');priceSituation.id='priceproof-situation';priceSituation.setAttribute('aria-label','豆浆店五个生产方案');pEl('legend').before(priceSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨的可选方案在工资变化前后相同，每杯售价1元。五个自主方案按“劳动力投入，豆浆产量”列出：0=(0,0)、1=(1,2)、2=(2,2.5)、3=(3,6)、4=(4,6.2)。工资由1元涨到2.1元；可用0方案停产。这是有限方案演示，不声称它满足教材的凹生产函数假设。</p><p class="reading"><strong>这张图要回答：</strong>工资涨后，阿姨选择什么？为什么两次最优选择可以说明投入不会增加？</p>';
  if(priceSituation.dataset.signature!==html){priceSituation.dataset.signature=html;priceSituation.innerHTML=html;}
 }else priceSituation?.remove();

 let techSituation=pEl('techchange-situation');
 if(mode==='techchange'){
  if(!techSituation){techSituation=document.createElement('section');techSituation.id='techchange-situation';techSituation.setAttribute('aria-label','磨豆机技术变化的题设');pEl('legend').before(techSituation)}
  const html='<p class="reading"><strong>题设与条件：</strong>阿姨的原料投入 a 可以连续，豆浆售价每杯1元、原料每单位0.29元，目标是利润最大。旧技术 <span class="equation">f(a)=\\sqrt a</span>；先逐步改为 <span class="equation">g(a)=\\sqrt a+0.7ae^{-a}</span>，最后再对比另一种技术 <span class="equation">g(a)=1.7\\sqrt a</span>。场景、函数与数字为自主例子。</p><p class="reading"><strong>这张图要回答：</strong>同样原料做出的豆浆增加，为什么最优原料和产量可能反而减少？利润又会怎样？</p>';
  if(techSituation.dataset.signature!==html){techSituation.dataset.signature=html;techSituation.innerHTML=html;}
 }else techSituation?.remove();

 let profitSituation=pEl('profit-situation');
 if(mode==='profit'){
  if(!profitSituation){profitSituation=document.createElement('section');profitSituation.id='profit-situation';profitSituation.setAttribute('aria-label','豆浆摊利润的条件与问题');pEl('legend').before(profitSituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨用 a 单位原料做豆浆，技术为下式；每杯售价2元，每单位原料1元，没有其他成本。原料和产量可连续，停产时利润为零。故事、函数和价格为自主举例。</p><span class="equation">f(a)=2\\sqrt a</span><p class="reading"><strong>这张图要回答：</strong>原料加到哪里时收入减成本的差最大？收入继续增加，利润一定也增加吗？最后再比较不亏钱时的最大产量。</p>';
  if(profitSituation.dataset.signature!==html){profitSituation.dataset.signature=html;profitSituation.innerHTML=html;}
 }else profitSituation?.remove();

 let crusoeSituation=pEl('crusoe-situation');
 if(mode==='crusoe'||mode==='harmony'){
  if(!crusoeSituation){crusoeSituation=document.createElement('section');crusoeSituation.id='crusoe-situation';crusoeSituation.setAttribute('aria-label','鲁滨逊原题条件与问题');pEl('legend').before(crusoeSituation)}
  const html=mode==='crusoe'?'<p class="reading"><strong>原题条件：</strong>鲁滨逊只有1单位时间，休闲 l 与劳动 x 加起来等于1。劳动生产消费品；原题(b)给出以下技术和满意程度，休闲与消费都不能为负。</p><span class="equation">f(x)=\\sqrt x,\\quad u(l,c)=lc,\\quad x=1-l</span><p class="reading"><strong>这张图要回答：</strong>如果他自己统筹劳动与休息，怎样选择才能最满意？切点条件为什么成立，端点还需要检查什么？</p>':'<p class="reading"><strong>原题条件：</strong>同一座孤岛分成企业和家庭：企业雇佣劳动并把利润返给家庭，家庭按工资和利润决定休闲与消费。劳动时间和休闲共1单位；先用原题(b)的技术与偏好。</p><span class="equation">f(x)=\\sqrt x,\\quad u(l,c)=lc,\\quad c=w(1-l)+\\pi</span><p class="reading"><strong>这张图要回答：</strong>工资怎样让企业需求的劳动等于家庭愿意提供的劳动？企业目标从利润最大改为不亏钱时产量最大，协调结果还一样吗？</p>';
  if(crusoeSituation.dataset.signature!==html){crusoeSituation.dataset.signature=html;crusoeSituation.innerHTML=html;}
 }else crusoeSituation?.remove();

 let technologySituation=pEl('technology-situation');
 if(mode==='technology'){
  if(!technologySituation){technologySituation=document.createElement('section');technologySituation.id='technology-situation';technologySituation.setAttribute('aria-label','豆浆技术的情境与问题');pEl('legend').before(technologySituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨用原料做豆浆。自主例子设投入 a 单位原料时，产出由下面的函数给出；原料和杯数可以连续取值。故事、函数和数字都是自主举例。</p><span class="equation">f(a)=2\\sqrt a</span><p class="reading"><strong>这张图要回答：</strong>原料增加时，豆浆如何增加？当前点旁边“再多一点原料”与从零开始“平均每单位原料”，有什么不同？</p>';
  if(technologySituation.dataset.signature!==html){technologySituation.dataset.signature=html;technologySituation.innerHTML=html;}
 }else technologySituation?.remove();
 let objectiveSituation=pEl('objectives-situation');
 if(mode==='objectives'){
  if(!objectiveSituation){objectiveSituation=document.createElement('section');objectiveSituation.id='objectives-situation';objectiveSituation.setAttribute('aria-label','四个生产目标的条件与问题');pEl('legend').before(objectiveSituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>四位店主面对同样的自主技术，每杯售价2元、每单位投入成本1元；假设他们是价格接受者，自己做多做少都不改变市场价格。产量和投入可连续，前三位把投入视作原料。第三位承诺至少做5杯；第四位是合作社，每名成员贡献1单位劳动，额外假设至少1名成员，并用连续人数作近似。</p><span class="equation">f(a)=2\\sqrt a</span><p class="reading"><strong>这张图要回答：</strong>同样的技术和价格，利润最多、不亏钱时尽量多做、先满足订单再赚钱、人均利润最多，会选同样的生产规模吗？</p>';
  if(objectiveSituation.dataset.signature!==html){objectiveSituation.dataset.signature=html;objectiveSituation.innerHTML=html;}
 }else objectiveSituation?.remove();

 let outputSituation=pEl('output-situation');
 if(mode==='output'){
  if(!outputSituation){outputSituation=document.createElement('section');outputSituation.id='output-situation';outputSituation.setAttribute('aria-label','两家豆浆摊的条件与问题');pEl('legend').before(outputSituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨只要求不亏钱，然后尽量多做豆浆。先看第一家：<span class="equation">f(a)=\\sqrt{a+1}-1</span>，每杯卖1元、原料每单位2元；再明确换成第二家：<span class="equation">f(a)=2\\sqrt a</span>，每杯卖2元、原料每单位1元。投入和杯数可连续；故事、技术和价格为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>第一家为什么停产？第二家可以多做时，做到哪里恰好保本？不亏钱的最大产量和利润最大是一回事吗？</p>';
  if(outputSituation.dataset.signature!==html){outputSituation.dataset.signature=html;outputSituation.innerHTML=html;}
 }else outputSituation?.remove();
 let staticsSituation=pEl('statics-situation');
 if(mode==='statics'){
  if(!staticsSituation){staticsSituation=document.createElement('section');staticsSituation.id='statics-situation';staticsSituation.setAttribute('aria-label','价格和技术变化的题设与问题');pEl('legend').before(staticsSituation)}
  const html='<p class="reading"><strong>情境与条件：</strong>豆浆技术原为 <span class="equation">f(a)=2\\sqrt a</span>，每杯售价2元、原料每单位1元。先把售价提高到3元；接着将售价还原，再把技术改成 <span class="equation">g(a)=3\\sqrt a</span>。数量可连续，数字和豆浆故事为自主例子。</p><p class="reading"><strong>这张图要回答：</strong>价格提高或同样原料做得更多后，原来的不亏钱方案还能用吗？最右边的保本投入和最大产量怎样变化？</p>';
  if(staticsSituation.dataset.signature!==html){staticsSituation.dataset.signature=html;staticsSituation.innerHTML=html;}
 }else staticsSituation?.remove();

 let goalSituation=pEl('goals-situation');
 if(mode==='goals'){
  if(!goalSituation){goalSituation=document.createElement('section');goalSituation.id='goals-situation';goalSituation.setAttribute('aria-label','快递公司原题条件与问题');pEl('legend').before(goalSituation)}
  const html='<p class="reading"><strong>教材原题：</strong>快递公司有196名员工，经济衰退后仍有正利润。财务部门只列出七个留用方案及预计年利润：留下100人时预计赚200万美元，全部留下时预计赚40万美元。利润是预测，不是实际已经赚到的钱。</p><p class="reading"><strong>这张图要回答：</strong>如果只看利润，会留下多少人？如果经理也在意裁员给员工带来的影响，选择可能怎样改变？下方的主观权衡函数和权重是自主举例，并非教材给定，也不是实际发生的支出。</p>';
  if(goalSituation.dataset.signature!==html){goalSituation.dataset.signature=html;goalSituation.innerHTML=html;}
 }else goalSituation?.remove();

 Object.assign(plot.dataset, {
  filmIntro: story.intro,
  filmPhase: frame.title,
  filmNarration: frame.narration,
  filmConclusion: story.end,
  phase: String(pIdx)
 });

 if(['technology','objectives','output','statics','profit','priceproof','techchange','crusoe','harmony','inverse','costs','acproof','supply','coststatic','factories','existence','firing','goals'].includes(mode))plot.innerHTML=pChart(mode,frame,small);else window.microMotion.chart(plot,pChart(mode,frame,small));
 pEl('legend').textContent = mode === 'techchange' ? '灰色虚线与灰点：旧技术及旧最优选择；绿色：新技术及新最优选择。数值由当前例子的模型计算。' : mode === 'priceproof' ? '灰点是自主构造的可行计划；绿点是旧价格下最优计划，紫点是新价格下最优计划。' : mode === 'firing' ? '灰虚线：现金利润；绿线：扣除裁员主观成本后的目标。纵轴保留负值，两个点分别是对应的最优选择。' : mode === 'crusoe' ? '绿线：生产可能边界；紫点是当前休闲与消费，紫虚线是经过该点的无差异曲线。' : mode === 'harmony' ? '绿线：生产边界；紫虚线：家庭预算线；紫点是家庭选择，绿色空心圈是企业生产。' : mode === 'inverse' ? '绿线：由当前生产技术计算的成本函数；绿点：当前产量对应的成本。虚线标出产量上限。' : mode === 'coststatic' ? '灰色虚线：原成本与原价格；绿线：新平均成本；红线：新边际成本；紫虚线：新价格。绿点是产量目标，紫点是利润目标。' : mode === 'factories' ? '紫色与红色虚线：分别只用一厂和两厂的成本；绿线：最低成本；金点：转换门槛，绿点：当前产量。' : mode === 'costs' && !frame.state.curves && !frame.state.convex ? '绿线：总成本；实心点是停产时成本，空心点表示启动成本的右极限。' : ['costs','acproof','supply'].includes(mode) ? '绿线：平均成本；红线：边际成本；金点：本例平均成本最低点；紫虚线：价格。供给画面中绿点与紫点分别对应产量目标和利润目标。' : '绿色代表生产技术/收益/保本边界；紫色代表最优选择/无差异曲线；红色代表成本/亏损/跳跃；金色代表边际增量或切换临界点。';
 if(mode==='factories')pEl('legend').textContent='横轴：豆浆总产量（杯）；纵轴：总成本（元）。紫虚线是一家厂，红虚线是两家平分，绿线是两者较低的成本；绿圈标出当前更省的方案，金点是两种方案相等。零产量不启动，纵轴空心点只是正产量趋近零的成本。';
 if(mode==='costs'&&!frame.state.curves&&!frame.state.convex)pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：总成本（元）。绿线和绿点是正产量的总成本；原点实心点是不开摊成本0，纵轴上的空心点是正产量接近0时的启动费用，不是零产量的实际成本。';
 if(mode==='costs'&&(frame.state.curves||frame.state.convex))pEl('legend').textContent=frame.state.convex?'横轴：产量；纵轴：每单位成本。绿线是平均成本，红线是边际成本；本例没有固定启动费。':'横轴：产量；纵轴：每单位成本。绿线是平均成本，红线是边际成本；金点标出这个例子的平均成本最低点。';
 if(mode==='costs'&&frame.state.limit)pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：每杯成本（元）。绿点是正产量的平均成本，红点是同一产量的边际成本；金点是零点的边际成本。零产量的平均成本没有定义。';
 if(mode==='inverse')pEl('legend').textContent=frame.state.kind==='saturating'?'横轴：豆浆产量（杯）；纵轴：最低原料成本（元）。绿点是本例订单，竖虚线标出2杯上限：有限投入无法达到。':'横轴：豆浆产量（杯）；纵轴：最低原料成本（元）。绿线是按当前技术反推的成本，绿点随订单移动；单位原料价格保持1元。';
 if(mode==='coststatic')pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：每杯价格或成本（元）。灰虚线是起始售价及成本；紫线是当前售价，红线是当前边际成本，绿线是当前平均成本。紫点是利润目标，绿点是不亏钱的最大产量。';
 if(mode==='existence')pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：收入或成本（元）。绿线和绿点是收入，红线和红点是成本；同一产量下绿点高于红点表示盈利。产量1处的空心红点是左极限，实际成本是上方的实心红点。';
 if(mode==='firing')pEl('legend').textContent='横轴：劳动力投入（可连续）；纵轴：现金利润或扣除主观代价后的目标。灰虚线及灰点为只看现金时的最优，绿线及绿点为计入裁员主观代价后的最优；零代价时两点重合。';
 if(mode==='priceproof')pEl('legend').textContent='横轴：劳动力投入；纵轴：豆浆产量。每个编号点是一个固定方案；金色空心圈标记工资1元时的旧最优方案，紫点标记当前工资下的全部最优方案，灰点是其他方案。重合或并列时保留所有标记。';
 if(mode==='techchange')pEl('legend').textContent='横轴：原料投入；纵轴：豆浆产量。灰虚线和灰点是旧技术及其利润最优选择，绿线和绿点是当前技术及其利润最优选择；起始时两条线和两点重合。利润数值见下方。';
 if(mode==='technology')pEl('legend').textContent='横轴：原料投入；纵轴：豆浆产量。绿线是自主生产函数，绿点跟着当前投入移动；金色切线表示该点的局部边际产出，紫色割线表示从零投入开始的平均产出。';
 if(mode==='objectives')pEl('legend').textContent='横轴：投入数量；纵轴：收入或投入成本（元）。绿线是收入，红线是成本；紫点标出当前目标下的选择。合作社一幕将投入解释为成员劳动；数量连续只是模型近似。';
 if(mode==='output')pEl('legend').textContent='横轴：原料投入；纵轴：收入或原料成本（元）。绿线是收入，红线是成本；紫点标记最右保本投入。第二家摊中，绿点与红点是当前尝试的同一投入，两点高度之差是利润。';
 if(mode==='profit')pEl('legend').textContent='横轴：原料投入；纵轴：收入或原料成本（元）。绿线和绿点是收入，红线和红点是同一投入下的成本；金色竖虚线连接两点，高度差是利润。紫圈是利润最大处，紫色斜虚线是该处的收入切线；最后的金点是本例最大保本投入。';
 if(mode==='statics')pEl('legend').textContent='横轴：原料投入；纵轴：收入或原料成本（元）。灰色虚线和灰点是最初收入与保本投入；绿线和绿点是当前收入与保本投入；红线是原料成本。售价还原与技术改善分开比较。';
 if(mode==='supply')pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：每杯价格或成本（元）。绿线是平均成本，红线是边际成本，紫虚线是售价；紫点对应利润目标，绿点对应不亏钱的最大产量；金点是两者重合的保本门槛。停产时平均成本未定义，不在图中画成本点。';
 if(mode==='acproof')pEl('legend').textContent='横轴：豆浆产量（杯）；纵轴：每杯成本（元）。绿线和绿点是平均成本，红线和红点是边际成本；两点重合时用金点标记当前位置，虚线连接同一产量的两笔账。';
 if (mode === 'goals') pEl('legend').textContent = '每个点对应教材的一个留用人数与预计利润；紫点是按当前自主偏好计算的最优选择。纵轴保留亏损。';
 if (mode === 'techchange' && pEl('film-title')) pEl('film-title').textContent = frame.state.kind === 'marginal' ? '边际改善与企业选择' : '技术改善后投入和产出下降';

 const metrics = [
  ['当前画面', Number.isInteger(pIdx)?`${pIdx + 1} / ${story.frames.length}`:`第 ${Math.floor(pIdx)+1} 幕向下一幕变化`],
  ['本节场景', mode === 'technology' ? '原料与豆浆' : mode === 'objectives' ? '四种经营目标' : mode === 'profit' ? '利润与投入' : mode === 'costs' ? '成本与产量' : mode === 'goals' ? '利润与员工' : mode === 'acproof' ? '平均与边际' : mode === 'supply' ? '两种经营目标' : mode === 'factories' ? '开一家或两家' : mode === 'techchange' ? (frame.state.kind === 'marginal' ? '边际产出不降' : '技术改善后规模下降') : story.title.replace(/^§6\.\d\s*/, '')],
  ['核心指标', readout]
 ];
 pEl('metrics').innerHTML = metrics.map(([k, v]) => `<div class="metric"><label>${pEsc(k)}</label><strong${['profit','priceproof','techchange','costs','acproof','supply','coststatic','factories','existence','firing','goals'].includes(mode)&&k==='核心指标'?' style="font-size:1rem;line-height:1.6"':''}>${pEsc(v)}</strong></div>`).join('');
 let goalLedger=pEl('goals-ledger');
 if(mode==='goals'){
  if(!goalLedger){goalLedger=document.createElement('details');goalLedger.id='goals-ledger';goalLedger.className='sd-proof';goalLedger.innerHTML='<summary>展开七个方案的对比账本</summary><div></div>';pEl('metrics').after(goalLedger)}
  const z=producerGoalsP(frame.state.lambda ?? 0),f=n=>pNum(n,6);
  goalLedger.querySelector('div').innerHTML=`<p>假想权重：每裁1人减去 ${f(z.lambda*100)} 万美元的主观得分。利润和得分单位为百万美元；得分不是现金利润。</p><table><thead><tr><th>留用人数</th><th>裁员人数</th><th>预计利润</th><th>自主得分</th></tr></thead><tbody>${z.plans.map(x=>`<tr><td>${x.N}${z.winners.includes(x)?' ★':''}</td><td>${x.fired}</td><td>${f(x.profit)}</td><td>${f(x.utility)}</td></tr>`).join('')}</tbody></table><p>★ 表示当前账本下的最优方案；并列时全部保留。只能选教材列出的七项。</p>`;
 }else goalLedger?.remove();
 pEl('reading').textContent = frame.narration;
 pEl('formula').textContent = frame.formula;
 pEl('boundary').textContent = `Osborne–Rubinstein §6.1—6.5，印刷75—86页／PDF94—105。${frame.source}。有限数值与图形演示服务于直观理解，不代替全象限一般数学证明。`;
 pEl('extra').innerHTML = producerProofs[mode] || '';

 if (pEl('step')) {
  pEl('step').max = story.frames.length - 1;
  pEl('step').value = pIdx;
 }
 if (pEl('filmStep')) pEl('filmStep').value = pIdx;
 if (pEl('advance')) pEl('advance').disabled = pIdx >= story.frames.length - 1;
 if (pEl('play')) pEl('play').disabled = pIdx >= story.frames.length - 1;

 const link = document.querySelector('.lesson-end a[download]');
 if (link) {
  link.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch6-${mode}.html`;
  link.textContent = '下载本段完整动画代码 ↓';
 }
 window.microMath?.refresh();

 window.demo = {
  state: { step: pIdx, mode },
  draw() {
   const p = window.demo.state.step;
   const f = producerFrame(mode, p);
   window.microMotion.chart(plot, pChart(mode, f, plot.clientWidth < 500));
   pEl('reading').textContent = f.narration;
   pEl('formula').textContent = f.formula;
   pEl('metrics').innerHTML = [
    ['当前画面', `${p + 1} / ${story.frames.length}`],
    ['本节场景', mode],
    ['核心指标', producerReadout(mode, f)]
   ].map(([k, v]) => `<div class="metric"><label>${pEsc(k)}</label><strong>${pEsc(v)}</strong></div>`).join('');
   window.microMath?.refresh();
  }
 };

 return { mode, phase: pIdx, readout };
}
