const {escape, inline} = require('./format.cjs');
const COLORS=['#285f4b','#9b4c2f','#415f95','#765184','#817020','#4e7272'];
const fmt=v=>Number(v.toFixed(3));
function axisPlot(plot) {
  const [xmin,xmax]=plot.x,[ymin,ymax]=plot.y;
  const box={left:41,top:14,width:268,height:137};
  const dx=x=>box.left+(x-xmin)*box.width/(xmax-xmin);
  const dy=y=>box.top+box.height-(y-ymin)*box.height/(ymax-ymin);
  const xTicks=[xmin,(xmin+xmax)/2,xmax],yTicks=[ymin,(ymin+ymax)/2,ymax];
  const grid=xTicks.map(x=>`<line x1="${dx(x)}" x2="${dx(x)}" y1="14" y2="151"/><text x="${dx(x)}" y="169" text-anchor="middle">${fmt(x)}</text>`).join('')
   +yTicks.map(y=>`<line x1="41" x2="309" y1="${dy(y)}" y2="${dy(y)}"/><text x="35" y="${dy(y)+4}" text-anchor="end">${fmt(y)}</text>`).join('');
  const zeroX=xmin<0&&xmax>0?`<line class="zero" x1="${dx(0)}" x2="${dx(0)}" y1="14" y2="151"/>`:'';
  const zeroY=ymin<0&&ymax>0?`<line class="zero" x1="41" x2="309" y1="${dy(0)}" y2="${dy(0)}"/>`:'';
  const paths=plot.lines.map((line,i)=>`<polyline points="${line.points.map(([x,y])=>fmt(dx(x))+','+fmt(dy(y))).join(' ')}" fill="none" stroke="${COLORS[i%COLORS.length]}" stroke-width="2.4" ${i%2?'stroke-dasharray="6 3"':''}/>`).join('');
  const positions=plot.dots.map(([x,y])=>[fmt(dx(x)),fmt(dy(y))]);
  const legend=plot.lines.map((l,i)=>`<span><i style="--swatch:${COLORS[i%COLORS.length]}" class="${i%2?'dashed':''}"></i>${inline(l.label)}</span>`).join('');
  return `<figure class="figure"><figcaption><span>横轴　${inline(plot.axes[0].replace(/^横轴[：:　 ]*/,''))}</span><span>纵轴　${inline(plot.axes[1].replace(/^纵轴[：:　 ]*/,''))}</span></figcaption><svg viewBox="0 0 328 181" role="img" aria-label="按固定坐标比较各步位置"><g class="grid">${grid}</g>${zeroX}${zeroY}<defs><clipPath id="chart-clip"><rect x="39" y="12" width="272" height="141"/></clipPath></defs><g clip-path="url(#chart-clip)">${paths}</g><circle id="plot-dot" data-token="plot-dot" cx="${positions[0][0]}" cy="${positions[0][1]}" r="5" fill="#1d3528" stroke="#fffdf7" stroke-width="2" data-positions='${escape(JSON.stringify(positions))}'/></svg><div class="legend">${legend}<span><b aria-hidden="true">●</b> 当前这一步</span></div></figure>`;
}
function relationDiagram(network) {
  const nodes=new Map(network.nodes.map(n=>[n.id,{...n,cx:31+258*n.x,cy:21+113*n.y}]));
  const key=([a,b])=>JSON.stringify([a,b]);
  const all=new Map(network.frames.flat().map(edge=>[key(edge),edge]));
  function path(a,b) {
    if(a.id===b.id) return `M${a.cx-10} ${a.cy-10} c-16 -21 36 -21 21 0`;
    const dx=b.cx-a.cx,dy=b.cy-a.cy,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
    const bend=all.has(key([b.id,a.id])) ? 13 : 0;
    const rx=n=>Math.max(17,Math.min(37,[...String(n.label)].length*6+7));
    const pad=n=>1/Math.sqrt((ux/rx(n))**2+(uy/15)**2)+2;
    const start=pad(a),end=pad(b)+3;
    return `M${fmt(a.cx+ux*start)} ${fmt(a.cy+uy*start)} Q${fmt((a.cx+b.cx)/2-uy*bend)} ${fmt((a.cy+b.cy)/2+ux*bend)} ${fmt(b.cx-ux*end)} ${fmt(b.cy-uy*end)}`;
  }
  const edges=[...all.values()].map(([a,b])=>{
    const visible=network.frames.map(edges=>edges.some(([x,y])=>x===a&&y===b)?'1':'0').join('');
    return `<path d="${path(nodes.get(a),nodes.get(b))}" class="net-edge" marker-end="url(#arrow)" data-visible="${visible}" ${visible[0]==='0'?'style="display:none"':''}/>`;
  }).join('');
  const labels=[...nodes.values()].map(n=>`<g><ellipse cx="${n.cx}" cy="${n.cy}" rx="${Math.max(17,Math.min(37,[...String(n.label)].length*6+7))}" ry="15"/><text x="${n.cx}" y="${n.cy+4}" text-anchor="middle">${escape(n.label)}</text></g>`).join('');
  return `<figure class="figure network"><figcaption>${inline(network.legend)}</figcaption><svg viewBox="-10 -9 340 170" role="img" aria-label="${escape(network.legend)}"><defs><marker id="arrow" viewBox="0 0 8 8" markerWidth="6" markerHeight="6" refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#8f4d34"/></marker></defs>${edges}${labels}</svg></figure>`;
}
function amountsIn(column, frames, index) {
  if (/效用|序数|排名|等级|序号|代码|编号|名次|排序/.test(column)) return null;
  const entries=frames.map(f=>/^([+−-]?\d+(?:\.\d+)?)(%|元|份|杯|件|张|人|小时)?$/.exec(String(f[1][index]).trim()));
  if(entries.some(e=>!e)||entries.some(e=>e[2]!==entries[0][2]))return null;
  const values=entries.map(e=>Number(e[1].replace('−','-')));
  if(values.every(v=>v===values[0]))return null;
  const percent=entries[0][2]==='%';
  const lo=Math.min(0,...values),hi=percent?Math.max(100,...values):Math.max(0,...values);
  const position=v=>fmt(100*(v-lo)/(hi-lo));
  return {values:values.map(position),zero:position(0),lo:lo+(percent?'%':''),hi:hi+(percent?'%':'')};
}
function miniScale(s, barKey = '') {
  if(!s)return '';
  const first=s.values[0];
  const left=Math.min(s.zero,first), width=Math.abs(first-s.zero);
  const keyAttrs = barKey ? ` data-bar-key="${escape(barKey)}" data-bar-left="${left}%" data-bar-pct="${width}"` : '';
  return `<div class="mini-scale" aria-hidden="true" data-values='${escape(JSON.stringify(s.values))}' data-zero="${s.zero}"><div class="scale-track"><i${keyAttrs} style="left:${left}%;width:${width}%"></i><b style="left:${s.zero}%"></b></div><div class="scale-range"><span>${s.lo}</span><span>${s.hi}</span></div></div>`;
}
function cups(menu) {
  return `<figure class="figure cups"><figcaption>同一张价目表 · 每只杯子的满刻度相同</figcaption><div class="cup-pair">${menu.labels.map((label,i)=>{
    const states=menu.frames.map(f=>f[i]),[quantity,price]=states[0], pct=fmt(100*quantity/menu.max);
    return `<div class="cup-option" data-cups='${escape(JSON.stringify(states))}' data-max="${menu.max}"><div class="vessel" aria-hidden="true"><i data-bar-key="cup-${i}" data-bar-axis="y" data-bar-pct="${pct}" style="height:${pct}%"></i></div><div><strong>${inline(label)}</strong><div class="cup-tag">${quantity===0?'不买':price+' 元'}</div></div></div>`;
  }).join('')}</div></figure>`;
}
function tickets(box) {
  const cards=counts=>counts.flatMap((n,i)=>Array(n).fill(box.labels[i]));
  const frames=box.counts.map(cards);
  return `<figure class="figure ticket-box" data-tickets='${escape(JSON.stringify(frames))}'><figcaption>每张券被抽到的机会相同</figcaption><div class="ticket-tray">${frames[0].map(s=>`<span class="ticket">${escape(s)}</span>`).join('')}</div></figure>`;
}
function payoffTable(game) {
  const [rowPlayer,colPlayer]=game.players;
  const heading=game.cols.map(label=>`<th scope="col">${inline(label)}</th>`).join('');
  const body=game.cells.map((row,i)=>`<tr><th scope="row">${inline(game.rows[i])}</th>`+row.map(([a,b],j)=>{
    const selected=game.frames[0][0]===i&&game.frames[0][1]===j;
    return `<td data-choice="${i},${j}" class="${selected?'selected':''}"><span class="cell-mark" aria-hidden="true">●</span>${inline(a)}，${inline(b)}</td>`;
  }).join('')+'</tr>').join('');
  return `<figure class="figure payoff" data-moves='${escape(JSON.stringify(game.frames))}'><figcaption>${inline(rowPlayer)}选行，${inline(colPlayer)}选列。每格的两个数按这个顺序读，圆点标出当前结果。</figcaption><table><thead><tr><td class="corner">行／列</td>${heading}</tr></thead><tbody>${body}</tbody></table></figure>`;
}
function holdingBoard(board) {
  return `<figure class="figure holding" data-rounds='${escape(JSON.stringify(board.frames))}'><figcaption>同一个岗位竖着读，比较每轮暂留的人。</figcaption><dl>${board.labels.map((label,i)=>`<div><dt>${inline(label)}</dt><dd>${escape(board.frames[0][i])}</dd></div>`).join('')}</dl></figure>`;
}

function screeningFigure(states, index) {
  const s = states[index];
  const smallPct = Math.round(s.smallQ * 100);
  const netFmt = x => (x > 0 ? '+' : '') + fmt(x) + ' 元';
  const badge = (who, label, cls = '') => `<span class="motion-token ${cls}" data-token="buyer-${who}">${who}：${label}</span>`;
  return `<figure class="figure figure-screen"><figcaption><span>容量、标价与两位顾客的“愿付 − 付价”账本</span><span>总收入 <strong>${fmt(s.total)} 元</strong></span></figcaption><div class="screen-grid"><div class="screen-cups"><div class="screen-cup"><div class="screen-vessel" aria-hidden="true"><i data-bar-key="small-q" data-bar-pct="${smallPct}" style="height:${smallPct}%"></i></div><div class="screen-cup-meta"><strong>小杯 (${fmt(s.smallQ)} 满杯)</strong><span>${s.smallQ === 0 ? '相当于不买 · 0 元' : '定价 ' + fmt(s.smallPrice) + ' 元'}</span></div></div><div class="screen-cup"><div class="screen-vessel" aria-hidden="true"><i data-bar-key="large-q" data-bar-pct="100" style="height:100%"></i></div><div class="screen-cup-meta"><strong>大杯 (1 满杯)</strong><span>定价 ${fmt(s.largePrice)} 元</span></div></div></div><div class="screen-buyers"><div class="screen-buyer is-low"><div class="screen-buyer-head"><strong>顾客 2（低估值）</strong>${badge('顾客2', s.cust2.buys, s.cust2.buys.includes('不买') ? 'is-out' : 'is-in')}</div><p>愿付 ${fmt(s.cust2.val)} − 价格 ${fmt(s.cust2.pay)} = <b>净好处 ${netFmt(s.cust2.net)}</b></p><div class="screen-meter" aria-hidden="true"><i data-bar-key="c2-val" data-bar-pct="${Math.min(100, s.cust2.val * 25)}" style="width:${Math.min(100, s.cust2.val * 25)}%"></i></div></div><div class="screen-buyer is-high"><div class="screen-buyer-head"><strong>顾客 1（高估值）</strong>${badge('顾客1', s.cust1.buys, 'is-in')}</div><p>${s.smallQ > 0 && s.smallQ < 1 ? `买小杯得 <b>${fmt(s.cust1.altVal)}−${fmt(s.cust1.altPay)}=+${fmt(s.cust1.altNet)}</b> → 大杯最多标 <b>${fmt(s.cust1.val)}−${fmt(s.cust1.altNet)}=${fmt(s.cust1.pay)}</b> 元` : `愿付 ${fmt(s.cust1.val)} − 价格 ${fmt(s.cust1.pay)} = <b>净好处 ${netFmt(s.cust1.net)}</b>`}</p><div class="screen-meter" aria-hidden="true"><i data-bar-key="c1-pay" data-bar-pct="${Math.min(100, s.cust1.pay * 25)}" style="width:${Math.min(100, s.cust1.pay * 25)}%"></i></div></div></div></div></figure>`;
}

function exchangeFigure(states, index) {
  const s = states[index];
  const scaleMax = 10;
  const pct = x => Math.min(100, Math.max(0, fmt((x / scaleMax) * 100)));
  const stockPct = pct(s.stockRice);
  const aPct = pct(s.riceA);
  const bPct = pct(s.riceB);
  const statusClass = s.gap > 0 ? 'is-shortage' : s.gap < 0 ? 'is-surplus' : 'is-clear';
  return `<figure class="figure figure-exchange"><figcaption><span>价签：米 ${fmt(s.r)} 元/斤 · 豆 1 元/斤</span><span class="ex-status ${statusClass}">${escape(s.verdict)}</span></figcaption><div class="ex-homes"><div class="ex-home"><strong>甲 (4米, 2豆)</strong><span>家底 <b>${fmt(s.wA)} 元</b> → 各花 <b>${fmt(s.halfA)} 元</b></span><span>下单：<b>${fmt(s.riceA)} 斤米</b>, ${fmt(s.beanA)} 斤豆</span></div><div class="ex-home"><strong>乙 (2米, 4豆)</strong><span>家底 <b>${fmt(s.wB)} 元</b> → 各花 <b>${fmt(s.halfB)} 元</b></span><span>下单：<b>${fmt(s.riceB)} 斤米</b>, ${fmt(s.beanB)} 斤豆</span></div></div><div class="ex-balance"><div class="ex-balance-label"><span>米总需求：${fmt(s.riceA)} + ${fmt(s.riceB)} = <b>${fmt(s.totalRice)} 斤</b></span><span>全场库存：<b>${s.stockRice} 斤</b></span></div><div class="ex-bar-track" aria-hidden="true"><span class="ex-seg-a" data-bar-key="ex-a" data-bar-pct="${aPct}" style="width:${aPct}%"></span><span class="ex-seg-b" data-bar-key="ex-b" data-bar-pct="${bPct}" style="left:${aPct}%;width:${bPct}%"></span><b class="ex-stock-line" style="left:${stockPct}%" title="库存 6 斤"></b></div><div class="ex-scale-labels"><span>0 斤</span><span style="left:${stockPct}%">库存 ${s.stockRice} 斤</span><span>10 斤</span></div></div></figure>`;
}

function matchingFigure(trace, index) {
  const persons = '甲乙丙丁';
  const posts = 'ABCD';
  const round = trace[index];
  const token = (i, extraClass = '') => {
    const note = round.tokenNote?.[i] ? `<small>${escape(round.tokenNote[i])}</small>` : '';
    return `<span class="motion-token match-person ${extraClass}" data-token="app-${i}"><strong>${persons[i]}</strong>${note}</span>`;
  };
  const freeTokens = round.free.length
    ? round.free.map(i => token(i, 'is-free')).join('')
    : '<span class="match-empty">无落单，已收敛</span>';
  const postCards = Array.from(posts, (p, j) => {
    const occupant = round.held[j];
    const slotCls = round.postClass?.[j] || '';
    const detail = round.postNote?.[j] || '';
    return `<div class="match-post ${slotCls}" data-slot="post-${j}"><div class="match-post-head"><span>岗位 ${p}</span>${detail ? `<small>${escape(detail)}</small>` : ''}</div><div class="match-slot-body">${occupant >= 0 ? token(occupant, 'is-held') : '<span class="match-vacant">空缺</span>'}</div></div>`;
  }).join('');
  return `<figure class="figure figure-matching"><figcaption><span>本轮暂留与淘汰追踪（同色徽章为同一位申请者）</span></figcaption><div class="match-stage"><div class="match-free-row"><span class="match-zone-label">落单 / 待投池</span><div class="match-free-tokens">${freeTokens}</div></div><div class="match-post-grid">${postCards}</div>${round.actionLine ? `<p class="match-causal-line">${escape(round.actionLine)}</p>` : ''}</div></figure>`;
}

module.exports={axisPlot,relationDiagram,amountsIn,miniScale,cups,tickets,payoffTable,holdingBoard,screeningFigure,exchangeFigure,matchingFigure};
