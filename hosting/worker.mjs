// Reassemble the original static response from shared, lossless gzip blocks.
// No lesson content or browser-side behavior is generated at request time.
export function createHandler(files, blocks) {
  const decoded = new Map();
  let cachedBytes = 0;
  const cacheLimit = 4 * 1024 * 1024;
  function compressedBlock(id) {
    if (decoded.has(id)) {
      const value = decoded.get(id);
      decoded.delete(id); decoded.set(id, value);
      return value;
    }
    const text = atob(blocks[id]), bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
    decoded.set(id, bytes); cachedBytes += bytes.length;
    while (cachedBytes > cacheLimit && decoded.size > 1) {
      const first = decoded.keys().next().value;
      cachedBytes -= decoded.get(first).length; decoded.delete(first);
    }
    return bytes;
  }
  function body(parts) {
    let index = 0, reader = null, cancelled = false;
    return new ReadableStream({
      async pull(controller) {
        while (true) {
          if (cancelled) return;
          if (!reader) {
            if (index === parts.length) { controller.close(); return; }
            reader = new Response(compressedBlock(parts[index++])).body
              .pipeThrough(new DecompressionStream('gzip')).getReader();
          }
          const next = await reader.read();
          if (cancelled) return;
          if (!next.done) { controller.enqueue(next.value); return; }
          reader.releaseLock(); reader = null;
        }
      },
      async cancel(reason) { cancelled = true; if (reader) await reader.cancel(reason); }
    });
  }
  return {
    async fetch(request) {
      if (!['GET', 'HEAD'].includes(request.method))
        return new Response('Method not allowed', {status:405, headers:{allow:'GET, HEAD'}});
      const url = new URL(request.url);
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); }
      catch { return new Response('Invalid URL', {status:400}); }
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(x => x === '..' || x === '.'))
        return new Response('Not found', {status:404});
      let key = pathname.slice(1);
      if (!key || key.endsWith('/')) {
        const index = key + 'index.html';
        if (Object.hasOwn(files, index)) key = index;
        else if (key.endsWith('/') && Object.hasOwn(files, key.slice(0, -1) + '.html')) {
          url.pathname = url.pathname.replace(/\/$/, '');
          return new Response(null, {status:308, headers:{location:url.href}});
        }
      }
      if (!Object.hasOwn(files, key) && Object.hasOwn(files, key + '.html')) key += '.html';
      if (!Object.hasOwn(files, key)) return new Response('Not found', {status:404});
      const file = files[key], etag = '"' + file.sha256 + '"';
      const headers = {
        'content-type':file.type, 'content-length':String(file.bytes),
        'cache-control':'public, max-age=0, must-revalidate',
        'etag':etag, 'x-content-type-options':'nosniff'
      };
      const matches = request.headers.get('if-none-match');
      if (matches && matches.split(',').some(s => s.trim().replace(/^W\//, '') === etag || s.trim() === '*')) {
        delete headers['content-length'];
        return new Response(null, {status:304, headers});
      }
      return new Response(request.method === 'HEAD' ? null : body(file.parts), {headers});
    }
  };
}
