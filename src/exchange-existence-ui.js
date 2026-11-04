import {existenceKeys,existenceStory,existenceCurve} from './exchange-existence-story.mjs';
import {existenceContent} from './exchange-existence-content.mjs';

export function startExistenceStory(requested){
 const $=id=>document.getElementById(id),C={ink:'#2c433a',muted:'#6b7c70',rice:'#177468',bean:'#ab8124',purple:'#786796',red:'#bf634e',rule:'#d9e2d7',paper:'#fffdf7'};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=x=>String(+Number(x).toFixed(3)),sign=x=>(x>1e-9?'正':x<-1e-9?'负':'')+num(Math.abs(x)),trade=x=>x>1e-9?'买入'+num(x):x<-1e-9?'卖出'+num(-x):'不买不卖';
 const txt=(x,y,s,size=12,color=C.ink,anchor='start')=>`<text x="${x}" y="${y}" font-family="system-ui,sans-serif" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
 let key=existenceKeys.includes(requested)?requested:existenceKeys[0],step=0;
 $('fields').insertAdjacentHTML('beforebegin','<div class="field"><label for="experiment">本节连贯讲解</label><select id="experiment">'+existenceKeys.map(k=>'<option value="'+k+'">'+esc(existenceContent[k].title)+'</option>').join('')+['multiple','nonconvex','complements','cd'].map(k=>'<option value="'+k+'">保留原例：'+esc({multiple:'三零点',nonconvex:'非凸偏好',complements:'互补品',cd:'CD交换'}[k])+'</option>').join('')+'</select></div>');
 function configure(k){key=k;window.EXISTENCE_DEFAULT=key;const q=new URLSearchParams(location.search),n=Number(q.get('filmStep'));step=(q.get('case')===key||!q.has('case'))&&Number.isFinite(n)?Math.max(0,Math.min(5,Math.round(n))):0;$('experiment').value=key;$('fields').innerHTML='<div class="field"><label for="filmStep">讲解进度 <output id="out-filmStep"></output></label><input id="filmStep" data-key="filmStep" type="range" min="0" max="5" step="1"></div>';$('plot').closest('.stage').classList.add('jungle-intro');draw();}
 function ledger(f,small){
  const W=small?320:760,H=small?775:510,pw=small?300:350,marketY=small?68:326,cardY=small?277:60,max=f.kind==='cd'?32:f.kind==='min'?16:12,unitName='千克';let s='';
  s+=txt(W/2,23,`每千克价格：米${num(f.prices[0])}元，豆${num(f.prices[1])}元`,small?12:15,C.ink,'middle');
  s+=txt(W/2,45,f.kind==='cd'?'两人的评分：米 × 豆':f.kind==='min'?'两人的评分：米豆能配成几份':'两人的评分：米的平方 + 豆的平方',small?12:14,C.muted,'middle');
  for(let i=0;i<2;i++){
   const ox=small?10:i?395:15,oy=cardY+(small?i*244:0),person=i?'乙':'甲',e=f.endowments[i],a=f.assignment?.[i],b=f.check.people[i],left=ox+50,right=ox+pw-16,scale=(right-left)/max;
   s+=`<rect x="${ox}" y="${oy}" width="${pw}" height="230" rx="12" fill="#f5f7f0" stroke="${C.rule}"/>`;
   s+=txt(ox+14,oy+24,`${person}：原有米${num(e[0])}、豆${num(e[1])}`,15)+txt(ox+14,oy+46,`家底值${num(b.wealth)}元；${a?'本步花'+num(b.cost)+'元':'免费方向没有最高评分'}`,12,C.muted);
   for(let k=0;k<2;k++){
    const y=oy+66+k*58,col=k?C.bean:C.rice;s+=txt(ox+14,y+15,k?'豆':'米',13,col);
    s+=`<rect x="${left}" y="${y}" width="${e[k]*scale}" height="18" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
    if(a)s+=`<rect data-motion="exist-${key}-${step}-${i}-${k}" x="${left}" y="${y+5}" width="${a[k]*scale}" height="8" fill="${b.optimal?col:C.red}"/>`;
    s+=txt(left,y+37,a?`本步${num(a[k])}；${trade(f.net[i][k])}`:'不存在最优篮子',12,a?C.ink:C.red);
   }
   const axis=oy+187;s+=`<path d="M${left} ${axis}H${right}" stroke="${C.rule}"/>`;
   for(const v of [0,max/2,max])s+=txt(left+v*scale,axis+16,num(v),11,C.muted,'middle');
   s+=txt(ox+14,oy+222,a?`评分${num(b.utility)}；${b.optimal?'预算内最优':'还可以选得更好'}`:'预算无上界，不能指定一个最优点',12,b.optimal?C.rice:C.red);
  }
  s+=txt(15,marketY,'先合起来，核对全村够不够分',small?14:16);
  const bx=small?74:145,bw=W-bx-25,scale=bw/max;
  for(let k=0;k<2;k++){
   const y=marketY+20+k*58,d=f.check.totals?.[k],e=f.check.supply[k],col=k?C.bean:C.rice;
   s+=txt(15,y+15,k?'全村豆':'全村米',12,col)+`<rect x="${bx}" y="${y}" width="${e*scale}" height="20" fill="none" stroke="${C.muted}" stroke-dasharray="3 2"/>`;
   if(d!==undefined)s+=`<rect data-motion="exist-${key}-${step}-total-${k}" x="${bx}" y="${y+6}" width="${d*scale}" height="8" fill="${f.check.clearing[k]?col:C.red}"/>`;
   s+=txt(bx,y+40,`原有${num(e)}；${d===undefined?'最优不存在':`本步${num(d)}；差${sign(f.check.excess[k])}`}`,12,C.muted);
  }
  s+=txt(W/2,marketY+161,f.check.equilibrium?'个人最优、资源守恒：均衡':f.check.allocation?'资源守恒，但个人还可选得更好':f.check.valid?'这是需求计划，尚未成交':'没有最优篮子，不能组成均衡',small?12:15,f.check.equilibrium?C.rice:C.red,'middle');
  s+=txt(W/2,H-8,`各图固定范围：0—${max}${unitName}；买卖数量另有标注`,small?11:12,C.muted,'middle');
  return {W,H,s};
 }
 function curve(f,small){
  const W=small?320:760,H=440,left=small?48:72,right=W-24,top=76,bottom=340,X=p=>left+(p-f.xRange[0])/(f.xRange[1]-f.xRange[0])*(right-left),Y=z=>bottom-(z-f.yRange[0])/(f.yRange[1]-f.yRange[0])*(bottom-top),colors={A:C.rice,B:C.purple,sum:C.bean,multiple:C.rice,jump:C.red};let s='';
  s+=txt(W/2,23,f.kind==='shape'?'自主函数示意 · 不是完整经济模型':f.kind==='jump'?'跳跃函数反例 · 已切换数学对象':'真实米豆经济 · 净需求由最优消费算出',small?12:15,C.ink,'middle');
  s+=txt(W/2,46,`当前价格${num(f.price)}；${f.kind==='shape'||f.kind==='jump'?'函数值':'净需求'}${sign(f.value)}`,small?13:16,colors[f.curve],'middle');
  if(f.interval)s+=`<rect x="${X(f.interval.low)}" y="${top}" width="${X(f.interval.high)-X(f.interval.low)}" height="${bottom-top}" fill="#ebefdf"/>`;
  const yt=f.kind==='shape'?[-.15,0,.15]:[-4,0,10,20];
  for(const v of yt)s+=`<line x1="${left}" y1="${Y(v)}" x2="${right}" y2="${Y(v)}" stroke="${v===0?C.ink:C.rule}"/>`+txt(left-7,Y(v)+4,num(v),11,C.muted,'end');
  const xt=f.kind==='shape'?[.5,1,2,3,3.5]:[.2,1,2,3,4,5];
  for(const v of xt)s+=`<path d="M${X(v)} ${bottom}v5" stroke="${C.muted}"/>`+txt(X(v),bottom+21,num(v),11,C.muted,'middle');
  s+=`<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="${C.ink}"/>`+txt(left,top-12,f.kind==='shape'||f.kind==='jump'?'函数值':'米净需求（千克）',12,C.muted)+txt(right,bottom+43,'米价（豆价固定1）',12,C.muted,'end');
  for(const k of f.curves){
   let path='';if(k==='jump'){path=`M${X(.2)} ${Y(6)}H${X(1)}M${X(1)} ${Y(-4)}H${X(5)}`;}
   else for(let j=0;j<=300;j++){const p=f.xRange[0]+j/300*(f.xRange[1]-f.xRange[0]);path+=(j?'L':'M')+X(p)+' '+Y(existenceCurve(k,p));}
   s+=`<path data-motion="exist-${key}-curve-${k}" d="${path}" stroke="${colors[k]}" stroke-width="${k==='sum'?3.5:2.4}" fill="none"/>`;
  }
  if(f.kind==='jump')s+=`<circle cx="${X(1)}" cy="${Y(6)}" r="5" fill="${C.red}"/><circle cx="${X(1)}" cy="${Y(-4)}" r="5" fill="${C.paper}" stroke="${C.red}" stroke-width="2"/>`;
  for(const m of f.marks){s+=`<circle cx="${X(m.p)}" cy="${Y(m.value)}" r="5" fill="${C.red}"/>`;}
  // Mathematical sample points fade into place; do not interpolate a chord
  // between them, which would leave the true demand curve during the motion.
  s+=`<circle data-motion="exist-${key}-sample-${step}" cx="${X(f.price)}" cy="${Y(f.value)}" r="7" fill="${colors[f.curve]}" stroke="${C.paper}" stroke-width="2"/>`;
  const note=f.interval?`异号两端保留在[${num(f.interval.low)}, ${num(f.interval.high)}]`:f.kind==='jump'?'实心点取6；空心点不取负4':f.kind==='shape'?'红点标零点；不宣称市场自动走到红点':'绿色甲，紫色乙，金色加总；同价格加高度';
  s+=txt(W/2,410,note,small?11:13,C.muted,'middle');return {W,H,s};
 }
 function draw(){
  const f=existenceStory(key,step),c=existenceContent[key],phase=c.steps[step];$('filmStep').value=step;$('out-filmStep').value=step;
  let brief=$('existence-brief');if(!brief){brief=document.createElement('section');brief.id='existence-brief';brief.setAttribute('aria-label','问题与题目条件');brief.innerHTML='<p class="reading"><strong>这张图要回答：</strong><span id="existence-question"></span></p><p class="reading"><strong>情境与条件：</strong><span id="existence-condition"></span></p><p class="boundary" id="existence-scope"></p>';$('legend').before(brief);}
  $('existence-question').textContent=c.question;$('existence-condition').textContent=c.conditions;$('existence-scope').textContent=f.scope;
  Object.assign($('plot').dataset,{filmIntro:c.question,filmPhase:phase[0],filmNarration:phase[1],filmConclusion:c.steps[5][1]});
  const {W,H,s}=f.view==='ledger'?ledger(f,$('plot').clientWidth<500):curve(f,$('plot').clientWidth<500);
  window.microMotion.chart($('plot'),`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title+'：'+phase[0])}"><rect width="${W}" height="${H}" fill="${C.paper}"/>${s}</svg>`);
  const metrics=f.view==='ledger'?[['各人在预算内最优',f.check.individualOptimal?'都是':'未全部满足'],['总资源完整分配',f.check.allocation?'是':'否'],['当前是否均衡',f.check.equilibrium?'是':'否']]:[['米价',num(f.price)],[f.kind==='shape'||f.kind==='jump'?'示意函数值':'本步净需求',sign(f.value)],['这幅图的身份',f.kind==='shape'||f.kind==='jump'?'数学示意':'真实需求']];
  $('metrics').innerHTML=metrics.map(([a,b])=>'<div class="metric"><label>'+esc(a)+'</label><strong>'+esc(b)+'</strong></div>').join('');$('reading').textContent=phase[1];$('formula').textContent=c.formula;$('boundary').textContent=c.trap;
  $('legend').textContent=f.view==='ledger'?'空框是原有数量，色条是本步篮子。两户个人图可直接比较长度；全村总账用单独画布，请对照标注数量和空框。各图范围固定，清单还不代表已经成交。':'零线上方＝净想买；下方＝净想卖。价格是横坐标，净需求是纵坐标。点标当前候选，不模拟价格自动收敛；跳跃反例和自主函数另有明确标注。';
  $('extra').innerHTML='<h3>把条件与原理连起来</h3><ol>'+c.proof.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><h3>同类题怎么上手</h3><p>'+esc(c.template)+'</p><h3>最容易混淆的地方</h3><p>'+esc(c.trap)+'</p><p>来源：Osborne–Rubinstein '+esc(c.source)+' 中文解释与图形为本站编写，数值例子不代替一般证明。</p>';
  document.querySelectorAll('.study-guide .guide-panel').forEach((el,i)=>el.textContent=[c.question,c.conditions,c.template][i]||'');const gb=document.querySelector('.study-guide>.boundary');if(gb)gb.textContent='本段对应§10.3正文与条件边界；章末习题的全部题项另行审核。';
  const d=document.querySelector('.lesson-end a[download]');if(d){d.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch10-existence-'+key+'.html';d.textContent='下载本段完整动画代码 ↓';}window.microMath?.refresh?.();
 }
 const advance=()=>{step=Math.min(5,step+1);draw()};
 $('experiment').onchange=e=>{if(existenceKeys.includes(e.target.value)){history.replaceState(null,'',location.pathname+'?case='+e.target.value);configure(e.target.value)}else location.href=location.pathname+'?case='+encodeURIComponent(e.target.value)};
 $('fields').addEventListener('input',e=>{if(e.target.dataset.key==='filmStep'){step=Math.max(0,Math.min(5,Math.round(Number(e.target.value)||0)));draw()}});$('advance').onclick=advance;$('play').onclick=advance;$('reset').onclick=()=>configure(key);window.addEventListener('resize',draw);configure(key);
}
