import {evCameras,evRates,evModes,evLastPhase,evRows,evFrameCells,evDistribution,evExpected,evDominance,evMental} from './choice-evidence.mjs';
import {evContent} from './choice-evidence-content.mjs';
export function startChoiceEvidence(initial){
 const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),mode=evModes.includes(initial)?initial:'attention',content=evContent[mode],last=evLastPhase[mode];
 const raw=q.has('phase')?Number(q.get('phase')):q.get('step')==='1'?last:0;
 let phase=Number.isFinite(raw)?Math.max(0,Math.min(last,Math.round(raw))):0;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ink='#334b40',muted='#65796e',green='#177468',purple='#7a6594',gold='#a27619',red='#b75f46',pale='#edf2ec';
 document.body.classList.add('sequential-page','choice-evidence-page');
 $('fields').innerHTML=`<label for="ev-phase">讲解进度</label><input id="ev-phase" data-key="phase" type="range" min="0" max="${last}" step="1" value="${phase}">`;
 const table=(heads,rows)=>`<div class="sd-table-scroll" tabindex="0" role="region" aria-label="原始数字与计算核对"><table class="alpha-table"><thead><tr>${heads.map(h=>'<th>'+esc(h)+'</th>').join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')}</tbody></table></div>`;
 function scene(label,height){const W=innerWidth<650?280:640;let body='';return {W,H:height,small:W<400,add:s=>body+=s,text:(x,y,t,color=ink,size=16,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${esc(t)}</text>`,rect:(key,x,y,w,h,fill,extra='')=>`<rect data-motion="ev-${key}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" ${extra}/>`,finish:()=>`<svg viewBox="0 0 ${W} ${height}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`};}
 function strip(g,key,y,title,labels,rates,colors,show){g.add(g.text(12,y,title,ink,g.small?13:16));const span=g.W-24;let x=12;for(let i=0;i<rates.length;i++){const w=span*rates[i]/100;g.add(g.rect(key+'-'+i,x,y+12,show?w:0,25,colors[i]));if(show&&rates[i]>=10)g.add(g.text(x+w/2,y+30,labels[i]+' '+rates[i]+'%','#fff',g.small?12:14,'middle'));x+=w;}g.add(g.text(12,y+59,show?labels.map((a,i)=>a+' '+rates[i]+'%').join(' · '):'这一道题的结果稍后揭开',muted,g.small?12:14));}
 function camera(){const g=scene('A、B保持原位；加入C后比较属性与两道题的历史占比',580),cell=(g.W-24)/3;g.add(g.text(12,24,phase<2?'先看 A 和 B':'原来的 A、B 都没有变',ink,g.small?16:20));
  for(const [i,c]of evCameras.entries()){const show=i<2||phase>=2,x=12+i*cell,w=cell-8;g.add(g.rect('camera-'+c.id,x,52,w,140,show?pale:'#fff',`stroke="${show?'#d5dfd6':'#eee'}" opacity="${show?1:.4}"`));if(show){g.add(g.text(x+w/2,83,c.id,ink,24,'middle')+g.text(x+w/2,116,'评分 '+c.rating,ink,g.small?12:16,'middle')+g.text(x+w/2,146,c.megapixels+'00万',ink,g.small?14:18,'middle')+g.text(x+w/2,174,'像素',muted,12,'middle'));}else g.add(g.text(x+w/2,125,'稍后加入',muted,12,'middle'));}
  g.add(g.text(12,220,phase>=3?'B 两项胜 C；A、B 各有长处':'先按两项指标比较，不含价格',phase>=3?green:muted,g.small?13:17));
  if(phase>=3){const x=12+cell,w=cell-8;g.add(g.rect('dominance-focus',x-3,49,w+6,146,'none',`stroke="${gold}" stroke-width="2"`));}
  strip(g,'camera-AB',258,'题一 · 只提供 A、B',['A','B'],evRates.attention.AB,[purple,green],phase>=1);
  strip(g,'camera-ABC',348,'题二 · 提供 A、B、C',['A','B','C'],evRates.attention.ABC,[purple,green,gold],phase>=4);
  g.add(g.text(12,439,'每条色带各自为100%；不连线追踪个人',muted,g.small?12:15));
  if(phase>=5){g.add(g.text(12,480,'自主假想记录：',gold,15)+g.text(12,510,'三台选 B → 拿掉 C → 两台选 A',ink,g.small?13:18)+g.text(12,541,'原赢家 B 仍可选，却换了赢家',green,g.small?14:18));}
  return g.finish();
 }
 function lottery(){const g=scene('彩票概率与收益：拆分事件，保持各张彩票的最终收益分布',phase>=5?660:490),split=phase>=2,labels=split?['C','D']:['A','B'];
  g.add(g.text(12,25,split?'拆开事件，概率没有变':'原表：同时读概率与收益',ink,g.small?16:20));
  labels.forEach((label,row)=>{const original=row?'B':'A',cells=evFrameCells(label),y=68+row*145,left=42,span=g.W-left-8,cell=span/cells.length;
   g.add(g.text(12,y+53,label,row?green:purple,22));if(split)g.add(g.text(12,y+92,'='+original,muted,13));
   cells.forEach((r,i)=>{const x=left+i*cell,w=cell-4,color={白:'#f6f6ee',红:'#f3dfda',绿:'#dfece2',黄:'#f4edcf',黑:'#dfe4e7'}[r.color],better=split&&row===1&&phase>=3&&['black','green'].includes(r.id);g.add(g.rect('lottery-'+original+'-'+r.id,x,y,w,106,color,`stroke="${better?green:'#d5dcd5'}" stroke-width="${better?2:1}"`)+g.text(x+w/2,y+24,r.color,ink,g.small?12:16,'middle')+g.text(x+w/2,y+51,r.percent+'%',ink,g.small?12:17,'middle')+g.text(x+w/2,y+80,(r.payoff<0?'−'+Math.abs(r.payoff):r.payoff)+'',row?green:purple,g.small?13:18,'middle'));});
  });
  g.add(g.text(12,337,'收益：美元；格子等宽，不表示概率大小',muted,g.small?12:15));
  if(phase>=3){g.add(g.text(12,374,'相同概率下，D 比 C 多给：',ink,g.small?14:17));const cells=evDominance(),cell=(g.W-24)/5;cells.forEach((r,i)=>{const x=12+i*cell+cell/2;g.add(g.text(x,406,r.color,muted,13,'middle')+g.text(x,433,(r.gain>0?'+':'')+r.gain,r.gain?green:muted,17,'middle'));});}
  else g.add(g.text(12,385,phase===1?'逐项核对两份概率':'先看清每一种可能发生的结果',phase===1?red:muted,g.small?14:18));
  if(phase>=5){strip(g,'lottery-AB',490,'原表提问 · A、B',['A','B'],[51,49],[purple,green],true);strip(g,'lottery-CD',580,'拆分表提问 · C、D',['C','D'],[7,93],[purple,green],true);}
  return g.finish();
 }
 function mental(){const g=scene('丢票与丢现金：从共同起点算到相同的最终财富和演出状态',phase>=4?670:490),v=evMental(),cell=(g.W-28)/2;
  g.add(g.text(12,25,'同一票价，同一场演出',ink,g.small?16:20));
  for(let i=0;i<2;i++){const x=12+i*(cell+4),mid=x+cell/2;g.add(g.text(mid,59,i?'丢现金':'丢票',i?green:purple,19,'middle')+g.rect('ticket-object-'+i,x,82,cell-4,88,phase>=1?'#eee9e3':pale)+g.text(mid,113,phase>=1?(i?'现金丢了':'票丢了'):(i?'还没买票':'已经买票'),ink,g.small?14:19,'middle')+g.text(mid,145,phase>=1?'已少40美元':i?'钱还在':'已付40美元',muted,g.small?12:16,'middle'));}
  g.add(g.text(12,204,phase>=1?'到门口：两边都无票，仍够钱再买':'共同参照：出门前的钱',muted,g.small?13:16));
  if(phase>=2){g.add(g.rect('decision-buy',12,232,g.W-24,75,'#e0eee5')+g.text(26,259,'买：再付 '+v.additionalBuy,green,g.small?16:20)+g.text(26,288,'最终少 '+(-v.buy.wealthChange)+' 美元 · 看演出',ink,g.small?15:19)+g.rect('decision-skip',12,320,g.W-24,75,'#efebe3')+g.text(26,347,'不买：不再付钱',ink,g.small?16:20)+g.text(26,377,'最终少 '+(-v.skip.wealthChange)+' 美元 · 不看演出',ink,g.small?15:19));}
  if(phase>=3){g.add(g.text(12,429,'可能的心理分账 · 不是新票价',gold,g.small?13:16)+g.text(12,460,'丢票：这场算80；丢钱：票算40',ink,g.small?13:18));}
  if(phase>=4){strip(g,'mental-ticket',508,'丢票组 · 约1200人',['买','不买'],[65,35],[green,purple],true);strip(g,'mental-cash',596,'丢现金组 · 人数相近、不同参与者',['买','不买'],[79,21],[green,purple],true);}
  return g.finish();
 }
 function records(){if(mode==='attention')return table(['相机','平均评分','像素'],evCameras.map(c=>[c.id,c.rating,c.megapixels+'00万']))+table(['题目','A','B','C'],[['只提供A、B','48%','52%','未提供'],['提供A、B、C','30%','68%','2%']]);
  if(mode==='framing')return table(['彩票','颜色：概率 → 美元'],['A','B','C','D'].map(k=>[k,evRows(k).map(r=>r.color+' '+r.percent+'% → '+r.payoff).join('；')]))+table(['收益分布','按相同收益合并概率'],['A','B','C','D'].map(k=>[k,evDistribution(k).map(r=>r.payoff+'美元：'+r.percent+'%').join('；')]))+table(['比较列','共同概率','C','D','D比C多给'],evDominance().map(r=>[r.color,r.percent+'%',r.C,r.D,r.gain]));
  const v=evMental();return table(['情境','买票终点','不买终点','从现在起多付'],['丢票','丢现金'].map(s=>[s,'少'+(-v.buy.wealthChange)+'，看演出','少'+(-v.skip.wealthChange)+'，不看演出',v.additionalBuy]))+table(['历史群体','愿意买票','不买'],[['丢票，约1200人','65%','35%'],['丢现金，相近数量的不同参与者','79%','21%']]);
 }
 const proof=()=>'<details class="sd-proof" open><summary>做题怎么套：条件、推理与迁移练习</summary><ol>'+content.proofs.map(([h,t,f])=>'<li><h4>'+esc(h)+'</h4><p>'+esc(t)+'</p><div class="equation">'+esc(f)+'</div></li>').join('')+'</ol></details>';
 function draw(){const [heading,text]=content.phases[phase];$('ev-phase').value=phase;$('plot').dataset.phase=phase;Object.assign($('plot').dataset,{filmIntro:content.intro,filmPhase:heading,filmNarration:text,filmConclusion:content.end});window.microMotion.chart($('plot'),mode==='attention'?camera():mode==='framing'?lottery():mental());
  const metrics=mode==='attention'?[['A、B的参数','始终不变'],['B 对 C',phase>=3?'两指标都更高':'先观察属性'],['B 占比差',phase>=4?'16个百分点':'稍后揭开']]:mode==='framing'?[['分布不变','A=C，B=D'],['概率合计','每张都是100%'],['平均收益核算',phase>=4?'分别2.55与2.75美元':'稍后核对']]:[['票价','40美元'],['决定点已损失',phase>=1?'各40美元':'先区分起点'],['继续看演出多付',phase>=2?'各40美元':'稍后核对']];
  $('metrics').innerHTML=metrics.map(([label,value])=>'<div class="metric"><label>'+esc(label)+'</label><strong>'+esc(value)+'</strong></div>').join('');$('reading').textContent=text;
  $('formula').textContent=mode==='attention'?(phase>=5?String.raw`c(\{A,B,C\})=B,\quad c(\{A,B\})=A\ne B`:phase>=3?String.raw`8.3>8.1,\quad9>7`:String.raw`9.1>8.3,\quad6<9`):mode==='framing'?(phase>=4?String.raw`F_A=F_C,\quad F_B=F_D;\qquad\mathbb E[A]=${evExpected('A')},\quad\mathbb E[B]=${evExpected('B')}`:phase>=3?String.raw`D(s)\ge C(s)\text{ 对每个 }s`:phase>=2?String.raw`F_A=F_C,\quad F_B=F_D`:String.raw`0.90+0.06+0.01+0.03=1;\qquad0.90+0.07+0.01+0.02=1`):(phase>=2?String.raw`X=\{(W-80,\text{看}),(W-40,\text{不看})\};\qquad\Delta\text{支出}=40`:phase>=1?String.raw`W_{\text{门口}}=W-40`:String.raw`p=40`);
  $('legend').textContent=mode==='attention'?'相机身份与位置固定；色带每条各为100%。群体结果与自主假想的个人记录分开。':mode==='framing'?'相同收益事件可拆分和重命名；矩形等宽用于排版，概率以文字为准。下方保留原表与精确合并核算。':'两条故事使用同一个出门前财富参照；最终选项合在同一处，避免误把不同心理账目当成不同票价。';
  $('boundary').textContent='Osborne–Rubinstein §2.6，印刷24—27页（原PDF43—46页）。历史在线实验面向全球具有相近学业背景的学生；人数和比例沿用原书约数，本页未重新调查。原书记录、可能解释、自主假想与迁移练习分别标注。';
  $('extra').innerHTML='<p>这一节的三种检验要分开：相机例关注菜单变化与α；彩票和丢票例关注同一选项集合是否因描述不同而改变选择。此处按教材定义检查：能否用同一份偏好排序解释不同菜单下的选择。</p><details open><summary>原书数字与逐项核算</summary>'+records()+'</details>'+proof();
  $('advance').disabled=phase>=last;$('play').disabled=phase>=last;$('plot').tabIndex=-1;$('plot').setAttribute('role','region');$('plot').setAttribute('aria-label',content.title);window.microMath?.refresh();
  const u=new URL(location.href);u.searchParams.set('case',mode);u.searchParams.set('phase',phase);history.replaceState(null,'',u);
  const download=document.querySelector('.lesson-end a[download]');if(download){download.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch2-evidence-'+mode+'.html';download.textContent='下载本段独立代码 ↓';download.title='内含本段完整讲解、公式、模型和字体';}
 }
 function advance(){if(phase<last){phase++;draw()}return phase>=last;}
 $('advance').onclick=advance;$('reset').onclick=()=>{phase=0;draw()};$('play').onclick=advance;
 $('ev-phase').addEventListener('input',e=>{phase=Math.max(0,Math.min(last,Math.round(+e.target.value)));draw()});
 window.addEventListener('resize',draw);draw();
}
