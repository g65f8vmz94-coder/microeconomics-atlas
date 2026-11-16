(() => {
  const byId = id => document.getElementById(id);
  const flow = document.querySelector('.guided-flow');
  if (location.protocol === 'file:') {
    // Browsers treat local files as opaque origins. A blob download works
    // even after renaming the file. Capture before hiding any reading steps.
    const link = document.querySelector('a[download]');
    const source = '<!doctype html>\n' + document.documentElement.outerHTML;
    link.addEventListener('click', () => {
      if (link.protocol !== 'blob:') {
        link.href = URL.createObjectURL(new Blob([source], {type: 'text/html;charset=utf-8'}));
      }
    });
  }
  const steps = Array.from(flow.querySelectorAll(':scope > .guided-step'));
  const reasoning = steps.filter(step => step.classList.contains('guided-reasoning'));
  const scenes = steps.filter(step => step.classList.contains('guided-scene'));
  const paper = byId('answer');
  const storageKey = 'guided-proof:' + flow.dataset.unit;
  const proofIds = new Set(reasoning.map(step => step.id));
  // A reload or a trip to a model preserves progress within this tab. Some
  // browsers restrict storage on file: pages; history state also carries it.
  let saved = [];
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)) || []; } catch {}
  const state = history.state?.guided || {};
  const seen = new Set([...(Array.isArray(saved) ? saved : []), ...(state.seen || [])].filter(id => proofIds.has(id)));
  let current;
  let returnId = '';
  let returnTop = null;

  const desk = flow.parentElement;
  const card = desk.querySelector('.condition-card');
  const conditions = byId('condition-text');
  const citeBox = byId('condition-cite');
  const citeText = citeBox?.querySelector('.cite-text');
  const citeLocate = citeBox?.querySelector('.cite-locate');
  const sizeButton = card.querySelector('.condition-size');
  const narrow = matchMedia('(max-width:799px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cardMotion;
  let tokenMotions = [];
  const isReduced = () => reduced.matches || document.documentElement.dataset.motion === 'reduced';
  function resolveAliasId(id) {
    // Legacy IDs are real descendant anchors generated from the original text.
    return id;
  }
  function owner(id) {
    const element = byId(resolveAliasId(id));
    if (element === desk || card.contains(element)) return steps[0];
    return element?.closest('.guided-step');
  }
  function measureCard() {
    desk.style.setProperty('--reference-height', card.offsetHeight + 'px');
    const overflows = conditions.scrollHeight > conditions.clientHeight + 1;
    const expanded = card.hasAttribute('data-expanded');
    sizeButton.hidden = !(desk.hasAttribute('data-docked') && narrow.matches && (expanded || overflows));
    conditions.tabIndex = overflows ? 0 : -1;
  }
  sizeButton.addEventListener('click', () => {
    const expanded = card.toggleAttribute('data-expanded');
    sizeButton.setAttribute('aria-expanded', String(expanded));
    sizeButton.textContent = expanded ? '收回全题' : '展开全题';
    if (!expanded) conditions.scrollTop = 0;
    measureCard();
  });
  citeLocate?.addEventListener('click', () => {
    const first = conditions.querySelector('.is-cited');
    if (!first) return;
    if (narrow.matches && !sizeButton.hidden && !card.hasAttribute('data-expanded')) sizeButton.click();
    first.scrollIntoView({block: 'nearest', behavior: isReduced() ? 'instant' : 'smooth'});
  });
  // Measure natural reflow (including font and viewport changes) for anchor offsets.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measureCard);
    observer.observe(card);
    observer.observe(conditions.firstElementChild);
  }
  function stopMotion() {
    cardMotion?.cancel();
    for (const anim of tokenMotions) anim.cancel();
    tokenMotions = [];
  }
  reduced.addEventListener('change', stopMotion);
  narrow.addEventListener('change', () => {stopMotion(); measureCard();});
  new MutationObserver(stopMotion).observe(document.documentElement, {attributes:true, attributeFilter:['data-motion']});
  function syncConditionCite(step, docked) {
    for (const el of conditions.querySelectorAll('.is-cited')) el.classList.remove('is-cited');
    const itemIdxs = (step.dataset.citeItems || '').split(',').filter(Boolean);
    const rowKeys = (step.dataset.citeRows || '').split(',').filter(Boolean);
    for (const idx of itemIdxs) conditions.querySelector(`li[data-item-idx="${idx}"]`)?.classList.add('is-cited');
    for (const key of rowKeys) conditions.querySelector(`tr[data-row-key="${key}"]`)?.classList.add('is-cited');
    const first = conditions.querySelector('.is-cited');
    if (citeBox && citeText) {
      const inlineVal = step.querySelector('.step-cite-inline .cite-val');
      if (docked && inlineVal) {
        citeText.innerHTML = inlineVal.innerHTML;
        citeBox.hidden = false;
        if (citeLocate) citeLocate.hidden = !first;
      } else if (docked && first) {
        const nums = [...conditions.querySelectorAll('li.is-cited')].map(li => Number(li.dataset.itemIdx) + 1);
        const snippet = first.textContent.replace(/\s+/g, ' ').trim();
        const short = snippet.length > 44 ? snippet.slice(0, 44) + '…' : snippet;
        citeText.textContent = nums.length ? '第 ' + nums.join('、') + ' 条：' + short : short;
        citeBox.hidden = false;
        if (citeLocate) citeLocate.hidden = false;
      } else {
        citeBox.hidden = true;
      }
    }
    if (docked && !narrow.matches && first && document.activeElement !== conditions) {
      first.scrollIntoView({block: 'nearest', behavior: 'instant'});
    }
  }
  function captureSceneSnapshot(fromStep) {
    if (isReduced() || !fromStep || !fromStep.classList.contains('guided-scene')) return null;
    const fig = fromStep.querySelector('.figure');
    if (!fig) return null;
    const base = fig.getBoundingClientRect();
    const tokens = new Map();
    for (const el of fromStep.querySelectorAll('[data-token]')) {
      if (el.getClientRects().length) {
        const r = el.getBoundingClientRect();
        tokens.set(el.dataset.token, {left: r.left - base.left, top: r.top - base.top});
      }
    }
    const bars = new Map();
    for (const el of fromStep.querySelectorAll('[data-bar-key]')) {
      bars.set(el.dataset.barKey, {pct: Number(el.dataset.barPct || 0), left: el.style.left || ''});
    }
    return {tokens, bars};
  }
  function playSceneMotion(toStep, snap) {
    stopMotion();
    if (!snap || isReduced() || !toStep.classList.contains('guided-scene')) return;
    const fig = toStep.querySelector('.figure');
    if (!fig) return;
    const base = fig.getBoundingClientRect();
    for (const el of toStep.querySelectorAll('[data-token]')) {
      const prev = snap.tokens.get(el.dataset.token);
      if (!prev || !el.animate) continue;
      const now = el.getBoundingClientRect();
      const dx = prev.left - (now.left - base.left), dy = prev.top - (now.top - base.top);
      if (Math.hypot(dx, dy) > 2 && Math.hypot(dx, dy) < 900) {
        tokenMotions.push(el.animate(
          [{transform: `translate(${dx}px,${dy}px)`}, {transform: 'none'}],
          {duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)'}
        ));
      }
    }
    for (const el of toStep.querySelectorAll('[data-bar-key]')) {
      const prev = snap.bars.get(el.dataset.barKey);
      if (!prev || !el.animate) continue;
      const nextPct = Number(el.dataset.barPct || 0);
      if (Math.abs(prev.pct - nextPct) < 0.1 && prev.left === (el.style.left || '')) continue;
      const vertical = el.dataset.barAxis === 'y' || el.dataset.barKey === 'small-q';
      const from = vertical ? {height: prev.pct + '%'} : {width: prev.pct + '%', ...(prev.left ? {left: prev.left} : {})};
      const to = vertical ? {height: nextPct + '%'} : {width: nextPct + '%', ...(el.style.left ? {left: el.style.left} : {})};
      tokenMotions.push(el.animate([from, to], {duration: 240, easing: 'cubic-bezier(.22, 1, .36, 1)'}));
    }
  }
  function carryCard(before) {
    if (!before || !card.animate || reduced.matches || document.documentElement.dataset.motion === 'reduced') return;
    const after = card.getBoundingClientRect();
    const x = before.left - after.left;
    const y = Math.min(90, Math.max(-90, before.top - after.top));
    // Keeping the width and position in step holds the paper's outer edge
    // steady. Text reflows at its reading size instead of stretching sideways.
    const start = {transform:`translate(${x}px,${y}px)`};
    const end = {transform:'none'};
    if (Math.abs(before.width - after.width) > 1) {
      start.width = before.width + 'px';
      end.width = after.width + 'px';
    }
    cardMotion = card.animate([start,end], {duration:260,easing:'cubic-bezier(.2,.75,.25,1)'});
  }
  function locationId() {
    const url = new URL(location.href);
    const hash = url.hash.slice(1);
    const sceneAnchor = ['', 'scene', 'scene-title', 'scene-why'].includes(hash);
    const rawStep = url.searchParams.get('step');
    const old = Number(rawStep);
    if (sceneAnchor && url.searchParams.has('step')) {
      if (Number.isInteger(old)) return scenes[Math.min(Math.max(old, 1), scenes.length) - 1].id;
      if (owner(rawStep)) return rawStep;
    }
    return owner(hash) ? hash : steps[0].id;
  }
  function writeHistory(method, id, keepURL) {
    const url = new URL(location.href);
    if (!keepURL) {
      url.hash = id === 'scene' && url.protocol === 'file:' && url.searchParams.has('step') ? 'scene-1' : id;
      // Changing a file URL's query via History API is restricted. Its
      // fragment always takes precedence over the original query.
      if (url.protocol !== 'file:') url.searchParams.delete('step');
    }
    const value = {...history.state, guided: {seen: [...seen], returnId, returnTop}};
    try { history[method](value, '', url.href); } catch {
      if (url.hash !== location.hash) location.hash = url.hash;
    }
  }
  function remember(step) {
    if (!proofIds.has(step.id) || seen.has(step.id)) return;
    seen.add(step.id);
    try { sessionStorage.setItem(storageKey, JSON.stringify([...seen])); } catch {}
  }
  function navigate(requested, {method = 'pushState', origin = '', sourceTop = null, backTop = null, restore = false, focus = true} = {}) {
    let id = resolveAliasId(requested);
    let step = owner(id) || steps[0];
    remember(step);
    returnId = owner(origin) && step.classList.contains('guided-scene') ? origin : '';
    returnTop = returnId && Number.isFinite(sourceTop) ? sourceTop : null;
    const back = step.querySelector('[data-return]');
    if (back) {
      back.dataset.defaultHref ||= back.getAttribute('href');
      back.dataset.defaultLabel ||= back.textContent;
      back.setAttribute('href', returnId ? '#' + returnId : back.dataset.defaultHref);
      back.textContent = returnId ? '← 回到刚才那一行' : back.dataset.defaultLabel;
    }
    if (step.id === 'practice' && paper) {
      const previous = step.querySelector('[data-direction="previous"]');
      previous.href = '#answer';
      previous.textContent = '← 回到答卷';
    }
    const docked = step !== steps[0];
    const crossing = !!current && docked !== desk.hasAttribute('data-docked');
    const before = crossing ? card.getBoundingClientRect() : null;
    const prevSnapshot = current && current !== step ? captureSceneSnapshot(current) : null;
    if (crossing) {
      stopMotion();
      card.removeAttribute('data-expanded');
      sizeButton.setAttribute('aria-expanded', 'false');
      sizeButton.textContent = '展开全题';
      conditions.scrollTop = 0;
    }
    desk.toggleAttribute('data-docked', docked);
    desk.dataset.ready = '';
    if (current !== step) {
      for (const panel of steps) {
        panel.hidden = panel !== step;
        panel.classList.toggle('is-current', panel === step);
      }
      current = step;
    }
    flow.dataset.interactive = '';
    if (byId(id)?.hasAttribute('data-legacy-proof')) {
      for (const detail of step.querySelectorAll('details.guided-detail')) detail.open = true;
    }
    syncConditionCite(step, docked);
    measureCard();
    playSceneMotion(step, prevSnapshot);
    writeHistory(method, id, restore);
    syncStudyProgress?.(step, docked);
    if (focus) {
      const target = byId(id);
      // A figure comparison from the paper can return to a specific row.
      const sourceLink = Number.isFinite(backTop) && target?.querySelector('[data-compare-from]');
      if (sourceLink) {
        sourceLink.focus({preventScroll: true});
        window.scrollBy({top: sourceLink.getBoundingClientRect().top - backTop, behavior: 'instant'});
        return;
      }
      const destination = !docked ? card : target?.classList.contains('guided-answer-row') ? target : step;
      destination.focus({preventScroll: true});
      const bounds = destination.getBoundingClientRect();
      const clearance = docked && narrow.matches ? card.offsetHeight + 8 : 10;
      if (bounds.top < clearance || bounds.top > innerHeight / 2) {
        window.scrollBy({top:bounds.top - clearance, behavior:'instant'});
      }
    }
    carryCard(before);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    const id = link.hash.slice(1);
    if (!owner(id)) return;
    event.preventDefault();
    const jumpMenu = link.closest('.guided-jumps');
    if (jumpMenu) jumpMenu.open = false;
    navigate(id, {origin: link.dataset.compareFrom, sourceTop: link.getBoundingClientRect().top,
      backTop: link.hasAttribute('data-return') ? returnTop : null});
  });
  function restoreLocation(focus) {
    navigate(locationId(), {method: 'replaceState', restore: true, origin: history.state?.guided?.returnId, sourceTop: history.state?.guided?.returnTop, focus});
  }
  // Native back/forward can fire both events. The second pass is harmless
  // and also handles pasted/edited fragments that have no history state.
  window.addEventListener('popstate', () => restoreLocation(true));
  window.addEventListener('hashchange', () => restoreLocation(true));
  // On a cached history traversal another copy of this unit may have advanced.
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    try {
      for (const id of JSON.parse(sessionStorage.getItem(storageKey)) || []) {
        if (proofIds.has(id)) seen.add(id);
      }
    } catch {}
    restoreLocation(false);
  });
  const form = byId('transfer');
  const feedback = byId('feedback');
  const worked = byId('worked');
  const hintBtn = byId('hint-btn');
  const hintBox = byId('practice-hint');
  const data = JSON.parse(byId('guide-data').textContent);

  const study = AtlasStudy.create(() => localStorage);
  const statusBar = byId('study-status-bar');
  const statusNote = byId('study-status-note');
  const statusBtns = statusBar ? [...statusBar.querySelectorAll('.study-status-btn')] : [];
  function readStudy() {
    return study.read();
  }
  function writeStudy(next) {
    return study.write(next);
  }
  function paintStatus(status, msg = '') {
    for (const btn of statusBtns) {
      btn.setAttribute('aria-pressed', String(btn.dataset.studyStatus === status));
    }
    if (statusNote && msg) statusNote.textContent = msg;
  }
  function syncStudyProgress(step, docked) {
    if (!data.key || !statusBar) return;
    statusBar.hidden = false;
    const store = readStudy();
    store.units ||= {};
    const prev = store.units[data.key] || {};
    const nextStatus = Object.hasOwn(prev, 'status') ? prev.status : (docked ? 'seen' : '');
    store.units[data.key] = { ...prev, status: nextStatus, stepId: step.id, updatedAt: Date.now() };
    store.last = {
      key: data.key, label: data.label, title: data.title,
      url: data.url, stepId: step.id,
      stepTitle: step.querySelector('.guided-step-title')?.textContent?.trim() || data.title,
      updatedAt: Date.now()
    };
    const saved = writeStudy(store);
    paintStatus(nextStatus, saved ? '' : '本地存储受限：记录仅保留在当前页。');
    for (const link of document.querySelectorAll('a[data-review-route]')) {
      link.dataset.baseHref ||= link.getAttribute('href');
      const url = new URL(link.dataset.baseHref, location.href);
      const reviewFrom = new URL(location.href).searchParams.get('reviewFrom');
      if (reviewFrom && /^review-\d+\.html#[\w.-]+$/.test(reviewFrom) && url.pathname.endsWith('/' + reviewFrom.split('#')[0])) url.hash = reviewFrom.split('#')[1];
      url.searchParams.set('returnTo', data.url + '#' + step.id);
      link.href = url.href;
    }
  }
  if (statusBar && data.key) {
    statusBar.hidden = false;
    const initStore = readStudy();
    paintStatus(initStore?.units?.[data.key]?.status || '');
    for (const btn of statusBtns) {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.studyStatus;
        const store = readStudy();
        if (!store) { paintStatus('', '当前浏览器无法写入本地存储'); return; }
        store.units ||= {};
        const prev = store.units[data.key] || {};
        const nextStatus = prev.status === chosen ? '' : chosen;
        store.units[data.key] = { ...prev, status: nextStatus, stepId: current?.id || 'given-start', updatedAt: Date.now() };
        const ok = writeStudy(store);
        paintStatus(nextStatus, ok ? (nextStatus ? '已保存在本机' : '已清除本节标记') : '保存失败（存储空间不足或已禁用）');
      });
    }
  }

  restoreLocation(false);

  function markExposure(kind) {
    const record = readStudy();
    record.practice[data.key] = AtlasStudy.exposure(record.practice[data.key], kind);
    writeStudy(record);
  }
  form.querySelector('[type="submit"]').hidden = false;
  if (hintBtn && data.hint) {
    hintBtn.hidden = false;
    hintBtn.addEventListener('click', () => {
      if (!hintBox) return;
      const show = hintBox.hidden;
      hintBox.hidden = !show;
      if (show) {
        markExposure('hintViewed');
        hintBox.innerHTML = '<strong>思考提示：</strong>' + data.hint;
      }
      hintBtn.textContent = show ? '收起提示' : '只看提示（先不看答案）';
    });
  }
  form.addEventListener('change', () => { feedback.replaceChildren(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const choice = form.querySelector('input:checked');
    if (!choice) {
      feedback.textContent = '先选一个答案，再点核对；拿不准可先看提示或展开做法。';
      form.querySelector('input').focus();
      return;
    }
    const idx = Number(choice.value);
    if (worked.open) markExposure('answerViewed');
    worked.open = false;
    const ok = idx === data.correct;
    // Record the first attempt once; a later correction never overwrites it.
    const record = readStudy();
    const attempt = AtlasStudy.attempt(record.practice[data.key], idx, ok);
    record.practice[data.key] = attempt;
    const attempts = attempt.attempts;
    // Independent completion is a user-controlled label, never inferred from a click.
    if (ok) record.units[data.key] = {...record.units[data.key], practiced: true, updatedAt: Date.now()};
    writeStudy(record);
    if (ok) {
      const badge = '（' + AtlasStudy.verdict(attempt) + '）';
      feedback.innerHTML = '<strong>这次判断对了' + badge + '。</strong> ' + data.explain;
      return;
    }
    const specific = data.wrongReasons?.[idx] || '';
    const pickedText = data.choices?.[idx] || ('第 ' + (idx + 1) + ' 项');
    const detail = specific || ('所选「' + pickedText + '」与本节约束不符：' + (data.hint || '请先对照上方高亮条件逐项重算，再选一次。'));
    feedback.innerHTML = '<strong>再核对一下这一步（第 ' + attempts + ' 次尝试）。</strong>' + detail + '<br><span class="retry-cue">已暂不展开参考答案——先按上面线索重选一次，确实卡住再点下方“看做法”。</span>';
  });
  worked.addEventListener('toggle', () => {
    byId('reveal').textContent = worked.open ? '收起做法' : '看做法';
    if (worked.open) { markExposure('answerViewed'); feedback.replaceChildren(); }
  });

  const shareBar = byId('step-share-bar');
  const shareStatus = byId('share-status');
  const issueExt = shareBar?.querySelector('[data-issue-link]');
  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text).then(() => true, () => false);
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return Promise.resolve(ok);
    } catch { return Promise.resolve(false); }
  }
  function stepUrl() {
    const hash = '#' + (current?.id || 'given');
    return (location.protocol === 'file:' ? new URL(data.url, 'https://microeconomics-atlas-mingze.synb636.chatgpt.site/').href : location.href.split('#')[0]) + hash;
  }
  if (shareBar) {
    shareBar.hidden = false;
    shareBar.querySelector('[data-copy-step]')?.addEventListener('click', async () => {
      const url = stepUrl();
      const ok = await copyText(url);
      if (shareStatus) shareStatus.textContent = ok ? '已复制本步直达链接：' + url.split('#')[1] : '请手动复制地址栏链接（包含 #' + (current?.id || 'given') + '）';
    });
    shareBar.querySelector('[data-copy-issue]')?.addEventListener('click', async () => {
      const stepId = current?.id || 'given';
      const stepTitle = current?.querySelector('.guided-step-title')?.textContent?.trim() || data.title;
      const body = [
        '- 单元：' + data.label + ' · ' + data.title,
        '- 页面位置：' + data.url + '#' + stepId + '（' + stepTitle + '）',
        '- 视口与动效：' + innerWidth + '×' + innerHeight + '，reducedMotion=' + isReduced(),
        '- 问题描述：[请补充你看到的公式 / 数值 / 排版异常]'
      ].join('\n');
      const ok = await copyText(body);
      if (issueExt && data.github) {
        issueExt.href = data.github + '/issues/new?title=' + encodeURIComponent('[体验/勘误] ' + data.label + ' #' + stepId) + '&body=' + encodeURIComponent(body);
        issueExt.hidden = false;
      }
      if (shareStatus) shareStatus.textContent = ok ? '已复制纠错模板（无本地隐私路径，可直接粘贴）' : '已生成反馈模板（点击右侧链接可手动提交）';
    });
  }
})();
