/* Navigation and presentation enhancements. No economic calculation lives here. */
(() => {
 const menu=document.querySelector('.site-index'),toggle=document.querySelector('.motion-toggle');
 function closeMenu(restore=false){if(!menu?.open)return;menu.open=false;if(restore)menu.querySelector('summary').focus()}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){closeMenu(true);e.preventDefault()}});
 document.addEventListener('click',e=>{if(menu?.open&&(!menu.contains(e.target)||e.target.closest('.site-index-panel a')))closeMenu()});
 const motion=window.microMotion;
 function motionLabel(){if(!toggle||!motion)return;const chosen=motion.preference==='reduce';toggle.setAttribute('aria-pressed',String(chosen));toggle.setAttribute('aria-label',chosen?'恢复跟随设备的动态效果设置':'减少动态效果');toggle.title=motion.reduced.matches?'当前已减少动态效果；保留分步讲解与公式':'减少非必要动画，保留静态图像与分步讲解';toggle.textContent=chosen?'跟随设备':'少些动效'}
 toggle?.addEventListener('click',()=>{motion?.setPreference(motion.preference==='reduce'?'auto':'reduce');motionLabel()});motion?.reduced.addEventListener('change',motionLabel);motionLabel();
 const chapter=window.LESSON?.chapter;
 if(chapter)document.querySelector(`.site-index a[data-chapter="${chapter}"]`)?.setAttribute('aria-current','page');
 const fields=document.getElementById('fields'),details=document.querySelector('.model-menu'),path=[...document.querySelectorAll('.learning-path a')];
 function activate(i){path.forEach((a,j)=>{if(i===j)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')})}
 path.forEach((a,i)=>a.addEventListener('click',e=>{const target=document.querySelector(a.hash);if(!target)return;e.preventDefault();activate(i);if(i===0&&details)details.open=true;target.scrollIntoView({block:'start',behavior:motion?.reduced.matches?'instant':'smooth'});const focus=target.matches('details')?target.querySelector('summary'):target.querySelector('select,input,button')||target;focus.tabIndex=focus.tabIndex<0?-1:focus.tabIndex;focus.focus({preventScroll:true})}));
 fields?.addEventListener('focusin',()=>activate(1));document.getElementById('plot')?.addEventListener('focusin',()=>activate(2));
 function explainLogicSymbols(){
  const equation=document.getElementById('formula');if(!equation)return;
  const raw=equation.querySelector('.math-layout')?.dataset.mathSource||equation.textContent||'';
  const or=/∨|\\(?:lor|vee)\b/.test(raw),and=/∧|\\(?:land|wedge)\b/.test(raw),union=/∪|\\cup\b/.test(raw),intersection=/∩|\\cap\b/.test(raw);
  let hint=document.getElementById('formula-symbol-guide');
  if(!or&&!and&&!union&&!intersection){hint?.remove();return}
  if(!hint){hint=document.createElement('p');hint.id='formula-symbol-guide';hint.className='formula-symbol-guide';equation.after(hint)}
  const parts=[];if(or)parts.push('“或者”表示至少一条成立就行。');if(and)parts.push('“并且”表示两条都要成立。');if(union)parts.push('∪ 表示并集：属于任一集合的都收进来。');if(intersection)parts.push('∩ 表示交集：同时属于两个集合的才留下。');
  if(raw.includes('R=P_1')&&raw.includes('I_1'))parts.push('这里集合收的是两方案之间的比较：R为整体不差，P₁为第一标准更好，I₁为第一标准打平，R₂为第二标准不差。先用交集筛出同时过两关的比较，再把第一标准已经胜出的比较并进来。');
  if(raw.includes('\\succ_1')&&raw.includes('\\sim_1'))parts.push('这条式子说：第一标准下更好，或者第一标准打平且第二标准下不差；先看第一条，打平再看第二条。');
  hint.textContent=parts.join(' ');
 }
 function enhance(){
  explainLogicSymbols();
  fields?.querySelectorAll('.field').forEach(field=>{const control=field.querySelector('input,select');if(!control)return;let note=field.querySelector('.field-note');if(control.disabled&&!note){note=document.createElement('small');note.className='field-note';note.textContent='当前情境中不可调整';field.append(note)}else if(!control.disabled&&note)note.remove()});
  if(details){const current=new URLSearchParams(location.search).get('case'),links=[...details.querySelectorAll('a')],match=links.find(a=>new URL(a.href).searchParams.get('case')===current);links.forEach(a=>{if(a===match)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});details.querySelector('.current-scenario').textContent=match?'当前：'+match.textContent:''}
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;enhance()})});if(fields)observer.observe(fields,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});const metrics=document.getElementById('metrics');if(metrics)observer.observe(metrics,{childList:true,subtree:true});const formula=document.getElementById('formula');if(formula)observer.observe(formula,{childList:true,subtree:true});enhance();
 // The homepage may carry its preview prices into the original consumer controls.
 // Use their existing input events rather than changing controller state or maths.
 const params=new URLSearchParams(location.search),carry={p:'ui_p',q:'ui_q',w:'ui_w'};
 let carryReady=!Object.values(carry).some(k=>params.has(k));
 if(fields&&Object.values(carry).some(k=>params.has(k))){
  let applied=false;const carryObserver=new MutationObserver(apply);
  function apply(){if(applied)return;const targets=Object.entries(carry).filter(([,q])=>params.has(q));if(targets.some(([id])=>!document.getElementById(id)))return;applied=true;carryObserver.disconnect();for(const[id,key]of targets){const el=document.getElementById(id),value=Number(params.get(key));if(!Number.isFinite(value)||el.disabled)continue;el.value=String(Math.max(Number(el.min||-Infinity),Math.min(Number(el.max||Infinity),value)));el.dispatchEvent(new Event('input',{bubbles:true}))}carryReady=true;queueMicrotask(syncConsumerPrices)}
  carryObserver.observe(fields,{childList:true,subtree:true});apply();
 }
 // Keep the three carried values in the URL after real controls change/reset.
 // Scope this to the original consumer controller; other labs own their URLs.
 function syncConsumerPrices(){
  if(!carryReady||window.LESSON?.engine!=='consumer-lab'||!Array.isArray(window.demo?.spec))return;
  const controls=Object.entries(carry).map(([id,key])=>[document.getElementById(id),key]);
  if(controls.some(([el])=>!el?.matches('#fields input[data-key]')))return;
  try{const u=new URL(location.href);for(const[el,key]of controls)u.searchParams.set(key,el.value);if(u.href!==location.href)history.replaceState(history.state,'',u)}catch{}
 }
 if(fields){fields.addEventListener('input',()=>queueMicrotask(syncConsumerPrices));const priceObserver=new MutationObserver(syncConsumerPrices);priceObserver.observe(fields,{childList:true,subtree:true});if(metrics)priceObserver.observe(metrics,{childList:true,subtree:true});syncConsumerPrices()}
})();
