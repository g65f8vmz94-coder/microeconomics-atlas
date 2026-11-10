'use strict';

const css = `
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }
}
@keyframes atlas-enter {
  from { opacity: 0; transform: translateX(var(--atlas-in, 10px)); }
}
@keyframes atlas-leave {
  to { opacity: 0; transform: translateX(var(--atlas-out, -8px)); }
}
:root:active-view-transition-type(atlas-back) {
  --atlas-in: -10px;
  --atlas-out: 8px;
}
::view-transition { background: var(--paper, #f8f7f1); }
::view-transition-group(root) { animation-duration: 210ms; }
::view-transition-old(root) { animation: atlas-leave 85ms ease-out both; }
::view-transition-new(root) { animation: atlas-enter 125ms ease-out 85ms both; }
[data-atlas-route-title] { view-transition-name: atlas-route-title; }
h1[data-atlas-route-title], h2[data-atlas-route-title], h3[data-atlas-route-title] {
  width: fit-content; max-width: 100%;
}
strong[data-atlas-route-title], a[data-atlas-route-title]:not(.home-open), span[data-atlas-route-title] {
  display: inline-block; max-width: 100%;
}
[data-atlas-route-title="cover"] { view-transition-name: atlas-cover-entry; }
::view-transition-group(atlas-cover-entry),
::view-transition-group(atlas-route-title) {
  animation-duration: 230ms;
  animation-timing-function: ease-out;
}
/* Hand off a paired title at one position without blending different glyph sizes. */
::view-transition-old(atlas-route-title),
::view-transition-new(atlas-route-title) {
  animation-duration: 85ms; animation-timing-function: step-end; animation-fill-mode: both;
}
/* Move the cover snapshot pair together, while each text keeps its own size. */
::view-transition-old(atlas-cover-entry), ::view-transition-new(atlas-cover-entry) {
  width: auto; height: auto; max-width: none; max-height: none;
  object-fit: none; object-position: left top; mix-blend-mode: normal; animation-fill-mode: both;
}
::view-transition-old(atlas-cover-entry) { animation-duration: 105ms; }
::view-transition-new(atlas-cover-entry) {
  animation-duration: 145ms; animation-delay: 70ms;
}
`;

// Serialized as a classic head script so pagereveal is registered before first paint.
function install() {
  const root = document.documentElement;
  const mark = 'data-atlas-route-title';
  let marked;
  let revision = 0;

  function reduced() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches ||
        root.dataset.motion === 'reduced' || window.microMotion?.reduced.matches) return true;
    try { return localStorage.getItem('micro-motion-preference') === 'reduce'; }
    catch { return false; }
  }

  function route(href) {
    if (!href) return;
    const url = new URL(href, location.href);
    if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return;
    const path = url.pathname.replace(/\.html\/?$/i, '').replace(/\/$/, '');
    const slash = path.lastIndexOf('/');
    const slug = path.slice(slash + 1);
    const chapter = /^learn-(\d+)$/.exec(slug);
    const unit = /^(?:learn-[sp]|lesson-)(\d+)-\d+$/.exec(slug);
    const insurance = slug === 'insurance-3-9';
    if (chapter || unit || insurance || /^(index|about|exercises|learn)$/.test(slug)) {
      return { base: path.slice(0, slash + 1), slug, depth: chapter ? 1 : unit || insurance ? 2 : 0,
        chapter: Number((chapter || unit)?.[1] || (insurance ? 3 : 0)) };
    }
    if (url.pathname.endsWith('/')) return { base: url.pathname, slug: 'index', depth: 0 };
  }

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight &&
      r.right > 0 && r.left < innerWidth;
  }

  function listingTitle(target, cover) {
    const selector = cover ? 'a.home-open' : '.chapter-card,.unit-row,a.lesson-row,.section-heading a,' +
      '.lesson-row h3 a,.situation-list a,#matches a';
    for (const link of document.querySelectorAll(selector)) {
      if (link.target && link.target !== '_self' || link.hasAttribute('download')) continue;
      const dest = route(link.href);
      if (dest?.base !== target.base || dest.slug !== target.slug) continue;
      const title = cover ? link : link.querySelector('strong,h3') || link.closest('.section-heading')?.querySelector('h2') ||
        link.querySelector('span:last-child') || link;
      if (visible(title)) return title;
    }
  }

  function clear() {
    marked?.removeAttribute(mark);
    marked = undefined;
  }

  function prepare(event, outgoing) {
    const token = ++revision;
    clear();
    const transition = event.viewTransition;
    if (!transition) return;
    const nav = outgoing ? event.activation : window.navigation?.activation;
    const from = route(nav?.from?.url);
    const to = route(nav?.entry?.url);
    if (reduced() || !from || !to || from.base !== to.base ||
        from.slug === to.slug || nav.navigationType === 'reload') {
      transition.skipTransition();
      return;
    }
    const cover = (from.slug === 'index' && to.slug === 'learn') ||
      (from.slug === 'learn' && to.slug === 'index');
    const back = nav.navigationType === 'traverse'
      ? nav.entry.index < nav.from.index : to.depth < from.depth || (cover && to.slug === 'index');
    if (back) transition.types?.add('atlas-back');

    const list = cover ? (from.slug === 'index' ? from : to) : (from.depth < to.depth ? from : to);
    const detail = list === from ? to : from;
    if ((!cover && detail.depth === list.depth) || list.slug === 'about' ||
        (list.chapter && list.chapter !== detail.chapter)) return;
    const here = outgoing ? from : to;
    const title = here === list ? listingTitle(detail, cover) : document.querySelector('h1');
    if (!visible(title)) return;
    marked = title;
    title.setAttribute(mark, cover ? 'cover' : 'title');
    // A restored document can begin another transition before the old promise settles.
    const release = () => { if (revision === token) clear(); };
    transition.finished.then(release, release);
  }

  addEventListener('pageswap', event => prepare(event, true));
  addEventListener('pagereveal', event => prepare(event, false));
}

function compactLines(source) {
  return source.split('\n')
    .map(line => line.trimStart())
    .filter(line => line && !line.startsWith('//') && line.replace(/^\/\*.*?\*\//, '').trim())
    .join('\n');
}

function head() {
  return '<style>' + compactLines(css) + '</style><script>(' +
    compactLines(install.toString()) + ')();</script>';
}

module.exports = { head };
