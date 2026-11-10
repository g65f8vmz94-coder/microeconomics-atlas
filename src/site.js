(()=>{
 const $=id=>document.getElementById(id),safeRead=()=>{try{return JSON.parse(localStorage.getItem('micro-atlas-progress-v1')||'{}')}catch{return {}}};
 const progress=safeRead();
 if($('search')){
  const search=$('search'),filter=$('filter'),chapters=[...document.querySelectorAll('.chapter')];
  const rows=[...document.querySelectorAll('.lesson-row')];
  let savedOpen=null;
  function openLinkedChapter(){
   const target=document.getElementById(location.hash.slice(1));
   if(target?.matches('details.exercise-chapter'))target.open=true;
  }
  function apply(){
   const term=search.value.trim().toLowerCase().replace(/\s+/g,''),mode=filter?.value||'all';
   if(term&&!savedOpen)savedOpen=new Set(chapters.filter(el=>el.open));
   let count=0;
   for(const row of rows){
    row.hidden=!row.dataset.search.replace(/\s+/g,'').includes(term)||
     (mode==='ready'&&row.dataset.ready!=='yes')||(mode==='practice'&&!progress[row.dataset.id]?.practiced);
    if(!row.hidden)count++;
   }
   for(const chapter of chapters){
    chapter.hidden=!chapter.querySelector('.lesson-row:not([hidden])');
    if(chapter.matches('details')){
     if(term)chapter.open=!chapter.hidden;
     else if(savedOpen)chapter.open=savedOpen.has(chapter);
    }
   }
   if(!term)savedOpen=null;
   $('found').textContent=`显示 ${count} ${$('found').dataset.unit||'个小节'}`;
  }
  search.addEventListener('input',apply);filter?.addEventListener('change',apply);
  apply();openLinkedChapter();window.addEventListener('hashchange',openLinkedChapter);
 }
 if(window.LESSON){const id=window.LESSON.id;progress[id]={...progress[id],opened:true};try{localStorage.setItem('micro-atlas-progress-v1',JSON.stringify(progress))}catch{}
  const practice=$('practice');if(practice){const update=()=>practice.textContent=progress[id].practiced?'已自行练习 · 点击撤销':'标记已自行练习';update();practice.onclick=()=>{progress[id].practiced=!progress[id].practiced;try{localStorage.setItem('micro-atlas-progress-v1',JSON.stringify(progress));update();$('progress-notice').textContent='练习记录保存在本浏览器。'}catch{$('progress-notice').textContent='当前浏览器无法保存记录。'}};}
  $('chapter-select')?.addEventListener('change',e=>location.assign(e.target.value));
  const tabs=[...document.querySelectorAll('[role=tab]')];function activate(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;$(t.getAttribute('aria-controls')).hidden=!selected});if(focus)tab.focus();window.microMotion.reveal($(tab.getAttribute('aria-controls')),5)}
  tabs.forEach((tab,i)=>{tab.onclick=()=>activate(tab);tab.onkeydown=e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const j=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activate(tabs[j],true)}});
 }
})();
