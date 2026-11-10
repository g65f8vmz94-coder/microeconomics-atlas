/* Guided playback. Economic controllers remain the only source of chart values.
 * This layer calls their existing one-step explanation; it never invents a
 * demand point, interpolates a discrete choice, or writes a student's answers.
 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),meta=window.LESSON;
 if(!meta||!$('plot')||!$('film-play'))return;
 const controls=$('fields'),plot=$('plot'),player=$('lesson-film'),motion=window.microMotion;
 const specific={
  '5.6:giffen':{intro:'想象便宜的主食涨价了。手里的钱没变，反而可能要少买别的、靠更多主食过日子。这个自主模型让我们看清这种可能性需要什么条件。',end:'这里的“涨价反而多买”只在标出的局部区间成立。劣等品还不够：收入效应必须大过反方向的替代效应。'},
  '1.2:lexformation':{intro:'挑电脑，先比第一条；第一条打平，才比第二条。像先看工资，工资一样再比通勤，后一条不会反过来推翻前一条的胜负。',end:'并集收进任一路合格的比较；交集要求两关同时过。这里的元素是“两个方案之间的比较”。这是原文“或者、并且”的等价集合改写。'}
 };
 let ready=false,playing=false,finished=false,frame=0,elapsed=0,lastTime=0,raf=0,hold=7000,canonical=window.LESSON_ENTRY||location.href,baseline=[],signatures=new Set(),changed=0,transition=null,lastPaint=0;
 let story,pendingEnd=false,urlRestoreTimer=0,bootScheduled=false;
 const plain=(el,omit)=>{if(!el)return '';const copy=el.cloneNode(true);if(omit)copy.querySelectorAll(omit).forEach(x=>x.remove());copy.querySelectorAll('[data-math-source]').forEach(x=>{if(x.isConnected||copy.contains(x))x.replaceWith(document.createTextNode(x.dataset.mathSource));});copy.querySelectorAll('.katex-mathml').forEach(x=>x.remove());return (copy.textContent||'').replace(/\s+/g,' ').trim();};
 const key=el=>el.dataset.key||el.dataset.sd||el.dataset.al||el.dataset.rz||el.dataset.formationField||el.dataset.utility||el.id.replace(/^(?:f|u|ex|ci|rz|al|sd)-/,'');
 function snapshot(){return [...controls.querySelectorAll('input[id],select[id]')].map(el=>({id:el.id,key:key(el),value:el.value,type:el.type,min:el.min,max:el.max,step:el.dataset.filmOriginalStep||el.step,label:plain(el.labels?.[0],'output')}));}
 function signature(){return JSON.stringify(snapshot().map(x=>[x.id,x.value]))+'|'+plain($('reading'))+'|'+plain($('metrics'))+'|'+(plot.querySelector('svg')?.outerHTML||'');}
 function keepURL(){if(canonical&&location.href!==canonical)history.replaceState(history.state,'',canonical);}
 function settleURL(){keepURL();queueMicrotask(keepURL);clearTimeout(urlRestoreTimer);urlRestoreTimer=setTimeout(keepURL,250);}
 const isScalar=item=>item.type==='range'&&Number(item.step)>0&&Number(item.step)<1&&!/^(?:phase|step|proofStep|peel|progress)$/.test(item.key);
 function exactRange(item){const el=$(item.id);if(el&&isScalar(item)){el.dataset.filmOriginalStep=item.step;el.step='any';}}
 function setField(item,value,continuous=false,restoreOpening=false){const el=$(item.id);if(!el||(el.disabled&&!restoreOpening))return;if(el.type==='range'){el.step=continuous||isScalar(item)?'any':item.step||'1';if(isScalar(item))el.dataset.filmOriginalStep=item.step;}if(el.value===String(value))return;el.value=String(value);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));if(el.type==='range')el.dispatchEvent(new Event('change',{bubbles:true}));}
 function calmContent(){
  for(const el of document.querySelectorAll('#plot button,#extra button,#plot input,#extra input,#plot select,#extra select')){el.tabIndex=-1;el.setAttribute('aria-hidden','true');}

 }
 function updateButtons(){
  const mode=finished?'ended':playing?'playing':'paused';
  player.dataset.state=mode;
  const play=$('film-play');
  play.disabled=!ready||!!motion?.reduced.matches;
  play.textContent=playing?'暂停':finished?'从头播放':'连续播放';
  play.setAttribute('aria-pressed',String(playing));
  $('film-next').disabled=!ready||finished;
  $('film-next').textContent=pendingEnd?'看结论 →':'下一步 →';
  $('film-replay').disabled=!ready;
 }
 function caption(title,text){
  $('film-phase').textContent=title;$('film-caption').textContent=text;
  player.dataset.frame=String(frame);
  $('film-status').textContent=finished?'本段讲解结束':playing?'正在连续播放':'停在当前画面';
  updateButtons();
 }
 function pause(){
  playing=false;cancelAnimationFrame(raf);lastTime=0;motion?.pauseCharts?.();
  updateButtons();
  if(ready)$('film-status').textContent=finished?'本段讲解结束':'停在当前画面';
 }
 function end(){finished=true;pause();caption('把原理带走',plot.dataset.filmConclusion||story.end||plain($('reading'))||meta.boundary);$('film-meter').textContent='讲解结束';}
 // A static step must never inherit an unfinished scalar transition. Settle
 // that same model step before allowing the next one; otherwise resuming
 // motion could send the model back to the previous target.
 function settleTransition(){if(!transition)return;const current=transition;transition=null;setField(current.item,current.to);elapsed=0;caption('停下来，看看结果',current.explanation);calmContent();settleURL();}
 // Reset the controller's private stage as well as visible progress, then put
 // back the opening parameters. Specialist questionnaires keep their answers
 // in their reset handler. No practice or answer buttons are ever activated.
 function rewind(){
  $('reset').click();
  for(const x of baseline)setField(x,x.value,false,true);
  for(const x of snapshot()){
   if(x.type==='range'&&/^(?:phase|step|proofStep|peel|progress|filmStep)$/.test(x.key))setField(x,x.min||0);
  }
  startFrame(false);
 }
 function startFrame(positioned){
  settleURL();calmContent();frame=0;changed=0;elapsed=0;transition=null;
  pendingEnd=$('advance').disabled;finished=false;signatures=new Set([signature()]);
  $('film-meter').textContent=positioned?'指定画面':'起始画面';
  caption(positioned?(plot.dataset.filmPhase||'当前条件'):'先看题设',
   positioned?(plot.dataset.filmNarration||plain($('reading'))):
   (plot.dataset.filmIntro||story.intro||plot.dataset.filmNarration||
    plain($('reading')).match(/^[^。]+。?/)?.[0]||meta.question));
 }
 function next(){
  if(pendingEnd){end();return;}
  const before=snapshot(),prior=signature();
  // Hidden legacy ranges are only a transport bridge. Their old pointer step
  // must not round a controller's authored target (e.g. 1.6125 to 1.6).
  before.forEach(exactRange);
  // Existing authored advance is synchronous. Never run the legacy autoplay,
  // which may wrap a finished sequence or start a second timer.
  if(!$('advance').disabled){const handler=$('advance').onclick;if(handler)pendingEnd=handler.call($('advance'))===true;else $('advance').click();}
  pendingEnd=pendingEnd||$('advance').disabled;
  settleURL();calmContent();
  const now=signature();
  if(now===prior||signatures.has(now)||changed>=120){end();return;}
  signatures.add(now);changed++;frame++;
  const after=snapshot(),delta=after.filter(x=>{const old=before.find(y=>y.id===x.id);return old&&old.value!==x.value;});
  const label=delta.filter(x=>!/^(?:phase|step|proofStep|peel|progress)$/.test(x.key)).map(x=>{const old=before.find(y=>y.id===x.id);const el=$(x.id);const v=el?.tagName==='SELECT'?el.selectedOptions[0]?.textContent:x.value;return `${x.label||x.key}：${old.value} → ${v}`;}).join('；');
  let text=plain($('reading')).split('。').slice(0,2).join('。')+'。';
  let explanation=(label?label+'。':'')+text;
  if(meta.id==='5.6'&&new URL(canonical).searchParams.get('case')==='giffen'&&$('p')&&$('q')&&$('w')){
   const p=Number($('p').value),w=Number($('w').value),q=Number($('q').value),quantity=plain($('metrics').querySelector('strong'));
   explanation=`钱仍是 ${w} 元，商品1价格现在是 ${p} 元，模型算出的购买量是 ${quantity}。`+(q===1&&p>1&&p<2&&w>4*p&&w<12?'看，涨价后反而买得更多：钱更不够用了，就要压缩别的消费，靠这种便宜商品补上。这个例子里，后一个力量盖过了“它贵了，少买点”的力量。':'现在要看条件：这一步已不在刚才标出的内点区间，不能继续套“涨价多买”的那条公式。');
  }
  explanation=plot.dataset.filmNarration||explanation;
  caption(plot.dataset.filmPhase||(delta.length?'条件怎样带出结果':'顺着图往下想'),explanation);
  // Animate an economic input through the real controller, never between two
  // pictures or choice outcomes. Integer/proof steps remain exact and discrete.
  const scalar=delta.length===1&&isScalar(delta[0])?delta[0]:null;
  if(scalar&&playing&&!motion?.reduced.matches){const old=before.find(x=>x.id===scalar.id),customTransition=plot.dataset.filmTransition,transitionText=customTransition||label+'。其他条件先不变。盯住刚才的对象，看看它沿着图走到哪里。';transition={item:scalar,from:Number(old.value),to:Number(scalar.value),elapsed:0,explanation};setField(scalar,old.value);keepURL();caption(customTransition?'条件变化，慢慢观察':'一个条件，慢慢改变',transitionText);}
  hold=Math.max(7000,Math.min(15000,3000+text.length*65));
  $('film-meter').textContent='第 '+(changed+1)+' 个画面';
 }
 function tick(now){if(!playing)return;const dt=lastTime?Math.min(now-lastTime,120):0;lastTime=now;
  if(transition){transition.elapsed+=dt;const t=Math.min(1,transition.elapsed/1800);if(now-lastPaint>=50||t===1){lastPaint=now;setField(transition.item,transition.from+(transition.to-transition.from)*t,t!==1);settleURL();}if(t===1){caption('停下来，看看结果',transition.explanation);transition=null;calmContent();}raf=requestAnimationFrame(tick);return;}
  elapsed+=dt;
  if(elapsed>=hold){elapsed=0;next();}if(playing)raf=requestAnimationFrame(tick);
 }
 function play(){if(!ready)return;if(playing){pause();return;}if(finished)rewind();
  if(motion?.reduced.matches)return;
  playing=true;lastTime=0;motion?.resumeCharts?.();updateButtons();$('film-status').textContent='正在连贯讲解';player.dataset.state='playing';raf=requestAnimationFrame(tick);
 }
 $('film-next').addEventListener('click',()=>{
  if(!ready||finished)return;
  pause();settleTransition();elapsed=0;next();
 });
 $('film-play').addEventListener('click',play);
 $('film-replay').addEventListener('click',()=>{pause();rewind();});
 function mountConditions(){
  const rail=$('film-conditions'),brief=$('film-brief'),given=$('film-given'),values=$('film-values'),box=$('condition-text');
  const stage=plot.parentElement,reading=$('reading'),boundary=$('boundary');
  // Keep the controller's real nodes (including typeset math and provenance).
  // The original headings mark where to return them when a case has its own brief.
  const readingHeading=reading.previousElementSibling,boundaryHeading=boundary.previousElementSibling;
  let scene,priorGiven,priorValues;
  function place(node,heading,show){
   heading.hidden=show;
   if(show&&node.parentElement!==box)box.append(node);
   if(!show&&node.parentElement===box)heading.after(node);
  }
  function sync(){
   const fresh=stage.querySelector(':scope > section[id$="-brief"],:scope > section[id$="-situation"]');
   const context=$('expectations-context');
   if(fresh)brief.replaceChildren(fresh);
   else if(context&&!context.hidden&&context.parentElement!==brief)brief.replaceChildren(context);
   const authored=[...brief.children].some(node=>!node.hidden);
   const premise=controls.querySelector('[data-film-given]')?.dataset.filmGiven||plot.dataset.filmGiven||'';
   const text=premise||(!authored?plot.dataset.filmIntro:'')||'';
   if(text!==priorGiven){given.textContent=text;priorGiven=text;}
   place(reading,readingHeading,!authored&&!premise);
   place(boundary,boundaryHeading,!authored);
   const inputs=[...controls.querySelectorAll('select,input[id]')].filter(el=>!el.disabled&&el.type!=='hidden');
   const describe=el=>el.selectedOptions?.[0]?.dataset.mathOriginal||el.selectedOptions?.[0]?.textContent||el.value;
   const settings=inputs.filter(el=>!/^(?:case|experiment|step|phase|proofStep|filmStep|progress|peel)$/.test(key(el))&&el.labels?.length);
   const parameters=settings.map(el=>plain(el.labels[0],'output')+'：'+describe(el)).join('；');
   if(parameters!==priorValues){values.textContent=parameters;priorValues=parameters;}
   const identity=[$('experiment')?.value,brief.firstElementChild?.id,...inputs.filter(el=>el.tagName==='SELECT').map(el=>el.value)].join('|');
   if(identity!==scene){box.scrollTop=0;scene=identity;}
   rail.hidden=false;
  }
  sync();
  const updates=new MutationObserver(sync);
  updates.observe(stage,{childList:true});
  updates.observe(controls,{childList:true,subtree:true});
  updates.observe(reading,{childList:true});
  updates.observe(brief,{childList:true,attributes:true,attributeFilter:['hidden'],subtree:true});
  updates.observe(plot,{attributes:true,attributeFilter:['data-film-given','data-film-intro']});
  controls.parentElement.addEventListener('input',()=>queueMicrotask(sync));
  controls.parentElement.addEventListener('change',()=>queueMicrotask(sync));
 }
 function boot(){
  if(ready||bootScheduled||!plot.children.length||!$('reading').textContent.trim()||!controls.children.length)return;
  bootScheduled=true;setTimeout(finishBoot,0);
 }
 function finishBoot(){
  if(ready)return;
  ready=true;baseline=snapshot();
  mountConditions();
  const entry=new URL(canonical).searchParams;
  const scene=plot.dataset.exercise||new URL(location.href).searchParams.get('case')||entry.get('case')||
   $('experiment')?.value||$('case')?.value||window.EXERCISE_DEFAULT||window.CHOICE_EXERCISE_DEFAULT||
   window.demo?.state?.key||window.demo?.caseName;
  story=specific[meta.id+':'+scene]||specific[meta.id]||{};
  if($('film-title').textContent===meta.title){
   const scenario=meta.scenarios?.find(x=>x.value===scene);
   if(scenario)$('film-title').textContent=scenario.label;
  }
  const answer=meta.answers?.[scene];
  if(answer){
   const link=$('film-solution');
   link.href=new URL(answer,link.href).href;
   link.textContent='本题推理与完整书写答案 →';
   const after=$('exercise-answer');after.href=link.href;after.hidden=false;
  }
  // On entry the controller already owns the chosen case, prices and proof position.
  // Only a deliberate replay resets it. In particular, never click reset at boot.
  const positioned=[...entry.keys()].some(k=>k!=='case');
  startFrame(positioned);observer.disconnect();
  new MutationObserver(calmContent).observe($('extra'),{childList:true,subtree:true});
 }
 const observer=new MutationObserver(boot);observer.observe(plot,{childList:true,subtree:true});observer.observe(controls,{childList:true,subtree:true});observer.observe($('reading'),{childList:true,subtree:true,characterData:true});boot();
 const visibility=new IntersectionObserver(entries=>{
  if(!entries[0].isIntersecting&&playing)pause();
 },{threshold:.02});
 visibility.observe(document.querySelector('.workspace'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause();});
 window.addEventListener('pagehide',pause);
 motion?.reduced.addEventListener('change',()=>{pause();settleTransition();});
 // A failed controller leaves its original static explanation readable.
 window.addEventListener('load',()=>{if(!ready){$('film-status').textContent='正在准备模型。';}});
})();
