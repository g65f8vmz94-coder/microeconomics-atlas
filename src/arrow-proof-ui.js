import {arrowProof} from './arrow-proof-content.mjs';
import {arrowProofFrame,arrowProofAudit} from './arrow-proof-story.mjs';
export function startArrowProofStory(){
 const $=id=>document.getElementById(id),names=['a','b','c'],colors={ink:'#263f37',muted:'#64796f',green:'#177468',gold:'#aa7c28',paper:'#fffdf7',soft:'#eef4ed',purple:'#715b8f'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const rect=(x,y,w,h,fill,id,rx=9)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" data-motion="'+id+'"/>';
 const txt=(x,y,value,size=14,color=colors.ink,weight=600,anchor='middle')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="'+size+'" font-family="system-ui,sans-serif" font-weight="'+weight+'">'+esc(value)+'</text>';
 const query=new URLSearchParams(location.search);let step=Math.min(5,Math.max(0,Number(query.get('filmStep'))||0)),timer=null,initialFilmReset=true;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if($('play'))$('play').textContent='播放整段';};
 const orderText=row=>row.map(x=>names[x]).join(' ＞ ');
 function chart(f,small){
  const W=small?320:760,H=small?392:425,cardW=small?91:205,margin=small?13:55,gap=small?10:18,rankY=small?78:84;
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc('三个个人的完整排序和社会榜。'+f.scene[1])+'">'+rect(0,0,W,H,colors.soft,'arrow-background',14);
  for(let i=0;i<3;i++){
   const x=margin+i*(cardW+gap),y=small?16:23;
   s+=rect(x,y,cardW,146,colors.paper,'arrow-person-card-'+i,10)+txt(x+cardW/2,y+23,(i+1)+'号'+(i===1?' *':''),small?13:16,i===1?colors.gold:colors.muted);
   f.profile[i].forEach((v,k)=>{
    const yy=y+rankY-19+k*31,active=v===1;
    s+=rect(x+8,yy-20,cardW-16,28,active?'#ddede2':'#f7f8f2','arrow-rank-'+i+'-'+v,5);
    s+=txt(x+cardW/2,yy,names[v]+' · 第'+(k+1)+'名',small?12:17,active?colors.green:colors.ink,active?750:550);
   });
   s+=txt(x+cardW/2,y+137,f.bAtTop[i]?'b在首位':f.bAtBottom[i]?'b在末位':'b在中间',small?10:12,colors.muted);
  }
  const panelY=small?181:197,panelX=small?12:55,panelW=small?296:650;
  s+=rect(panelX,panelY,panelW,small?164:175,colors.paper,'arrow-social-card',11);
  s+=txt(W/2,panelY+27,'社会榜 · 三人示意采用固定2号的排序',small?12:17,colors.muted);
  f.social.forEach((v,k)=>{
   const colW=small?83:151,x=panelX+(small?15:57)+k*(colW+(small?9:43)),y=panelY+55;
   s+=rect(x,y,colW,55,v===1?'#ddede2':'#f0f1ed','arrow-social-rank-'+v,8);
   s+=txt(x+colW/2,y+25,names[v],small?22:28,v===1?colors.green:colors.ink,750);
   s+=txt(x+colW/2,y+46,'第'+(k+1)+'名',small?10:13,colors.muted);
  });
  const note=f.step<4?'把b排首位的人：'+f.supportCount+'／3；社会b在第'+(f.socialBPosition+1)+'位':'当前看：'+(f.pair?names[f.pair[0]]+'与'+names[f.pair[1]]:'全部方案')+'；社会仍用同一2号的排序';
  s+=txt(W/2,panelY+147,note,small?11:15,colors.green);
  s+=txt(W/2,H-18,'* 只表示本站示意的2号；定理的一般证明在图下',small?10:14,colors.muted);
  return s+'</svg>';
 }
 function draw(){
  const f=arrowProofFrame(step),c=arrowProof,a=arrowProofAudit(),small=$('plot')?.clientWidth<500;
  if($('film-progress'))$('film-progress').textContent='第 '+(step+1)+' 幕（共6幕） · '+f.scene[0];
  if($('film-title'))$('film-title').textContent=c.title;
  if($('film-caption'))$('film-caption').textContent=f.scene[1];
  if($('film-phase'))$('film-phase').textContent=f.scene[0];
  let brief=$('strategic-brief');if(!brief){brief=document.createElement('section');brief.id='strategic-brief';brief.setAttribute('aria-label','问题、条件与来源');$('legend')?.before(brief);}
  brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong>'+esc(c.question)+'</p><p class="reading"><strong>使用条件：</strong>'+esc(c.conditions)+'</p><p class="boundary">'+esc(c.source)+'</p>';
  const plot=$('plot');if(plot){plot.parentElement?.classList.add('strategic-story');Object.assign(plot.dataset,{filmIntro:c.question,filmPhase:f.scene[0],filmNarration:f.scene[1],filmConclusion:c.scenes[5][1]});const svg=chart(f,small);if(window.microMotion?.chart)window.microMotion.chart(plot,svg);else plot.innerHTML=svg;}
  if($('legend'))$('legend').textContent='上面是本站三人示意，2号用星号固定标记；同一人、同一方案颜色贯穿六幕。图下五步证明适用于所有合条件的规则。';
  if($('metrics'))$('metrics').innerHTML=[['本幕谁把b排首位',f.supportCount+'／3'],['示意社会b的位置','第'+(f.socialBPosition+1)+'名'],['规则全域检查',a.profileCount+'份三人档案']].map(([k,v])=>'<div class="metric"><label>'+esc(k)+'</label><strong>'+esc(v)+'</strong></div>').join('');
  if($('reading'))$('reading').textContent=f.scene[1];if($('formula'))$('formula').textContent=c.formula;if($('boundary'))$('boundary').textContent=c.trap;
  if($('extra'))$('extra').innerHTML='<h3>把五步证明写成可套用的路线</h3><ol>'+c.proof.map((v,i)=>'<li'+(i===step?' class="current-proof"':'')+'>'+esc(v)+'</li>').join('')+'</ol><h3>考试时怎么套</h3><p>'+esc(c.template)+'</p><h3>条件究竟在哪里起作用</h3><p>'+esc(c.trap)+'</p><p>三人全域模型核对：固定2号的规则满足Pareto与IIA：'+(a.dictatorialPassesPareto&&a.dictatorialPassesIIA?'是':'检查异常')+'；Borda违反IIA：'+(a.bordaFailsIIA?'是':'检查异常')+'。有限枚举只验示意规则，Arrow一般结论靠上面的证明。</p><p>来源：'+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,j)=>el.textContent=[c.question,c.conditions,c.template][j]||'');
  const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch20-arrow-prop201.html';dl.textContent='下载本节完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 const advance=()=>{if(step>=5)return true;step++;draw();return step>=5;};
 const fields=$('fields');if(fields){fields.innerHTML='<p class="small" id="film-progress" aria-live="polite"></p>';}
 if($('advance')){$('advance').textContent='下一幕';$('advance').onclick=()=>{stop();return advance();};}
 if($('reset')){$('reset').textContent='从头重播';$('reset').onclick=()=>{stop();if(initialFilmReset){initialFilmReset=false;if(query.has('filmStep')){draw();return;}}step=0;draw();};}
 if($('play'))$('play').onclick=()=>{if(timer){stop();return;}if(window.microMotion?.reduced?.matches){advance();return;}if(step>=5){step=0;draw();}advance();timer=setInterval(()=>{if(advance())stop();},2200);$('play').textContent='暂停播放';};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.microMotion?.reduced?.addEventListener?.('change',stop);window.addEventListener('resize',draw);
 window.demo={get state(){return {step,case:'prop201'};},advance,draw};draw();
}
window.startArrowProofStory=startArrowProofStory;
