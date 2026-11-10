'use strict';

const origin = {x: 54, y: 262};
const scale = 23;
const sx = n => origin.x + n * scale;
const sy = n => origin.y - n * scale;
const label = (x,y,body,attrs='') => `<text x="${x}" y="${y}" ${attrs}>${body}</text>`;

function consumerPlate() {
  // One currency unit per good, ten units of income, U = x1*x2.
  const income=10, optimum=income/2, utility=optimum**2;
  const curve=Array.from({length:121},(_,i)=>{
    const x=utility/income+(income-utility/income)*i/120;
    return `${i?'L':'M'}${sx(x).toFixed(2)} ${sy(utility/x).toFixed(2)}`;
  }).join(' ');
  const p=sx(optimum), q=sy(optimum);
  const grid=Array.from({length:11},(_,i)=>
    `M${sx(i)} ${sy(0)}V${sy(10)} M${sx(0)} ${sy(i)}H${sx(10)}`
  ).join(' ');
  return `<svg class="cover-plate" viewBox="0 0 397 305" role="img" aria-labelledby="cover-plot-title cover-plot-desc">
  <title id="cover-plot-title">两种商品的最优消费束</title>
  <desc id="cover-plot-desc">预算十元，两种商品单价都是一元。横轴和纵轴分别表示两种商品的份数。赭色预算线连接（零，十）和（十，零），线上每种买法都刚好花完十元。假设效用等于两种商品份数的乘积，效用为二十五的绿色无差异曲线在（五，五）与预算线相切，各买五份最优。</desc>
  <defs><pattern id="cover-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-1 1L1 -1 M0 7L7 0 M6 8L8 6" fill="none" stroke="currentColor" stroke-width=".65"/></pattern></defs>
  <path class="cover-grid" d="${grid}"/>
  <path class="cover-feasible" d="M${sx(0)} ${sy(0)}V${sy(income)}L${sx(income)} ${sy(0)}Z" fill="url(#cover-hatch)"/>
  <path class="cover-guides" d="M${sx(0)} ${q}H${p}V${sy(0)}"/>
  <path class="cover-axes" d="M54 15V262H314 M50 21l4 -6 4 6 M308 258l6 4 -6 4"/>
  <g class="cover-ticks">${label(48,281,'0')}${[5,10].map(n=>`<path d="M${sx(n)} 262v5 M49 ${sy(n)}h5"/>${label(sx(n),282,n,'text-anchor="middle"')}${label(42,sy(n)+4,n,'text-anchor="end"')}`).join('')}</g>
  ${label(321,267,'x₁','class="cover-variable"')}${label(30,19,'x₂','class="cover-variable"')}
  <path class="cover-budget" data-cover-budget d="M${sx(0)} ${sy(income)}L${sx(income)} ${sy(0)}"/>
  <path class="cover-utility" data-cover-utility d="${curve}"/>
  <path class="cover-leader" d="M${p+5} ${q-5}l44 -45h51"/>
  <circle class="cover-point" data-cover-optimum="5,5" cx="${p}" cy="${q}" r="5"/>
  ${label(222,85,'最优消费束','class="cover-note"')}${label(222,121,'(5, 5)','class="cover-coordinate"')}
  ${label(77,235,'可行集','class="cover-feasible-name"')}
  </svg>`;
}

function coverHTML() {
  return `<header class="home-intro atlas-cover" data-atlas-cover aria-labelledby="cover-title">
  <div class="cover-folio" data-cover-guard><span>中级微观经济学</span><span lang="en">MICROECONOMIC THEORY</span></div>
  <div class="cover-spread">
    <div class="cover-copy">
      <h1 id="cover-title" data-cover-guard><span>跟着图，</span><span>看懂选择。</span></h1>
      <p data-cover-guard>手里有 10 元，两样东西每份都是 1 元。沿着赭色预算线看，哪些买法刚好花完？</p>
      <a data-cover-guard class="primary home-open" href="learn.html">进入全书随题图解 <span aria-hidden="true">→</span></a>
    </div>
    <figure class="cover-diagram">
      ${consumerPlate()}
      <figcaption data-cover-guard><span><i></i>预算线 <var>x₁ + x₂ = 10</var></span><span><i></i>无差异曲线 <var>x₁x₂ = 25</var></span><span class="cover-preference">若偏好由 <var>u = x₁x₂</var> 表示，各买 5 份最优。</span></figcaption>
    </figure>
  </div>
  <svg class="cover-ink" data-cover-ink aria-hidden="true" focusable="false"></svg>
  <div class="cover-foot" data-cover-guard><span class="cover-interaction-tip">移动或停留，在纸上画小图。</span><span class="cover-touch-tip">轻点纸面，画一张小图。</span><button type="button" data-cover-draw><span aria-hidden="true">＋</span> 画一张小图</button></div>
  <span class="cover-announcement" data-cover-status role="status"></span>
  </header>`;
}
module.exports = {coverHTML};
