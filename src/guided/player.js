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

  const desk = flow.parentElement;
  const card = desk.querySelector('.condition-card');
  const conditions = byId('condition-text');
  const sizeButton = card.querySelector('.condition-size');
  const narrow = matchMedia('(max-width:799px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let cardMotion;
  function owner(id) {
    const element = byId(id);
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
  // Measure natural reflow (including font and viewport changes) for anchor offsets.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measureCard);
    observer.observe(card);
    observer.observe(conditions.firstElementChild);
  }
  function stopMotion() { cardMotion?.cancel(); }
  reduced.addEventListener('change', stopMotion);
  narrow.addEventListener('change', () => {stopMotion(); measureCard();});
  new MutationObserver(stopMotion).observe(document.documentElement, {attributes:true, attributeFilter:['data-motion']});
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
    const docked = step !== steps[0];
    const crossing = !!current && docked !== desk.hasAttribute('data-docked');
    const before = crossing ? card.getBoundingClientRect() : null;
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
    measureCard();
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
