'use strict';
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.ts':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function paths(root) {
  return fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>{
    if(e.name.startsWith('.'))return [];
    const p=path.join(root,e.name);
    if(e.isSymbolicLink()||!e.isDirectory()&&!e.isFile())throw Error('Only regular static files may be packed: '+p);
    return e.isDirectory()?paths(p):[p];
  });
}
function build(input,output) {
  input=fs.realpathSync(input);output=path.resolve(output);
  if(output===input||output.startsWith(input+path.sep)||input.startsWith(output+path.sep))throw Error('Use a separate output directory');
  if(fs.existsSync(output)&&!fs.existsSync(path.join(output,'.micro-hosting-generated')))throw Error('Refusing to replace a directory not created by this builder');
  const blocks=[],byHash=new Map(),files={};let originalBytes=0,uniqueBytes=0;
  for(const filename of paths(input)) {
    const key=path.relative(input,filename).split(path.sep).join('/'),buffer=fs.readFileSync(filename);
    const ext=path.extname(filename);if(!types[ext])throw Error('Declare MIME type for '+key);
    let pieces=[buffer];
    if(ext==='.html'){
      const text=buffer.toString('utf8');if(!Buffer.from(text).equals(buffer))throw Error('Invalid UTF-8 HTML: '+key);
      pieces=text.split(/(?=<script\b)|(?<=<\/script>)|(?=<style\b)|(?<=<\/style>)/g).filter(Boolean).map(s=>Buffer.from(s));
    }
    const parts=pieces.map(b=>{
      const sha=hash(b);if(byHash.has(sha))return byHash.get(sha);
      const id=blocks.length;blocks.push(zlib.gzipSync(b,{level:9}).toString('base64'));byHash.set(sha,id);uniqueBytes+=b.length;return id;
    });
    const restored=Buffer.concat(parts.map(i=>zlib.gunzipSync(Buffer.from(blocks[i],'base64'))));
    if(!restored.equals(buffer))throw Error('Byte reconstruction mismatch: '+key);
    files[key]={type:types[ext],bytes:buffer.length,sha256:hash(buffer),parts};originalBytes+=buffer.length;
  }
  if(!files['index.html'])throw Error('Missing index.html');
  const runtime=fs.readFileSync(path.join(__dirname,'worker.mjs'),'utf8');
  const source=runtime+'\nconst files='+JSON.stringify(files)+';\nconst blocks='+JSON.stringify(blocks)+';\nexport default createHandler(files, blocks);\n';
  const sourceBytes=Buffer.byteLength(source),gzipBytes=zlib.gzipSync(source,{level:9}).length;
  if(sourceBytes>64*1024*1024)throw Error('Worker exceeds the current 64 MiB source limit');
  fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(path.join(output,'server'),{recursive:true});
  fs.writeFileSync(path.join(output,'.micro-hosting-generated'),'Lossless hosting output; rebuild from hosting/build.cjs.\n');
  fs.writeFileSync(path.join(output,'server/index.js'),source);
  const report={files:Object.keys(files).length,originalBytes,uniqueBlocks:blocks.length,uniqueBytes,workerBytes:sourceBytes,workerGzipBytes:gzipBytes,byteMismatches:0};
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({summary:report,files},null,2)+'\n');
  return report;
}
module.exports={build,paths};
if(require.main===module){
  const input=process.argv[2]||path.join(__dirname,'../dist'),output=process.argv[3]||path.join(__dirname,'../hosting-dist');
  console.log(JSON.stringify(build(input,output)));
}
