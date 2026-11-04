/* Adapted from Amicro registry/lib/presets.ts and AiPromptChips entrance/tap design.
 * Copyright (c) 2026 SYED SUBHAN UDDIN, MIT. See licenses/AMICRO-LICENSE.txt.
 * Native Web Animations adapter; no unneeded React runtime or hover dependency.
 */
(() => {
 const presets={snappy:{stiffness:400,damping:28,mass:.8},smooth:{stiffness:220,damping:24,mass:1},gentle:{stiffness:120,damping:14,mass:1}};
 const device=matchMedia('(prefers-reduced-motion: reduce)'),active=new Set(),listeners=new Set();
 let preference='auto';try{preference=localStorage.getItem('micro-motion-preference')==='reduce'?'reduce':'auto'}catch{}
 const reduced={get matches(){return preference==='reduce'||device.matches},addEventListener(type,fn){if(type==='change')listeners.add(fn)},removeEventListener(type,fn){if(type==='change')listeners.delete(fn)}};
 function notify(){document.documentElement.dataset.motion=reduced.matches?'reduced':'normal';for(const fn of listeners)fn({type:'change',matches:reduced.matches,media:device.media})}
 function setPreference(value){preference=value==='reduce'?'reduce':'auto';try{localStorage.setItem('micro-motion-preference',preference)}catch{}notify()}
 device.addEventListener('change',notify);notify();
 function response(t,p=presets.smooth){const w0=Math.sqrt(p.stiffness/p.mass),z=p.damping/(2*Math.sqrt(p.stiffness*p.mass)),wd=w0*Math.sqrt(1-z*z);return 1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t))}
 function reveal(el,distance=8){if(reduced.matches||!el.animate)return;const frames=Array.from({length:61},(_,i)=>{const r=i===60?1:response(i/60*.7);return {opacity:Math.min(1,i/12),transform:`translateY(${distance*(1-r)}px)`,offset:i/60}});const a=el.animate(frames,{duration:700,easing:'linear'});active.add(a);a.onfinish=()=>active.delete(a)}
 function tap(el){if(reduced.matches||!el.animate)return;const a=el.animate([{transform:'scale(.97)'},{transform:'scale(1)'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});active.add(a);a.onfinish=()=>active.delete(a)}
 document.addEventListener('click',e=>{const el=e.target.closest('button,.chapter-link');if(el)tap(el)});
 reduced.addEventListener('change',()=>{if(reduced.matches){active.forEach(a=>a.finish());active.clear()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){active.forEach(a=>a.finish());active.clear()}});
 // Retain keyed chart objects when their coordinates change. New/deleted edges
 // are faded; matching endpoints are never interpolated into a different pair.
 function chart(container,markup){
  const chartResponse=(el,t)=>el.dataset.motionClamp==='true'?Math.min(1,Math.max(0,response(t))):response(t);
  const old=container.querySelector('svg');
  if(!old||reduced.matches){container.innerHTML=markup;return}
  const nextViewBox=markup.match(/viewBox="([^"]+)"/)?.[1];
  if(nextViewBox&&old.getAttribute('viewBox')!==nextViewBox){container.innerHTML=markup;return}
  const previous=new Map([...old.querySelectorAll('[data-motion]')].map(el=>{
   const computed=getComputedStyle(el);let tx=0,ty=0;
   if(el.tagName==='text'){const m=(computed.transform||'').match(/^matrix\(([^)]+)\)$/);if(m){const v=m[1].split(',').map(Number);if(v[0]===1&&v[1]===0&&v[2]===0&&v[3]===1){tx=v[4];ty=v[5]}}}
   return [el.dataset.motion,{...Object.fromEntries(['x','y','width','height','cx','cy','x1','y1','x2','y2'].map(k=>{const value=Number(el.getAttribute(k)||0),visible=parseFloat(computed.getPropertyValue(k));return[k,el.tagName==='text'&&(k==='x'||k==='y')?value+(k==='x'?tx:ty):Number.isFinite(visible)?visible:value]})),fill:computed.fill,stroke:computed.stroke,opacity:computed.opacity,text:el.textContent}];
  }));
  container.innerHTML=markup;
  for(const el of container.querySelectorAll('[data-motion]')){
   const before=previous.get(el.dataset.motion);
   if(!before){const a=el.animate([{opacity:0},{opacity:1}],{duration:240});active.add(a);a.onfinish=()=>active.delete(a);continue}
   const geometry=el.tagName==='rect'?['x','y','width','height']:el.tagName==='circle'?['cx','cy']:el.tagName==='line'?['x1','y1','x2','y2']:[];
   if(geometry.length){
    // SVG geometry stays in viewBox units. Screen-pixel FLIP transforms would
    // drift under mobile scaling and move a bar's origin when scaling height.
    const after=Object.fromEntries(geometry.map(k=>[k,Number(el.getAttribute(k)||0)]));
    const frames=Array.from({length:41},(_,i)=>{const r=i===40?1:chartResponse(el,i/40*.55),frame={offset:i/40};for(const k of geometry){const value=before[k]+(after[k]-before[k])*r;frame[k]=(k==='width'||k==='height'?Math.max(0,value):value)+'px'}return frame});
    for(const [a,b] of [[0,1],[40,0]]){const frame=frames[a];frame.fill=b?before.fill:getComputedStyle(el).fill;frame.stroke=b?before.stroke:getComputedStyle(el).stroke;frame.opacity=b?before.opacity:getComputedStyle(el).opacity;}
    const a=el.animate(frames,{duration:550,easing:'linear'});active.add(a);a.onfinish=()=>active.delete(a);
   }else if(el.tagName==='text'&&!el.hasAttribute('transform')&&(before.x!==Number(el.getAttribute('x')||0)||before.y!==Number(el.getAttribute('y')||0))){
    // SVG text does not animate its x/y attributes as CSS geometry. Translate
    // by user-coordinate differences, retaining an interrupted translation.
    const dx=before.x-Number(el.getAttribute('x')||0),dy=before.y-Number(el.getAttribute('y')||0),frames=Array.from({length:41},(_,i)=>{const r=i===40?1:chartResponse(el,i/40*.55);return {offset:i/40,transform:`translate(${dx*(1-r)}px,${dy*(1-r)}px)`,opacity:before.text===el.textContent?1:Math.min(1,i/28)}});
    const a=el.animate(frames,{duration:550,easing:'linear'});active.add(a);a.onfinish=()=>active.delete(a);
   }else if(el.tagName==='text'&&before.text!==el.textContent){
    const a=el.animate([{opacity:0},{opacity:1}],{duration:380,easing:'ease-out'});active.add(a);a.onfinish=()=>active.delete(a);
   }
  }
 }
 function pauseCharts(){for(const a of active)if(a.effect?.target?.closest?.('#plot'))a.pause();}
 function resumeCharts(){for(const a of active)if(a.effect?.target?.closest?.('#plot')&&a.playState==='paused')a.play();}
 window.microMotion={presets,response,reveal,chart,reduced,setPreference,pauseCharts,resumeCharts,get preference(){return preference}};
 document.querySelectorAll('.entrance').forEach(el=>reveal(el));
})();
