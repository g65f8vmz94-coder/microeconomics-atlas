(() => {
  const byId=id=>document.getElementById(id);
  const data=JSON.parse(byId('guide-data').textContent);
  const reduced=window.microMotion.reduced;
  const cards=Array.from(document.querySelectorAll('.state-cell'));
  const stepButtons=Array.from(document.querySelectorAll('[data-proof-step]'));
  const chart=byId('plot-dot');
  const pos=chart?JSON.parse(chart.dataset.positions):null;
  const edges=Array.from(document.querySelectorAll('.net-edge'));
  const scales=Array.from(document.querySelectorAll('.mini-scale'),el=>({bar:el.querySelector('i'),zero:Number(el.dataset.zero),values:JSON.parse(el.dataset.values)}));
  const cups=Array.from(document.querySelectorAll('.cup-option'),el=>({fill:el.querySelector('.vessel i'),tag:el.querySelector('.cup-tag'),max:Number(el.dataset.max),states:JSON.parse(el.dataset.cups)}));
  const tray=document.querySelector('.ticket-box');
  const tickets=tray?JSON.parse(tray.dataset.tickets):null;
  const payoff=document.querySelector('.payoff'), moves=payoff?JSON.parse(payoff.dataset.moves):[];
  const holding=document.querySelector('.holding'), rounds=holding?JSON.parse(holding.dataset.rounds):[];
  const pips=Array.from(document.querySelectorAll('.pips i'));
  let step=-1, timer=0, origin=null;
  function pause() {
    clearTimeout(timer); timer=0; byId('play').textContent='连续播放';
  }
  function fromURL() {
    const n=Number(new URL(location.href).searchParams.get('step')||1);
    return Number.isInteger(n)?Math.max(0,Math.min(n-1,data.frames.length-1)):0;
  }
  function show(n,{save=true,announce=true,animate=true}={}) {
    const target=data.frames[n], prior=n>0?data.frames[n-1]:null;
    cards.forEach((card,i)=>{
      const changed=!!prior && prior.values[i]!==target.values[i];
      const value=card.querySelector('.value'), before=card.querySelector('.before');
      const newValue=value.innerHTML!==target.values[i];
      value.innerHTML=target.values[i];
      card.classList.toggle('changed',changed);
      before.innerHTML=changed?'原先 '+prior.values[i]:'';
      if (animate && !reduced.matches && newValue) window.microMotion.reveal(value,3);
    });
    for(const s of scales){
      s.bar.style.left=Math.min(s.zero,s.values[n])+'%';
      s.bar.style.width=Math.abs(s.values[n]-s.zero)+'%';
    }
    for(const c of cups){
      const [quantity,price]=c.states[n];
      c.fill.style.height=(100*quantity/c.max)+'%';c.tag.textContent=quantity===0?'不买':price+' 元';
    }
    if(tray)Array.from(tray.querySelectorAll('.ticket')).forEach((el,i)=>{
      if(el.textContent!==tickets[n][i]){el.textContent=tickets[n][i];if(animate&&!reduced.matches)window.microMotion.reveal(el,3);}
    });
    if(payoff){
      const selected=moves[n].join(',');
      for(const cell of payoff.querySelectorAll('[data-choice]')){
        const chosen=cell.dataset.choice===selected;
        cell.classList.toggle('selected',chosen);
        if(chosen)cell.setAttribute('aria-current','true');else cell.removeAttribute('aria-current');
      }
    }
    if(holding)Array.from(holding.querySelectorAll('dd')).forEach((slot,i)=>{
      slot.textContent=rounds[n][i];slot.classList.toggle('changed',n>0&&rounds[n-1][i]!==rounds[n][i]);
    });
    byId('scene-title').innerHTML=target.action;
    byId('scene-why').innerHTML=target.why;
    byId('counter').textContent='第 '+(n+1)+' / '+data.frames.length+' 步';
    pips.forEach((el,i)=>el.classList.toggle('on',i<=n));
    if(chart){chart.setAttribute('cx',pos[n][0]);chart.setAttribute('cy',pos[n][1]);}
    for(const edge of edges)edge.style.display=edge.dataset.visible[n]==='1'?'':'none';
    byId('previous').disabled=n===0;
    byId('next').textContent=n===data.frames.length-1?'从头再看 ↺':'看下一步 →';
    step=n;
    if(save){
      const url=new URL(location.href);url.searchParams.set('step',String(n+1));
      try{history.replaceState(history.state,'',url)}catch{}
    }
    if(announce)byId('announce').textContent=byId('counter').textContent+'。'+byId('scene-title').textContent+'。'+byId('scene-why').textContent;
  }
  function advance(){show((step+1)%data.frames.length)}
  function schedule(){
    if(step===data.frames.length-1){pause();return;}
    byId('play').textContent='暂停播放';
    const readingMs=Math.min(12500,Math.max(5600,byId('scene-why').textContent.length*135));
    timer=setTimeout(()=>{advance();schedule()},readingMs);
  }
  byId('next').addEventListener('click',()=>{pause();advance()});
  byId('previous').addEventListener('click',()=>{pause();show(Math.max(0,step-1))});
  byId('play').addEventListener('click',()=>{
    if(timer){pause();return;}
    if(step===data.frames.length-1)show(0);
    schedule();
  });
  function focusAt(el){
    el.focus({preventScroll:true});
    el.scrollIntoView({block:'start',behavior:'instant'});
  }
  stepButtons.forEach(link=>link.addEventListener('click',e=>{
    e.preventDefault();pause();origin=link;
    show(Number(link.dataset.proofStep),{animate:false});
    const back=byId('back-to-proof');back.href='#'+link.id;back.textContent='回到刚才那行解答 ↓';
    focusAt(byId('scene'));
  }));
  byId('back-to-proof').addEventListener('click',e=>{
    pause();if(origin){e.preventDefault();focusAt(origin)}
  });
  for(const a of document.querySelectorAll('.unit-nav a'))a.addEventListener('click',pause);
  function motionPreference(){byId('play').hidden=reduced.matches;if(reduced.matches)pause();}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
  window.addEventListener('pagehide',pause);
  window.addEventListener('popstate',()=>{pause();show(fromURL(),{save:false,animate:false,announce:false})});
  reduced.addEventListener('change',motionPreference);motionPreference();
  show(fromURL(),{save:false,animate:false,announce:false});

  const form=byId('transfer');
  function feedback(message){byId('feedback').innerHTML=message;}
  form.addEventListener('change',()=>feedback(''));
  form.addEventListener('submit',e=>{
    e.preventDefault();pause();
    const choice=form.querySelector('input:checked');
    if(!choice){feedback('先选一个答案，或者直接看做法。');form.querySelector('input').focus();return;}
    feedback((Number(choice.value)===data.correct?'<strong>这次判断对了。</strong> ':'<strong>再核对一下条件。</strong> ')+data.explain);
  });
  byId('reveal').addEventListener('click',()=>{
    pause();const panel=byId('worked');panel.hidden=!panel.hidden;
    byId('reveal').setAttribute('aria-expanded',String(!panel.hidden));
    byId('reveal').textContent=panel.hidden?'直接看做法':'收起做法';
  });
})();
