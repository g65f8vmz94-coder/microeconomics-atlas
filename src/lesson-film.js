/* Guided playback. Economic controllers remain the only source of chart values.
 * This layer calls their existing one-step explanation; it never invents a
 * demand point, interpolates a discrete choice, or writes a student's answers.
 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),meta=window.LESSON;
 if(!meta||!$('plot')||!$('film-play'))return;
 const controls=$('fields'),plot=$('plot'),player=$('lesson-film'),motion=window.microMotion;
 const chapterStories={
  1:'买电脑时，有人先看价格，有人先看内存。先记住：这里研究的是“怎么比较”，还没轮到“买不买得起”。',
  2:'你走进店里，最后拿走一件东西。我们先记下你面前有什么，再看你选了什么，逐步追问这些选择能否互相说得通。',
  3:'一笔钱稳稳拿到手，和一笔可能拿不到的钱，你会怎样比较？先看清每种结果和它发生的机会。',
  4:'把购物袋里的两样东西画成一个点。点往哪边走，就是哪样多了、哪样少了；接下来再判断你是否更满意。',
  5:'拿着同一笔钱去买两样东西。一件涨价了，原来的购物袋还能买得起吗？先看钱够不够，再看怎样挑。',
  6:'开一家小店，原料要花钱，产品能卖钱。我们跟着同一家店，看它能做多少、愿意做多少。',
  7:'假如你是卖家，涨价可以多收一点，也可能少卖几杯。先把这两件事放在同一张图里看。',
  8:'几个人挑房子，喜欢的可能是同一间。记住每个人是谁、房子在哪里，再看挑选顺序怎样影响结果。',
  9:'这次房子原本各有主人。大家可以换房，但没人必须白白让出自己的房子；看看交易怎样接成一圈。',
  10:'两个人各带来一些东西。把一个人的所得和另一个人的所余同时画进盒子，交换就不会凭空多出资源。',
  11:'一件物品不能切成两半，未来的损失也未必落在同一个人身上。先看清这一页具体能交易什么。',
  12:'工厂做出了东西，利润归谁，又会影响谁能买东西。跟着同一笔资源和收入，看看它们怎样接起来。',
  13:'大家以为哪里会拥挤，就会改变自己的选择；这些选择又真的改变拥挤。看看预期和结果能否对得上。',
  14:'买家或老板看不清你的真实情况，只能看见报价、证书或行动。先看谁知道什么，再看谁愿意接受。',
  15:'两个人都在做决定。先把另一个人的做法按住，看看自己单独改一下，会不会更划算。',
  16:'谈条件要分先后。先看后面的人到了那一步会怎么选，再倒过来想，前面的人现在该怎么办。',
  17:'分东西、收费用的规则，会改变大家怎么报、怎么选。我们把规则、真实想法和最后所得分开看。',
  18:'分学校或分岗位，双方可能都在挑。跟着同一位申请者，看申请、暂留和拒绝怎样一步步发生。',
  19:'一起做出了多少，和每个人分到多少，是两件事。先固定一组人的贡献，再看分配规则要求什么。',
  20:'几个人各有各的排序，怎样合成大家的决定？先逐对数清楚，别急着以为多数结果一定能排成一条直线。'
 };
 const specific={
  '2.4':{intro:'招人时，不一定把所有人都见完。假设你按固定顺序面试，遇到第一个达到门槛的人就停；都没过线，才选最后一位。',end:'记住两段排序：过线的人按面试顺序排；没过线的人按倒序接在后面。固定评分、门槛和顺序，才能用这同一张排序解释不同菜单。'},
  '2.5':{intro:'你手里的一件东西，每次都换成当时更想要的，还付一点钱。我们盯住两样：现在拿着什么，钱包还剩多少。',end:'东西绕回起点，不等于钱包也回到起点。不断损失还需要愿意付费、没有识破、钱足够和收费下限等额外条件；物品选择本身推不出这些条件。'},
  '5.6:giffen':{intro:'想象便宜的主食涨价了。手里的钱没变，反而可能要少买别的、靠更多主食过日子。这个自主模型让我们看清这种可能性需要什么条件。',end:'这里的“涨价反而多买”只在标出的局部区间成立。劣等品还不够：收入效应必须大过反方向的替代效应。别把这一段外推成整条需求都向上。'},
  '1.2:lexformation':{intro:'挑电脑，先比第一条；第一条打平，才比第二条。像先看工资，工资一样再比通勤，后一条不会反过来推翻前一条的胜负。',end:'并集收进任一路合格的比较；交集要求两关同时过。这里的元素是“两个方案之间的比较”。这是原文“或者、并且”的等价集合改写。'}
 };
 let ready=false,playing=false,finished=false,frame=0,elapsed=0,lastTime=0,raf=0,hold=7000,canonical='',baseline=[],signatures=new Set(),changed=0,transition=null,lastPaint=0;
 let autoStarted=false,visible=true,initialMarkup='',story,pendingEnd=false,urlRestoreTimer=0,bootScheduled=false;
 const plain=el=>{if(!el)return '';const copy=el.cloneNode(true);copy.querySelectorAll('[data-math-source]').forEach(x=>{if(x.isConnected||copy.contains(x))x.replaceWith(document.createTextNode(x.dataset.mathSource));});copy.querySelectorAll('.katex-mathml').forEach(x=>x.remove());return (copy.textContent||'').replace(/\s+/g,' ').trim();};
 const key=el=>el.dataset.key||el.dataset.sd||el.dataset.al||el.dataset.rz||el.dataset.formationField||el.dataset.utility||el.id.replace(/^(?:f|u|ex|ci|rz|al|sd)-/,'');
 function snapshot(){return [...controls.querySelectorAll('input[id],select[id]')].map(el=>({id:el.id,key:key(el),value:el.value,type:el.type,min:el.min,max:el.max,step:el.dataset.filmOriginalStep||el.step,label:plain(controls.querySelector(`label[for="${CSS.escape(el.id)}"]`))}));}
 function signature(){return JSON.stringify(snapshot().map(x=>[x.id,x.value]))+'|'+plain($('reading'))+'|'+plain($('metrics'))+'|'+(plot.querySelector('svg')?.outerHTML||'');}
 function keepURL(){if(canonical&&location.href!==canonical)history.replaceState(history.state,'',canonical);}
 function settleURL(){keepURL();queueMicrotask(keepURL);clearTimeout(urlRestoreTimer);urlRestoreTimer=setTimeout(keepURL,250);}
 const isScalar=item=>item.type==='range'&&Number(item.step)>0&&Number(item.step)<1&&!/^(?:phase|step|proofStep|peel|progress)$/.test(item.key);
 function exactRange(item){const el=$(item.id);if(el&&isScalar(item)){el.dataset.filmOriginalStep=item.step;el.step='any';}}
 function setField(item,value,continuous=false,restoreOpening=false){const el=$(item.id);if(!el||(el.disabled&&!restoreOpening))return;if(el.type==='range'){el.step=continuous||isScalar(item)?'any':item.step||'1';if(isScalar(item))el.dataset.filmOriginalStep=item.step;}if(el.value===String(value))return;el.value=String(value);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));if(el.type==='range')el.dispatchEvent(new Event('change',{bubbles:true}));}
 function calmContent(){
  for(const el of document.querySelectorAll('#plot button,#extra button,#plot input,#extra input,#plot select,#extra select')){el.tabIndex=-1;el.setAttribute('aria-hidden','true');}
  for(const d of $('extra').querySelectorAll('details'))d.open=true;
 }
 function caption(title,text){$('film-phase').textContent=title;$('film-caption').textContent=text;$('film-status').textContent=playing?'正在连贯讲解':finished?'本段讲解结束':'已暂停，可以慢慢看图';player.dataset.frame=String(frame);player.dataset.state=playing?'playing':finished?'ended':'paused';}
 function updateButtons(){const p=$('film-play');p.disabled=!ready;p.textContent=playing?'暂停':finished?'重新播放':motion?.reduced.matches?'继续讲解':'播放讲解';p.setAttribute('aria-label',p.textContent);p.setAttribute('aria-pressed',String(playing));$('film-replay').disabled=!ready;}
 function pause(){playing=false;cancelAnimationFrame(raf);lastTime=0;motion?.pauseCharts?.();updateButtons();if(ready){$('film-status').textContent=finished?'本段讲解结束':'已暂停，可以慢慢看图';player.dataset.state=finished?'ended':'paused';}}
 function end(){finished=true;pause();caption('把原理带走',plot.dataset.filmConclusion||story.end||plain($('reading'))||meta.boundary);$('film-meter').textContent='讲解结束';}
 // A static step must never inherit an unfinished scalar transition. Settle
 // that same model step before allowing the next one; otherwise resuming
 // motion could send the model back to the previous target.
 function settleTransition(){if(!transition)return;const current=transition;transition=null;setField(current.item,current.to);elapsed=0;caption('停下来，看看结果',current.explanation);calmContent();settleURL();}
 // Reset the controller's private stage as well as visible progress, then put
 // back the opening parameters. Specialist questionnaires keep their answers
 // in their reset handler. No practice or answer buttons are ever activated.
 function rewind(toStart=true){
  $('reset').click();
  // Inactive parameters still belong to the saved opening state. Restoring
  // them does not enable their controls or advance an authored model step.
  for(const x of baseline)setField(x,x.value,false,true);
  const query=new URL(canonical||location.href).searchParams,keepTwoPartProof=!toStart&&query.get('case')==='twopart'&&query.has('proofStep');
  for(const x of snapshot())if((/^(?:phase|step|proofStep|peel|progress)$/.test(x.key)||(toStart&&x.key==='filmStep'))&&x.type==='range'&&!(keepTwoPartProof&&x.key==='proofStep')&&!(!toStart&&meta.chapter===10&&query.has(x.key)))setField(x,x.min||0);
  settleURL();calmContent();frame=0;changed=0;elapsed=0;transition=null;pendingEnd=false;finished=false;signatures=new Set([signature()]);initialMarkup=plot.innerHTML;
  const restoredExternal=(['8.6','9.1','9.2','9.3','9.4','10.1','10.2','10.3','10.4','10.5','10.6','10.7','10.8','10.9'].includes(meta.id)&&!toStart&&Number($('filmStep')?.value)>0&&plot.dataset.filmPhase)||(['15.3','15.4'].includes(meta.id)&&!toStart&&query.has('filmStep')&&window.demo?.state?.step>0&&plot.dataset.filmPhase);
  const restoredExchange=!toStart&&meta.chapter===10&&snapshot().some(x=>/^(?:step|progress)$/.test(x.key)&&query.has(x.key)&&Number(x.value)>Number(x.min||0));
  $('film-meter').textContent=restoredExternal||restoredExchange?'已定位到指定画面':'起始画面';caption(restoredExternal?plot.dataset.filmPhase:restoredExchange?'已定位到指定画面':'生活引入 · 自主讲解',restoredExternal?plot.dataset.filmNarration:restoredExchange?plain($('reading')):(plot.dataset.filmIntro||story.intro||chapterStories[meta.chapter]||meta.question));updateButtons();
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
  settleURL();calmContent();
  const now=signature();
  if(now===prior||signatures.has(now)||changed>=120){end();return;}
  signatures.add(now);changed++;frame++;
  const after=snapshot(),delta=after.filter(x=>{const old=before.find(y=>y.id===x.id);return old&&old.value!==x.value;});
  const label=delta.filter(x=>!/^(?:phase|step|proofStep|peel|progress)$/.test(x.key)).map(x=>{const old=before.find(y=>y.id===x.id);const el=$(x.id);const v=el?.tagName==='SELECT'?el.selectedOptions[0]?.textContent:x.value;return `${x.label.replace(/[\d.\-]+$/, '').trim()||x.key}：${old.value} → ${v}`;}).join('；');
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
  if(scalar&&!motion?.reduced.matches){const old=before.find(x=>x.id===scalar.id),customTransition=plot.dataset.filmTransition,transitionText=customTransition||label+'。其他条件先不变。盯住刚才的对象，看看它沿着图走到哪里。';transition={item:scalar,from:Number(old.value),to:Number(scalar.value),elapsed:0,explanation};setField(scalar,old.value);keepURL();caption(customTransition?'条件变化，慢慢观察':'一个条件，慢慢改变',transitionText);}
  hold=Math.max(7000,Math.min(15000,3000+text.length*65));
  $('film-meter').textContent='第 '+(changed+1)+' 个画面';
 }
 function tick(now){if(!playing)return;const dt=lastTime?Math.min(now-lastTime,120):0;lastTime=now;
  if(transition){transition.elapsed+=dt;const t=Math.min(1,transition.elapsed/1800);if(now-lastPaint>=50||t===1){lastPaint=now;setField(transition.item,transition.from+(transition.to-transition.from)*t,t!==1);settleURL();}if(t===1){caption('停下来，看看结果',transition.explanation);transition=null;calmContent();}raf=requestAnimationFrame(tick);return;}
  elapsed+=dt;
  if(elapsed>=hold){elapsed=0;next();}if(playing)raf=requestAnimationFrame(tick);
 }
 function play(){if(!ready)return;if(playing){pause();return;}if(finished)rewind();
  if(motion?.reduced.matches){next();pause();return;}
  playing=true;lastTime=0;motion?.resumeCharts?.();updateButtons();$('film-status').textContent='正在连贯讲解';player.dataset.state='playing';raf=requestAnimationFrame(tick);
 }
 $('film-play').addEventListener('click',play);$('film-replay').addEventListener('click',()=>{pause();rewind();if(!motion?.reduced.matches)play();});
 function boot(){if(ready||bootScheduled||!plot.querySelector('svg')||!$('reading').textContent.trim()||!controls.children.length)return;bootScheduled=true;setTimeout(finishBoot,0);}
 function finishBoot(){if(ready)return;bootScheduled=false;
  ready=true;canonical=location.href;baseline=snapshot();const c=window.PRODUCER_DEFAULT||new URLSearchParams(location.search).get('case')||window.EXCHANGE_MODEL_DEFAULT||window.EQUILIBRIUM_DEFAULT||window.EXISTENCE_DEFAULT||window.REOPENING_DEFAULT||window.WELFARE_DEFAULT||window.CORE_DEFAULT||window.DEMAND_DEFAULT||window.MANIPULATION_DEFAULT||window.EDGEWORTH_DEFAULT||window.MARKET_DEFAULT||window.LOTTERY_DEFAULT||window.PREFERENCE_DEFAULT||window.CONSUMER_DEFAULT||window.MONOPOLY_DEFAULT;story=specific[meta.id+':'+c]||specific[meta.id]||{};
  $('film-title').textContent=(meta.scenarios||[]).find(x=>x.value===c)?.label||meta.title;
  rewind(false);observer.disconnect();
  new MutationObserver(calmContent).observe($('extra'),{childList:true,subtree:true});
  if(!motion?.reduced.matches&&visible&&!document.hidden){autoStarted=true;play();}
 }
 const observer=new MutationObserver(boot);observer.observe(plot,{childList:true,subtree:true});observer.observe(controls,{childList:true,subtree:true});observer.observe($('reading'),{childList:true,subtree:true,characterData:true});boot();
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&playing)pause();else if(visible&&ready&&!autoStarted&&!motion?.reduced.matches&&!document.hidden){autoStarted=true;play();}},{threshold:.02});visibility.observe(document.querySelector('.workspace'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('pagehide',pause);motion?.reduced.addEventListener('change',()=>{pause();if(ready&&motion.reduced.matches){settleTransition();$('film-status').textContent='减少动态效果：每次继续显示一个完整状态';}});
 // A failed controller leaves its original static explanation readable.
 window.addEventListener('load',()=>{if(!ready){$('film-status').textContent='图像准备中；下方原理和公式可直接阅读。';}});
})();
