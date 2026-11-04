(()=>{
 const $=id=>document.getElementById(id),safeRead=()=>{try{return JSON.parse(localStorage.getItem('micro-atlas-progress-v1')||'{}')}catch{return {}}};
 const progress=safeRead();
 if($('search')){const q=$('search'),status=$('filter');function filter(){let n=0;document.querySelectorAll('.lesson-row').forEach(el=>{const visible=el.dataset.search.includes(q.value.toLowerCase())&&(status.value!=='ready'||el.dataset.ready==='yes')&&(status.value!=='practice'||progress[el.dataset.id]?.practiced);el.hidden=!visible;if(visible)n++});document.querySelectorAll('.chapter').forEach(el=>el.hidden=![...el.querySelectorAll('.lesson-row')].some(x=>!x.hidden));$('found').textContent=`显示 ${n} ${$('found').dataset.unit||'个小节'}`;};q.addEventListener('input',filter);status.addEventListener('change',filter);filter();}
 if(window.LESSON){const id=window.LESSON.id;progress[id]={...progress[id],opened:true};try{localStorage.setItem('micro-atlas-progress-v1',JSON.stringify(progress))}catch{}
  const practice=$('practice');if(practice){const update=()=>practice.textContent=progress[id].practiced?'已自行练习 · 点击撤销':'标记已自行练习';update();practice.onclick=()=>{progress[id].practiced=!progress[id].practiced;try{localStorage.setItem('micro-atlas-progress-v1',JSON.stringify(progress));update();$('progress-notice').textContent='记录保存在本浏览器；已练习不等于已掌握。'}catch{$('progress-notice').textContent='当前浏览器无法保存记录。'}};}
  $('chapter-select')?.addEventListener('change',e=>location.assign(e.target.value));
  const tabs=[...document.querySelectorAll('[role=tab]')];function activate(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;$(t.getAttribute('aria-controls')).hidden=!selected});if(focus)tab.focus();window.microMotion.reveal($(tab.getAttribute('aria-controls')),5)}
  tabs.forEach((tab,i)=>{tab.onclick=()=>activate(tab);tab.onkeydown=e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[j],true)}});
 }
})();
