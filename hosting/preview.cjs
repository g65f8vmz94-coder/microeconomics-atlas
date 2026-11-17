'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {Readable}=require('node:stream');
(async()=>{
 const dir=path.resolve(process.argv[2]||path.join(__dirname,'../hosting-dist'));
 const {default:worker}=await import('data:text/javascript;base64,'+fs.readFileSync(path.join(dir,'server/index.js')).toString('base64'));
 const server=http.createServer(async(req,res)=>{
  try{
   const response=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:req.method,headers:req.headers}));
   res.writeHead(response.status,Object.fromEntries(response.headers));
   if(response.body)Readable.fromWeb(response.body).pipe(res);else res.end();
  }catch(e){console.error(e);res.writeHead(500).end('Preview error');}
 });
 server.listen(Number(process.argv[3]||8799),'127.0.0.1',()=>console.log('http://127.0.0.1:'+server.address().port));
})().catch(e=>{console.error(e);process.exitCode=1;});
