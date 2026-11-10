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
  const steps = Array.from(flow.children);
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

  const owner = id => byId(id)?.closest('.guided-step');
  const firstUnread = () => reasoning.find(step => !seen.has(step.id));
  function locationId() {
    const url = new URL(location.href);
    const hash = url.hash.slice(1);
    const sceneAnchor = ['', 'scene', 'scene-title', 'scene-why'].includes(hash);
    const old = Number(url.searchParams.get('step'));
    if (sceneAnchor && url.searchParams.has('step') && Number.isInteger(old)) {
      return scenes[Math.min(Math.max(old, 1), scenes.length) - 1].id;
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
    let id = requested;
    let step = owner(id) || steps[0];
    const missing = paper && step === paper && firstUnread();
    if (missing) {
      id = missing.id;
      step = missing;
    }
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
      previous.href = firstUnread() ? '#' + firstUnread().id : '#answer';
      previous.textContent = firstUnread() ? '回顾推理' : '← 上一步';
    }
    if (current !== step) {
      for (const panel of steps) {
        panel.hidden = panel !== step;
        panel.classList.toggle('is-current', panel === step);
      }
      current = step;
    }
    flow.dataset.interactive = '';
    writeHistory(method, id, restore && !missing);
    if (focus) {
      const target = byId(id);
      // A figure comparison from the paper can return to a specific row.
      const sourceLink = Number.isFinite(backTop) && target?.querySelector('[data-compare-from]');
      if (sourceLink) {
        sourceLink.focus({preventScroll: true});
        window.scrollBy({top: sourceLink.getBoundingClientRect().top - backTop, behavior: 'instant'});
        return;
      }
      const destination = target?.classList.contains('guided-answer-row') ? target : step;
      destination.focus({preventScroll: true});
      const bounds = destination.getBoundingClientRect();
      if (bounds.top < 0 || bounds.top > innerHeight / 2) {
        destination.scrollIntoView({block: 'start', behavior: 'instant'});
      }
    }
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
  restoreLocation(false);

  const form = byId('transfer');
  const feedback = byId('feedback');
  const worked = byId('worked');
  const data = JSON.parse(byId('guide-data').textContent);
  form.querySelector('[type="submit"]').hidden = false;
  form.addEventListener('change', () => { feedback.replaceChildren(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const choice = form.querySelector('input:checked');
    if (!choice) {
      feedback.textContent = '先选一个答案，或展开做法。';
      form.querySelector('input').focus();
      return;
    }
    worked.open = false;
    const verdict = Number(choice.value) === data.correct ? '这次判断对了。' : '再核对一下条件。';
    feedback.innerHTML = '<strong>' + verdict + '</strong> ' + data.explain;
  });
  worked.addEventListener('toggle', () => {
    byId('reveal').textContent = worked.open ? '收起做法' : '看做法';
    if (worked.open) feedback.replaceChildren();
  });
})();
