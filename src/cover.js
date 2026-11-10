(() => {
  'use strict';
  function mountGraphs(cover) {
    const models = JSON.parse(cover.querySelector('[data-market-deck]').textContent);
    const summon = cover.querySelector('.market-summon');
    const DWELL = 450, IDLE = 6000, FADE = 480;
    const fmt = new Intl.NumberFormat('zh-CN', {maximumFractionDigits: 2});
    let bag = [], previousChapter, card, dwellTimer, idleTimer, exitTimer;
    let origin, spawnedAt, dragId = null, keyboard = false;

    function drawModel() {
      if (!bag.length) {
        bag = models.slice();
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i],bag[j]] = [bag[j],bag[i]];
        }
        if (bag.length > 1 && bag[bag.length-1].chapter === previousChapter) {
          [bag[0],bag[bag.length-1]] = [bag[bag.length-1],bag[0]];
        }
      }
      const model = bag.pop();
      previousChapter = model.chapter;
      return model;
    }

    function stopDwell() { clearTimeout(dwellTimer); origin = null; }
    function remove() {
      clearTimeout(idleTimer); clearTimeout(exitTimer);
      card?.remove(); card = null; dragId = null; keyboard = false;
    }
    function dismiss() {
      if (!card || dragId !== null || keyboard) return;
      card.classList.add('is-leaving');
      exitTimer = setTimeout(() => { remove(); spawnedAt=null; }, FADE);
    }
    function active() {
      clearTimeout(exitTimer); clearTimeout(idleTimer);
      card?.classList.remove('is-leaving');
      if (card && dragId === null && !keyboard) idleTimer = setTimeout(dismiss, IDLE);
    }

    // Anchor the drawing to the pointer, moving it only as far as needed
    // to keep it inside the visible scene and clear of the entrance links.
    function place(x,y) {
      const box=cover.getBoundingClientRect(), w=card.offsetWidth, h=card.offsetHeight;
      const pad=8, top=Math.max(pad,pad-box.top);
      const bottom=Math.max(top,Math.min(box.height, innerHeight-box.top)-h-pad);
      const maxX=Math.max(pad,box.width-w-pad);
      const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
      const px=x-box.left, py=y-box.top;
      const copy=cover.querySelector('.market-copy').getBoundingClientRect();
      const blocked={l:copy.left-box.left-4,r:copy.right-box.left+4,t:copy.top-box.top-4,b:copy.bottom-box.top+4};
      const idealX=px-w*.5, idealY=py-h*.55;
      let best;
      for(const left of [idealX,blocked.r,blocked.l-w,pad,maxX]){
        for(const upper of [idealY,blocked.b,blocked.t-h,top,bottom]){
          const l=clamp(left,pad,maxX),t=clamp(upper,top,bottom);
          const overlap=Math.max(0,Math.min(l+w,blocked.r)-Math.max(l,blocked.l))*
            Math.max(0,Math.min(t+h,blocked.b)-Math.max(t,blocked.t));
          const score=(l-idealX)**2+(t-idealY)**2+overlap*1000;
          if(!best||score<best.score)best={l,t,score};
        }
      }
      card.style.left=best.l+'px';card.style.top=best.t+'px';
    }

    function show(x,y,fromKeyboard=false) {
      stopDwell(); remove();
      const model=drawModel(), points=model.points;
      const xs=points.map(p=>p[0]), ys=points.map(p=>p[1]);
      const xmin=xs[0], xmax=xs[xs.length-1];
      const ymin=Math.min(0,...ys), ymax=Math.max(0,...ys);
      const sx=v=>32+193*(v-xmin)/(xmax-xmin);
      const sy=v=>81-63*(v-ymin)/(ymax-ymin||1);
      card=document.createElement('article');
      card.className='market-card';card.dataset.chapter=String(model.chapter);
      card.innerHTML='<div class="graph-title"></div><p class="graph-condition"></p>'+
        '<svg viewBox="0 0 250 105" aria-label="可拖动的模型图"><path class="graph-axis" d="M32 10V81H234" fill="none"/><g class="graph-series"></g><text class="graph-tick" x="31" y="100"></text><text class="graph-tick" x="225" y="100" text-anchor="end"></text><circle class="graph-handle" r="7" role="slider" tabindex="0" aria-orientation="horizontal"/></svg>'+
        '<div class="graph-reading"></div><div class="graph-actions"><a>进课看原理 ↗</a><button type="button">收起</button></div>';
      const panel=card;
      const title=panel.querySelector('.graph-title');
      title.textContent='第 '+model.chapter+' 章 · '+model.title;
      panel.setAttribute('aria-label',title.textContent);
      panel.querySelector('.graph-condition').textContent=model.condition;
      panel.querySelector('a').href=model.href;
      const svg=panel.querySelector('svg'), handle=panel.querySelector('.graph-handle');
      const series=svg.querySelector('.graph-series'), reading=panel.querySelector('.graph-reading');
      function shape(tag,attrs) {
        const el=document.createElementNS(svg.namespaceURI,tag);
        for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);
        series.append(el);
      }
      if(model.discrete){
        for(const [a,b] of points) shape('circle',{cx:sx(a),cy:sy(b),r:3,class:'graph-choice',fill:'currentColor'});
      }else{
        shape('polyline',{points:points.map(([a,b])=>sx(a)+','+sy(b)).join(' '),class:'graph-line',fill:'none'});
      }
      // Mark zero on signed outcomes (e.g. excess demand and time differences).
      const zero=sy(0);
      svg.querySelector('.graph-axis').setAttribute('d','M32 10V81 M32 '+zero+'H234');
      shape('text',{x:28,y:zero+3,'text-anchor':'end',class:'graph-tick'});
      series.lastElementChild.textContent='0';
      const ticks=svg.querySelectorAll(':scope > .graph-tick');
      ticks[0].textContent=fmt.format(xmin);ticks[1].textContent=fmt.format(xmax)+' · '+model.xLabel;
      handle.setAttribute('aria-label',model.xLabel+'，用左右方向键调整');
      handle.setAttribute('aria-valuemin',xmin);handle.setAttribute('aria-valuemax',xmax);
      let index;
      function select(i) {
        index=Math.max(0,Math.min(points.length-1,i));const [a,b]=points[index];
        handle.setAttribute('cx',sx(a));handle.setAttribute('cy',sy(b));
        handle.setAttribute('aria-valuenow',a);
        reading.textContent=model.xLabel+' '+fmt.format(a)+'　→　'+model.yLabel+' '+fmt.format(b);
        handle.setAttribute('aria-valuetext',reading.textContent);
      }
      function selectAt(event) {
        const matrix=svg.getScreenCTM();
        if(!matrix)return;
        const local=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
        const value=xmin+(local.x-32)/193*(xmax-xmin);
        let closest=0;
        for(let i=1;i<xs.length;i++)if(Math.abs(xs[i]-value)<Math.abs(xs[closest]-value))closest=i;
        select(closest);
      }
      select(model.initial??Math.floor(points.length/2));
      svg.addEventListener('pointerdown',e=>{
        if(!e.isPrimary||e.button!==0)return;
        keyboard=false;dragId=e.pointerId;stopDwell();active();
        svg.setPointerCapture(dragId);selectAt(e);e.preventDefault();
      });
      svg.addEventListener('pointermove',e=>{if(e.pointerId===dragId)selectAt(e)});
      function finish(e){if(e.pointerId===dragId){dragId=null;active()}}
      for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,finish);
      handle.addEventListener('keydown',e=>{
        const next={ArrowRight:index+1,ArrowUp:index+1,ArrowLeft:index-1,ArrowDown:index-1,Home:0,End:xs.length-1};
        if(Object.hasOwn(next,e.key)){e.preventDefault();keyboard=true;select(next[e.key]);active()}
      });
      function close(){const focus=panel.contains(document.activeElement);remove();if(focus)summon.focus({preventScroll:true})}
      panel.querySelector('button').addEventListener('click',close);
      panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});
      panel.addEventListener('focusin',e=>{keyboard=e.target.matches(':focus-visible');active()});
      panel.addEventListener('focusout',e=>{if(!panel.contains(e.relatedTarget)){keyboard=false;active()}});
      cover.append(panel);place(x,y);spawnedAt={x,y};
      if(fromKeyboard){handle.focus({preventScroll:true});keyboard=true}
      active();
    }

    function schedule(e){
      if(e.pointerType==='touch'||!e.isPrimary||dragId!==null||e.buttons)return;
      const {clientX:x,clientY:y}=e;
      if(card?.contains(e.target)){stopDwell();active();return}
      if(e.target.closest('a,button')||keyboard){stopDwell();return}
      if(card)active();
      if(spawnedAt && Math.hypot(x-spawnedAt.x,y-spawnedAt.y)<10)return;
      if(origin && Math.hypot(x-origin.x,y-origin.y)<5)return;
      stopDwell();origin={x,y};
      dwellTimer=setTimeout(()=>{
        const hit=document.elementFromPoint(x,y);
        if(hit && cover.contains(hit) && !hit.closest('a,button,.market-card'))show(x,y);
        else stopDwell();
      },DWELL);
    }
    cover.addEventListener('pointermove',schedule,{passive:true});
    cover.addEventListener('pointerleave',()=>{stopDwell();spawnedAt=null});
    cover.addEventListener('click',e=>{
      if(!e.target.closest('a,button,.market-card') && e.detail)show(e.clientX,e.clientY);
    });
    summon.hidden=false;
    summon.addEventListener('click',e=>{
      const b=cover.getBoundingClientRect();
      show(b.left+b.width*.56,b.top+b.height*.65,e.detail===0);
    });
    function resetGraphs(){stopDwell();remove();spawnedAt=null}
    window.addEventListener('pagehide',resetGraphs);
    window.addEventListener('resize',resetGraphs);
    window.addEventListener('scroll',stopDwell,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)resetGraphs()});
  }

  function mount() {
    const cover = document.querySelector('[data-atlas-cover]');
    if (!cover || cover.dataset.coverReady) return;

    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let frame = 0, previous = 0, visible = true, pageActive = true;
    function paint() {
      cover.style.setProperty('--cover-x', x.toFixed(4));
      cover.style.setProperty('--cover-y', y.toFixed(4));
    }
    function reset() {
      cancelAnimationFrame(frame);
      frame = previous = x = y = targetX = targetY = 0;
      paint();
    }
    function enabled() {
      return cover.dataset.coverMode === 'motion' && pageActive && visible && !document.hidden;
    }
    function updateMode() {
      cover.dataset.coverMode = fine.matches && !reduced.matches &&
        document.documentElement.dataset.motion !== 'reduced' ? 'motion' : 'static';
      reset();
    }
    function advance(now) {
      frame = 0;
      if (!enabled()) { reset(); return; }
      const elapsed = previous ? now - previous : 16;
      const follow = 1 - Math.exp(-elapsed / 78);
      x += (targetX - x) * follow;
      y += (targetY - y) * follow;
      if (Math.max(Math.abs(targetX - x), Math.abs(targetY - y)) < 0.001) {
        x = targetX; y = targetY; previous = 0;
      } else {
        previous = now;
        frame = requestAnimationFrame(advance);
      }
      paint();
    }
    function aim(nextX, nextY) {
      targetX = nextX; targetY = nextY;
      if (!frame && (x !== targetX || y !== targetY)) frame = requestAnimationFrame(advance);
    }
    const normalized = (offset, length) => Math.max(-1, Math.min(1, 2 * offset / length - 1));
    cover.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || !enabled()) return;
      const box = cover.getBoundingClientRect();
      aim(normalized(event.clientX-box.left,box.width), normalized(event.clientY-box.top,box.height));
    }, {passive:true});
    cover.addEventListener('pointerleave', () => { if (enabled()) aim(0,0); });
    cover.addEventListener('pointercancel', reset);
    cover.addEventListener('focusin', event => { if (event.target.matches(':focus-visible')) reset(); });
    window.addEventListener('blur', reset);
    window.addEventListener('pagehide', () => { pageActive = false; reset(); });
    window.addEventListener('pageshow', () => { pageActive = true; updateMode(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
    for (const media of [fine, reduced]) media.addEventListener('change', updateMode);
    new MutationObserver(updateMode).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    }).observe(cover);

    mountGraphs(cover);
    updateMode();
    cover.dataset.coverReady = 'true';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
