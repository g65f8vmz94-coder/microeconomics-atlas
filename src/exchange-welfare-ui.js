import {welfareKeys,welfareStory} from './exchange-welfare-story.mjs';
import {welfareContent} from './exchange-welfare-content.mjs';
export function startWelfareStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#2c433a',muted:'#6b7c70',rice:'#177468',bean:'#ab8124',red:'#bf634e',rule:'#d9e2d7',paper:'#fffdf7'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>String(+Number(x).toFixed(3)),signed=x=>x<0?'负'+num(-x):num(x),change=x=>Math.abs(x)<1e-9?'保持不变':x>0?'提高'+num(x):'减少'+num(-x);
 const txt=(x,y,s,size=12,color=C.ink,anchor='start')=>`<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
 let key=welfareKeys.includes(requested)?requested:welfareKeys[0],step=0;
 $('fields').insertAdjacentHTML('beforebegin','<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">'+welfareKeys.map(k=>'<option value="'+k+'">'+esc(welfareContent[k].title)+'</option>').join('')+'<option value="welfare">保留原例：支出矛盾</option><option value="externality">保留原例：外部性</option><option value="cd">保留原例：CD交换</option></select></div>');
 function configure(k){key=k;window.WELFARE_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(q.get('case')===key||!q.has('case'))&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;$('experiment').value=key;$('fields').innerHTML='<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';$('plot').closest('.stage').classList.add('jungle-intro');draw();}
 function ledger(f,small){
  const W=small?320:760,H=small?865:560,pw=small?300:355,goods=f.external?['点心','音乐']:['米','豆'],units=f.external?['份','小时']:['千克','千克'];
  let s=txt(W/2,24,'先看每个人，再核对总资源',small?15:19,C.ink,'middle');
  if(f.prices)s+=txt(W/2,48,`固定价格：${goods[0]}${num(f.prices[0])}元；${goods[1]}${num(f.prices[1])}元`,small?12:15,C.muted,'middle');
  else s+=txt(W/2,48,'本段比较分配，不设市场价格',small?12:15,C.muted,'middle');
  for(let i=0;i<2;i++){
   const ox=small?10:i?395:10,oy=66+(small?i*290:0),left=ox+60,right=ox+pw-18,scale=(right-left)/f.limit,a=f.assignment[i],before=f.baseline[i],ck=f.check;
   s+=`<rect x="${ox}" y="${oy}" width="${pw}" height="275" rx="12" fill="#f5f7f0" stroke="${C.rule}"/>`+txt(ox+14,oy+25,(i?'乙':'甲')+'的篮子',16);
   for(let k=0;k<2;k++){
    const y=oy+48+k*63,col=k?C.bean:C.rice;
    s+=txt(ox+14,y+16,goods[k],13,col)+`<rect x="${left}" y="${y}" width="${before[k]*scale}" height="20" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/><rect data-motion="welfare-${key}-bundle-${i}-${k}" data-motion-clamp="true" x="${left}" y="${y+5}" width="${a[k]*scale}" height="10" fill="${col}"/>`+txt(left,y+43,`原来${num(before[k])}；本步${num(a[k])}${units[k]}`,12);
   }
   s+=`<path d="M${left} ${oy+172}H${right}" stroke="${C.rule}"/>`;
   for(const v of [0,f.limit/2,f.limit])s+=txt(left+v*scale,oy+190,num(v),11,C.muted,'middle');
   s+=txt(ox+14,oy+216,`评分：原${signed(ck.before[i])}；本步${signed(ck.after[i])}`,13)+txt(ox+14,oy+239,'与自己相比：'+change(ck.gains[i]),13,ck.gains[i]<-1e-9?C.red:C.rice);
   s+=txt(ox+14,oy+261,f.costs?`篮子支出${num(f.costs[i])}元；原财富${num(f.wealth[i])}元`:'只按本人偏好比较，不作人际评分加总',small?11:12,C.muted);
  }
  const y=small?680:380,bx=small?77:145,bw=W-bx-23,scale=bw/f.limit;
  s+=txt(14,y,'全体资源账：东西有没有凭空多出来',small?13:17);
  for(let k=0;k<2;k++){
   const yy=y+21+k*55,col=k?C.bean:C.rice;s+=txt(14,yy+15,'总'+goods[k],12,col)+`<rect x="${bx}" y="${yy}" width="${f.resources[k]*scale}" height="19" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/><rect data-motion="welfare-${key}-total-${k}" data-motion-clamp="true" x="${bx}" y="${yy+5}" width="${f.check.totals[k]*scale}" height="9" fill="${f.check.feasible?col:C.red}"/>`+txt(bx,yy+37,`原有${num(f.resources[k])}；本步要${num(f.check.totals[k])}${units[k]}`,12);
  }
  const verdict=!f.check.feasible?'资源不够：不可行，不能成交':f.check.paretoImprovement?(f.check.allStrict?'资源可行，而且每个人都严格改善':'资源可行，全体不差、至少一人更好'):f.check.allWeak?'资源可行，但没有任何人严格改善':'资源可行，但有人比原来更差';
  s+=txt(W/2,H-28,verdict,small?12:15,f.check.paretoImprovement?C.rice:f.check.allWeak&&f.check.feasible?C.muted:C.red,'middle');
  s+=txt(W/2,H-8,'虚框是原值；色条是本步。各图刻度固定。',small?11:12,C.muted,'middle');return{W,H,s};
 }
 function prices(f,small){
  const W=small?320:760,H=small?510:460,left=small?25:65,right=W-left,Y=124,X=p=>left+(p-.4)/.9*(right-left),d=f.demand,pname=Math.abs(f.price-2/3)<1e-10?'三分之二':num(f.price);let s='';
  s+=txt(W/2,28,'点心价格怎样改变两人的选择',small?15:20,C.ink,'middle')+txt(W/2,57,'音乐价格固定1；本步点心价'+pname,small?13:16,C.muted,'middle');
  s+=`<rect x="${X(2/3)}" y="87" width="${X(1)-X(2/3)}" height="66" fill="#e1ecde"/><path d="M${left} ${Y}H${right}" stroke="${C.ink}" stroke-width="2"/>`;
  for(const v of [.5,2/3,1,1.2])s+=`<path d="M${X(v)} ${Y-5}v10" stroke="${C.ink}"/>`+txt(X(v),Y+26,v===2/3?'三分之二':num(v),11,C.muted,'middle');
  s+=`<circle data-motion="welfare-price-${step}" cx="${X(f.price)}" cy="${Y}" r="7" fill="${d.eq?C.rice:C.red}"/>`+txt(W/2,184,'绿色区间含两端：能够支持出清',small?12:15,C.rice,'middle');
  const sets={rice:'只要点心',bean:'只要音乐',line:'预算线上的所有混合'};
  for(let i=0;i<2;i++){
   const y=217+i*85;s+=txt(20,y,(i?'乙':'甲')+'的最优选择：'+sets[d.choice[i]],small?14:17);
   const endpoints=(i?d.B:d.A).map(a=>`（${num(a[0])}，${num(a[1])}）`).join(' 到 ');
   s+=txt(20,y+27,(d.choice[i]==='line'?'全部线段：':'唯一篮子：')+endpoints,small?12:15,C.muted);
  }
  s+=txt(W/2,405,d.eq?'出清只能是甲拿点心、乙拿音乐':'不能出清：两户的清单无法同时实现',small?12:16,d.eq?C.rice:C.red,'middle')+txt(W/2,430,'括号顺序：点心份数、音乐小时数',small?12:14,C.muted,'middle');
  if(small)s+=txt(W/2,470,'这是价格比较，不模拟市场自动调价。',11,C.muted,'middle');return{W,H,s};
 }
 function draw(){
  const f=welfareStory(key,step),c=welfareContent[key],phase=c.steps[step];$('filmStep').value=step;$('out-filmStep').value=step;
  let brief=$('welfare-brief');if(!brief){brief=document.createElement('section');brief.id='welfare-brief';brief.setAttribute('aria-label','问题与题目条件');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="welfare-question"></span></p><p class="reading"><strong>情境与条件：</strong><span id="welfare-condition"></span></p><p class="boundary" id="welfare-scope"></p>';$('legend').before(brief);}
  $('welfare-question').textContent=c.question;$('welfare-condition').textContent=c.conditions;$('welfare-scope').textContent=f.scope;
  Object.assign($('plot').dataset,{filmIntro:c.question,filmPhase:phase[0],filmNarration:phase[1],filmConclusion:c.steps[5][1]});
  const {W,H,s}=f.view==='price'?prices(f,$('plot').clientWidth<500):ledger(f,$('plot').clientWidth<500);window.microMotion.chart($('plot'),`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title+'：'+phase[0])}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`);
  $('legend').textContent=f.identity+'。'+(f.view==='price'?'横轴为点心每份价格；端点的个人需求保留整个线段。':'同一人物和商品贯穿各幅。评分只与本人原值比较；个人图与总账用独立画布，请按标注读数量。');
  const metrics=f.view==='price'?[['甲的选择',f.demand.choice[0]==='line'?'整条预算线':f.demand.choice[0]==='rice'?'点心':'音乐'],['乙的选择',f.demand.choice[1]==='line'?'整条预算线':f.demand.choice[1]==='rice'?'点心':'音乐'],['当前价格能出清',f.demand.eq?'是':'否']]:[['资源可行',f.check.feasible?'是':'否'],['所有人不差',f.check.allWeak?'是':'否'],['构成帕累托改善',f.check.paretoImprovement?'是':'否']];
  $('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+a+'</label><strong>'+b+'</strong></div>').join('');$('reading').textContent=phase[1];$('formula').textContent=c.formula;$('boundary').textContent=c.trap;
  $('extra').innerHTML='<h3>把条件与原理连起来</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>同类题怎么上手</h3><p>'+esc(c.template)+'</p><h3>最容易混淆的地方</h3><p>'+esc(c.trap)+'</p><p>来源：Osborne–Rubinstein '+esc(c.source)+'</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||'');const gb=document.querySelector('.study-guide>.boundary');if(gb)gb.textContent='本段对应§10.5正文、命题10.4与四条评论；保留的章末习题另行审核。';
  const dl=document.querySelector('.lesson-end a[download]');if(dl){dl.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch10-welfare-'+key+'.html';dl.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 const advance=()=>{step=Math.min(5,step+1);draw()};$('experiment').onchange=e=>{if(welfareKeys.includes(e.target.value)){history.replaceState(null,'',location.pathname+'?case='+e.target.value);configure(e.target.value)}else location.href=location.pathname+'?case='+encodeURIComponent(e.target.value)};
 $('fields').addEventListener('input',e=>{if(e.target.dataset.key==='filmStep'){step=Math.max(0,Math.min(5,Math.round(Number(e.target.value)||0)));draw()}});$('advance').onclick=advance;$('play').onclick=advance;$('reset').onclick=()=>configure(key);window.addEventListener('resize',draw);configure(key);
}
