import {demandC} from './consumer.mjs';
const home=document.getElementById('home-demo'),plot=document.getElementById('home-plot');
if(home&&plot){
 const $=id=>home.querySelector(`#${id}`),play=$('home-film-play'),replay=$('home-film-replay');
 const duration=25000,changeStart=9000,changeEnd=19000;
 const X=x=>40+40*x,Y=y=>275-24*y,f=x=>x.toFixed(2);
 const motion=window.microMotion?.reduced||matchMedia('(prefers-reduced-motion: reduce)');
 const steps=[...home.querySelectorAll('#home-film-story li')];
 const captions=['先认清条件：10元预算，商品2每单位1元，偏好为 u=x₁x₂。',
  '原价每单位1元：最优选择是两样各买5单位，各花5元。',
  '只让商品1涨价：预算线绕纵轴截距向内转，最优点向左移，商品2仍买5单位。',
  '涨到每单位2元：商品1买2.50单位，商品2仍买5.00单位，两样仍各花5元。'];
 let elapsed=0,lastTime=null,raf=0,playing=false,phase=-1,visible=false;

 // Keep one SVG and coordinate system. Recompute the optimum each frame,
 // rather than interpolating endpoint bundles or queuing chart transitions.
 plot.innerHTML=`<svg viewBox="0 0 500 320" role="img" aria-labelledby="home-chart-title home-chart-description"><title id="home-chart-title">涨价如何改变最优选择</title><desc id="home-chart-description"></desc><g class="home-grid" fill="none">${[0,5,10].map(t=>`<path d="M${X(t)} 35V275M40 ${Y(t)}H440"/>`).join('')}</g><path class="home-axes" d="M40 22V275H470" fill="none"/><path id="home-budget" class="home-budget" fill="none" stroke-width="2"/><path id="home-indifference" class="home-indifference" fill="none" stroke-width="3"/><path id="home-projection" class="home-indifference" fill="none" stroke-dasharray="4 5" opacity=".6"/><circle id="home-choice-point" class="home-choice-point" r="7"/><g class="home-axis-labels" font-family="sans-serif"><text x="465" y="300">x₁</text><text x="44" y="24">x₂</text><text x="28" y="299">0</text><text x="233" y="299">5</text><text x="427" y="299">10</text><text x="17" y="161">5</text><text x="9" y="41">10</text><text id="home-choice-label" class="home-choice-label"></text></g></svg>`;
 const budget=$('home-budget'),curve=$('home-indifference'),projection=$('home-projection');
 const point=$('home-choice-point'),label=$('home-choice-label');

 function draw(){
  const t=Math.max(0,Math.min(1,(elapsed-changeStart)/(changeEnd-changeStart)));
  const p=1+t*t*(3-2*t),r=demandC('product',p,1,10),[a,b]=r.bundle;
  $('home-price-value').textContent=`${f(p)} 元 / 单位`;
  $('home-x1').textContent=f(a);$('home-x2').textContent=f(b);
  budget.setAttribute('d',`M40 ${Y(10)}L${X(10/p)} 275`);
  curve.setAttribute('d',Array.from({length:121},(_,i)=>{
   const x=r.u/10+(10-r.u/10)*i/120;
   return `${i?'L':'M'}${X(x)},${Y(r.u/x)}`;
  }).join(' '));
  projection.setAttribute('d',`M${X(a)} 275V${Y(b)}H40`);
  point.setAttribute('cx',X(a));point.setAttribute('cy',Y(b));
  label.setAttribute('x',X(a)+12);label.setAttribute('y',Y(b)-14);
  label.textContent=`(${f(a)}, ${f(b)})`;
  $('home-chart-description').textContent=`横轴商品1数量、纵轴商品2数量，刻度始终为0至10。商品1每单位${f(p)}元，预算10元；最优选择为(${f(a)}, ${f(b)})。`;
  $('home-film-progress').value=elapsed/duration;
  const next=elapsed<4000?0:elapsed<changeStart?1:elapsed<changeEnd?2:3;
  if(next!==phase){
   phase=next;$('home-film-caption').textContent=captions[phase];
   $('home-observation').textContent=phase<2?'两样各花5元，刚好用完10元。':phase===2?'商品1越来越贵，买得越来越少；商品2仍买5单位。':'商品1数量减半，商品2数量不变；两样仍各花5元。';
   steps.forEach((step,i)=>{if(i===phase)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');});
  }
 }
 function syncControls(message){
  const reduced=motion.matches,ended=elapsed>=duration;
  home.dataset.state=reduced?'reduced':playing?'playing':ended?'ended':elapsed?'paused':'ready';
  play.disabled=reduced;replay.disabled=reduced;
  play.textContent=playing?'暂停':ended?'重新播放':'播放讲解';
  play.setAttribute('aria-pressed',String(playing));
  $('home-film-status').textContent=reduced?'已减少动态效果：显示最终图，完整讲解可在下方阅读。':message||'约25秒 · 点击播放；可随时暂停看图。';
 }
 function pause(message='已暂停，可继续播放或慢慢看图。'){
  playing=false;cancelAnimationFrame(raf);raf=0;lastTime=null;syncControls(message);
 }
 function tick(now){
  if(!playing)return;
  if(document.hidden||!visible){pause('画面已离开视野，讲解已暂停；返回后可继续播放。');return;}
  elapsed=Math.min(duration,elapsed+now-lastTime);lastTime=now;draw();
  if(elapsed>=duration){pause('本段讲解结束。可重播，或继续阅读章节。');return;}
  raf=requestAnimationFrame(tick);
 }
 function start(fromBeginning=false){
  if(motion.matches||document.hidden||!visible)return;
  if(fromBeginning||elapsed>=duration){elapsed=0;draw();}
  playing=true;lastTime=performance.now();syncControls('正在讲解；点击暂停可以停下来读图。');
  cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);
 }
 play.addEventListener('click',()=>playing?pause():start());
 replay.addEventListener('click',()=>start(true));
 function staticFinal(){pause();elapsed=duration;draw();syncControls();}
 function motionChanged(){if(motion.matches)staticFinal();else syncControls('可以重播动画，或直接阅读下方完整讲解。');}
 motion.addEventListener('change',motionChanged);
 function sizeLabels(){
  plot.querySelector('.home-axis-labels').setAttribute('font-size',Math.min(25,Math.max(16,14*500/Math.max(1,plot.clientWidth))));
 }
 const resize=new ResizeObserver(sizeLabels);resize.observe(plot);sizeLabels();
 const observer=new IntersectionObserver(entries=>{
  visible=entries[0].isIntersecting;
  if(!visible&&playing)pause('画面已离开视野，讲解已暂停；返回后可继续播放。');
 },{threshold:0});observer.observe(plot);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause('页面已隐藏，讲解已暂停；返回后可继续播放。');});
 // Reconnect observers after a back/forward-cache restore.
 window.addEventListener('pagehide',()=>{pause();observer.disconnect();resize.disconnect();});
 window.addEventListener('pageshow',()=>{observer.observe(plot);resize.observe(plot);if(motion.matches)staticFinal();});
 if(motion.matches)staticFinal();else{draw();syncControls();}
}
