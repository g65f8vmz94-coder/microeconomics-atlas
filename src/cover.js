(() => {
  'use strict';
  function mount() {
    const cover = document.querySelector('[data-atlas-cover]');
    if (!cover || cover.dataset.coverReady) return;
    const ink = cover.querySelector('[data-cover-ink]');
    const button = cover.querySelector('[data-cover-draw]');
    const status = cover.querySelector('[data-cover-status]');
    const diagram = cover.querySelector('.cover-diagram');
    const guards = Array.from(cover.querySelectorAll(
      '[data-cover-guard], .cover-note, .cover-coordinate, [data-cover-optimum]'
    ));
    const device = matchMedia('(prefers-reduced-motion: reduce)');
    const green = '#173d32', rust = '#a2472e';
    const models = [
      {id:'market', title:'供给与需求', axes:['量 Q','价 P'], max:[8,8], point:[3,5],
       caption:'D: 8−Q   S: 2+Q', alt:'需求价格等于八减数量，供给价格等于二加数量。均衡数量三、价格五。',
       curves:[[0,8,q=>8-q,rust],[0,6,q=>2+q,green]]},
      {id:'budget', title:'预算线', axes:['x₁','x₂'], max:[7,7], point:[3,3],
       caption:'x₁ + x₂ = 6', alt:'两种商品单价各一元，预算六元。各买三单位恰好花完。',
       curves:[[0,6,x=>6-x,rust]]},
      {id:'indifference', title:'无差异曲线', axes:['x₁','x₂'], max:[8,8], point:[2,4],
       caption:'x₁x₂ = 8', alt:'两个数量的乘积保持为八。第一种商品两单位、第二种四单位就在曲线上。',
       curves:[[1,8,x=>8/x,green]]},
      {id:'cost', title:'平均与边际成本', axes:['量 Q','成本'], max:[4,10], point:[2,4],
       caption:'C(Q) = 4 + Q²', alt:'总成本为四加产量平方。产量二时，平均成本达到最低值四，等于边际成本。',
       curves:[[.42,4,q=>4/q+q,green],[0,4,q=>2*q,rust]]}
    ];
    const NS = 'http://www.w3.org/2000/svg';
    const markSize = {w:150,h:110};
    const lifetime = 3300, dwell = 1450;
    let seq = 0, lastTime = -Infinity, hover = null, lastPoint = null;
    let timer = 0, shown = true, pageActive = true;
    const marks = [];
    const reduced = () => device.matches || document.documentElement.dataset.motion === 'reduced';
    const eligible = () => pageActive && shown && !document.hidden && cover.isConnected;
    const el = (tag,attrs,body) => {
      const node = document.createElementNS(NS,tag);
      for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
      if (body!==undefined) node.textContent=body;
      return node;
    };
    function mini(model) {
      const group=el('g',{'data-cover-mark':model.id});
      const viewport=el('svg',{width:markSize.w,height:markSize.h,viewBox:'0 0 150 110'});
      const left=20,right=123,top=29,bottom=86;
      const x=q=>left+(right-left)*q/model.max[0], y=p=>bottom-(bottom-top)*p/model.max[1];
      const text=(px,py,value,cls='cover-ink-label')=>el('text',{x:px,y:py,class:cls},value);
      group.append(viewport);
      viewport.append(el('rect',{x:2,y:1,width:146,height:106,rx:2,fill:'#f6f2e7','fill-opacity':.88}));
      viewport.append(text(8,15,model.title,'cover-ink-title'));
      viewport.append(el('path',{d:'M20 26V86H127 M17 31l3 -5 3 5 M122 83l5 3 -5 3',fill:'none',stroke:'#476452','stroke-width':1,'pathLength':1,class:'cover-ink-stroke'}));
      viewport.append(text(5,33,model.axes[1]),text(126,90,model.axes[0]));
      for (const [from,to,amount,color] of model.curves) {
        const points=Array.from({length:57},(_,i)=>{
          const q=from+(to-from)*i/56;
          return (i?'L':'M')+x(q).toFixed(2)+' '+y(amount(q)).toFixed(2);
        }).join(' ');
        viewport.append(el('path',{d:points,fill:'none',stroke:color,'stroke-width':2,'stroke-linecap':'round',pathLength:1,class:'cover-ink-stroke'}));
      }
      const [qx,py]=model.point;
      viewport.append(el('circle',{cx:x(qx),cy:y(py),r:2.8,fill:green,stroke:'#f6f2e7','stroke-width':1}));
      viewport.append(text(8,102,model.caption,'cover-ink-formula'));
      return group;
    }
    function remove(mark) {
      clearTimeout(mark.expire);
      mark.node.remove();
      const index=marks.indexOf(mark);
      if(index>=0) marks.splice(index,1);
      cover.dataset.coverMarks=String(marks.length);
    }
    function cease() {clearTimeout(timer);timer=0;hover=null;lastPoint=null;}
    function reset() {
      cease();
      for(const mark of [...marks]) remove(mark);
      lastTime=-Infinity;
    }
    function position(point) {
      const box=ink.getBoundingClientRect(), w=markSize.w,h=markSize.h;
      if(box.width<w+8||box.height<h+8) return null;
      const dx=point.x-box.left,dy=point.y-box.top;
      const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
      const blocks=guards.map(g=>g.getBoundingClientRect()).filter(b=>b.width&&b.height);
      const maxX=box.width-w-4,maxY=box.height-h-4;
      // Choose the nearest clear rectangle. A stamp over the headline moves
      // beside it; in the open drawing field it stays at the pointer.
      const preferred=[dx-w/2,dy-h/2];
      const xs=[preferred[0],4,maxX],ys=[preferred[1],4,maxY];
      for(const b of blocks){
        xs.push(b.left-box.left-w-6,b.right-box.left+6);
        ys.push(b.top-box.top-h-6,b.bottom-box.top+6);
      }
      let best=null,dist=Infinity;
      for(const tx of xs) for(const ty of ys){
        const x=clamp(tx,4,maxX),y=clamp(ty,4,maxY);
        const cost=(x-preferred[0])**2+(y-preferred[1])**2;
        if(cost>=dist) continue;
        const left=box.left+x,top=box.top+y;
        if(blocks.some(b=>left<b.right+4&&left+w>b.left-4&&top<b.bottom+4&&top+h>b.top-4)) continue;
        dist=cost; best={x,y};
      }
      return best;
    }
    function stamp(point, announce=false) {
      if(!eligible()) return;
      const at=position(point); if(!at)return;
      if(reduced()) for(const mark of [...marks])remove(mark);
      for(const mark of [...marks]){
        if(Math.abs(mark.x-at.x)<markSize.w*.68&&Math.abs(mark.y-at.y)<markSize.h*.70&&!mark.node.classList.contains('cover-previous')){
          clearTimeout(mark.expire);mark.node.classList.add('cover-previous');mark.expire=setTimeout(()=>remove(mark),280);
        }
      }
      const limit=cover.clientWidth<550?3:6;
      while(marks.length>=limit)remove(marks[0]);
      const model=models[seq++%models.length],node=mini(model);
      node.setAttribute('transform','translate('+at.x.toFixed(1)+' '+at.y.toFixed(1)+')');
      const mark={...at,node,expire:0};
      marks.push(mark);ink.append(node);
      cover.dataset.coverMarks=String(marks.length);
      if(!reduced()) mark.expire=setTimeout(()=>remove(mark),lifetime);
      if(announce)status.textContent=model.title+'。'+model.alt;
      lastTime=performance.now();lastPoint=point;
    }
    function isDrawingSurface(x,y) {
      // A pointerenter dispatched on the header can land directly on a control.
      const hit=document.elementFromPoint(x,y);
      return hit && cover.contains(hit) && !hit.closest('a,button');
    }
    function bindDwell() {
      clearTimeout(timer);timer=0;
      if(!hover||reduced()||!eligible())return;
      timer=setTimeout(()=>{
        if(!hover||reduced()||!eligible())return;
        if(!isDrawingSurface(hover.x,hover.y)){cease();return;}
        stamp(hover);bindDwell();
      },dwell);
    }
    function pointMove(e) {
      if(e.pointerType==='touch'||reduced()||!eligible())return;
      if(!isDrawingSurface(e.clientX,e.clientY)){cease();return;}
      const entering=!hover;hover={x:e.clientX,y:e.clientY};
      if(entering||!lastPoint||(performance.now()-lastTime>=150&&Math.hypot(hover.x-lastPoint.x,hover.y-lastPoint.y)>=52)){
        stamp(hover);bindDwell();
      } else if(!timer)bindDwell();
    }
    function drawFromButton() {
      const box=diagram.querySelector('svg').getBoundingClientRect();
      stamp({x:box.left+box.width*.53,y:box.top+box.height*.50},true);
    }
    function mode(){
      reset();cover.dataset.coverMode=reduced()?'static':'motion';
    }
    cover.addEventListener('pointerenter',pointMove);
    cover.addEventListener('pointermove',pointMove,{passive:true});
    cover.addEventListener('pointerleave',cease);
    cover.addEventListener('pointercancel',cease);
    cover.addEventListener('click',e=>{
      if(e.target.closest('a,button')||!e.detail)return;
      stamp({x:e.clientX,y:e.clientY},true);
    });
    button.addEventListener('click',drawFromButton);
    cover.addEventListener('keydown',e=>{if(e.key==='Escape')reset()});
    window.addEventListener('blur',reset);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
    window.addEventListener('pagehide',()=>{pageActive=false;reset()});
    window.addEventListener('pageshow',()=>{pageActive=true;mode()});
    device.addEventListener('change',mode);
    new MutationObserver(mode).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{shown=entries[0].isIntersecting;if(!shown)reset()}).observe(cover);
    }
    new ResizeObserver(reset).observe(cover);
    mode();cover.dataset.coverMarks='0';cover.dataset.coverReady='true';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
