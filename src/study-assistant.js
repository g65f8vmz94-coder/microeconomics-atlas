(() => {
  const STUDY_KEY = 'micro-atlas-study-v1';
  const LEGACY_KEY = 'micro-atlas-progress-v1';
  const $ = id => document.getElementById(id);

  const study = AtlasStudy.create(() => localStorage);
  const readStudy = () => study.read();
  const writeStudy = value => study.write(value);
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[\s\-·•§()（）]/g, '')
      .replace(/proposition/g, '命题')
      .replace(/lemma/g, '引理');
  }

  function matchEntries(entries, rawQuery) {
    const q0 = String(rawQuery || '').trim().toLowerCase();
    if (!q0) return [];
    const q = norm(q0).replace(/^第(?=\d)/, '').replace(/^(章末题|题)(?=\d)/, '习题');
    const idMatch = /^(小节|习题|命题|引理)?(\d+\.\d+)$/.exec(q);
    const chMatch = /^(\d+)章?$/.exec(q);
    const kindFilter = idMatch?.[1] || '';
    const numId = idMatch?.[2] || '';

    const scored = [];
    for (const e of entries) {
      const eId = String(e.id || '').toLowerCase();
      const hay = norm([e.label, e.id, e.title, e.chapterTitle, e.theme, e.keywords].join(' '));
      let score = 0;
      if (numId && eId === numId) {
        if (kindFilter && e.kind === kindFilter) score = 120;
        else if (!kindFilter) score = e.kind === '小节' || e.kind === '习题' ? 95 : 85;
      } else if (chMatch && e.chapter === Number(chMatch[1])) {
        score = e.kind === '章' ? 110 : 50;
      } else if (hay.includes(q)) {
        score = norm(e.label).includes(q) ? 80 : norm(e.title).includes(q) ? 70 : 40;
      }
      if (score > 0) scored.push({ entry: e, score });
    }
    scored.sort((a, b) => b.score - a.score || (a.entry.chapter - b.entry.chapter));
    return scored.map(x => x.entry);
  }

  function renderResultItem(e) {
    const li = document.createElement('li');
    li.className = 'atlas-result-item';
    const badge = document.createElement('span');
    badge.className = 'atlas-result-kind';
    badge.textContent = e.kind;
    const mainLink = document.createElement('a');
    mainLink.className = 'atlas-result-main';
    mainLink.href = e.url;
    mainLink.textContent = `${e.label}　${e.title}`;
    li.append(badge, mainLink);
    if (e.altUrl) {
      const altLink = document.createElement('a');
      altLink.className = 'atlas-result-alt';
      altLink.href = e.altUrl;
      altLink.textContent = (e.altLabel || '对照视图') + ' →';
      li.append(altLink);
    }
    return li;
  }

  function initUnifiedSearchWidgets() {
    const entries = window.ATLAS_SEARCH_INDEX || (() => {
      const el = $('entries');
      if (!el) return null;
      try { return JSON.parse(el.textContent); } catch { return null; }
    })();
    if (!entries) return;

    for (const box of document.querySelectorAll('[data-atlas-search]')) {
      const input = box.querySelector('input[type="search"]');
      const countEl = box.querySelector('[data-search-count]');
      const listEl = box.querySelector('[data-search-results]');
      const hideTarget = box.dataset.hideTarget ? $(box.dataset.hideTarget) : null;
      if (!input || !listEl) continue;
      const run = () => {
        const val = input.value.trim();
        listEl.replaceChildren();
        if (hideTarget) hideTarget.hidden = !!val;
        listEl.hidden = !val;
        if (!val) {
          if (countEl) countEl.textContent = '';
          return;
        }
        const found = matchEntries(entries, val).slice(0, 40);
        for (const item of found) listEl.append(renderResultItem(item));
        if (countEl) countEl.textContent = found.length ? `全站找到 ${found.length} 项匹配` : '未找到匹配项，试试“17.1”、“命题17.1”或“WARP”。';
      };
      input.addEventListener('input', run);
      window.addEventListener('pageshow', run);
    }

    // Also attach cross-site unified suggestions into catalog.html / exercises.html #search!
    const pageSearch = $('search');
    const foundEl = $('found');
    if (pageSearch && foundEl) {
      let uniWrap = $('unified-search-box');
      if (!uniWrap) {
        uniWrap = document.createElement('section');
        uniWrap.id = 'unified-search-box';
        uniWrap.className = 'unified-search-box';
        uniWrap.setAttribute('aria-label', '全站直达搜索结果');
        uniWrap.hidden = true;
        uniWrap.innerHTML = '<h2 class="unified-search-title">全站直达（命题 / 引理 / 4h速通 / 图解）</h2><ul class="atlas-result-list" id="unified-search-list"></ul>';
        foundEl.after(uniWrap);
      }
      const uniList = $('unified-search-list');
      const runCatalogUnified = () => {
        const val = pageSearch.value.trim();
        uniList.replaceChildren();
        if (!val) { uniWrap.hidden = true; return; }
        const found = matchEntries(entries, val).slice(0, 12);
        uniWrap.hidden = !found.length;
        for (const item of found) uniList.append(renderResultItem(item));
      };
      pageSearch.addEventListener('input', runCatalogUnified);
      runCatalogUnified();
    }
  }

  function paintStudy() {
    const store = readStudy(), mount = $('study-resume');
    if (mount) {
      mount.replaceChildren(); mount.hidden = !store.last?.url;
      if (store.last?.url) {
        const link = document.createElement('a');
        link.className = 'resume-link';
        link.href = store.last.url + (store.last.stepId ? '#' + store.last.stepId : '');
        link.textContent = `继续上次：${store.last.label || ''} · ${store.last.title}（${store.last.stepTitle || '上次位置'}） →`;
        mount.append(link);
      }
    }
    const labels = {seen:'已看过',confused:'还没懂',done:'已独立做过'};
    const filter = document.querySelector('[data-study-filter] [aria-pressed="true"]')?.dataset.filter || 'all';
    for (const row of document.querySelectorAll('.unit-row[data-unit-key]')) {
      const status = store.units[row.dataset.unitKey]?.status || 'unread';
      row.dataset.mastery = status;
      row.querySelector('.unit-mastery')?.remove();
      if (labels[status]) {
        const badge = document.createElement('span'); badge.className = 'unit-mastery status-' + status;
        badge.textContent = labels[status]; row.append(badge);
      }
      row.hidden = filter !== 'all' && filter !== status;
    }
  }
  function paintSprint() {
    const store = readStudy(), sprint = store.sprint || {}, tasks = store.sprintTasks || {};
    const todoOnly = document.querySelector('[data-sprint-filter="todo"]')?.getAttribute('aria-pressed') === 'true';
    let count = 0, minutes = 0, next;
    for (const el of document.querySelectorAll('.sprint-item[data-sprint-chapter]')) {
      const ch = el.dataset.sprintChapter, done = !!sprint[ch], btn = el.querySelector('.sprint-check');
      el.classList.toggle('is-sprint-done', done); el.hidden = todoOnly && done;
      if (done) { count++; minutes += Number(el.dataset.sprintMin || 0); }
      if (btn) { btn.setAttribute('aria-pressed', String(done)); btn.textContent = done ? '已过完 ✓' : '标记过完'; }
      for (const task of el.querySelectorAll('[data-sprint-task]')) {
        const key = ch + ':' + task.dataset.sprintTask, complete = done || !!tasks[key];
        const toggle = task.querySelector('[data-task-done]');
        toggle.setAttribute('aria-pressed', String(complete)); toggle.textContent = complete ? '已完成 ✓' : '标记完成';
        if (!complete && !next) next = task.querySelector('a');
      }
    }
    const summary = $('sprint-progress-summary');
    if (summary) {
      summary.hidden = false; summary.replaceChildren();
      const label = document.createElement('strong');
      label.textContent = `4h 计划进度：${count} / 20 章 · ${minutes} / 240 分钟`;
      summary.append(label);
      if (next) { const link = next.cloneNode(true); link.className = 'sprint-next-link'; link.textContent = '继续下一任务：' + next.textContent; summary.append(link); }
      else summary.append('已勾完全部任务，可再查“还没懂”的内容。');
    }
    const btn = $('review-chapter-toggle');
    if (btn) { const done = !!sprint[btn.dataset.sprintChapter]; btn.setAttribute('aria-pressed', String(done)); btn.textContent = done ? `已完成第 ${btn.dataset.sprintChapter} 章速通 · 点击取消` : `标记第 ${btn.dataset.sprintChapter} 章已过完`; }
  }
  function refresh() { paintStudy(); paintSprint(); }
  function initStudyControls() {
    for (const box of document.querySelectorAll('[data-study-backup]')) {
      box.hidden = false;
      const status = box.querySelector('[data-backup-status]');
      box.querySelector('[data-export-study]')?.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),study:readStudy()},null,2)],{type:'application/json'});
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'micro-atlas-study-progress.json'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href),1500);
        if (status) status.textContent = '已导出本机学习记录 JSON。';
      });
      box.querySelector('[data-clear-study]')?.addEventListener('click', () => {
        const ok = study.clear(); refresh();
        if (status) status.textContent = ok ? '已清空本站新旧学习记录。' : '存储受限，已清空当前页记录。';
      });
    }
    for (const bar of document.querySelectorAll('[data-study-filter]')) {
      for (const btn of bar.querySelectorAll('[data-filter]')) btn.addEventListener('click', () => {
        for (const b of bar.querySelectorAll('[data-filter]')) b.setAttribute('aria-pressed',String(b === btn));
        paintStudy();
      });
    }
    const save = store => {
      const ok = writeStudy(store); refresh();
      if (!ok) {
        const target = $('sprint-progress-summary') || $('review-chapter-toggle');
        if (target) target.insertAdjacentText('afterend',' 本地存储受限，进度仅保留在当前页。');
      }
    };
    for (const btn of document.querySelectorAll('.sprint-check')) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        const store = readStudy(), ch = btn.dataset.sprintChapter || btn.closest('[data-sprint-chapter]').dataset.sprintChapter;
        store.sprint ||= {}; store.sprintTasks ||= {};
        const done = !store.sprint[ch]; store.sprint[ch] = done;
        for (const kind of ['conditions','derivation','check']) store.sprintTasks[ch + ':' + kind] = done;
        save(store);
      });
    }
    for (const task of document.querySelectorAll('[data-sprint-task]')) {
      const btn = task.querySelector('[data-task-done]'); btn.hidden = false;
      btn.addEventListener('click', () => {
        const store = readStudy(), ch = task.closest('[data-sprint-chapter]').dataset.sprintChapter;
        store.sprint ||= {}; store.sprintTasks ||= {};
        const key = ch + ':' + task.dataset.sprintTask;
        const previous = !!store.sprint[ch] || !!store.sprintTasks[key];
        if (store.sprint[ch]) for (const kind of ['conditions','derivation','check']) store.sprintTasks[ch + ':' + kind] = true;
        store.sprintTasks[key] = !previous;
        store.sprint[ch] = ['conditions','derivation','check'].every(kind => store.sprintTasks[ch + ':' + kind]);
        save(store);
      });
    }
    for (const btn of document.querySelectorAll('[data-sprint-filter]')) {
      btn.hidden = false; btn.addEventListener('click', () => {
        for (const b of document.querySelectorAll('[data-sprint-filter]')) b.setAttribute('aria-pressed',String(b === btn));
        paintSprint();
      });
    }
    window.addEventListener('storage',refresh);
    window.addEventListener('pageshow',refresh);
    refresh();
  }
  function initReturnLinks() {
    const target = new URL(location.href).searchParams.get('returnTo');
    const path = target && /^learn-[sp]\d+-\d+\.html#[\w.-]+$/.test(target) ? target.split('#')[0] : '';
    for (const link of document.querySelectorAll('.formal-crosslink')) {
      if (link.getAttribute('href') === path) {
        link.href = target;
        link.textContent = '回到刚才的生活版步骤 →';
      }
      if (/^learn-[sp]\d+-\d+\.html(?:#|$)/.test(link.getAttribute('href') || '')) link.addEventListener('click', () => {
        const source = location.pathname.split('/').pop();
        if (!/^review-\d+\.html$/.test(source)) return;
        const hash = location.hash || '#' + (link.closest('[id]')?.id || 'principles');
        const url = new URL(link.href,location.href);
        url.searchParams.set('reviewFrom',source + hash);
        link.href = url.href;
      });
    }
  }
  function ready() { initUnifiedSearchWidgets(); initStudyControls(); initReturnLinks(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready);
  else ready();
})();
