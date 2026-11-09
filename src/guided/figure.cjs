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
  return `<figure class="figure"><figcaption><span>横轴　${inline(plot.axes[0].replace(/^横轴[：:　 ]*/,''))}</span><span>纵轴　${inline(plot.axes[1].replace(/^纵轴[：:　 ]*/,''))}</span></figcaption><svg viewBox="0 0 328 181" role="img" aria-label="按固定坐标比较各步位置"><g class="grid">${grid}</g>${zeroX}${zeroY}<defs><clipPath id="chart-clip"><rect x="39" y="12" width="272" height="141"/></clipPath></defs><g clip-path="url(#chart-clip)">${paths}</g><circle id="plot-dot" cx="${positions[0][0]}" cy="${positions[0][1]}" r="5" fill="#1d3528" stroke="#fffdf7" stroke-width="2" data-positions='${escape(JSON.stringify(positions))}'/></svg><div class="legend">${legend}<span><b aria-hidden="true">●</b> 当前这一步</span></div></figure>`;
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
function miniScale(s) {
  if(!s)return '';
  const first=s.values[0];
  return `<div class="mini-scale" aria-hidden="true" data-values='${escape(JSON.stringify(s.values))}' data-zero="${s.zero}"><div class="scale-track"><i style="left:${Math.min(s.zero,first)}%;width:${Math.abs(first-s.zero)}%"></i><b style="left:${s.zero}%"></b></div><div class="scale-range"><span>${s.lo}</span><span>${s.hi}</span></div></div>`;
}
function cups(menu) {
  return `<figure class="figure cups"><figcaption>同一张价目表 · 每只杯子的满刻度相同</figcaption><div class="cup-pair">${menu.labels.map((label,i)=>{
    const states=menu.frames.map(f=>f[i]),[quantity,price]=states[0];
    return `<div class="cup-option" data-cups='${escape(JSON.stringify(states))}' data-max="${menu.max}"><div class="vessel" aria-hidden="true"><i style="height:${100*quantity/menu.max}%"></i></div><div><strong>${inline(label)}</strong><div class="cup-tag">${quantity===0?'不买':price+' 元'}</div></div></div>`;
  }).join('')}</div></figure>`;
}
function tickets(box) {
  const cards=counts=>counts.flatMap((n,i)=>Array(n).fill(box.labels[i]));
  const frames=box.counts.map(cards);
  return `<figure class="figure ticket-box" data-tickets='${escape(JSON.stringify(frames))}'><figcaption>每张券被抽到的机会相同</figcaption><div class="ticket-tray">${frames[0].map(s=>`<span class="ticket">${escape(s)}</span>`).join('')}</div></figure>`;
}
module.exports={axisPlot,relationDiagram,amountsIn,miniScale,cups,tickets};
