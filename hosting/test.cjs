'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const input=path.resolve(process.argv[2]||path.join(__dirname,'../dist'));
const output=path.resolve(process.argv[3]||path.join(__dirname,'../hosting-dist'));
(async()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(output,'verification.json')));
 const start=performance.now();const {default:worker}=await import('data:text/javascript;base64,'+fs.readFileSync(path.join(output,'server/index.js')).toString('base64'));
 const loadMs=performance.now()-start;let count=0;
 for(const [key,meta]of Object.entries(manifest.files)){
  const r=await worker.fetch(new Request('https://atlas.test/'+key+'?state=retained'));
  assert.equal(r.status,200,key);assert.equal(r.headers.get('content-type'),meta.type,key);
  const body=Buffer.from(await r.arrayBuffer());assert.ok(body.equals(fs.readFileSync(path.join(input,key))),key);
  assert.equal(crypto.createHash('sha256').update(body).digest('hex'),meta.sha256,key);count++;
 }
 for(const key of ['index.html','learn-s10-6.html','learn-s13-3.html','downloads/lesson-10-6.html']){
  const exact=await worker.fetch(new Request('https://atlas.test/'+key));
  const conditional=await worker.fetch(new Request('https://atlas.test/'+key,{headers:{'if-none-match':exact.headers.get('etag')}}));assert.equal(conditional.status,304);
  const head=await worker.fetch(new Request('https://atlas.test/'+key,{method:'HEAD'}));assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);assert.equal(Number(head.headers.get('content-length')),manifest.files[key].bytes);
  const alias=await worker.fetch(new Request('https://atlas.test/'+key.replace(/\.html$/,'')+'?case=unchanged'));assert.equal(alias.status,200);
  assert.ok(Buffer.from(await alias.arrayBuffer()).equals(fs.readFileSync(path.join(input,key))));
  await exact.body.cancel();
 }
 assert.equal((await worker.fetch(new Request('https://atlas.test/'))).status,200);
 for(const p of ['/absent','.env','/.openai/hosting.json','/__proto__','/%2e%2e%2f.env'])assert.equal((await worker.fetch(new Request('https://atlas.test/'+p.replace(/^\//,'')))).status,404,p);
 assert.equal((await worker.fetch(new Request('https://atlas.test/%zz'))).status,400);
 assert.equal((await worker.fetch(new Request('https://atlas.test/',{method:'POST'}))).status,405);
 const trailing=await worker.fetch(new Request('https://atlas.test/learn-s10-6/?case=test'));assert.equal(trailing.status,308);assert.equal(trailing.headers.get('location'),'https://atlas.test/learn-s10-6?case=test');
 const results={files:count,byteMismatches:0,loadMs:Math.round(loadMs),aliases:true,queries:true,head:true,conditionalRequests:true,notFound:true,passed:true};
 fs.writeFileSync(path.join(output,'test-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exitCode=1;});
