import {socialPropertiesContent,socialPropertiesKeys} from './social-properties-content.mjs';
import {socialPropertiesFrame} from './social-properties-story.mjs';

export function startSocialPropertiesStory(requested){
 const $=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const C={ink:'#263f37',muted:'#61766b',green:'#177468',gold:'#a47a26',violet:'#75618d',paper:'#fffdf7',soft:'#eef4ed'};
 const T=(x,y,v,size=14,color=C.ink,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-family="system-ui,sans-serif" font-weight="${weight}">${esc(v)}</text>`;
 const R=(x,y,w,h,fill,id,rx=7)=>`<rect x="${x}" y="${y}" width="${Math.max(0,w)}" height="${h}" rx="${rx}" fill="${fill}" data-motion="${esc(id)}"/>`;
 const fmt=v=>Number.isInteger(v)?String(v):Math.abs(v*3-Math.round(v*3))<1e-8?`${Math.round(v*3)}/3`:Math.abs(v*13-Math.round(v*13))<1e-8?`${Math.round(v*13)}/13`:String(+v.toFixed(2));
 let key=socialPropertiesKeys.includes(requested)?requested:socialPropertiesKeys.includes(window.SOCIAL_PROPERTIES_DEFAULT)?window.SOCIAL_PROPERTIES_DEFAULT:'d194',step=0,timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 function chart(f,small){
  const W=small?320:760,H=410,n=f.left.lambda.length,ys=n===2?[127,250]:[99,191,283],leftX=small?77:170,rightX=small?206:464,barW=small?84:205,scale=Math.max(1,...f.left.lambda,...f.right.lambda,...f.left.wealth,...f.right.wealth);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(f.narration)}">`+R(0,0,W,H,C.soft,'social-property-background',14);
  s+=T(leftX+barW/2,40,'原状态',small?15:18,C.gold)+T(rightX+barW/2,40,f.sameRule?'同一规则重算':'另一条制度',small?15:18,C.violet);
  for(let i=0;i<n;i++){
   const y=ys[i],j=f.oldToNew[i],label=f.oldToNew.some((v,k)=>v!==k)?`→新${j+1}`:'';
   s+=T(small?31:75,y+8,`旧${i+1}号`,small?12:15,C.ink)+T(small?31:75,y+27,label,small?11:13,C.muted);
   s+=T(leftX,y-9,`生产率 ${fmt(f.left.lambda[i])}`,small?12:15,C.ink,'start');
   s+=R(leftX,y,barW,19,C.paper,`social-left-track-${i}`);
   if(f.showLeftWealth)s+=R(leftX,y,barW*f.left.wealth[i]/scale,19,C.gold,`social-left-wealth-${i}`);
   s+=T(leftX+barW/2,y+39,f.showLeftWealth?`财富 ${fmt(f.left.wealth[i])}`:'财富待揭晓',small?12:14,C.ink);
   if(f.showRightProfile)s+=T(rightX,y-9,`生产率 ${fmt(f.right.lambda[j])}`,small?12:15,C.ink,'start');
   s+=R(rightX,y,barW,19,C.paper,`social-right-track-${i}`);
   if(f.showRightWealth)s+=R(rightX,y,barW*f.right.wealth[j]/scale,19,C.violet,`social-right-wealth-${i}`);
   s+=T(rightX+barW/2,y+39,f.showRightWealth?`财富 ${fmt(f.right.wealth[j])}`:'财富待揭晓',small?12:14,C.ink);
  }
  s+=R(small?12:30,343,small?296:700,52,C.paper,'social-property-summary');
  const oldTotal=f.showLeftWealth?fmt(f.left.wealth.reduce((a,b)=>a+b,0)):'待算',newTotal=f.showRightWealth?fmt(f.right.wealth.reduce((a,b)=>a+b,0)):'待算';
  s+=T(W/2,365,`原财富总量 ${oldTotal} · 最高可产 ${fmt(f.left.max)}`,small?12:15,C.ink)+T(W/2,384,`新财富总量 ${newTotal} · 最高可产 ${fmt(f.right.max)}`,small?12:15,C.ink);
  return s+'</svg>';
 }
 function draw(){
  const c=socialPropertiesContent[key],f=socialPropertiesFrame(key,step),plot=$('plot');if($('experiment'))$('experiment').value=key;
  if($('film-progress'))$('film-progress').textContent=`第 ${step+1} 幕（共6幕） · ${f.identity}`;
  if($('film-title'))$('film-title').textContent=c.title;if($('film-caption'))$('film-caption').textContent=f.narration;if($('film-phase'))$('film-phase').textContent=f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与数值来源');$('legend')?.before(brief);}brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>题目条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.scenes[5][1]});const art=chart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent='每一行追踪同一位原来的人。左侧金柱是原财富，右侧紫柱是新财富；生产率数字与财富柱使用固定尺度。'+(f.boundary?' 当前变化：'+f.boundary:'');
  const moved=f.oldToNew.some((j,i)=>j!==i),rightLambda=moved?f.right.lambda:f.oldToNew.map(j=>f.right.lambda[j]),rightWealth=moved?f.right.wealth:f.oldToNew.map(j=>f.right.wealth[j]);const metrics=[['原生产率档案',f.left.lambda.map(fmt).join('、')],['原财富',f.showLeftWealth?f.left.wealth.map(fmt).join('、'):'尚未揭晓'],[moved?'新编号顺序的生产率':'新生产率',f.showRightProfile?rightLambda.map(fmt).join('、'):'尚未揭晓'],[moved?'新编号顺序的财富':'新财富',f.showRightWealth?rightWealth.map(fmt).join('、'):'尚未揭晓']];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([label,value])=>`<div class="metric"><label>${esc(label)}</label><strong>${esc(value)}</strong></div>`).join('');
  if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>解题步骤</h3><ol>'+c.proof.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch19-property-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=socialPropertiesKeys.includes(next)?next:'d194';window.SOCIAL_PROPERTIES_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(!q.has('case')||q.get('case')===key)&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;draw();}
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点或原书反例';const select=document.createElement('select');select.id='experiment';for(const k of socialPropertiesKeys){const option=document.createElement('option');option.value=k;option.textContent=socialPropertiesContent[k].title;select.append(option);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
  const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();return advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(new URLSearchParams(location.search).has('filmStep')){draw();return;}}step=0;draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startSocialPropertiesStory=startSocialPropertiesStory;
