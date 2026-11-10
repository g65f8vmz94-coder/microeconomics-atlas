'use strict';
// Exercise the *browser* decoder on every distinct asset embedded in our offline HTML.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {gunzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const vendor=fs.readFileSync(path.join(__dirname,'src/vendor/fflate/gunzip.min.js'),'utf8');
const env={window:{},TextDecoder};
vm.runInNewContext(vendor,env);
const seen=new Set();
const base=path.join(__dirname,'dist/downloads');
let pages=0;
for(const filename of fs.readdirSync(base).filter(p=>p.endsWith('.html'))){
  const html=fs.readFileSync(path.join(base,filename),'utf8');
  assert.ok(html.includes(vendor),filename+' missing embedded reader');
  const blocks=[...html.matchAll(/<script type="text\/plain" id="([^"]+-gzip)">([^<]+)<\/script>/g)];
  assert.ok(blocks.some(m=>m[1]==='atlas-style-gzip')&&blocks.some(m=>m[1]==='katex-gzip'),filename+' missing payload');
  for(const [,,encoded] of blocks){
    const digest=createHash('sha256').update(encoded).digest('hex');
    if(seen.has(digest))continue;
    const bytes=Buffer.from(encoded,'base64');
    assert.equal(env.window.atlasUnpack(new Uint8Array(bytes)),gunzipSync(bytes).toString('utf8'),filename);
    seen.add(digest);
  }
  pages++;
}
console.log('Verified browser decompression in '+pages+' standalone pages, '+seen.size+' distinct assets.');
