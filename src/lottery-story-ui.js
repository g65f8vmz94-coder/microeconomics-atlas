import {lotteryStories,lotteryFrame,probabilityPoint,frameSupport} from './lottery-story.mjs';

const l31El=id=>document.getElementById(id);
const L31C={ink:'#334b40',muted:'#65796e',green:'#177468',purple:'#7a6594',gold:'#a27619',red:'#b75f46',pale:'#edf2ec',line:'#cbd7cf'};
const l31Esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const num=x=>x===.001||x===.999?x.toFixed(3):Number(x.toFixed(2)).toString();
const text=(x,y,value,size=15,fill=L31C.ink,anchor='start',key='')=>`<text ${key?`data-motion="l31-${key}"`:''} x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-family="system-ui,sans-serif">${l31Esc(value)}</text>`;
const line=(x1,y1,x2,y2,stroke=L31C.line,width=1,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(key,x,y,fill=L31C.green,r=8,opacity=1)=>`<circle data-motion="l31-${key}" cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="white" stroke-width="3" opacity="${opacity}"/>`;

function distribution(frame,small){
 const W=small?320:700,H=small?315:355,left=small?24:60,right=W-left,scale=right-left,rows=[122,222];let svg='';
 svg+=text(left,37,frame.invalid?'这组数字不能成为彩票':'同一张彩票，把机会分给不同结果',small?14:18,frame.invalid?L31C.red:L31C.ink);
 for(const [i,p] of frame.p.entries()){
  const y=rows[i],color=frame.invalid?L31C.red:i?L31C.purple:L31C.green;
  svg+=text(left,y-22,frame.labels[i],small?15:18,L31C.ink)+text(right,y-22,num(p),small?15:18,color,'end');
  svg+=`<rect x="${left}" y="${y}" width="${scale}" height="18" rx="9" fill="${L31C.pale}"/>`;
  svg+=`<rect data-motion="l31-prob-${i}" x="${left}" y="${y}" width="${scale*p}" height="18" rx="9" fill="${color}"/>`;
  if(p>0&&p<.005)svg+=line(left+scale*p,y-8,left+scale*p,y+27,L31C.gold,2);
 }
 svg+=line(left,276,right,276,L31C.line,1)+text(left,299,'0',small?12:14,L31C.muted)+text(right,299,'1',small?12:14,L31C.muted,'end');
 svg+=text(W/2,299,frame.invalid?'总和 1.2 · 不合法':`总和 ${num(frame.p.reduce((a,b)=>a+b,0))} · 合法`,small?13:16,frame.invalid?L31C.red:L31C.green,'middle','sum');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${l31Esc(frame.title)}：${frame.labels.map((s,i)=>s+'的概率'+num(frame.p[i])).join('，')}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

function simplex(frame,small){
 const W=small?320:700,H=small?610:395;
 const lx=small?62:75,ly=small?70:82,side=small?184:220,lower=ly+side;
 const pair=probabilityPoint(frame.pair,[[lx+side,lower],[lx,ly]]);
 const top=small?[W/2,380]:[530,65],left=small?[34,545]:[395,302],right=small?[W-34,545]:[665,302],vertices=[top,left,right];
 const tri=probabilityPoint(frame.tri,vertices),pairActive=frame.focus==='pair';let svg='';
 svg+=text(small?W/2:lx+side/2,32,'两奖品：概率线段',small?16:17,L31C.ink,'middle');
 svg+=line(lx,ly,lx,lower,L31C.muted)+line(lx,lower,lx+side,lower,L31C.muted);
 svg+=line(lx,ly,lx+side,lower,L31C.purple,3);
 svg+=text(lx-10,ly+5,'1',13,L31C.muted,'end')+text(lx+side,lower+22,'1',13,L31C.muted,'middle');
 svg+=text(lx+side+8,lower+4,'p₁',15,L31C.ink)+text(lx-16,ly-8,'p₂',15,L31C.ink);
 svg+=line(pair[0],pair[1],pair[0],lower,L31C.gold,1,'4 4')+line(lx,pair[1],pair[0],pair[1],L31C.gold,1,'4 4');
 svg+=dot('pair',pair[0],pair[1],pairActive?L31C.green:L31C.purple,8,pairActive?1:.46);
 svg+=text(small?W/2:lx+side/2,small?304:352,`(p₁,p₂) = (${num(frame.pair[0])}, ${num(frame.pair[1])})`,small?13:15,pairActive?L31C.green:L31C.muted,'middle','pair-vector');
 svg+=text(small?W/2:530,small?330:32,'三奖品：概率三角形',small?16:17,L31C.ink,'middle');
 svg+=`<path d="M${top[0]} ${top[1]}L${left[0]} ${left[1]}L${right[0]} ${right[1]}Z" fill="${L31C.pale}" stroke="${L31C.purple}" stroke-width="2"/>`;
 svg+=text(top[0],top[1]-14,'z₁ · p₁=1',small?12:14,L31C.ink,'middle');
 svg+=text(left[0],left[1]+21,'z₂ · p₂=1',small?12:14,L31C.ink,'start');
 svg+=text(right[0],right[1]+21,'z₃ · p₃=1',small?12:14,L31C.ink,'end');
 svg+=dot('tri',tri[0],tri[1],pairActive?L31C.purple:L31C.green,9,pairActive?.46:1);
 svg+=text(small?W/2:530,small?596:351,`(p₁,p₂,p₃) = (${frame.tri.map(num).join(', ')})`,small?12:15,pairActive?L31C.muted:L31C.green,'middle','tri-vector');
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="两奖品概率线段和三奖品概率三角形；当前${l31Esc(frame.focus==='pair'?'线段':'三角形')}点${l31Esc(frame.focus==='pair'?frame.pair.join('，'):frame.tri.join('，'))}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

const proofs=String.raw`<details class="sd-proof" open><summary>可套用：四步检查一张彩票</summary><ol>
 <li><h4>列奖品</h4><p>先写结果集合 Z；奖品可以是物品、天气或其他结果，不要求都是金额。</p></li>
 <li><h4>查概率</h4><p>每项至少为 0，总和恰好为 1。缺一项时用 1 减去已知项，再检查结果没有小于 0。</p><div class="equation">p(z)\ge0,\quad\sum_{z\in Z}p(z)=1</div></li>
 <li><h4>写支撑集</h4><p>只收严格正概率的奖品；非常小的正数也要收，恰好为 0 的不要收。</p><div class="equation">\operatorname{supp}(p)=\{z\in Z:p(z)>0\}</div></li>
 <li><h4>落到图上</h4><p>两奖品用 (p₁,p₂) 在线段上找点；三奖品用 (p₁,p₂,p₃) 在三角形上找点。角是确定彩票，边有一种奖品概率为 0，内部三种都可能发生。</p></li>
 </ol></details>`;

export function renderLotteryStory(mode,phase){
 const story=lotteryStories[mode],frame=lotteryFrame(mode,phase),small=l31El('plot').clientWidth<500;
 Object.assign(l31El('plot').dataset,{filmIntro:story.intro,filmPhase:frame.title,filmNarration:frame.narration,filmConclusion:story.end,phase:String(phase)});
 window.microMotion.chart(l31El('plot'),mode==='lottery'?distribution(frame,small):simplex(frame,small));
 l31El('legend').textContent=mode==='lottery'?'柱长按真实概率绘制；极小概率另用金线定位，不放大其份额。':'线段的横轴是 p₁、纵轴是 p₂；右侧平铺三角形按 p₁、p₂、p₃ 定位，三角顶点是确定彩票。';
 const metrics=mode==='lottery'?[['当前画面',`${phase+1} / ${story.frames.length}`],['概率总和',num(frame.p.reduce((a,b)=>a+b,0))],['支撑集',frame.invalid?'不适用：候选无效':frameSupport(frame).map(i=>frame.labels[i]).join('、')]]:[['当前画面',`${phase+1} / ${story.frames.length}`],['两奖品',frame.pair.map(num).join(' / ')],['三奖品',frame.tri.map(num).join(' / ')]];
 l31El('metrics').innerHTML=metrics.map(([k,v])=>`<div class="metric"><label>${l31Esc(k)}</label><strong>${l31Esc(v)}</strong></div>`).join('');
 l31El('reading').textContent=frame.narration;l31El('formula').textContent=frame.formula;
 l31El('boundary').textContent=`Osborne–Rubinstein §3.1，印刷31页／PDF50；图3.1在印刷32页／PDF51。${frame.source||frame.note}。${mode==='simplex'?'本站把原书三维概率平面平铺成等价三角形；三条概率轴的含义不变。':'教材例子与自主构造练习已分别标注。'}这里只定义彩票与概率几何，不预设风险偏好或期望效用。`;
 l31El('extra').innerHTML=`<p>${l31Esc(frame.note)}</p>${proofs}`;
 l31El('step').value=phase;l31El('advance').disabled=phase>=story.frames.length-1;l31El('play').disabled=phase>=story.frames.length-1;
 const download=document.querySelector('.lesson-end a[download]');
 if(download){download.href=(location.protocol==='file:'||location.pathname.includes('/downloads/')?'https://microeconomics-atlas-mingze.synb636.chatgpt.site/':'')+`downloads/ch3-${mode}.html`;download.textContent='下载本段完整动画代码 ↓';}
 window.microMath?.refresh();
 return {phase,mode,valid:!frame.invalid,probabilities:frame.p||frame.tri,support:mode==='lottery'?frameSupport(frame):null};
}
