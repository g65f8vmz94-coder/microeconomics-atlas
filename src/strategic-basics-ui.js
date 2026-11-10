import {strategicBasicsContent,strategicBasicsKeys} from './strategic-basics-content.mjs';
import {strategicBasicsStory} from './strategic-basics-story.mjs';

export function startStrategicBasicsStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#263f37',muted:'#667c71',green:'#177468',purple:'#74618d',red:'#bd624c',gold:'#b18429',rule:'#d7e0d5',paper:'#fffdf7',soft:'#f3f6f1'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tag=(name,a,body='')=>'<'+name+Object.entries(a).map(([k,v])=>' '+k+'="'+esc(v)+'"').join('')+'>'+body+'</'+name+'>';
 const txt=(x,y,v,size=12,color=C.ink,anchor='start',weight=500)=>tag('text',{x,y,fill:color,'text-anchor':anchor,'font-family':'system-ui,sans-serif','font-size':size,'font-weight':weight},esc(v));
 const box=(x,y,w,h,fill=C.paper,stroke=C.rule,id='',rx=8)=>tag('rect',{x,y,width:w,height:h,rx,fill,stroke,'stroke-width':stroke?1.5:0,'data-motion':id},'');
 const arrow=(x1,y1,x2,y2,dash='')=>tag('path',{d:`M${x1} ${y1}L${x2} ${y2}`,fill:'none',stroke:C.red,'stroke-width':2.4,'stroke-dasharray':dash,'marker-end':'url(#basicArrow)'},'');
 const defs=tag('defs',{},tag('marker',{id:'basicArrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'},tag('path',{d:'M0 0L10 5L0 10',fill:'none',stroke:C.red,'stroke-width':2},'')));
 let key=strategicBasicsKeys.includes(requested)?requested:strategicBasicsKeys.includes(window.STRATEGIC_BASICS_DEFAULT)?window.STRATEGIC_BASICS_DEFAULT:strategicBasicsKeys[0],step=0,timer=null;
 function stop(){if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';}
 function matrixChart(f,small){
  const n=f.game.row.length,m=f.game.col.length,W=small?280:760,L=small?44:120,T=100,cw=small?(W-L-9)/m:Math.min(230,(W-L-40)/m),ch=small?(n===5?55:n===3?81:108):(n===5?66:n===3?90:112),panelY=T+n*ch+28,H=panelY+92;
  const cell=(i,j)=>[L+j*cw,T+i*ch],center=(i,j)=>[L+(j+.5)*cw,T+(i+.5)*ch];
  let s=defs+box(0,0,W,H,C.paper,'','background',0)+txt(W/2,27,f.identity,small?11:18,C.ink,'middle',760);
  s+=txt(L+cw*m/2,57,small?'玩家2选':'玩家2（列）选',small?10:14,C.purple,'middle',720);
  s+=txt(4,T-14,small?'玩家1':'玩家1（行）',small?10:13,C.green,'start',720);
  for(let j=0;j<m;j++)s+=txt(L+(j+.5)*cw,T-12,f.game.col[j],small?(m===5?10:11):13,C.ink,'middle',650);
  for(let i=0;i<n;i++)s+=txt(L-7,T+(i+.53)*ch,f.game.row[i],small?(n===5?10:12):13,C.ink,'end',650);
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){
   const [x,y]=cell(i,j),[cx,cy]=center(i,j),selected=f.selected[0]===i&&f.selected[1]===j,ne=f.showNE&&f.audit.ne.some(p=>p[0]===i&&p[1]===j);
   s+=box(x+1,y+1,cw-2,ch-2,selected?'#f8f2e4':ne?'#eaf3ed':C.paper,selected?C.gold:C.rule,'basic-cell-'+i+'-'+j,small?5:9);
   const fs=small?(m===5?11:m===3?14:17):m===5?17:22,sep=small?(m===5?7:m===3?9:13):m===5?13:18;
   s+=txt(cx-sep,cy+fs*.32,f.game.M[i][j][0],fs,C.green,'middle',760)+txt(cx,cy+fs*.32,'/',fs-2,C.muted,'middle',450)+txt(cx+sep,cy+fs*.32,f.game.M[i][j][1],fs,C.purple,'middle',760);
   if(f.showBR){if(f.audit.brRow[j].includes(i))s+=tag('circle',{cx:x+Math.min(13,cw*.2),cy:y+11,r:small?3:5,fill:C.green,'data-motion':'br1-'+i+'-'+j},'');if(f.audit.brCol[i].includes(j))s+=tag('circle',{cx:x+cw-Math.min(13,cw*.2),cy:y+11,r:small?3:5,fill:C.purple,'data-motion':'br2-'+i+'-'+j},'');}
   if(ne)s+=txt(cx,y+ch-8,'NE',small?9:12,C.green,'middle',750);
  }
  if(f.deviation&&f.deviation.player!=='joint'){const d=f.deviation,[x1,y1]=center(...d.from),[x2,y2]=center(...d.to),offset=d.player===0?cw*.28:ch*.26;s+=d.player===0?arrow(x1+offset,y1,x2+offset,y2):arrow(x1,y1+offset,x2,y2+offset);}
  s+=box(10,panelY,W-20,76,C.soft,C.rule,'summary',10);
  const first=f.deviation?(f.deviation.player==='joint'?'两人一起改变':f.deviation.player===0?'只改玩家1':'只改玩家2')+'：'+f.deviation.before.join('/')+' → '+f.deviation.after.join('/'):'当前格收益：'+f.audit.u.join(' / ');
  const second=f.showNE?'两色最佳反应重合的格子：NE':f.showBR?'绿点：玩家1最优；紫点：玩家2最优':'先按行列定位；只比自己的数字';
  s+=txt(20,panelY+31,first,small?(n===5?10:11):14,C.ink,'start',720)+txt(20,panelY+58,second,small?9:11,C.muted,'start',620);
  return tag('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':f.identity+'。'+f.narration},s);
 }
 function travelerChart(f,small){
  const W=small?280:760,H=435,L=small?29:80,R=small?250:680,scale=x=>L+(x-180)/120*(R-L),a=f.amounts,u=f.audit.u;
  let s=defs+box(0,0,W,H,C.paper,'','background',0)+txt(W/2,28,f.identity,small?11:18,C.ink,'middle',760);
  for(let i=0;i<2;i++){const y=125+i*120,color=i?C.purple:C.green,label='玩家'+(i+1),v=a[i];s+=txt(L,y-47,label+' 报 '+v,small?13:18,color,'start',750)+tag('path',{d:`M${L} ${y}H${R}`,stroke:C.rule,'stroke-width':6,'stroke-linecap':'round'},'')+tag('circle',{cx:scale(v),cy:y,r:small?9:12,fill:color,'data-motion':'report-'+i},'')+txt(L,y+27,'180',small?10:12,C.muted)+txt(R,y+27,'300',small?10:12,C.muted,'end')+txt(R,y-47,'实际拿 '+u[i],small?12:17,color,'end',720);}
  s+=box(10,321,W-20,98,C.soft,C.rule,'summary',10);
  const first=f.kind==='behavior'?'支付规则仍按美元算：'+u.join(' / '):f.showNE?'双方报180：单改报高只拿175':f.from?'只比较指定的改报，其他人不动':'当前两人收到：'+u.join(' / ');
  const second=f.kind==='behavior'?'个人偏好可能还包含对方感受':'可报金额是180—300的整数';
  s+=txt(20,355,first,small?10:14,C.ink,'start',720)+txt(20,382,second,small?9:12,C.muted,'start',600);
  if(f.from){s+=txt(20,405,'比较 '+f.from.join('/')+' → '+a.join('/'),small?9:11,C.red,'start',600);}
  return tag('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':f.identity+'。'+f.narration},s);
 }
 function controls(){const wrap=$('fields');if(!wrap)return;const field=document.createElement('div');field.className='field';const label=document.createElement('label');label.htmlFor='experiment';label.textContent='知识点';const select=document.createElement('select');select.id='experiment';for(const k of strategicBasicsKeys){const o=document.createElement('option');o.value=k;o.textContent=strategicBasicsContent[k].title;select.append(o);}field.append(label,select);const progress=document.createElement('p');progress.className='small';progress.id='film-progress';progress.setAttribute('aria-live','polite');wrap.replaceChildren(field,progress);select.onchange=e=>{if(!strategicBasicsKeys.includes(e.target.value))return;history.replaceState(null,'',location.pathname+'?case='+encodeURIComponent(e.target.value));configure(e.target.value);};if($('advance'))$('advance').textContent='下一幕';if($('reset'))$('reset').textContent='从头重播';}
 function draw(){const f=strategicBasicsStory(key,step),c=strategicBasicsContent[key];if($('experiment'))$('experiment').value=key;if($('film-progress'))$('film-progress').textContent='第 '+(step+1)+' 幕（共6幕） · '+f.identity;
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','题目条件与本图任务');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="strategic-question"></span></p><p class="reading"><strong>题目条件：</strong><span id="strategic-conditions"></span></p><p class="boundary" id="strategic-source"></p>';$('legend')?.before(brief);} $('strategic-question').textContent=c.question;$('strategic-conditions').textContent=c.conditions;$('strategic-source').textContent=c.source;
  const plot=$('plot');if(plot){Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.identity,filmNarration:f.narration,filmConclusion:c.steps[5][1]});const art=f.kind==='matrix'?matrixChart(f,plot.clientWidth<500):travelerChart(f,plot.clientWidth<500);if(window.microMotion?.chart)window.microMotion.chart(plot,art);else plot.innerHTML=art;}
  if($('legend'))$('legend').textContent=f.kind==='matrix'?'绿色数字属行玩家1；紫色数字属列玩家2；金边是当前组合；出现红箭头时，它标出一人的单独改选。':'绿色属玩家1，紫色属玩家2；报价刻度保持180—300，近邻整数通过下方文字精确比较。';
  const metrics=f.kind==='matrix'?[['玩家1收益',f.audit.u[0]],['玩家2收益',f.audit.u[1]],['玩家1单改最多增益',f.audit.gains[0]],['玩家2单改最多增益',f.audit.gains[1]]]:[['玩家1报 / 得',f.amounts[0]+' / '+f.audit.u[0]],['玩家2报 / 得',f.amounts[1]+' / '+f.audit.u[1]],['只按美元：玩家1最佳报',f.audit.best[0].slice(0,3).join(' / ')],['只按美元：玩家2最佳报',f.audit.best[1].slice(0,3).join(' / ')]];
  if($('metrics'))$('metrics').innerHTML=metrics.map(([l,v])=>'<div class="metric"><label>'+esc(l)+'</label><strong>'+esc(v)+'</strong></div>').join('');if($('reading'))$('reading').textContent=f.narration;if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>证明与计算</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>最容易混淆</h3><p>'+esc(c.trap)+'</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>{el.textContent=[c.question,c.conditions,c.template][i]||'';});const guideBoundary=document.querySelector('.study-guide>.boundary');if(guideBoundary)guideBoundary.textContent='所有收益表、生活化人物与修改偏好处都按原书/本站自主例标明；每次固定对手的行动，比较自己改选前后的收益。';
  const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch15-basics-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 function configure(next){stop();key=strategicBasicsKeys.includes(next)?next:strategicBasicsKeys[0];window.STRATEGIC_BASICS_DEFAULT=key;const p=new URLSearchParams(location.search),wanted=Number(p.get('filmStep'));step=(p.get('case')===key||!p.has('case'))&&Number.isFinite(wanted)?Math.max(0,Math.min(5,Math.round(wanted))):0;draw();}
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};controls();if($('advance'))$('advance').onclick=()=>{stop();advance();};if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5)step=0;advance();timer=setInterval(()=>{if(advance())stop();},1950);$('play').textContent='暂停播放';};if($('reset'))$('reset').onclick=()=>configure(key);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);window.demo={get state(){return{key,step};},advance,draw,configure};configure(key);
}
window.startStrategicBasicsStory=startStrategicBasicsStory;
