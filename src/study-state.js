(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AtlasStudy = api;
})(typeof window === 'object' ? window : globalThis, function() {
  const KEY = 'micro-atlas-study-v1', LEGACY_KEY = 'micro-atlas-progress-v1';
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function migrate(value, legacy) {
    const store = object(value) ? value : {};
    store.units = object(store.units) ? store.units : {};
    store.practice = object(store.practice) ? store.practice : {};
    if (store.legacyMigrated !== 1) {
      for (const [id, row] of Object.entries(object(legacy) ? legacy : {})) {
        if (!/^\d+\.\d+$/.test(id) || !object(row)) continue;
        const key = 's' + id;
        if (Object.hasOwn(store.units, key)) continue;
        if (row.practiced || row.opened) store.units[key] = {
          status: row.practiced ? 'done' : 'seen', practiced: !!row.practiced,
          provenance: 'classic-user-record'
        };
      }
      store.legacyMigrated = 1;
    }
    store.version = 2;
    return store;
  }
  function exposure(previous, kind) {
    return {...previous, [kind]: true, updatedAt: Date.now()};
  }
  function attempt(previous, choice, correct) {
    const p = object(previous) ? previous : {};
    const first = !Number.isInteger(p.firstChoice);
    return {...p, firstCorrect: first ? correct : p.firstCorrect,
      firstChoice: first ? choice : p.firstChoice,
      firstIndependent: first ? !(p.hintViewed || p.answerViewed) : (p.firstIndependent ?? false),
      attempts: (p.attempts || 0) + 1, resolved: correct || !!p.resolved,
      lastCorrect: correct, updatedAt: Date.now()};
  }
  function verdict(p) {
    if (p.firstCorrect === false) return '订正后通过';
    if (p.answerViewed) return '看过做法后通过';
    if (p.hintViewed) return '参考提示后通过';
    return p.attempts === 1 ? '首次作答正确' : '再次核对正确';
  }
  function create(storage) {
    let memory = migrate({}, {}), available = true;
    function write(value) {
      memory = value;
      try { storage().setItem(KEY, JSON.stringify(value)); available = true; return true; }
      catch { available = false; return false; }
    }
    function read() {
      if (!available) return memory;
      try {
        const s = storage(), raw = s.getItem(KEY), parsed = raw ? JSON.parse(raw) : {};
        let legacy = {};
        try { legacy = JSON.parse(s.getItem(LEGACY_KEY) || '{}'); } catch {}
        const needsMigration = !object(parsed) || parsed.legacyMigrated !== 1;
        memory = migrate(parsed, legacy); available = true;
        if (needsMigration) write(memory);
      } catch { available = false; }
      return memory;
    }
    function clear() {
      memory = migrate({}, {});
      try { const s = storage(); s.removeItem(KEY); s.removeItem(LEGACY_KEY); available = true; return true; }
      catch { available = false; return false; }
    }
    return {read, write, clear, get available() { return available; }};
  }
  return {KEY, LEGACY_KEY, migrate, attempt, exposure, verdict, create};
});
