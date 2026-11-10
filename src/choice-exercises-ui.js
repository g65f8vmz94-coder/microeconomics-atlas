import {cxIds,cxNames,cxResolve,cxScene,cxThresholdRank,cxSatisficingRank} from './choice-exercises.mjs';
import {cxContent} from './choice-exercises-content.mjs';
export function startChoiceExercises(initial){
 const $=id=>document.getElementById(id),q=new URLSearchParams(location.search),id=cxResolve(initial,q.get('variant')||'a')||'p1a',c=cxContent[id],last=c.phases.length-1;
 let phase=Math.max(0,Math.min(last,Math.floor(Number(q.get('phase')??q.get('step')??0)||0)));
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const C={ink:'#334b40',muted:'#65796e',green:'#177468',gold:'#a27619',red:'#b75f46',pale:'#edf2ec',purple:'#7a6594'};
 document.body.classList.add('sequential-page','choice-exercises-page');
 document.querySelector('.lesson-top h1').textContent='第2章习题 · 选择';
 document.querySelector('.lesson-top header p').textContent='原书第2章章末题 · 印刷27—29页';
 document.querySelector('.focus-question').textContent=c.title;
 document.title=c.title+' · 中微动态图谱';
 $('fields').innerHTML=`<label for="cx-phase">讲解进度</label><input id="cx-phase" data-key="phase" type="range" min="0" max="${last}" step="1" value="${phase}">`;
 const table=rows=>'<div class="sd-table-scroll" tabindex="0" role="region" aria-label="题目数据与证明核对"><table class="alpha-table">'+rows.map((r,i)=>'<tr>'+r.map(x=>`<${i?'td':'th'}>${esc(x)}</${i?'td':'th'}>`).join('')+'</tr>').join('')+'</table></div>';
 function graphic(s){const small=innerWidth<650,W=small?280:640,H=['p2','p7'].includes(id)?450:small&&s.labels.length>3?440:370;let b='';
  const t=(x,y,txt,color=C.ink,size=16,anchor='start',key='')=>`<text ${key?`data-motion="cx-${key}"`:''} x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${esc(txt)}</text>`;
  const r=(key,x,y,w,h,fill,stroke='#d8e1d7',opacity=1)=>`<rect data-motion="cx-${key}" x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" opacity="${opacity}"/>`;
  // Keep readable short titles; the full sentence stays in the caption above.
  b+=t(12,26,cxNames[id].split(' · ')[1],C.ink,small?16:21);
  if(id==='p2'){
   const span=W-24,dx=span/4;b+=r('setA',12,85,dx*3,115,phase===0?'#d7e8e0':'#edf2ec',C.green)+r('setB',12+dx,145,dx*3,115,phase===1?'#e5dfef':'#f0edf3',C.purple,.8);
   // The same gold frame follows the two possible winners, then widens to
   // their shared set. Its motion explains why both alpha arguments meet.
   const left=12+dx*(phase===1?2:1),both=phase>=2;
   b+=r('focus',left+dx*.23,158,both?dx*1.54:dx*.54,43,'none',C.gold,.95);
   b+=t(21,109,'A',C.green,20)+t(W-28,244,'B',C.purple,20);
   ['a','x','y','b'].forEach((n,i)=>b+=t(12+dx*(i+.5),i===0?151:i===3?222:182,n,C.ink,24,'middle'));
   b+=t(W/2,307,phase>=2?'共同部分：x、y都在里面':'两个名字可以指同一个人，也可以指两个人；按题设说明的身份分组',C.muted,small?13:17,'middle');
   const lines=phase>=4?['c(A) = c(A∩B) = c(B)','所以 x = y']:phase>=3?['从B缩到交集，也必须选y','同一个选择不能有两个赢家']:phase>=2?['从A缩到交集，必须选x']:['A选x，B选y','两个原赢家都在另一份名单中'];
   lines.forEach((l,i)=>b+=t(W/2,358+i*36,l,C.green,small?14:20,'middle','p2-line-'+i));
  }else if(id==='p7'){
   const pts=[[W/2,93],[48,250],[W-48,250]],cycle=phase>=2&&phase<=3;
   const edges=phase===0?[[0,1]]:phase===1?[[0,1],[1,2]]:[[0,1],[1,2],cycle?[2,0]:[0,2]];
   b+='<defs><marker id="cx-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="'+(cycle?C.red:C.green)+'"/></marker></defs>';
   for(const [a,z]of edges){const [x,y]=pts[a],[X,Y]=pts[z],L=Math.hypot(X-x,Y-y),ux=(X-x)/L,uy=(Y-y)/L;b+=`<path d="M${x+ux*28} ${y+uy*28}L${X-ux*34} ${Y-uy*34}" fill="none" stroke="${cycle?C.red:C.green}" stroke-width="2" marker-end="url(#cx-arrow)"/>`;}
   pts.forEach(([x,y],i)=>b+=`<circle data-motion="cx-node-${i}" cx="${x}" cy="${y}" r="25" fill="${C.pale}" stroke="#d8e1d7"/>`+t(x,y+7,['x','y','z'][i],C.ink,23,'middle'));
   b+=t(W/2,311,cycle?'反面假设：两两选择成圈':'箭头从二选一赢家指向另一项',cycle?C.red:C.muted,small?13:17,'middle');
   const lines=phase===3?['三项选x：与{x,z}冲突','三项选y：与{x,y}冲突','三项选z：与{y,z}冲突']:phase>=4?['两两关系必须传递','任意菜单赢家，缩到二项仍赢']:['画面只有三个符号','证明对任意x、y、z成立'];
   lines.forEach((l,i)=>b+=t(W/2,356+i*31,l,cycle?C.red:C.green,small?14:19,'middle'));
  }else{
   const n=s.labels.length,cols=small?Math.min(3,n):n,rows=Math.ceil(n/cols),gap=8,cell=(W-24)/cols,ch=rows>1?95:132,coords=[];
   for(let i=0;i<n;i++){const x=12+(i%cols)*cell,y=78+Math.floor(i/cols)*(ch+18),active=!!(s.mask&(1<<i)),selected=s.focus===i;coords.push([x+(cell-gap)/2,y]);
    b+=r('option-'+i,x,y,cell-gap,ch,active?selected?'#dceee5':C.pale:'#f6f4ef',selected?C.green:'#d8e1d7',active?1:.4)+t(x+(cell-gap)/2,y+31,s.labels[i],active?C.ink:C.muted,21,'middle');
    let sub='',sub2='';if(s.data.values){sub='分数 '+s.data.values[i];}else if(s.data.u){sub='u '+s.data.u[i];sub2='v '+s.data.v[i];}else if(s.data.bits){sub='标准1：'+s.data.bits[i][0];sub2='标准2：'+s.data.bits[i][1];}else if(s.data.colors){sub=s.data.colors[i];}else if(s.kind==='wins'){sub='胜 '+s.rows[1][i+1]+' 场';}
    if(id==='p8'){sub=i===5?'没有货物':'真实货物';sub2=i===5&&phase>=2?'只在错账上':'';}
    b+=t(x+(cell-gap)/2,y+61,sub,active?C.ink:C.muted,small?12:16,'middle');if(sub2)b+=t(x+(cell-gap)/2,y+84,sub2,C.muted,small?12:15,'middle');
   }
   const track=s.scan??s.focus;if(track!==null&&coords[track]){const [x,y]=coords[track];b+=`<circle data-motion="cx-scan" cx="${x}" cy="${y-15}" r="6" fill="${C.gold}"/>`;}
   const y=78+rows*(ch+18)+25;
   b+=t(12,y,id==='p8'?'实际收到：'+(phase===0?'2':'5')+'件':s.mask===0?'候选为空：程序没有选择结果':'当前菜单：{'+s.labels.filter((_,i)=>s.mask&(1<<i)).join(', ')+'}',s.mask===0?C.red:C.ink,small?14:20);
   b+=t(12,y+37,s.focus===null?(s.mask===0?'条件不足，无法保证总有结果':id==='p8'&&phase>=2?'实应付10元；误付12元':'先观察程序，还没宣布赢家'):'本次最终选择：'+s.labels[s.focus],C.green,small?15:21);
   if(id==='p1d'&&phase>=2)b+=t(12,y+77,'固定排序：'+cxThresholdRank(s.data).map(i=>s.labels[i]).join(' ≻ '),C.green,small?14:19);
   else if(/^p[34]/.test(id)&&phase>=5)b+=t(12,y+77,'固定排序：'+cxSatisficingRank(s.data,id.startsWith('p4')).map(i=>s.labels[i]).join(' ≻ '),C.green,small?14:19);
   else if(['p1a','p1b','p1e','p6'].includes(id)&&phase>=3)b+=t(12,y+77,'原赢家仍可选，最后却换了人',C.red,small?13:18);
   else if(id==='p1c'&&phase>=2)b+=t(12,y+77,'这里采用明确补全后的规则',C.gold,small?13:18);
   else if(id.startsWith('p5'))b+=t(12,y+77,id==='p5b'?'图示用c作赢家；证明用任意x':'同一张排序贯穿初选和决赛',C.muted,small?13:18);
  }
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.title+'：'+s.title)}" xmlns="http://www.w3.org/2000/svg">${b}</svg>`;
 }
 function draw(){const s=cxScene(id,phase),step=c.phases[phase];$('cx-phase').value=phase;$('plot').dataset.phase=phase;$('plot').dataset.exercise=id;
  Object.assign($('plot').dataset,{filmIntro:c.intro,filmPhase:step.heading,filmNarration:step.text,filmConclusion:c.end});window.microMotion.chart($('plot'),graphic(s));
  $('legend').textContent='金点追踪当前考察对象；浅色保留已离场对象的位置；绿色标出最终选择。';
  $('metrics').innerHTML=[['原题','第2章 · '+id.replace(/^p/,'').replace('qualified',' 有达标').replace('none',' 无达标')],['当前步骤',(phase+1)+' / '+c.phases.length],['讲解方式','跟随图像，逐步推理']].map(([l,v])=>'<div class="metric"><label>'+esc(l)+'</label><strong>'+esc(v)+'</strong></div>').join('');
  $('reading').textContent=step.text;const previous=c.phases.slice(0,phase+1).filter(x=>x.formula).at(-1);$('formula').textContent=step.formula||previous?.formula||(id==='p8'?'2+3=5':String.raw`c(A)\in A`);
  $('boundary').textContent='原题：Osborne–Rubinstein，第2章习题1—8，印刷27—29页／PDF46—48页。分数、菜单与交易数值为自主构造；原题条件、补充的破同分规则和措辞问题分别说明。';
  $('extra').innerHTML='<p>'+esc(s.note)+'</p>'+table(s.rows)+'<details class="sd-proof" open><summary>可套用的证明：先写条件，再分情况</summary><ol>'+c.proofs.map(p=>'<li><h4>'+esc(p.heading)+'</h4><p>'+esc(p.text)+'</p>'+(p.formula?'<div class="equation">'+esc(p.formula)+'</div>':'')+'</li>').join('')+'</ol></details>';
  $('advance').disabled=phase>=last;$('play').disabled=phase>=last;$('plot').tabIndex=-1;$('plot').setAttribute('role','region');$('plot').setAttribute('aria-label',c.title);window.microMath?.refresh();
  const u=new URL(location.href);u.searchParams.set('case',id);u.searchParams.set('phase',phase);try{history.replaceState(null,'',u)}catch{}
  const a=document.querySelector('.lesson-end a[download]');if(a){a.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+'downloads/ch2-exercise-'+id+'.html';a.textContent='下载本题完整讲解代码 ↓';}
 }
 function next(){if(phase<last){phase++;draw()}return phase>=last;}
 $('advance').onclick=next;$('play').onclick=next;$('reset').onclick=()=>{phase=0;draw()};$('cx-phase').addEventListener('input',e=>{phase=Math.max(0,Math.min(last,Math.round(+e.target.value)));draw()});window.addEventListener('resize',draw);draw();
}
