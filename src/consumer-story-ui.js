// Chapter 5 Consumer demand film-mode UI renderer
// Visualizes budget sets, demand functions, MRS, WARP, Slutsky decomposition, and Giffen goods

import { consumerStories, consumerFrame, consumerReadout } from './consumer-story.mjs';
import { utilityC, demandC, hicksC, slutskyC, warpC, sourceWarp, rationalizationC, mrsC, budgetC, normalMRSC } from './consumer.mjs';

const cEl = id => document.getElementById(id);
const cInk = '#334b40', cMuted = '#65796e', cRule = '#cbd7cf', cGold = '#a27619', cGreen = '#177468', cPurple = '#7a6594', cRed = '#c35f43';
const cEsc = s => String(s).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
const cNum = (n, d = 2) => Number(Number(n).toFixed(d)).toString();
const cText = (x, y, s, size = 14, color = cInk, anchor = 'start') => `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${cEsc(s)}</text>`;
const cLine = (a, b, c, d, color = cRule, width = 1, dash = '') => `<path d="M${a} ${b}L${c} ${d}" stroke="${color}" stroke-width="${width}" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
export function quasiIndifferenceY(x,u) { return x >= 0 && x <= u ? (u-x)**2 : NaN; }

// Clip the actual budget line against the visible square. Independently
// clamping its intercepts changes its slope and draws the wrong budget set.
export function clipConsumerBudget(p, q, w, limit) {
 if (![p, q, w, limit].every(Number.isFinite) || p <= 0 || q <= 0 || w < 0 || limit <= 0) throw Error('预算线参数无效');
 if (w > (p + q) * limit) return { line: null, polygon: [[0, 0], [limit, 0], [limit, limit], [0, limit]] };
 const x0 = Math.max(0, (w - q * limit) / p), y0 = Math.min(limit, w / q);
 const x1 = Math.min(limit, w / p), y1 = Math.max(0, (w - p * limit) / q);
 return { line: [[x0, y0], [x1, y1]], polygon: [[0, 0], [x1, 0], [x1, y1], [x0, y0], [0, y0]] };
}

export const consumerScenarios = [
 { value: 'budget', label: '§5.1 预算集与购买力几何边界' },
 { value: 'rules', label: '§5.2 四种需求函数规则' },
 { value: 'homogeneous', label: '§5.2 零次齐次性无货币幻觉' },
 { value: 'optimum', label: '§5.3 理性消费者与最优解唯一性' },
 { value: 'existence', label: '§5.3 不连续偏好极值不存在反例' },
 { value: 'mrs', label: '§5.4 可微偏好与切点条件' },
 { value: 'corners', label: '§5.4 拟线性偏好角点到内点演变' },
 { value: 'rationalize', label: '§5.5 需求函数的理性化检验' },
 { value: 'warp', label: '§5.5 显示偏好弱公理 (WARP)' },
 { value: 'curves', label: '§5.6 常规需求与恩格尔曲线' },
 { value: 'normal', label: '§5.6 正常品与边际替代率几何' },
 { value: 'slutsky', label: '§5.6 斯勒茨基替代与收入效应分解' },
 { value: 'property', label: '§5.6 命题5.5证明：Slutsky 支出矛盾' },
 { value: 'giffen', label: '§5.6 吉芬品折线构造与反常需求' }
];

function cChart(mode, frame, small) {
 const W = small ? 330 : 640, H = small ? 340 : 370;
 const left = small ? 38 : 52, right = W - (small ? 18 : 35), bottom = H - (small ? 42 : 50), top = small ? 35 : 42;
 if (mode === 'existence') {
  const lim=1.1, sx=x=>left+x/lim*(right-left), sy=y=>bottom-y/lim*(bottom-top), x=frame.state.progress ?? .8;
  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="效用趋近1但端点效用为0"><rect width="${W}" height="${H}" fill="#fffdf7"/>`;
  svg+=cText(W/2,24,frame.title,small?12:15,cInk,'middle');
  for(const v of [0,.25,.5,.75,1]) {svg+=cLine(sx(v),top,sx(v),bottom,'#e6ece2')+cLine(left,sy(v),right,sy(v),'#e6ece2');svg+=cText(sx(v),bottom+16,cNum(v),small?10:11,cMuted,'middle');if(v)svg+=cText(left-6,sy(v)+4,cNum(v),small?10:11,cMuted,'end');}
  svg+=cLine(left,top,left,bottom,cInk,1.5)+cLine(left,bottom,right,bottom,cInk,1.5);
  svg+=cText(right-4,bottom-16,'商品1数量 x₁',small?10:12,cInk,'end')+cText(left+4,top+14,'效用 u',small?10:12,cInk);
  svg+=cLine(sx(0),sy(0),sx(1),sy(1),cGreen,2.5);
  svg+=`<circle data-motion="supremum" cx="${sx(1)}" cy="${sy(1)}" r="6" fill="#fffdf7" stroke="${cGreen}" stroke-width="2"/>`;
  svg+=`<circle data-motion="boundary" cx="${sx(1)}" cy="${sy(0)}" r="6" fill="${cRed}" stroke="#fffdf7" stroke-width="2"/>`;
  svg+=`<circle data-motion="candidate" cx="${sx(x)}" cy="${sy(x)}" r="7" fill="${cGold}" stroke="#fffdf7" stroke-width="2"/>`;
  svg+=cText(W/2,H-9,`当前 x₁=${cNum(x)}，效用 ${cNum(x)}；端点效用为0`,small?10:12,cInk,'middle');
  return svg+'</svg>';
 }
 if (mode === 'curves') {
  const s=frame.state || {}, kind=s.curve ?? 'intro', p=s.p ?? 1, q=s.q ?? 1, w=s.w ?? 12;
  const isEngel=kind==='engel', maxX=isEngel?16:3, maxY=14;
  const sx=x=>left+x/maxX*(right-left),sy=y=>bottom-y/maxY*(bottom-top);
  const value=x=>isEngel?demandC('product',p,q,x).bundle[0]:kind==='cross'?demandC('product',x,q,w).bundle[1]:demandC('product',x,q,w).bundle[0];
  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cEsc(frame.title)}"><rect width="${W}" height="${H}" fill="#fffdf7"/>`+cText(W/2,24,frame.title,small?13:15,cInk,'middle');
  for(let i=0;i<=4;i++){const x=maxX*i/4,y=maxY*i/4;svg+=cLine(sx(x),top,sx(x),bottom,'#e6ece2')+cLine(left,sy(y),right,sy(y),'#e6ece2');svg+=cText(sx(x),bottom+16,cNum(x,2),small?10:11,cMuted,'middle');if(i)svg+=cText(left-6,sy(y)+4,cNum(y,1),small?10:11,cMuted,'end');}
  svg+=cLine(left,top,left,bottom,cInk,1.5)+cLine(left,bottom,right,bottom,cInk,1.5);
  svg+=cText(right-2,bottom-8,isEngel?'财富 w':'商品1价格 p₁',small?10:12,cInk,'end');
  svg+=cText(left+3,top+13,kind==='cross'?'商品2需求 x₂':'商品1需求 x₁',small?10:12,cInk);
  let path='';for(let i=0;i<=100;i++){const x=isEngel?maxX*i/100:.5+(maxX-.5)*i/100,y=value(x);if(y>=0&&y<=maxY)path+=(path?'L':'M')+sx(x)+' '+sy(y);}
  svg+=`<path d="${path}" stroke="${cGreen}" stroke-width="2.5" fill="none"/>`;
  const point=(x,color,key)=>{const y=value(x);return `<circle data-motion="${key}" cx="${sx(x)}" cy="${sy(y)}" r="6" fill="${color}" stroke="#fffdf7" stroke-width="2"/>`;};
  const current=isEngel?w:p,reference=isEngel?4:2;
  if(Math.abs(current-reference)>1e-8)svg+=point(reference,cMuted,'pt-before');
  svg+=point(current,cPurple,'pt-current');
  const anchor=current>maxX*.66?'end':'start';
  svg+=cText(sx(current)+(anchor==='end'?-9:9),sy(value(current))-10,`(${cNum(current)}, ${cNum(value(current))})`,small?11:13,cPurple,anchor);
  return svg+'</svg>';
 }
 const maxCoord = mode === 'warp' ? 3 : mode === 'corners' ? 7 : ['budget','slutsky'].includes(mode) ? 21 : 14;
 const sx = v => left + Math.max(0, Math.min(maxCoord, v)) / maxCoord * (right - left);
 const sy = v => bottom - Math.max(0, Math.min(maxCoord, v)) / maxCoord * (bottom - top);

 let svg = `<rect width="${W}" height="${H}" fill="#fffdf7"/>`;
 svg += cText(W / 2, 24, frame.title, small ? 13 : 15, cInk, 'middle');

 // Grid and axes
 Array.from({length:mode==='warp'?7:8},(_,i)=>i*maxCoord/(mode==='warp'?6:7)).forEach(v => {
  svg += `<path d="M${sx(v)} ${sy(0)}V${sy(maxCoord)}M${sx(0)} ${sy(v)}H${sx(maxCoord)}" stroke="#e6ece2" stroke-width="1"/>`;
  svg += cText(sx(v), sy(0) + 16, String(v), small ? 10 : 11, cMuted, 'middle');
  if (v > 0) svg += cText(sx(0) - 8, sy(v) + 4, String(v), small ? 10 : 11, cMuted, 'end');
 });
 svg += cLine(sx(0), sy(0), sx(maxCoord) + 8, sy(0), cInk, 1.5);
 svg += cLine(sx(0), sy(0), sx(0), sy(maxCoord) - 8, cInk, 1.5);
 svg += cText(sx(maxCoord) + 12, sy(0) + 4, 'x₁', small ? 11 : 13, cInk);
 svg += cText(sx(0) - 4, sy(maxCoord) - 12, 'x₂', small ? 11 : 13, cInk);

 const state = frame.state || {};

 function drawPoint(x, y, label, color = cGreen, r = 6, key = 'pt') {
  const cx = sx(x), cy = sy(y);
  let res = `<circle data-motion="${key}" cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#fffdf7" stroke-width="2"/>`;
  if (label) res += cText(cx + 8, cy - 8, label, small ? 11 : 13, color);
  return res;
 }

 function drawBudgetLine(p, q, w, color = cGreen, width = 2, dash = '') {
  const clipped = clipConsumerBudget(p, q, w, maxCoord);
  let res = '';
  // Fill budget set area if base
  if (color === cGreen && !dash) {
   const poly = clipped.polygon.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ');
   res += `<polygon points="${poly}" fill="${cGreen}" fill-opacity="0.12"/>`;
  }
  if (clipped.line) {
   const [[x0, y0], [x1, y1]] = clipped.line;
   res += cLine(sx(x0), sy(y0), sx(x1), sy(y1), color, width, dash);
  }
  return res;
 }

 function drawIndifference(model, uVal, color = cPurple, dash = '') {
  const N = 81;
  const pts = [];
  for (let i = 0; i <= N; i++) {
   const x = maxCoord * i / N;
   let y = NaN;
   if (model === 'cd') {
    if (x > 0.1) y = (uVal / (x ** 0.5)) ** (1 / 0.5);
   } else if (model === 'product') {
    if (x > 0.1) y = uVal / x;
   } else if (model === 'linear') {
    y = uVal - x;
   } else if (model === 'complement') {
    // L-shape corner at (uVal, uVal)
    if (x >= uVal) y = uVal;
   } else if (model === 'quasi') {
    y = quasiIndifferenceY(x,uVal);
   } else if (model === 'giffen') {
    // min{x1+x2, 4x1+2x2-12} = uVal
    const y1 = uVal - x;
    const y2 = (uVal + 12 - 4 * x) / 2;
    y = Math.max(y1, y2);
   }
   if (Number.isFinite(y) && y >= 0 && y <= maxCoord) pts.push([sx(x), sy(y)]);
  }
  if (model === 'complement') {
   const cx = sx(uVal), cy = sy(uVal);
   let path = `M${cx} ${sy(maxCoord)}V${cy}H${sx(maxCoord)}`;
   return `<path d="${path}" stroke="${color}" stroke-width="2" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
  }
  if (model === 'quasi' && uVal >= 0 && uVal <= maxCoord) pts.push([sx(uVal),sy(0)]);
  if (pts.length < 2) return '';
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ');
  return `<path d="${d}" stroke="${color}" stroke-width="2" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
 }

 if (mode === 'budget') {
  const p = state.p ?? 2, q = state.q ?? 1, w = state.w ?? 12;
  svg += drawBudgetLine(p, q, w, cGreen, 2.5);
  svg += drawPoint(w / p, 0, `(${cNum(w / p, 1)}, 0)`, cGreen, 6, 'pt-xint');
  svg += drawPoint(0, w / q, `(0, ${cNum(w / q, 1)})`, cGreen, 6, 'pt-yint');
  if (state.mode === 'base') {
   for (const [name,x,y] of [['A',3,4],['B',5,4]]) {
    const affordable=p*x+q*y<=w+1e-9;
    svg += drawPoint(x,y,name,affordable?cGreen:cRed,6,`example-${name}`);
   }
  }
  if (state.mode === 'endowment' && state.endowment) {
   const e = state.endowment;
   svg += drawPoint(e[0], e[1], `禀赋 e (${e[0]}, ${e[1]})`, cGold, 7, 'pt-endow');
  }
 } else if (mode === 'rules' || mode === 'homogeneous') {
  const p = state.p ?? 1, q = state.q ?? 1, w = state.w ?? 12;
  svg += drawBudgetLine(p, q, w, cGreen, 2);
  if (state.rule !== 'intro') {
   const rule = state.rule || 'half', pt = demandC(rule, p, q, w).bundle;
   const labels = { cheaper:'便宜品', equal:'数量相同', half:'各花一半', cap:'包子优先' };
   const lbl = `${labels[rule]} (${cNum(pt[0], 1)}, ${cNum(pt[1], 1)})`;
   const x = sx(pt[0]), y = sy(pt[1]), anchor = pt[0] > maxCoord * .55 ? 'end' : 'start';
   svg += drawPoint(pt[0], pt[1], '', cPurple, 7, `pt-rule-${rule}`);
   svg += cText(x + (anchor === 'end' ? -8 : 8), y < top + 24 ? y + 18 : y - 15, lbl, small ? 11 : 13, cPurple, anchor);
  }
 } else if (mode === 'optimum') {
  const p = state.p ?? 2, q = state.q ?? 1, w = state.w ?? 12;
  svg += drawBudgetLine(p, q, w, cGreen, 2);
  if (state.model === 'complement') {
   const eq = w / (p + q);
   svg += drawIndifference('complement', eq, cPurple);
   svg += drawPoint(eq, eq, `折点唯一最优 (${cNum(eq, 1)}, ${cNum(eq, 1)})`, cPurple, 7, 'pt-comp');
  } else if (state.model === 'linear') {
   const a=[0,w/q],b=[w/p,0];
   svg += drawIndifference('linear', w/p, cPurple);
   svg += drawPoint(...a, '', cPurple, 6, 'pt-l1') + drawPoint(...b, '', cPurple, 6, 'pt-l2');
   svg += cText(sx(a[0])+8, sy(a[1])-10, `(0, ${cNum(a[1])})`, small?11:13, cPurple);
   svg += cText(sx(b[0])-8, sy(b[1])-12, `(${cNum(b[0])}, 0)`, small?11:13, cPurple, 'end');
   svg += cText(sx(w/(2*p)), sy(w/(2*q)) - 12, '整条线段都最优', small ? 11 : 13, cGold, 'middle');
  } else {
   const opt = demandC('cd',p,q,w,.5).bundle, choice = state.candidate || opt;
   const uVal = Math.sqrt(choice[0] * choice[1]);
   svg += drawIndifference('cd', uVal, cPurple);
   svg += drawPoint(choice[0], choice[1], `${state.candidate?'当前篮子':'最优篮子'} (${cNum(choice[0], 1)}, ${cNum(choice[1], 1)})`, cPurple, 7, 'pt-cd');
  }
 } else if (mode === 'mrs' || mode === 'corners') {
  const p = state.p ?? 2, q = state.q ?? 1, w = state.w ?? 12;
  svg += drawBudgetLine(p, q, w, cGreen, 2);
  if (state.model === 'quasi') {
   const [xOpt,yOpt]=demandC('quasi',p,q,w).bundle;
   const uVal = xOpt + Math.sqrt(yOpt);
   svg += drawIndifference('quasi', uVal, cPurple);
   svg += drawPoint(xOpt, yOpt, xOpt <= 1e-9 ? `角点 (${cNum(xOpt, 2)}, ${cNum(yOpt, 2)})` : `内点 (${cNum(xOpt, 2)}, ${cNum(yOpt, 2)})`, cPurple, 7, 'pt-quasi');
  } else {
   const opt = demandC('product',p,q,w).bundle, choice=mode==='mrs' && state.candidate ? state.candidate : opt;
   const [x,y]=choice,slope=y/x;
   svg += drawIndifference('product', x*y, cPurple);
   if(mode==='mrs'){
    const leftX=Math.max(0,x-1,x+(y-maxCoord)/slope),rightX=Math.min(maxCoord,x+1,x+y/slope);
    svg += cLine(sx(leftX),sy(y+slope*(x-leftX)),sx(rightX),sy(y+slope*(x-rightX)),cGold,2,'5 4');
   }
   svg += drawPoint(x,y,`${state.candidate?'比较篮子':'相切点'} (${cNum(x,1)}, ${cNum(y,1)})`,cPurple,7,'pt-mrs');
  }
 } else if (mode === 'rationalize' || mode === 'warp') {
  if (mode === 'warp') {
   const first=state.scenario==='tie'?{prices:[1,1],w:1,bundle:[0,1]}:sourceWarp().first;
   const second=state.scenario==='tie'?{prices:[1,1],w:1,bundle:[1,0]}:sourceWarp().second;
   const result=warpC(first,second),[pA,qA]=first.prices,[pB,qB]=second.prices;
   svg += drawBudgetLine(pA,qA,first.w,cGreen,2.5);
   if(state.scenario!=='tie' && (state.stage>=2 || state.revealB>0)){
    const [[x0,y0],[x1,y1]]=clipConsumerBudget(pB,qB,second.w,maxCoord).line;
    const reveal=state.stage>=2?1:state.revealB;
    svg += cLine(sx(x0),sy(y0),sx(x0+(x1-x0)*reveal),sy(y0+(y1-y0)*reveal),cPurple,2.5,'5 4');
   }
   svg += drawPoint(...first.bundle, 'A：豆浆 (0,1)', cGreen, 7, 'pt-wa');
   svg += drawPoint(...second.bundle, '', cPurple, 7, 'pt-wb');
   svg += cText(sx(second.bundle[0])-8,sy(second.bundle[1])-12,'B (1,0)',small?11:13,cPurple,'end');
   if(state.showC)svg += drawPoint(1.2,.2,'C',cGold,6,'pt-wc');
   if(state.stage>=2)svg += cText(W/2,H-10,result.violation?'两次均有剩钱：本例违反 WARP':'两次都在边界：无严格显示',small?11:13,result.violation?cRed:cGold,'middle');
  } else {
   const p = state.p ?? 1, q = state.q ?? 2, w = state.w ?? 12;
   svg += drawBudgetLine(p, q, w, cGreen, 2);
   if (state.rule === 'expensive') {
    const secondP=q,secondQ=p,first=demandC('expensive',p,q,w),second=demandC('expensive',secondP,secondQ,w);
    svg += drawBudgetLine(secondP,secondQ,w,cPurple,2,'4 3');
    svg += drawPoint(...first.bundle, '第一次选择 A', cRed, 7, 'pt-exp');
    svg += drawPoint(...second.bundle, '第二次选择 B', cPurple, 7, 'pt-rat');
   } else {
    const rule=state.rule==='cheaper'?'cheaper':'half',candidate=state.candidate||'linear';
    const r=rationalizationC(rule,candidate,p,q,w),[x,y]=r.observed.bundle;
    if(state.reveal>0 && candidate!=='max')svg+=`<g opacity="${state.reveal}">`+drawIndifference(candidate,r.optimal.u,cPurple)+'</g>';
    svg += drawPoint(x,y,'',cGreen,7,'pt-rat');
    const anchor=x>maxCoord*.55?'end':'start';
    svg += cText(sx(x)+(anchor==='end'?-8:8),sy(y)-12,`观察 (${cNum(x)}, ${cNum(y)})`,small?11:13,cGreen,anchor);
    if(state.textbookCheck){
     const [xx,yy]=r.optimal.bundle;
     svg += drawPoint(xx,yy,'',cRed,7,'pt-better');
     svg += cLine(sx(xx),sy(yy)-8,sx(xx),sy(yy)-88,cRed,1,'2 3');
     svg += cText(sx(xx)-8,sy(yy)-94,`更优 (${cNum(xx)}, ${cNum(yy)})`,small?11:13,cRed,'end');
     svg += cText(W/2,H-10,'max：6 < 12；平方和：72 < 144',small?11:13,cRed,'middle');
    } else if(candidate==='linear'&&p===q&&state.reveal>0){
     svg += cText(W/2,H-10,'预算线上所有篮子都最优',small?11:13,cGold,'middle');
    }
   }
  }
 } else if (mode === 'normal') {
  const p=state.p ?? 1,q=state.q ?? 1,w=state.w ?? 8,extra=state.extraW ?? 0;
  const n=normalMRSC('cd',p,q,w,extra,.5);
  svg += drawBudgetLine(p,q,w,cGreen,2);
  if(extra>0.001)svg += drawBudgetLine(p,q,w+extra,cPurple,2,'4 3');
  svg += drawPoint(...n.old.bundle,'原 A (4,4)',cGreen,6,'pt-na');
  if(extra>0.001){
   svg += cLine(sx(n.old.bundle[0]),sy(n.old.bundle[1]),sx(n.vertical[0]),sy(n.vertical[1]),cGold,1.5,'3 3');
   svg += drawPoint(...n.vertical,extra>.8?'假想 D':'',cGold,6,'pt-vertical');
  }
  if(state.candidate){
   const [x,y]=state.candidate;
   svg += drawIndifference('product',x*y,cPurple);
   svg += drawPoint(x,y,'',cPurple,7,'pt-nb');
   if(x>4.5)svg += cText(sx(x)+8,sy(y)-9,state.stage==='optimal'?'新最优 B':'比较篮子',small?11:13,cPurple);
  }
 } else if (mode === 'property') {
  const p1=state.p1 ?? 1,compW=6*p1+6;
  svg += drawBudgetLine(1,1,12,cGreen,2);
  if(p1>1.001)svg += drawBudgetLine(p1,1,compW,cGold,2,'4 3');
  svg += drawPoint(6,6,'原选择 A',cGreen,7,'pt-sa');
  if(state.candidate){
   const [x,y]=state.candidate;
   svg += drawPoint(x,y,x>6.4?'假想 B':'',cRed,7,'pt-bh');
   if(state.stage==='contradiction')svg += cText(W/2,H-10,'旧价格下B只花10元，A原来被选中',small?10:12,cRed,'middle');
  }
 } else if (mode === 'slutsky') {
  const p0 = state.p0 ?? state.p ?? 1, p1 = state.p1 ?? state.newP ?? 2, q = state.q ?? 1, w = state.w ?? 12;
  const z=slutskyC('product',p0,p1,q,w), A=z.A.bundle;
  svg += drawBudgetLine(p0, q, w, cGreen, 2);
  svg += drawPoint(A[0], A[1], '原初态 A (6, 6)', cGreen, 7, 'pt-sa');

  if (state.step >= 1 || state.contra) {
   const compW = z.wealth;
   svg += drawBudgetLine(p1, q, compW, cGold, 2, '4 3');
  }
  if (state.step >= 2) {
   const B = z.B.bundle;
   svg += `<g opacity="${state.reveal ?? 1}">`+drawPoint(B[0], B[1], '补偿态 B (4.5, 9)', cGold, 7, 'pt-sb')+cLine(sx(A[0]), sy(A[1]), sx(B[0]), sy(B[1]), cGold, 2)+'</g>';
  }
  if (state.step >= 3) {
   const currentW=state.incomeW??w,C=demandC('product',p1,q,currentW).bundle;
   svg += drawBudgetLine(p1, q, currentW, cPurple, 2);
   svg += drawPoint(C[0], C[1], currentW===w?'终态 C (3, 6)':`当前篮子 (${cNum(C[0])}, ${cNum(C[1])})`, cPurple, 7, 'pt-sc');
   svg += cLine(sx(z.B.bundle[0]), sy(z.B.bundle[1]), sx(C[0]), sy(C[1]), cPurple, 2);
  }
  if (state.contra) {
   const Bhypo = [A[0]+2, (z.wealth-p1*(A[0]+2))/q];
   svg += drawPoint(Bhypo[0], Bhypo[1], '假设反例 B (8, 2)', cRed, 7, 'pt-bh');
   svg += cText(sx(5), sy(2), '落在原预算线内部：违反 WARP！', small ? 10 : 12, cRed, 'middle');
  }
 } else if (mode === 'giffen') {
  const p = state.p ?? 1.5, q = state.q ?? 1, w = state.w ?? 10;
  svg += drawBudgetLine(p, q, w, cGreen, 2);
  const z=demandC('giffen',p,q,w), [xG,yG]=z.bundle;
  svg += drawIndifference('giffen', z.u, cPurple);
  svg += drawPoint(xG, yG, `最优购物篮 (${cNum(xG, 2)}, ${cNum(yG, 2)})`, cRed, 7, 'pt-gif');
 }

 return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${cEsc(frame.title)}">${svg}</svg>`;
}

const consumerProofs = {
 budget: String.raw`<details class="sd-proof" open><summary>教材定义与几何公理：预算集与禀赋模型</summary><ol>
<li><strong>预算集定义</strong>：<span class="equation">B((p_1, p_2), w) = \{(x_1, x_2) \in \mathbb{R}_+^2 : p_1 x_1 + p_2 x_2 \le w\}</span>，是包含原点与两截距 <span class="equation">(\frac{w}{p_1},0)</span> 和 <span class="equation">(0,\frac{w}{p_2})</span> 的三角形。</li>
<li><strong>斜率与相对价格</strong>：预算线斜率 <span class="equation">-\frac{p_1}{p_2}</span>；在花完预算的边界上，多买1单位商品1要少买 <span class="equation">\frac{p_1}{p_2}</span> 单位商品2。</li>
<li><strong>换一组数怎么做</strong>：先写 <span class="equation">p_1x_1+p_2x_2\le w</span>；分别令一项数量为零，求两个截距，再用不等号判断篮子是否买得起。现金固定且仅商品1涨价时，商品2截距不变。</li>
<li><strong>教材笔误校准</strong>：印刷58页正文的预算线纵截距写成 <span class="equation">w/p_1</span>；由预算方程及图5.1可知应为 <span class="equation">w/p_2</span>。</li>
<li><strong>比例缩放公理</strong>：对任意 <span class="equation">\lambda > 0</span>，<span class="equation">B((\lambda p_1, \lambda p_2), \lambda w) = B((p_1, p_2), w)</span>，从定义上消除了名义单位与货币幻觉。</li>
<li><strong>禀赋转换</strong>：禀赋束 <span class="equation">e</span> 的市场价值为 <span class="equation">w = p_1 e_1 + p_2 e_2</span>。若可以按给定价格自由交换、没有交易成本，价格变动时预算线仍经过原有篮子 <span class="equation">e</span>；这与现金财富固定是不同设定。</li>
</ol></details>`,

 rules: String.raw`<details class="sd-proof" open><summary>需求函数四种启发式规则与解析表达式</summary><ol>
<li><strong>例5.1 全买便宜品</strong>：<span class="equation">p_1 &lt; p_2 \implies (\frac{w}{p_1}, 0)</span>；<span class="equation">p_1 &gt; p_2 \implies (0, \frac{w}{p_2})</span>；同价时各用一半财富。</li>
<li><strong>例5.2 等数量规则</strong>：联立 <span class="equation">x_1 = x_2</span> 与预算约束解得 <span class="equation">x_1 = x_2 = \frac{w}{p_1 + p_2}</span>。</li>
<li><strong>例5.3 各花一半规则</strong>：<span class="equation">x_1 = \frac{w}{2p_1},\quad x_2 = \frac{w}{2p_2}</span>。例如2元与1元、共12元时分别为3和6；数量相同规则则是4和4。该规则也可由特定的柯布-道格拉斯偏好产生，但这里先作为行为规则。</li>
<li><strong>例5.4 优先买至7单位</strong>：<span class="equation">x_1 = \min\left\{\frac{w}{p_1}, 7\right\},\quad x_2 = \frac{w - p_1 x_1}{p_2}</span>，在 <span class="equation">w = 7p_1</span> 处发生规则转折。</li>
<li><strong>换数做题</strong>：先读清购买规则与每种价格；如果是“数量相同”，先求一组两样东西的总价；如果是“支出各半”，先把钱分成两份，再分别除以单价。最后把购物篮代回预算，核对非负且没有超支。</li>
</ol></details>`,

 homogeneous: String.raw`<details class="sd-proof" open><summary>需求函数的零次齐次性严格证明</summary><ol>
<li><strong>命题要求</strong>：对任意 <span class="equation">\lambda > 0</span>，<span class="equation">x((\lambda p_1, \lambda p_2), \lambda w) = x((p_1, p_2), w)</span>。</li>
<li><strong>集合恒等</strong>：因为预算集 <span class="equation">B((\lambda p_1, \lambda p_2), \lambda w)</span> 与 <span class="equation">B((p_1, p_2), w)</span> 具有完全相同的元素：<div class="equation">\lambda p_1 x_1 + \lambda p_2 x_2 \le \lambda w \iff p_1 x_1 + p_2 x_2 \le w</div></li>
<li><strong>结论</strong>：既然约束集合完全同一，依赖于预算集的任何单值选择函数必然指定完全相同的物理消费束。</li>
</ol></details>`,

 optimum: String.raw`<details class="sd-proof" open><summary>命题5.1 证明与极值唯一性分析</summary><ol>
<li><strong>存在性</strong>：预算集 <span class="equation">B</span> 是非空紧集（闭且有界）。偏好连续保证效用函数 <span class="equation">u</span> 连续，由 Weierstrass 极值定理，最大值必然存在。</li>
<li><strong>落在预算线上</strong>：反设最优解 <span class="equation">a</span> 满足 <span class="equation">p \cdot a < w</span>。由严格单调性，可在微小邻域内取 <span class="equation">a + (\epsilon, \epsilon)</span> 仍可负担且严格更优，矛盾！</li>
<li><strong>严格凸保证唯一性</strong>：若存在两不同最优解 <span class="equation">a \ne b</span>，则中点 <span class="equation">m = 0.5a + 0.5b</span> 落在预算集内，由严格凸性 <span class="equation">m \succ a</span>，与最优性矛盾！故最优解必唯一。</li>
<li><strong>本例如何算</strong>：先写 <span class="equation">2x_1+x_2=12</span>；在预算线上，<span class="equation">x_1x_2=x_1(12-2x_1)=18-2(x_1-3)^2</span>，故最大值在 <span class="equation">(3,6)</span>。本例最优有正效用；预算有剩且正价格时可增加两样，因而不可能更优。</li>
<li><strong>遇到新题先辨偏好</strong>：光滑内点可检验切线条件，但还要确认全局最优；成套搭配先比较折点，完全替代先比较单位价格，价比相同时可能有整段最优。严格凸是唯一性的充分条件，并非必要条件。</li>
</ol></details>`,

 existence: String.raw`<details class="sd-proof" open><summary>极值不存在反例的严密分析</summary><ol>
<li><strong>目标设定</strong>：展示当偏好不连续时，即使预算集非空、闭且有界（紧集），最优解集仍可能为空集。</li>
<li><strong>反例构造</strong>：定义自主反例偏好在 <span class="equation">x_1 &lt; 1</span> 时为 <span class="equation">u=x_1</span>，在 <span class="equation">x_1 \ge 1</span> 时为 0。预算集为 <span class="equation">p_1=1, p_2=1, w=1</span>。</li>
<li><strong>上确界不可达</strong>：在预算集内取序列 <span class="equation">x^n = (1 - 1/n, 0)</span>，效用趋于上确界 1。但在唯一能取到 <span class="equation">x_1=1</span> 的可行端点 <span class="equation">(1,0)</span> 处效用骤降为 0，所以预算集内没有任何消费束能达到 1。这里的序列位于预算集内，不全在预算线上。</li>
<li><strong>做题区分充分与必要</strong>：连续性是紧预算集上存在最优解的充分条件，而非必要条件（例如习题5.1(a)的字典序偏好不连续，但在正价格预算集上仍有唯一最优解）。</li>
</ol></details>`,

 mrs: String.raw`<details class="sd-proof" open><summary>命题5.2 证明：切点条件 MRS = p₁/p₂</summary><ol>
<li><strong>主客观替代平衡</strong>：主观愿望 <span class="equation">MRS = v_1/v_2</span>，市场交换率 <span class="equation">p_1/p_2</span>。</li>
<li><strong>沿预算线微调</strong>：若 <span class="equation">MRS &gt; p_1/p_2</span>，少拿一点商品2换商品1，在可微且两侧都可行的内点附近效用提高；若小于价格比则反向调整。</li>
<li><strong>本例联立</strong>：<span class="equation">u=x_1x_2</span>，在正数量处 <span class="equation">MRS=\frac{x_2}{x_1}</span>。令 <span class="equation">\frac{x_2}{x_1}=2</span> 与 <span class="equation">2x_1+x_2=12</span> 同时成立，得到 <span class="equation">(x_1,x_2)=(3,6)</span>。沿预算线乘积为 <span class="equation">18-2(x_1-3)^2</span>，所以本例确为全局最大。</li>
<li><strong>边界与条件</strong>：内点可行且偏好满足相应光滑性时，相等是必要条件；还要比较可行边界并核对全局最优。角点只比较可行方向：在相关单侧导数存在且分母为正时，<span class="equation">x_1=0</span> 检查 <span class="equation">MRS\le \frac{p_1}{p_2}</span>，<span class="equation">x_2=0</span> 检查 <span class="equation">MRS\ge \frac{p_1}{p_2}</span>；分母为零或不可微时不能直接使用比值。</li>
</ol></details>`,

 corners: String.raw`<details class="sd-proof" open><summary>拟线性偏好角点与内点条件严格推导</summary><ol>
<li><strong>效用函数</strong>：<span class="equation">u = x_1 + \sqrt{x_2} \implies MRS = 2\sqrt{x_2}</span>。</li>
<li><strong>内点切点解</strong>：令 <span class="equation">2\sqrt{x_2} = p_1/p_2 \implies x_2^* = \left(\frac{p_1}{2p_2}\right)^2</span>。所需支出为 <span class="equation">p_2 x_2^* = \frac{p_1^2}{4p_2}</span>。</li>
<li><strong>财富分段</strong>：若 <span class="equation">w \le \frac{p_1^2}{4p_2}</span>，最优角点为 <span class="equation">(0, \frac{w}{p_2})</span>；若 <span class="equation">w &gt; \frac{p_1^2}{4p_2}</span>，两样都买，本例最优商品2数量不随财富变化，但商品2仍有正的边际效用。</li>
<li><strong>临界点别误判</strong>：当 <span class="equation">w=\frac{p_1^2}{4p_2}</span> 时，<span class="equation">x_1^*=0</span> 且 <span class="equation">MRS=\frac{p_1}{p_2}</span>；相等不保证内点。代入本例正价格 <span class="equation">p_1=3,p_2=1</span>，临界预算是 <span class="equation">\frac{9}{4}=2.25</span>。</li>
<li><strong>换数做题</strong>：先解出内点候选及买下它所需的最低预算；低于或等于门槛时检查角点，超过门槛再代入预算求商品1，并检验数量非负及一侧条件。本例效用沿预算线是凹函数，因此该比较确定全局最优。</li>
</ol></details>`,

 rationalize: String.raw`<details class="sd-proof" open><summary>需求函数理性化定义与全买高价的反例否证</summary><ol>
<li><strong>理性化定义</strong>：需求函数 <span class="equation">x(p, w)</span> 可由单调偏好 <span class="equation">\succeq</span> 理性化，当且仅当 <span class="equation">x(p, w)</span> 恒为预算集上的最优解。</li>
<li><strong>例5.9 全买便宜品</strong>：设 <span class="equation">u=x_1+x_2</span>，由 <span class="equation">\min\{p_1,p_2\}(x_1+x_2)\le w</span> 可知全部预算买便宜品达到最大总量；同价时规则的均分篮子也在最优线上。适用所有正价格与正预算，不要求该选择是唯一最优。</li>
<li><strong>例5.10 各花一半</strong>：设 <span class="equation">a=p_1x_1,\quad b=p_2x_2</span>，非负且 <span class="equation">a+b\le w</span>。由 <span class="equation">ab\le\frac{(a+b)^2}{4}\le\frac{w^2}{4}</span>，<span class="equation">u=x_1x_2=\frac{ab}{p_1p_2}</span> 在 <span class="equation">a=b=\frac{w}{2}</span> 达最大；这覆盖所有正价格和预算。</li>
<li><strong>原书例5.9附带说法校验</strong>：其称 <span class="equation">\max\{x_1,x_2\}</span> 和 <span class="equation">x_1^2+x_2^2</span> 也理性化含同价均分的规则。取 <span class="equation">p_1=p_2=1,w=12</span>，规则选 <span class="equation">(6,6)</span>，可行的 <span class="equation">(12,0)</span> 在两种效用下都严格更高：分别为6对12、72对144。因此该附带说法在同价分支上与规则不一致。</li>
<li><strong>例5.11 否证</strong>：价格 <span class="equation">(1,2)</span>、财富12时选 <span class="equation">A=(0,6)</span>；价格 <span class="equation">(2,1)</span>、财富12时选 <span class="equation">B=(6,0)</span>。两次对方的束均只花6，严格落在预算内。若由单调偏好理性化，第一次选择推出 <span class="equation">A\succ B</span>，第二次推出 <span class="equation">B\succ A</span>，矛盾。</li>
</ol></details>`,

 warp: String.raw`<details class="sd-proof" open><summary>命题5.3 证明：理性消费者需求满足 WARP</summary><ol>
<li><strong>直接显示偏好</strong>：若 <span class="equation">p \cdot b \le w</span> 且 <span class="equation">a</span> 被选中，则 <span class="equation">a \succeq b</span>。</li>
<li><strong>反证法</strong>：如果第二期选 <span class="equation">b</span>，而 <span class="equation">p'\cdot a < w'</span>，则 <span class="equation">b</span> 严格显示优于 <span class="equation">a</span>。</li>
<li><strong>单调性推出矛盾</strong>：在第二期预算内，可找到两种商品都严格多于 <span class="equation">a</span> 的束 <span class="equation">c</span>，因此 <span class="equation">b\succeq c\succ a</span>。这与第一期推出的 <span class="equation">a\succeq b</span> 矛盾。只知道两次均弱可负担，不能省略严格条件。</li>
<li><strong>换数检验</strong>：先分别计算 <span class="equation">p^A\cdot B</span> 与 <span class="equation">p^B\cdot A</span>，再与各自预算比较；两边都不超过，且至少一边严格小于，才能形成此处的反向严格矛盾。还需确认两次实际选择都可负担。</li>
<li><strong>两边均取等号</strong>：不因这两次弱显示就判违反教材的WARP。同一预算集出现两个选择还与单值需求的设定不符，可能反映平局处理；未发现这类两次矛盾，也不足以证明整个需求函数可理性化。</li>
</ol></details>`,

 curves: String.raw`<details class="sd-proof" open><summary>三大需求曲线体系与微观比较静态</summary><ol>
<li><strong>常规需求</strong>：<span class="equation">x_1^*(p_1) = x_1(p_1, p_2^0, w^0)</span>，沿自身价格轴刻画价格机制。</li>
<li><strong>交叉需求</strong>：<span class="equation">\hat{x}_2(p_1) = x_2(p_1, p_2^0, w^0)</span>。可微时，交叉价格效应为正或负对应该方向的毛替代或毛互补；零效应不属于严格正负。本例固定支出份额，豆浆数量恒为6，不代表一般结果。</li>
<li><strong>恩格尔曲线</strong>：<span class="equation">x_1(w) = x_1(p_1^0, p_2^0, w)</span>。在相关财富区间里需求不减少称为正常，减少称为劣等；可微时可结合导数判断，单点导数为零不能单独判定整个区间。</li>
<li><strong>换数字怎么做</strong>：先从需求函数代入保持不变的价格和预算，再选出变化的变量作横轴；给这个变量代入两个值求纵轴数量，标点并连成相应曲线。这个画面横轴是价格或预算，纵轴是数量；与常见的价格纵轴画法相反。</li>
</ol></details>`,

 normal: String.raw`<details class="sd-proof" open><summary>命题5.4：固定包子数量的纵向比较</summary><ol>
<li><strong>教材命题的条件</strong>：对每个固定的 <span class="equation">x_1</span>，<span class="equation">MRS(x_1,x_2)</span> 随 <span class="equation">x_2</span> 严格上升。价格固定且财富上升。</li>
<li><strong>本例几何</strong>：旧切点是 <span class="equation">(4,4)</span>；在新预算上保持商品1不变得到 <span class="equation">(4,8)</span>。本例 <span class="equation">MRS=x_2/x_1</span>，所以从1升到2，而价格比保持1。</li>
<li><strong>方向与边界</strong>：在本例中，商品1的主观交换价值高于市场交换率，沿新预算线向右移动可改善；新最优为 <span class="equation">(6,6)</span>。一般论证还需检查内点、角点与可微条件，不能将射线比较替换为教材的竖直比较。</li>
</ol></details>`,

 slutsky: String.raw`<details class="sd-proof" open><summary>命题5.5 斯勒茨基分解定理与代数恒等式</summary><ol>
<li><strong>总效应分解</strong>：<span class="equation">\Delta x_1 = [x_1(p_1', p_2, w') - x_1(p_1, p_2, w)] + [x_1(p_1', p_2, w) - x_1(p_1', p_2, w')]</span>。</li>
<li><strong>替代效应恒非正</strong>：由 WARP，经 Slutsky 补偿 <span class="equation">w' = p_1' a_1 + p_2 a_2</span> 后的需求 <span class="equation">b</span> 必满足 <span class="equation">b_1 \le a_1</span>。</li>
<li><strong>本例算一遍</strong>：先得 <span class="equation">A=(6,6)</span>；旧篮子按新价格需 <span class="equation">w'=2\times6+1\times6=18</span>，补偿后 <span class="equation">B=(4.5,9)</span>；回到12元得到 <span class="equation">C=(3,6)</span>。所以 <span class="equation">B_1-A_1=-1.5,\quad C_1-B_1=-1.5,\quad C_1-A_1=-3</span>。</li>
<li><strong>收入效应符号</strong>：若商品为正常品，收入效应为负（因涨价后实际购买力下降），两效应叠加强化需求下降；若为劣等品，两效应方向相反。Slutsky 补偿让旧篮子刚好可买，不保证旧效用不变；Hicks 补偿采用另一标准。</li>
</ol></details>`,

 property: String.raw`<details class="sd-proof" open><summary>做题：如何用 WARP 证明补偿需求不增加？</summary><ol>
<li><strong>先写条件：</strong>价格为正，需求函数单值、满足 WARP，且每次所选篮子花完预算。只有包子涨价；补偿后的预算恰好够买原篮子 A。</li>
<li><strong>算补偿：</strong>用涨价后的价格给旧篮子算一遍账，得到新预算。<div class="equation">w'=p_1'a_1+p_2a_2</div></li>
<li><strong>反过来假设：</strong>假设补偿后的篮子 B 中包子比 A 多。B 在新预算下可负担，因此按旧价格计算有：<div class="equation">p_1b_1+p_2b_2 \le w'-(p_1'-p_1)b_1 &lt; w'-(p_1'-p_1)a_1=w</div>第一个不等号来自 B 在新预算下可负担；第二个来自包子涨价且假设 B 的包子更多。即使 B 在新预算线内部，这个推理也成立。</li>
<li><strong>比较两次：</strong>旧预算下 B 严格买得起，但选了 A；新预算下 A 刚好买得起，却假设选了 B。这与 WARP 冲突，所以反设不成立：<div class="equation">b_1\le a_1</div></li>
</ol></details>`,

 giffen: String.raw`<details class="sd-proof" open><summary>做题：怎样验证这个吉芬例子？</summary><ol>
<li><strong>先写预算和偏好</strong>：<span class="equation">p_1x_1+x_2=w</span>，<span class="equation">u=\min\{x_1+x_2,4x_1+2x_2-12\}</span>。两段相等的折点满足 <span class="equation">3x_1+x_2=12</span>。</li>
<li><strong>先检查区间</strong>：当 <span class="equation">p_2=1,\quad 1&lt;p_1&lt;2,\quad 4p_1&lt;w&lt;12</span> 时，折点在非负预算线上，预算线斜率夹在两段无差异曲线斜率之间；该折点是本例最优束。</li>
<li><strong>联立并求方向</strong>：得到 <span class="equation">x_1=\frac{12-w}{3-p_1},\quad x_2=12-3x_1</span>。因此 <span class="equation">\frac{\partial x_1}{\partial p_1}=\frac{12-w}{(3-p_1)^2}&gt;0,\quad \frac{\partial x_1}{\partial w}=-\frac{1}{3-p_1}&lt;0</span>：这里主食既是局部吉芬品，也是局部劣等品。</li>
<li><strong>理解原因，别倒推</strong>：在适用 Slutsky 分解且相关导数存在时，<span class="equation">\frac{\partial x_1}{\partial p_1}=\frac{\partial x_1^S}{\partial p_1}-x_1\frac{\partial x_1}{\partial w}</span>。吉芬现象需要正的收入效应超过替代效应的绝对值；劣等品并不一定是吉芬品。区间以外要重新比较最优束。</li>
</ol></details>`
};

export function renderConsumerStory(meta, requested, phase = 0) {
 const mode = requested && consumerStories[requested] ? requested : (meta.scenarios?.[0]?.value || 'budget');
 const story = consumerStories[mode] || consumerStories.budget;
 const pIdx = Math.max(0, Math.min(story.frames.length - 1, Number(phase) || 0));
 const frame = consumerFrame(mode, pIdx);
 const readout = consumerReadout(mode, frame);
 const small = cEl('plot').clientWidth < 500;
 const plot = cEl('plot');
 const ruleGuides=['先看清包子和豆浆的单价、现金预算与购买规则。','在同一预算线内，按当前规则算出并找到购物篮。','比较数量相同与花钱相同；不同规则不一定来自同一套偏好。'];
 const homGuides=['先看两种价格、预算及各花一半的例子。','价格与预算同时乘同一个正数，比较每个篮子的可负担性。','单独改变一种价格不属于同比缩放；本例选择变化不能推广为所有规则。'];
 const curveGuides=['先看图上横轴是什么条件，纵轴是哪种商品数量。','一次只改变包子价或预算；按规则计算并跟着紫点走。','区分自身需求、交叉需求和恩格尔曲线；例子方向不代表所有规则。'];
 const optGuides=['先看预算、价格与当前顾客的偏好。','在可负担的篮子中比较满意程度，留意偏好和价格何时改变。','平滑切点、折点与整条最优线是不同情况；条件不能混用。'];
 const mrsGuides=['先看当前篮子、价格与本例偏好。','比较局部愿意放弃多少豆浆与市场要求放弃多少。','内点相等后还要检查全局；角点只比较可行的一侧。'];
 const cornerGuides=['先看包子和豆浆的价格、预算与给定偏好。','追踪预算增加时紫点何时离开纵轴。','等号也可能落在角点；先验非负与预算，再决定是否为内点。'];
 const warpGuides=['先读两次价格、预算和实际选择，确认所选篮子买得起。','把另一次选的篮子代入当前预算，记录是否有剩钱。','两边弱可负担且至少一边严格，才出现本定义的反向严格矛盾。'];
 const propertyGuides=['先看两次价格、原篮子和假想补偿金额。','假设新篮子包子更多，再算它在旧价格下要花多少钱。','两次互相买得起且旧预算严格有剩钱，与WARP冲突。'];
 const normalGuides=['先读价格、预算、偏好及要回答的问题。','金点是构造的比较篮子；沿新预算线比较满意程度，再找到新最优。','本例结果与一般命题分开；判断正常品时固定价格，检查收入区间。'];
 const ratGuides=['先看当前规则、价格、预算和观察到的篮子。','尝试一套偏好，比较所选篮子与同预算下的其他篮子。','一次相符不足以证明全部；同价分支也要验证。'];
 const existGuides=['先看清横轴是商品1数量 x₁，纵轴是效用 u（不是商品2数量）。','追踪金点向 x₁=1 逼近时效用如何接近空心点 1，而端点红点效用骤降为 0。','分清充分条件与必要条件：连续性保证紧预算集有解，但并非所有不连续偏好都无解。'];
 ruleGuides.forEach((text,i)=>{const el=cEl(`guide-${i}`);if(!el)return;if(!el.dataset.originalGuide)el.dataset.originalGuide=el.textContent;el.textContent=mode==='rules'?text:mode==='homogeneous'?homGuides[i]:mode==='curves'?curveGuides[i]:mode==='optimum'?optGuides[i]:mode==='mrs'?mrsGuides[i]:mode==='corners'?cornerGuides[i]:mode==='warp'?warpGuides[i]:mode==='rationalize'?ratGuides[i]:mode==='normal'?normalGuides[i]:mode==='property'?propertyGuides[i]:mode==='existence'?existGuides[i]:el.dataset.originalGuide;});

 let existContext=cEl('existence-situation');
 if(mode==='existence'){
  if(!existContext){existContext=document.createElement('section');existContext.id='existence-situation';existContext.setAttribute('aria-label','反例情境、条件与问题');cEl('legend').before(existContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>设两种商品单价均为1元、预算为1元，可行篮子满足 x₁+x₂≤1。为检验教材命题5.1的连续性前提，自主构造不连续效用：当 x₁&lt;1 时 u(x₁,x₂)=x₁；当 x₁≥1 时 u(x₁,x₂)=0。</p><p class="reading"><strong>这张图要回答：</strong>预算集明明有界且包含边界，为什么却找不到最满意的一篮？注意本图横轴是商品1数量 x₁，纵轴是效用 u（不是商品2数量）；空心点表示永远达不到的上确界 1。</p>';
  if(existContext.dataset.signature!==html){existContext.dataset.signature=html;existContext.innerHTML=html;}
 }else existContext?.remove();
 let context=cEl('giffen-situation');
 if(mode==='giffen'){
  if(!context){context=document.createElement('section');context.id='giffen-situation';context.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(context)}
  const html='<p class="reading"><strong>情境与条件：</strong>一位顾客用10元买主食 x₁ 和配菜 x₂。配菜每份1元；主食从每份1.2元涨到1.5元，再涨到1.7元。她每次都在预算内选自己最喜欢的组合。为展示这种可能，特意设定 u=min{x₁+x₂, 4x₁+2x₂−12}；份数可为小数。</p><p class="reading"><strong>这张图要回答：</strong>主食涨价、钱不变，她可能反而多买主食吗？红点表示每个价格下重新选出的购物篮；横轴是主食份数，纵轴是配菜份数。</p>';
  if(context.dataset.signature!==html){context.dataset.signature=html;context.innerHTML=html;}
 }else context?.remove();
 let budgetContext=cEl('budget-situation');
 if(mode==='budget'){
  if(!budgetContext){budgetContext=document.createElement('section');budgetContext.id='budget-situation';budgetContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(budgetContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨先拿12元现金买包子 x₁ 和豆浆 x₂，包子每个2元，豆浆每杯1元。后来分别比较“价格与钱同时翻倍”“一开始拥有4个包子和4杯豆浆”“现金不变但包子涨价”。数量允许是小数，数字是自主举例。</p><p class="reading"><strong>这张图要回答：</strong>哪些购物篮买得起？价格变化时，预算线为什么有时不动、有时绕一个点转？图只说明能不能买，还没决定阿姨最喜欢哪一篮。</p>';
  if(budgetContext.dataset.signature!==html){budgetContext.dataset.signature=html;budgetContext.innerHTML=html;}
 }else budgetContext?.remove();
 let rulesContext=cEl('rules-situation');
 if(mode==='rules'){
  if(!rulesContext){rulesContext=document.createElement('section');rulesContext.id='rules-situation';rulesContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(rulesContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨用现金买包子 x₁ 和豆浆 x₂，比较四种购买规则。每次的单价和预算显示在图旁；规则或价格改变时是另一个设定，数量允许取小数。数字为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>知道价格、预算和购买规则后，阿姨会挑哪一篮？尤其是“数量一样多”和“每样花一样多的钱”，结果有什么不同？绿色区域表示买得起，紫点表示该规则选出的篮子。</p>';
  if(rulesContext.dataset.signature!==html){rulesContext.dataset.signature=html;rulesContext.innerHTML=html;}
 }else rulesContext?.remove();
 let homContext=cEl('homogeneous-situation');
 if(mode==='homogeneous'){
  if(!homContext){homContext=document.createElement('section');homContext.id='homogeneous-situation';homContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(homContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨起初拿12元买包子 x₁ 和豆浆 x₂，两样单价都是1元。本例按“两样各花一半钱”选篮子；先让两种价格和预算按相同倍数变化，再单独比较只有包子涨价。数量可为小数，数字为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>所有价格和手里的钱一起翻倍，买得起的篮子和实际选择会变吗？如果只是包子涨价、钱不变，又有什么不同？绿线和浅绿区域是预算，紫点是按本例规则算出的选择。</p>';
  if(homContext.dataset.signature!==html){homContext.dataset.signature=html;homContext.innerHTML=html;}
 }else homContext?.remove();
 let curvesContext=cEl('curves-situation');
 if(mode==='curves'){
  if(!curvesContext){curvesContext=document.createElement('section');curvesContext.id='curves-situation';curvesContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(curvesContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨买包子 x₁ 和豆浆 x₂，按自主例子的规则各花一半预算；先固定豆浆单价1元和预算12元，观察包子价格变化；再固定两样单价为1元，观察预算变化。数量可为小数。</p><p class="reading"><strong>这张图要回答：</strong>包子降价，她买的包子和豆浆分别怎样变？手里的钱变多，包子又怎样变？每次先读图的坐标：横轴是包子价或预算，纵轴是标出的商品数量。</p>';
  if(curvesContext.dataset.signature!==html){curvesContext.dataset.signature=html;curvesContext.innerHTML=html;}
 }else curvesContext?.remove();
 let optContext=cEl('optimum-situation');
 if(mode==='optimum'){
  if(!optContext){optContext=document.createElement('section');optContext.id='optimum-situation';optContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(optContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>顾客有12元，买包子 x₁ 和豆浆 x₂。先以包子2元、豆浆1元比较两种假想偏好：平滑偏好 u=√(x₁x₂) 与成套偏好 u=min{x₁,x₂}；最后换成两样均1元、完全替代的假想偏好 u=x₁+x₂。数量可为小数，情境和数字为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>钱够买的篮子中哪一篮最满意？换一种偏好或价格后，为什么有时出现切点、折点，甚至一整条最优线？浅绿是买得起的范围，紫线连接满意程度相同的篮子。</p>';
  if(optContext.dataset.signature!==html){optContext.dataset.signature=html;optContext.innerHTML=html;}
 }else optContext?.remove();
 let mrsContext=cEl('mrs-situation');
 if(mode==='mrs'){
  if(!mrsContext){mrsContext=document.createElement('section');mrsContext.id='mrs-situation';mrsContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(mrsContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨有12元，包子 x₁ 每个2元、豆浆 x₂ 每杯1元，假设满意程度 u=x₁x₂；数量可为小数，生活情境和数字是自主举例。先比较(2,8)，再看(3,6)与(4,4)。</p><p class="reading"><strong>这张图要回答：</strong>在当前篮子附近，阿姨愿意用多少豆浆换一点包子？市场价格要求她放弃多少？两者相等为什么提示内点可能最优？金色虚线是紫色无差异曲线在当前点的局部切线，不代表整条曲线。</p>';
  if(mrsContext.dataset.signature!==html){mrsContext.dataset.signature=html;mrsContext.innerHTML=html;}
 }else mrsContext?.remove();
 let cornerContext=cEl('corners-situation');
 if(mode==='corners'){
  if(!cornerContext){cornerContext=document.createElement('section');cornerContext.id='corners-situation';cornerContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(cornerContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>包子 x₁ 每个3元、豆浆 x₂ 每杯1元；顾客的假想满意程度为 u=x₁+√x₂，数量可为小数。价格和偏好固定，预算从1元逐渐增加到6元，并回看2.25元门槛；生活情境和数值为自主举例。</p><p class="reading"><strong>这张图要回答：</strong>钱少时为什么只买豆浆？预算增加到哪里才开始买包子？MRS 与价格比相等时，篮子一定是两样都买吗？紫点是按当前预算和偏好算出的最优篮子。</p>';
  if(cornerContext.dataset.signature!==html){cornerContext.dataset.signature=html;cornerContext.innerHTML=html;}
 }else cornerContext?.remove();
 let warpContext=cEl('warp-situation');
 if(mode==='warp'){
  if(!warpContext){warpContext=document.createElement('section');warpContext.id='warp-situation';warpContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(warpContext)}
  const html=frame.state.scenario==='tie'
   ? '<p class="reading"><strong>对照情境与条件：</strong>换一组自主构造的观察：两次包子和豆浆都卖1元，预算都为1元；第一次选 A=(0,1)，第二次选 B=(1,0)。两次预算集相同；如果分别选A和B，需要另行解释同一预算下的平局选择与教材单值需求的关系。</p><p class="reading"><strong>这张图要回答：</strong>两个篮子互相买得起，但都刚好花完钱。这两次弱可负担是否足以构成教材定义下的反向严格矛盾？</p>'
   : '<p class="reading"><strong>情境与条件：</strong>同一位顾客两次各有2元，包子 x₁、豆浆 x₂ 的价格依次为(1,2)和(2,1)；她分别选 A=(0,1) 和 B=(1,0)。假设两次商品含义不变，偏好稳定、单调，商品可分；数值依据教材例5.11，购物情境为自主改写。最后另用同价同预算作弱可负担对照。</p><p class="reading"><strong>这张图要回答：</strong>每次选择时，另一个篮子买得起吗？是刚好花完还是仍有剩钱？两次选择是否能由同一套单调偏好解释？</p>';
  if(warpContext.dataset.signature!==html){warpContext.dataset.signature=html;warpContext.innerHTML=html;}
 }else warpContext?.remove();
 let ratContext=cEl('rationalize-situation');
 if(mode==='rationalize'){
  if(!ratContext){ratContext=document.createElement('section');ratContext.id='rationalize-situation';ratContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(ratContext)}
  const s=frame.state;
  const details=s.rule==='expensive'?'对照规则：总买贵的。第一次包子1元、豆浆2元；第二次包子2元、豆浆1元，两次预算都是12元。':s.textbookCheck?'同价校验：包子、豆浆各1元，预算12元；“只买便宜的”规则在同价时规定均分，选(6,6)。现在检验两种候选偏好。':s.rule==='half'?'换一条规则：两样各花一半。包子2元、豆浆1元，预算12元；候选偏好是 u=x₁x₂。':s.p===s.q?'同价分支：包子、豆浆各1元，预算12元；规则规定均分，候选偏好是 u=x₁+x₂。':'初始规则：只买便宜的。包子1元、豆浆2元，预算12元；候选偏好是 u=x₁+x₂。';
  const html=`<p class="reading"><strong>情境与条件：</strong>${details}数量可为小数；规则来自教材例5.9—5.11，生活场景和数字为自主例子。</p><p class="reading"><strong>这张图要回答：</strong>在当前预算下，规则选出的篮子是否最满意？一处相符够不够证明所有预算都相符？同价平局时怎样检验？</p>`;
  if(ratContext.dataset.signature!==html){ratContext.dataset.signature=html;ratContext.innerHTML=html;}
 }else ratContext?.remove();
 let normalContext=cEl('normal-situation');
 if(mode==='normal'){
  if(!normalContext){normalContext=document.createElement('section');normalContext.id='normal-situation';normalContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(normalContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨买包子 x₁ 和豆浆 x₂，每样单价都是1元。预算由8元增加到12元，价格和偏好保持不变；设满意程度 u=x₁x₂，数量可为小数。生活情境、偏好和数字是自主举例。</p><p class="reading"><strong>这张图要回答：</strong>钱多了，阿姨为什么会多买包子？先看原来的最优篮子 A；再假想包子数量不变，构造比较点 D；最后沿新预算线比较，找到新的最优篮子 B。D 不是预先选定的最优篮子。</p>';
  if(normalContext.dataset.signature!==html){normalContext.dataset.signature=html;normalContext.innerHTML=html;}
 }else normalContext?.remove();
 let propertyContext=cEl('property-situation');
 if(mode==='property'){
  if(!propertyContext){propertyContext=document.createElement('section');propertyContext.id='property-situation';propertyContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(propertyContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>包子和豆浆原来各1元，阿姨有12元并选 A=(6,6)。包子涨到2元，豆浆价格不变；为做比较，假想把钱补到18元，使旧篮子恰好买得起。依教材命题，需求函数是单值的、满足 WARP，且每次选择花完预算；数量可为小数。生活情境和数字是自主例子。</p><p class="reading"><strong>这张图要回答：</strong>补偿以后，阿姨会不会选一个包子比原来更多的篮子？红点 B=(8,2) 是为了反证临时假设的选择，不是观察到的真实选择；我们用两次预算检验这种假设。</p>';
  if(propertyContext.dataset.signature!==html){propertyContext.dataset.signature=html;propertyContext.innerHTML=html;}
 }else propertyContext?.remove();
 let slutskyContext=cEl('slutsky-situation');
 if(mode==='slutsky'){
  if(!slutskyContext){slutskyContext=document.createElement('section');slutskyContext.id='slutsky-situation';slutskyContext.setAttribute('aria-label','购物情境、条件与问题');cEl('legend').before(slutskyContext)}
  const html='<p class="reading"><strong>情境与条件：</strong>阿姨有12元买包子 x₁ 和豆浆 x₂。开始两样都是1元；后来包子涨到2元，豆浆仍是1元，实际预算仍为12元。她的偏好设为 u=x₁x₂，数量可以是小数；数字是自主举例。</p><p class="reading"><strong>这张图要回答：</strong>包子少买了多少？其中多少来自相对价格变化，多少来自购买力变化？中间的补偿是为了算账而假想的，不是实际发钱。</p>';
  if(slutskyContext.dataset.signature!==html){slutskyContext.dataset.signature=html;slutskyContext.innerHTML=html;}
 }else slutskyContext?.remove();

 Object.assign(plot.dataset, {
  filmIntro: story.intro,
  filmPhase: frame.title,
  filmNarration: frame.narration,
  filmConclusion: story.end,
  phase: String(pIdx)
 });
 // This sequence continuously recomputes the actual basket and budget line.
 // A second spring interpolation would put the dot off the current budget.
 if (mode === 'homogeneous' || mode === 'curves' || mode === 'optimum' || mode === 'existence' || mode === 'mrs' || mode === 'corners' || mode === 'warp' || mode === 'rationalize' || mode === 'normal' || mode === 'property') plot.innerHTML = cChart(mode, frame, small);
 else window.microMotion.chart(plot, cChart(mode, frame, small));
 cEl('legend').textContent = '绿色代表预算集/原选择/基准对象；紫色代表最优解/无差异集；金色标记补偿线与射线；红色代表反例、吉芬折点或矛盾点。';
 if (mode === 'budget') cEl('legend').textContent = '横轴：包子个数；纵轴：豆浆杯数。绿线：正好花完预算；浅绿区域：买得起的篮子；现金情境中A=(3,4)、B=(5,4)，绿点买得起、红点买不起；金点是实物设定中的原有篮子。';
 if (mode === 'rules') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。浅绿区域：买得起；绿线：花完预算；紫点：按当前规则选的篮子。第一幅只看预算，尚未规定购物规则。';
 if (mode === 'optimum') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。浅绿区域：买得起；绿线：花完预算；紫线：当前篮子对应的无差异曲线；紫点：正在比较或已选中的篮子。最后一种偏好的整条预算线都最优。';
 if (mode === 'mrs') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。绿线是预算线，紫点是正在比较的篮子，紫线是经过该篮子的无差异曲线；金色虚线是紫线在当前点的局部切线。';
 if (mode === 'warp') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。绿线是第一次预算边界，紫色虚线是第二次预算边界；A、B是两次比较的篮子。对照画面中两次预算线重合，只画一条。';
 if (mode === 'rationalize') cEl('legend').textContent = frame.state.rule==='expensive'
  ? '横轴：包子数量；纵轴：豆浆数量。绿线与紫色虚线分别是两次预算线；红点A、紫点B分别是两次购买规则的选择。'
  : frame.state.textbookCheck
   ? '横轴：包子数量；纵轴：豆浆数量。浅绿是买得起的篮子，绿点是规则选择，红点是同预算下更满意的篮子；本画面直接比较两个点，不画候选偏好的无差异线。'
   : '横轴：包子数量；纵轴：豆浆数量。浅绿是买得起的篮子，绿点是规则的选择；紫线展示候选偏好的无差异线，初始画面会逐渐引入。';
 if (mode === 'homogeneous') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。浅绿区域是买得起的篮子，绿线正好花完预算；紫点按“两样各花一半”的规则计算。';
 if (mode === 'existence') cEl('legend').textContent = '横轴：商品1数量；纵轴：效用。绿线趋向空心点，空心点没有取得；红点是端点实际效用，金点是当前候选。';
 if (mode === 'corners') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。浅绿区域：买得起；绿线：花完当前预算；紫线：经过最优篮子的无差异曲线；紫点：按当前预算算出的角点或内点。';
 if (mode === 'curves') cEl('legend').textContent = '绿线是当前问题的需求函数；紫点是当前数值，灰点是参照。横轴为价格或预算，纵轴为商品数量；本图的价格轴与常见教材价格在纵轴的画法相反。';
 if (mode === 'property') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。绿线和A：原预算和原选择；金虚线：补偿后的新预算，始终经过A；红点B：反证时假设的新选择，位于旧预算内部。';
 if (mode === 'normal') cEl('legend').textContent = '横轴：包子数量；纵轴：豆浆数量。绿线和 A 是原预算与原最优；紫虚线是新预算；金点 D 是保持包子不变的假想比较篮子；紫点先是正在比较的篮子，最后才是新最优 B。';
 if (mode === 'slutsky') cEl('legend').textContent = '横轴：包子；纵轴：豆浆。绿线与A：原预算和原篮子；金线与B：假想补偿后的预算和选择；紫线与C：撤回补偿后的预算和选择。';
 if (mode === 'giffen') cEl('legend').textContent = '绿线：预算线；紫线：经过当前最优消费束的无差异曲线；红点：当前模型计算出的最优束。';

 const metrics = [
  ['当前画面', Number.isInteger(pIdx)?`${pIdx + 1} / ${story.frames.length}`:`第 ${Math.floor(pIdx)+1} 幕向下一幕变化`],
  ['本节场景', mode === 'budget' ? '预算线' : mode === 'rules' ? '购买规则' : mode === 'homogeneous' ? '同比变化' : mode === 'curves' ? '需求曲线' : mode === 'optimum' ? '最优选择' : mode === 'existence' ? '不连续反例' : mode === 'mrs' ? '两笔交换账' : mode === 'corners' ? '角点与内点' : mode === 'warp' ? '两次购物' : mode === 'rationalize' ? '检验偏好' : mode === 'normal' ? '收入与购物' : mode === 'property' ? '补偿与反证' : mode],
  ['核心指标', mode === 'slutsky' ? `Δx₁ˢ=${frame.state.step >= 2 ? '-1.5' : '待补偿'}` : readout]
 ];
 cEl('metrics').innerHTML = metrics.map(([k, v]) => `<div class="metric"><label>${cEsc(k)}</label><strong${['homogeneous','curves','optimum','existence','mrs','corners','warp','rationalize','normal','property'].includes(mode) && k === '核心指标' ? ' style="font-size:1rem;line-height:1.6"' : ''}>${cEsc(v)}</strong></div>`).join('');
 cEl('reading').textContent = frame.narration;
 cEl('formula').textContent = frame.formula;
 cEl('boundary').textContent = `Osborne–Rubinstein §5.1—5.6，印刷57—74页／PDF76—93。${frame.source}。有限数值与图形演示服务于直观理解，不代替全象限一般数学证明。`;
 cEl('extra').innerHTML = consumerProofs[mode] || '';

 if (cEl('step')) {
  cEl('step').max = story.frames.length - 1;
  cEl('step').value = pIdx;
 }
 if (cEl('filmStep')) cEl('filmStep').value = pIdx;
 if (cEl('advance')) cEl('advance').disabled = pIdx >= story.frames.length - 1;
 if (cEl('play')) cEl('play').disabled = pIdx >= story.frames.length - 1;

 const link = document.querySelector('.lesson-end a[download]');
 if (link) {
  link.href = (location.protocol === 'file:' || location.pathname.includes('/downloads/') ? 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/' : '') + `downloads/ch5-${mode}.html`;
  link.textContent = '下载本段完整动画代码 ↓';
 }
 window.microMath?.refresh();

 window.demo = {
  state: { step: pIdx, mode },
  draw() {
   const p = window.demo.state.step;
   const f = consumerFrame(mode, p);
   window.microMotion.chart(plot, cChart(mode, f, plot.clientWidth < 500));
   cEl('reading').textContent = f.narration;
   cEl('formula').textContent = f.formula;
   cEl('metrics').innerHTML = [
    ['当前画面', `${p + 1} / ${story.frames.length}`],
    ['本节场景', mode === 'budget' ? '预算线' : mode === 'rules' ? '购买规则' : mode === 'homogeneous' ? '同比变化' : mode === 'curves' ? '需求曲线' : mode === 'optimum' ? '最优选择' : mode === 'existence' ? '不连续反例' : mode === 'mrs' ? '两笔交换账' : mode === 'corners' ? '角点与内点' : mode === 'warp' ? '两次购物' : mode === 'rationalize' ? '检验偏好' : mode === 'normal' ? '收入与购物' : mode === 'property' ? '补偿与反证' : mode],
    ['核心指标', consumerReadout(mode,f)]
   ].map(([k, v]) => `<div class="metric"><label>${cEsc(k)}</label><strong${['homogeneous','curves','optimum','existence','mrs','corners','warp','rationalize','normal','property'].includes(mode) && k === '核心指标' ? ' style="font-size:1rem;line-height:1.6"' : ''}>${cEsc(v)}</strong></div>`).join('');
   window.microMath?.refresh();
  }
 };

 return { mode, phase: pIdx, readout };
}
