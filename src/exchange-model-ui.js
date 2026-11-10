import {exchangeModelKeys,exchangeModelStory,exchangeModelBudgetPlot} from './exchange-model-story.mjs';
import {exchangeModelContent} from './exchange-model-content.mjs';

export function startExchangeModelStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#2c433a',muted:'#6b7c70',rice:'#177468',bean:'#ab8124',purple:'#786796',red:'#bf634e',rule:'#d9e2d7',paper:'#fffdf7'},esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>String(+Number(x).toFixed(4));
 const text=(x,y,s,size=13,color=C.ink,anchor='middle',key='')=>`<text ${key?'data-motion="'+key+'" data-motion-clamp="true"':''} x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
 const baseGuide=[...document.querySelectorAll('.study-guide .guide-panel')].map(e=>e.textContent);
 let key=exchangeModelKeys.includes(requested)?requested:exchangeModelKeys[0],step=0;
 $('fields').insertAdjacentHTML('beforebegin','<div class="field"><label for="experiment">本节讲解</label><select id="experiment">'+exchangeModelKeys.map(k=>'<option value="'+k+'">'+esc(exchangeModelContent[k].title)+'</option>').join('')+'<option value="cd">保留：CD交换实验</option><option value="substitutes">保留：替代品例</option><option value="complements">保留：互补品例</option></select></div>');
 function configure(k){key=k;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(q.get('case')===key||(!q.has('case')&&(!window.EXCHANGE_MODEL_DEFAULT||window.EXCHANGE_MODEL_DEFAULT===key)))&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;$('experiment').value=key;$('fields').innerHTML='<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';$('plot').closest('.stage').classList.add('jungle-intro');draw();}
 function resources(f){
  const small=$('plot').clientWidth<500,W=small?320:760,H=small?660:420,cardW=small?268:330,cell=18,gap=4;
  const pos=i=>({x:small?26:i?404:26,y:small?60+i*255:70});
  const cellPos=(owner,good,j)=>{if(owner===2)return{x:105+j*22,y:H-91+good*23};const p=pos(owner);return{x:p.x+(cardW-216)/2+(j%10)*22,y:p.y+(good?158:88)+Math.floor(j/10)*18};};
  let s=`<rect width="${W}" height="${H}" fill="${C.paper}"/>`+text(W/2,27,'绿米、金豆；每小格0.5千克',13,C.muted);
  for(let i=0;i<2;i++){const p=pos(i);s+=`<rect x="${p.x}" y="${p.y}" width="${cardW}" height="225" rx="15" fill="#edf3e9" stroke="${C.rule}"/>`+text(p.x+20,p.y+26,i?'乙':'甲',19,C.ink,'start')+text(p.x+cardW-16,p.y+26,`原有 (${f.endowments[i].map(num).join('，')})`,12,C.muted,'end')+text(p.x+18,p.y+75,`大米 ${num(f.assignment[i][0])} 千克`,14,C.rice,'start')+text(p.x+18,p.y+145,`豆子 ${num(f.assignment[i][1])} 千克`,14,C.bean,'start');}
  for(let good=0;good<2;good++){
   const a=f.assignment[0][good],b=f.assignment[1][good],total=f.resources.totals[good],color=good?C.bean:C.rice,starts=[0,a,a+b],ends=[a,a+b,total];
   for(let j=0;j<Math.ceil(total*2);j++){
    const lo=j/2,hi=Math.min(total,(j+1)/2);let part=0;
    for(let owner=0;owner<3;owner++){const amount=Math.max(0,Math.min(hi,ends[owner])-Math.max(lo,starts[owner]));if(!amount)continue;const local=owner===0?j:owner===1?j-Math.floor(Math.min(a,total)*2):j-Math.floor(Math.min(a+b,total)*2),p=cellPos(owner,good,local);s+=`<rect data-motion="em-${key}-${good}-${j}${part++?'-part-'+owner:''}" x="${p.x}" y="${p.y}" width="${cell*amount/.5}" height="14" rx="2" fill="${owner===2?'#c3c8bd':color}"/>`;}
   }
   const excess=Math.max(0,a+b-total);for(let j=0;j<Math.ceil(excess*2);j++){const p=cellPos(1,good,Math.max(0,Math.ceil((total-a)*2))+j);s+=`<rect data-motion="em-${key}-missing-${good}-${j}" x="${p.x}" y="${p.y}" width="${cell*Math.min(.5,excess-j/2)/.5}" height="14" rx="2" fill="#f8e8e1" stroke="${C.red}" stroke-dasharray="3 2"/>`;}
   if(a+b<total)s+=text(28,H-80+good*23,'未分完',12,C.muted,'start');
  }
  if(key==='trade101'){
   const rows=[['卖出米',num(f.soldRice)+'千克',C.rice],['记账',num(f.money)+'元',C.purple],['换成豆',num(f.boughtBeans)+'千克',C.bean]],pw=small?86:144;
   rows.forEach(([label,value,color],i)=>{const x=W*(.2+.3*i);s+=`<rect x="${x-pw/2}" y="${H-112}" width="${pw}" height="46" rx="8" fill="#f1f3eb" stroke="${C.rule}"/>`+text(x,H-95,label,12,C.muted)+text(x,H-76,value,14,color,'middle','em-trade-receipt-'+i);});
   s+=text(W*.35,H-82,'→',13,C.muted)+text(W*.65,H-82,'→',13,C.muted);
  }
  s+=text(W/2,H-44,`大米：共有${num(f.resources.totals[0])}，指派${num(f.resources.used[0])}千克`,13,f.resources.gap[0]?C.red:C.muted)+text(W/2,H-20,`豆子：共有${num(f.resources.totals[1])}，指派${num(f.resources.used[1])}千克`,13,f.resources.gap[1]?C.red:C.muted);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(exchangeModelContent[key].title)}">${s}</svg>`;
 }
 function graph(f){
  const small=$('plot').clientWidth<500,W=small?320:760,H=small?460:480,limit=key==='preferences101'?5:20,left=small?48:72,right=W-(small?22:72),top=62,bottom=H-77,sx=x=>left+x/limit*(right-left),sy=y=>bottom-y/limit*(bottom-top);
  let s=`<rect width="${W}" height="${H}" fill="${C.paper}"/>`+text(left,24,'豆子 x₂（千克）',12,C.muted,'start')+text(right,H-15,'大米 x₁（千克）',12,C.muted,'end');
  for(let i=0;i<=4;i++){const v=limit*i/4;s+=`<line x1="${sx(v)}" x2="${sx(v)}" y1="${top}" y2="${bottom}" stroke="${C.rule}"/><line x1="${left}" x2="${right}" y1="${sy(v)}" y2="${sy(v)}" stroke="${C.rule}"/>`+text(sx(v),bottom+21,num(v),11,C.muted)+text(left-8,sy(v)+4,num(v),11,C.muted,'end');}
  s+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`;
  const pathOf=ps=>ps.map((z,i)=>(i?'L':'M')+sx(z[0])+' '+sy(z[1])).join(' ');
  if(key==='preferences101'){
   const u=f.utility;s+=`<path d="${pathOf([[u,limit],[u,u],[limit,u]])}" stroke="${C.bean}" stroke-width="2" fill="none"/>`;
  }else if(f.plot.valid){
   s+=`<path d="${pathOf(f.plot.polygon)}Z" fill="#deeee4" opacity=".8"/>`;
   if(key==='budget101'&&f.step>=2){const old=exchangeModelBudgetPlot([1,1],f.endowments[0]);s+=`<path d="${pathOf(old.boundary)}" fill="none" stroke="${C.muted}" stroke-width="2" stroke-dasharray="5 4"/>`;}
   if(f.plot.boundary.length)s+=`<path data-motion="em-${key}-line-${f.prices.join('-')}" d="${pathOf(f.plot.boundary)}" stroke="${C.rice}" stroke-width="2.5" fill="none"/>`;
   if(f.plot.unbounded.includes('x1'))s+=`<path d="M${right-36} ${sy(1)}H${right-6}l-8 -5m8 5l-8 5" stroke="${C.rice}" fill="none" stroke-width="2"/>`+text(right-3,sy(1)-13,'向右不限',12,C.rice,'end');
   if(f.plot.unbounded.includes('x2'))s+=`<path d="M${sx(4)} ${top+38}V${top+8}l-5 8m5 -8l5 8" stroke="${C.rice}" fill="none" stroke-width="2"/>`+text(sx(4)+13,top+26,'向上不限',12,C.rice,'start');
  }else s+=text(W/2,(top+bottom)/2,'(0,0)不是本章价格体系',small?15:20,C.red);
  const dot=(z,label,color,id,ring=false,offset=-14)=>{if(!z)return'';const x=sx(z[0]),y=sy(z[1]),anchor=x>right-65?'end':'start',tx=x+(anchor==='end'?-10:10),ty=Math.max(top+14,Math.min(bottom-10,y+offset));return `<circle data-motion="em-${key}-${id}" data-motion-clamp="true" cx="${x}" cy="${y}" r="${ring?8:5}" fill="${ring?'none':color}" stroke="${color}" stroke-width="2"/>`+text(tx,ty,label,12,color,anchor,'em-'+key+'-'+id+'-label');};
  if(f.plot.valid||key==='preferences101'){
   s+=dot(f.baselinePoint,key==='preferences101'?'基准 (2,2)':key==='optimal101'?'起点 (3,3)':'原禀赋 (8,2)',C.muted,'reference',true,22);
   if(f.point)s+=dot(f.point,`本步 (${f.point.map(num).join('，')})`,key==='preferences101'||f.affordable?C.rice:C.red,'current',false,-16);
  }
  let note=key==='preferences101'?'本例 u = min{x₁,x₂}，只比较甲自己':!f.budget.valid?'停止作预算判断':f.plot.unbounded.length?'绿色仅为预算在画框中的部分':`价格 (${f.prices.map(num).join('，')})；原禀赋值 ${num(f.budget.wealth)}`;
  s+=text(W/2,H-43,note,small?12:14,C.muted);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(exchangeModelContent[key].title)}">${s}</svg>`;
 }
 function draw(){
  const f=exchangeModelStory(key,step),c=exchangeModelContent[key],isResources=['goods101','trade101','allocation101'].includes(key),svg=isResources?resources(f):graph(f),phase=c.steps[step];
  $('filmStep').value=step;$('out-filmStep').value=step;
  let brief=$('exchange-model-brief');if(!brief){brief=document.createElement('section');brief.id='exchange-model-brief';brief.setAttribute('aria-label','问题、条件与当前讲解');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="exchange-model-question"></span></p><p class="reading"><strong>情境与条件：</strong><span id="exchange-model-condition"></span></p><p class="reading"'+($('lesson-film')?' hidden':'')+'><strong>现在看什么：</strong><span id="exchange-model-live"></span></p>';$('legend').before(brief);}
  $('exchange-model-condition').textContent=c.conditions;$('exchange-model-question').textContent=c.question;$('exchange-model-live').textContent=phase[1];
  Object.assign($('plot').dataset,{filmIntro:c.question,filmPhase:phase[0],filmNarration:phase[1],filmConclusion:c.steps[5][1]});window.microMotion.chart($('plot'),svg);
  const metrics=isResources?[['大米总量',f.resources.totals[0]],['豆子总量',f.resources.totals[1]],['本步是否完整配置',f.resources.allocation?'是':'否']]:key==='preferences101'?[['甲本步消费',f.point.map(num).join('，')],['本例评分',f.utility],['评价范围','甲自己的篮子']]:[['价格',f.prices.map(num).join('，')],['原禀赋价值',f.budget.valid?num(f.budget.wealth):'价格不合法'],[key==='optimal101'?'本例评分':'本步篮子是否可负担',key==='optimal101'?f.utility:f.point?(f.affordable?'是':'否'):'本段只看预算集合']];
  $('metrics').innerHTML=metrics.map(([l,v])=>'<div class="metric"><label>'+esc(l)+'</label><strong>'+esc(v)+'</strong></div>').join('');$('reading').textContent=phase[1];$('formula').textContent=c.formula;$('boundary').textContent=c.trap;
  $('legend').textContent=f.kind+(isResources?'。米豆色彩固定，原总量与本步指派总量逐种核对。':'。坐标尺度在本段保持不变；实心点为本步，空心点为对照。');
  $('extra').innerHTML='<h3>把条件与原理连起来</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>同类题怎么上手</h3><p>'+esc(c.template)+'</p><h3>最容易混淆的地方</h3><p>'+esc(c.trap)+'</p><p>来源：Osborne–Rubinstein §10.1，印刷137—139页／PDF156—158页。定义与一般论证以教材为依据，米豆、数值、偏好函数与中文解释为本站构造。要判断竞争均衡，还要同时检验个人最优与市场出清。</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||baseGuide[i]);const gb=document.querySelector('.study-guide>.boundary');if(gb)gb.textContent='本段对应§10.1正文，印刷137—139页；零价格、个人零禀赋与最优存在性须按所述条件处理。';
  const download=document.querySelector('.lesson-end a[download]');if(download){download.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch10-model-'+key+'.html';download.textContent='下载本段完整动画代码 ↓';}
  window.microMath?.refresh?.();
 }
 const advance=()=>{step=Math.min(5,step+1);draw();};
 $('experiment').onchange=e=>{if(exchangeModelKeys.includes(e.target.value)){history.replaceState(null,'',location.pathname+'?case='+e.target.value);configure(e.target.value);}else location.href=location.pathname+'?case='+encodeURIComponent(e.target.value);};
 $('fields').addEventListener('input',e=>{if(e.target.dataset.key==='filmStep'){step=Math.max(0,Math.min(5,Math.round(Number(e.target.value)||0)));draw();}});$('advance').onclick=advance;$('play').onclick=advance;$('reset').onclick=()=>configure(key);window.addEventListener('resize',draw);configure(key);
}
