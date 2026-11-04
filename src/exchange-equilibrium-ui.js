import {equilibriumStoryKeys,equilibriumStory} from './exchange-equilibrium-story.mjs';
import {equilibriumStoryContent} from './exchange-equilibrium-content.mjs';

export function startEquilibriumStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#2c433a',muted:'#6b7c70',rice:'#177468',bean:'#ab8124',purple:'#786796',red:'#bf634e',rule:'#d9e2d7',paper:'#fffdf7'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>String(+Number(x).toFixed(3));
 const txt=(x,y,s,size=12,color=C.ink,anchor='start')=>`<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
 let key=equilibriumStoryKeys.includes(requested)?requested:equilibriumStoryKeys[0],step=0;
 $('fields').insertAdjacentHTML('beforebegin','<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">'+equilibriumStoryKeys.map(k=>'<option value="'+k+'">'+esc(equilibriumStoryContent[k].title)+'</option>').join('')+['substitutes','complements','product','destroy','cd'].map(k=>'<option value="'+k+'">保留原例：'+esc({substitutes:'替代品',complements:'互补品',product:'乘积效用',destroy:'毁损禀赋',cd:'CD交换'}[k])+'</option>').join('')+'</select></div>');
 function configure(k){key=k;window.EQUILIBRIUM_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(q.get('case')===key||(!q.has('case')&&(!window.EQUILIBRIUM_DEFAULT||window.EQUILIBRIUM_DEFAULT===key)))&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;$('experiment').value=key;$('fields').innerHTML='<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';$('plot').closest('.stage').classList.add('jungle-intro');draw();}
 function diagram(f){
  const small=$('plot').clientWidth<500,W=small?320:760,pw=small?300:350,ph=310,gap=small?326:0,ledgerY=small?64:370,H=small?900:ledgerY+195;
  let s=`<rect width="${W}" height="${H}" fill="${C.paper}"/><defs><marker id="eq-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${C.bean}"/></marker></defs>`;
  s+=txt(W/2,23,`每千克价格：米${num(f.prices[0])}元，豆${num(f.prices[1])}元`,small?12:14,C.ink,'middle');
  for(let i=0;i<2;i++){
   const ox=small?10:i?395:15,oy=(small?258:44)+i*gap,left=ox+40,right=ox+pw-16,top=oy+78,bottom=oy+245,sx=x=>left+x/f.limit*(right-left),sy=y=>bottom-y/f.limit*(bottom-top),e=f.endowments[i],a=f.assignment?.[i],b=f.check.people[i],person=i?'乙':'甲';
   s+=`<rect x="${ox}" y="${oy}" width="${pw}" height="${ph}" rx="12" fill="#f5f7f0" stroke="${C.rule}"/>`;
   s+=txt(ox+14,oy+24,`${person} · 原有米${num(e[0])}、豆${num(e[1])}`,15)+txt(ox+14,oy+45,`家底 ${num(b.wealth)} 元；${a?'支出 '+num(b.cost)+' 元':'免费方向效用无上界'}`,12,C.muted);
   for(const v of [0,f.limit/2,f.limit]){s+=`<line x1="${sx(v)}" x2="${sx(v)}" y1="${top}" y2="${bottom}" stroke="${C.rule}"/><line x1="${left}" x2="${right}" y1="${sy(v)}" y2="${sy(v)}" stroke="${C.rule}"/>`+txt(sx(v),bottom+18,num(v),11,C.muted,'middle')+txt(left-7,sy(v)+4,num(v),11,C.muted,'end');}
   s+=`<path d="M${left} ${top}V${bottom}H${right}" stroke="${C.ink}" fill="none"/>`+txt(left,top-9,'豆（千克）',11,C.muted)+txt(right,bottom+34,'米（千克）',11,C.muted,'end');
   const line=[];for(const x of [0,f.limit])if(f.prices[1]>0)line.push([x,(b.wealth-f.prices[0]*x)/f.prices[1]]);for(const y of [0,f.limit])if(f.prices[0]>0)line.push([(b.wealth-f.prices[1]*y)/f.prices[0],y]);
   const boundary=line.filter(z=>z.every(v=>v>=0&&v<=f.limit)).filter((z,j,ar)=>ar.findIndex(v=>Math.hypot(z[0]-v[0],z[1]-v[1])<1e-8)===j);
   if(boundary.length>=2)s+=`<path d="M${sx(boundary[0][0])} ${sy(boundary[0][1])}L${sx(boundary[1][0])} ${sy(boundary[1][1])}" stroke="${C.muted}" stroke-width="2" fill="none"/>`;
   if(a){
    let curve='';if(f.kind==='product'&&b.utility===0)curve=`M${sx(0)} ${sy(f.limit)}L${sx(0)} ${sy(0)}L${sx(f.limit)} ${sy(0)}`;else if(f.kind==='min'){const u=b.utility;curve=`M${sx(u)} ${sy(f.limit)}L${sx(u)} ${sy(u)}L${sx(f.limit)} ${sy(u)}`;}
    else{let open=false;for(let j=0;j<=200;j++){const x=f.limit*j/200,y=f.kind==='linear'?b.utility-x:x>0?b.utility/x:NaN;if(!Number.isFinite(y)||y<0||y>f.limit){open=false;continue}curve+=(open?'L':'M')+sx(x)+' '+sy(y);open=true}}
    s+=`<path d="${curve}" stroke="${C.purple}" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>`;
    s+=`<line data-motion="eq-${key}-${i}-trade" data-motion-clamp="true" x1="${sx(e[0])}" y1="${sy(e[1])}" x2="${sx(a[0])}" y2="${sy(a[1])}" stroke="${C.bean}" stroke-width="2.5" marker-end="url(#eq-arrow)"/>`;
    s+=`<circle data-motion="eq-${key}-${i}-choice" data-motion-clamp="true" cx="${sx(a[0])}" cy="${sy(a[1])}" r="5" fill="${b.optimal?C.rice:C.red}"/>`;
   }else s+=txt((left+right)/2,(top+bottom)/2,'不存在最优篮子',15,C.red,'middle');
   s+=`<circle data-motion="eq-${key}-${i}-endowment" data-motion-clamp="true" cx="${sx(e[0])}" cy="${sy(e[1])}" r="7" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
   s+=txt(ox+14,oy+290,a?`本步米${num(a[0])}、豆${num(a[1])}；评分${num(b.utility)}`:'没有有限的最优消费点',12,b.optimal?C.rice:C.red);
  }
  s+=txt(15,ledgerY,'把两户的篮子加起来，再核对全村资源',small?13:16);
  const bx=small?93:150,bw=W-bx-30,max=f.limit,unit=bw/max;
  for(let k=0;k<2;k++){
   const y=ledgerY+24+k*58,color=k?C.bean:C.rice,supply=f.check.supply[k],demand=f.check.totals?.[k];
   s+=txt(15,y+14,k?'豆总量':'米总量',13,color)+`<rect x="${bx}" y="${y}" width="${supply*unit}" height="20" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
   if(demand!==undefined)s+=`<rect data-motion="eq-${key}-total-${k}" data-motion-clamp="true" x="${bx}" y="${y+5}" width="${demand*unit}" height="10" fill="${f.check.clearing[k]?color:C.red}"/>`;
   s+=txt(bx,y+39,`原有${num(supply)}；${demand===undefined?'没有最优需求':`本步${num(demand)}，差${num(f.check.excess[k])}`}`,12,C.muted);
  }
  const status=f.check.equilibrium?'两道检查通过：这是均衡':!f.check.valid?'最优不存在，不能组成均衡':f.check.allocation?'资源对上了，但有人还可选得更好':'资源账没对上，尚不是配置';
  s+=txt(W/2,ledgerY+166,status,small?12:16,f.check.equilibrium?C.rice:C.red,'middle');
  if(f.compareOriginal)s+=txt(W/2,ledgerY+189,`原经济甲评分0 → 当前均衡甲评分${num(f.check.people[0].utility)}`,12,C.purple,'middle');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(equilibriumStoryContent[key].title)}">${s}</svg>`;
 }
 function draw(){
  const f=equilibriumStory(key,step),c=equilibriumStoryContent[key],phase=c.steps[step];$('filmStep').value=step;$('out-filmStep').value=step;
  let brief=$('equilibrium-brief');if(!brief){brief=document.createElement('section');brief.id='equilibrium-brief';brief.setAttribute('aria-label','问题与题目条件');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="equilibrium-question"></span></p><p class="reading"><strong>情境与条件：</strong><span id="equilibrium-condition"></span></p>';$('legend').before(brief);}
  $('equilibrium-question').textContent=c.question;$('equilibrium-condition').textContent=c.conditions;
  Object.assign($('plot').dataset,{filmIntro:c.question,filmPhase:phase[0],filmNarration:phase[1],filmConclusion:c.steps[5][1]});window.microMotion.chart($('plot'),diagram(f));
  const status=[['各人在预算内最优',f.check.individualOptimal?'都是':'未全部满足'],['总资源完整分配',f.check.allocation?'是':'否'],['当前是否均衡',f.check.equilibrium?'是':'否']];
  $('metrics').innerHTML=status.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+b+'</strong></div>').join('');$('reading').textContent=phase[1];$('formula').textContent=c.formula;$('boundary').textContent=c.trap;
  $('legend').textContent='空心圈＝原禀赋；实心点＝本步篮子；灰线＝预算线；紫虚线＝本步无差异线；金箭头＝净交易。下方空框为原总量、色条为本步总量。'+(f.kind==='linear'?'坐标0—24；免费时预算向右不限。':'两张个人图坐标均为0—12，画框不限制个人预算。');
  $('extra').innerHTML='<h3>把条件与原理连起来</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>同类题怎么上手</h3><p>'+esc(c.template)+'</p><h3>最容易混淆的地方</h3><p>'+esc(c.trap)+'</p><p>来源：Osborne–Rubinstein '+esc(c.source)+' 中文解释与图形为本站编写，图中的指定数值不能代替一般证明。</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||'');const gb=document.querySelector('.study-guide>.boundary');if(gb)gb.textContent='本段对应§10.2正文，印刷139—144页；章末习题另行审核。';
  const download=document.querySelector('.lesson-end a[download]');if(download){download.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch10-equilibrium-'+key+'.html';download.textContent='下载本段完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 const advance=()=>{step=Math.min(5,step+1);draw()};
 $('experiment').onchange=e=>{if(equilibriumStoryKeys.includes(e.target.value)){history.replaceState(null,'',location.pathname+'?case='+e.target.value);configure(e.target.value)}else location.href=location.pathname+'?case='+encodeURIComponent(e.target.value)};
 $('fields').addEventListener('input',e=>{if(e.target.dataset.key==='filmStep'){step=Math.max(0,Math.min(5,Math.round(Number(e.target.value)||0)));draw()}});$('advance').onclick=advance;$('play').onclick=advance;$('reset').onclick=()=>configure(key);window.addEventListener('resize',draw);configure(key);
}
