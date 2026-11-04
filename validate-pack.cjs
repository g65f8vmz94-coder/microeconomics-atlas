const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'dist'),files=[];function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);e.isDirectory()?walk(q):files.push(q)}}walk(root);
let links=0,totalBytes=0;const missing=[],privatePaths=[],maxExpandedBytes=256*1024*1024;
for(const file of files){
 totalBytes+=fs.statSync(file).size;
 assert.ok(!/\.(pdf|pptx?|docx?)$/i.test(file),'Private originals must not be published');
 if(!/\.(html|js|mjs|json|css|txt|ts)$/.test(file))continue;
 const text=fs.readFileSync(file,'utf8');if(/\/Users\/|\/Volumes\/|file:\/\/|sourcePath|originalPath/.test(text))privatePaths.push(path.relative(root,file));
 if(!file.endsWith('.html'))continue;
 // Inspect actual HTML attributes, not string literals inside bundled scripts.
 const markup=text.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi,'$1</script>');
 for(const [,raw] of markup.matchAll(/(?:href|src)="([^"<>]+)"/g)){
  if(/^(https?:|data:|mailto:|#)/.test(raw)||/[${}]/.test(raw))continue;
  const ref=decodeURIComponent(raw.split('#')[0].split('?')[0]);if(!ref)continue;links++;
  if(!fs.existsSync(path.resolve(path.dirname(file),ref)))missing.push({file:path.relative(root,file),ref});
 }
}
assert.equal(missing.length,0,JSON.stringify(missing));assert.equal(privatePaths.length,0,JSON.stringify(privatePaths));assert.ok(totalBytes<maxExpandedBytes,`dist expanded size ${totalBytes} exceeds 256 MiB limit (${maxExpandedBytes})`);
const r={files:files.length,totalBytes,totalMiB:Number((totalBytes/(1024*1024)).toFixed(2)),maxExpandedBytes,localLinks:links,missing,privatePaths,passed:true};fs.mkdirSync(__dirname+'/qa',{recursive:true});fs.writeFileSync(__dirname+'/qa/pack.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r));
