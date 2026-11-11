// The papers, their pigment and the final illustration all share viewport coordinates.
(() => {
  'use strict';
  const film=document.querySelector('.market-film');
  if(!film)return;
  const screen=film.querySelector('canvas'),ctx=screen.getContext('2d');
  const stage=document.querySelector('[data-atlas-cover]');
  const replay=stage.querySelector('.reel-replay'),skip=film.querySelector('.reel-skip'),full=film.querySelector('.reel-full');
  const scene=stage.querySelector('.market-scene img');
  const quiet=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const key='atlas-market-prologue-wallpaper';
  const first=[680,1910],second=[2530,3990],flipStart=4700;
  const plates=JSON.parse(film.querySelector('[data-book-plates]').textContent);
  const sheets=new Map(),artCache=new Map(),turnEnds=[];
  const firstTurnMs=300,lastTurnMs=95;
  let elapsed=flipStart;
  for(let i=0;i<=plates.length;i++){
    elapsed+=firstTurnMs*Math.pow(lastTurnMs/firstTurnMs,i/plates.length);
    turnEnds.push(elapsed);
  }
  const marketStart=turnEnds.at(-1),end=marketStart+1750;
  const clamp=n=>Math.max(0,Math.min(1,n)),phase=(t,a,b)=>clamp((t-a)/(b-a));
  const ease=x=>x*x*(3-2*x),mix=(a,b,k)=>a+(b-a)*k,TAU=2*Math.PI;
  const serif='Georgia,"Songti SC",STSong,serif',sans='"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif';
  const mono='"SFMono-Regular",Menlo,monospace';
  let W=0,H=0,ratio=1,mobile=false,active=false,serial=0,frame=0,started=0,manual=false;
  let originals=[],editions=[],coverSheet,verso,boot,market,grains,sceneBox;
  let targetX=0,targetY=0,lookX=0,lookY=0,ownsFullscreen=false;
  function reduced(){
    try {if(localStorage.getItem('micro-motion-preference')==='reduce')return true;} catch {}
    return quiet.matches||document.documentElement.dataset.motion==='reduced';
  }
  function surface(w=W,h=H,scale=ratio){
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    const c=canvas.getContext('2d');c.scale(canvas.width/w,canvas.height/h);
    return {canvas,c};
  }
  function line(c,x,y,xx,yy,color,width=1){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();
  }
  function text(c,s,x,y,size,family,colour,weight='400'){
    c.font=weight+' '+size+'px '+family;c.fillStyle=colour;c.fillText(s,x,y);
  }
  function fit(c,lines,space,cap,family,weight){
    c.font=weight+' 100px '+family;
    return Math.min(cap,space*100/Math.max(...lines.map(s=>c.measureText(s).width)));
  }
  function crop(c,im,sx,sy,sw,sh,x,y,w,h){
    const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
    let cw=iw*sw,ch=ih*sh;
    const factor=Math.max(w/cw,h/ch), sourceW=w/factor,sourceH=h/factor;
    c.drawImage(im,sx*iw+(cw-sourceW)/2,sy*ih+(ch-sourceH)/2,sourceW,sourceH,x,y,w,h);
  }
  function trim(c,dark=false) {
    const x=Math.max(10,W*.019),y=Math.max(11,H*.023);
    c.strokeStyle=dark?'#dcebe449':'#282e3150';c.lineWidth=.8;c.strokeRect(x,y,W-2*x,H-2*y);
    const len=mobile?12:20;
    for(const ax of [x,W-x])for(const ay of [y,H-y]){
      const dx=ax===x?1:-1,dy=ay===y?1:-1;
      line(c,ax,ay,ax+dx*len,ay,dark?'#f1dbba':'#303638',1.6);
      line(c,ax,ay,ax,ay+dy*len,dark?'#f1dbba':'#303638',1.6);
    }
  }
  function edition(n){
    const en=n===0,background=surface(),type=surface(),c=background.c,ink=type.c;
    const m=W*(mobile?.085:.067),im=originals[n];
    c.fillStyle=en?'#d7e4e4':'#f4cf43';c.fillRect(0,0,W,H);
    // Full-bleed macro photographs of the two actual jackets. Their titles
    // are set separately so the viewport can crop texture without cutting words.
    if(im) {
      if(en)crop(c,im,.41,.46,.53,.48,0,0,W,H);
      else crop(c,im,.72,.024,.23,.40,0,0,W,H);
    } else {
      const g=c.createLinearGradient(0,0,W,H);
      g.addColorStop(0,en?'#c9e7eb':'#ffe16d');g.addColorStop(.58,en?'#e9ccad':'#eac944');g.addColorStop(1,en?'#c9787c':'#c9a127');c.fillStyle=g;c.fillRect(0,0,W,H);
    }
    const wash=c.createLinearGradient(0,H*.3,W,H*.58);
    const stops=en?['#f1f4edfa','#f0f1e5df','#d5dedd58','#acbaba20']:['#ffe052fa','#ffdf50ed','#fbdc4f85','#ffe97926'];
    [0,.35,.69,1].forEach((v,i)=>wash.addColorStop(v,stops[i]));c.fillStyle=wash;c.fillRect(0,0,W,H);
    // Reproduce the print grid at the periphery, reserving the type's reading area.
    for(let i=1;i<12;i++){if(i>6||i===1)line(c,W*i/12,0,W*i/12,H,'#27342c13',.7);}
    for(let i=1;i<9;i++)line(c,0,H*i/9,W,H*i/9,'#27342c0c',.7);
    const fg='#172625', secondary='#3f493e';
    text(ink,'中级微观经济学',m,H*(mobile?.115:.105),mobile?15:19,sans,fg,'680');
    text(ink,en?'ENGLISH EDITION':'中文译本',m,H*(mobile?.222:.246),mobile?14:16,en?mono:sans,secondary,'570');
    line(ink,m,H*(mobile?.237:.261),m+Math.min(W*.12,110),H*(mobile?.237:.261),fg,1.4);
    const lines=en ? ['Models in','Microeconomic','Theory'] : ['微观经济','理论模型'];
    const family=en?sans:'"PingFang SC","Microsoft YaHei",sans-serif';
    const weight=en?'540':'780',space=W*(mobile?.87:.67);
    const size=fit(ink,lines,space,Math.min(W*(en?.105:.145),H*(mobile?.095:.175)),family,weight);
    const top=mobile?H*.305:H*.337;
    for(let i=0;i<lines.length;i++)text(ink,lines[i],m,top+size*(.8+i*1.025),size,family,fg,weight);
    const bottom=H-(mobile?42:54);
    line(ink,m,bottom-32,W-m,bottom-32,'#23342a55');
    text(ink,en?'Martin J. Osborne':'马丁·J. 奥斯本',m,bottom-10,mobile?13:17,en?serif:sans,fg);
    text(ink,en?'Ariel Rubinstein':'阿里尔·鲁宾斯坦',m,bottom+10,mobile?13:17,en?serif:sans,fg);
    ink.textAlign='right';text(ink,en?'Original text':'Chinese translation',W-m,bottom+5,mobile?11:14,mono,secondary);ink.textAlign='left';
    return {background:background.canvas,ink:type.canvas};
  }
  // A DSH-style, open calibration dial with independent glass, sweep and dot
  // layers. Its moving marks are decorative and carry no economic axis values.
  function dial(c,x,y,r,t,dark,lean=0){
    c.save();c.translate(x,y);c.rotate(lean);
    const accent=dark?'#f1a65c':'#ae571e',pale=dark?'#e1e8d055':'#27372f5a',main=dark?'#badbd6b8':'#283d35a8';
    const angle=t*.00045;
    for(const [rr,a,b,col,lw] of [[1,-2.83,2.18,main,1.3],[.92,-1.5,3.02,pale,1],[.72,.21,5.25,pale,1],[.55,2.7,5.64,main,1.2]]){
      c.beginPath();c.strokeStyle=col;c.lineWidth=lw;c.arc(0,0,r*rr,a,b);c.stroke();
    }
    for(let i=0;i<84;i++){
      const a=i/84*TAU,major=i%7===0,rad=r*(major?.865:.903);
      line(c,Math.cos(a)*rad,Math.sin(a)*rad,Math.cos(a)*r*.93,Math.sin(a)*r*.93,major?main:pale,major?1.2:.7);
    }
    const tip=angle-1.65;
    line(c,Math.cos(tip)*r*.72,Math.sin(tip)*r*.72,Math.cos(tip)*r*.99,Math.sin(tip)*r*.99,accent,2);
    for(let i=0;i<3;i++){
      const a=angle*(i===1?-.55:.7)+i*2.04,rr=[.72,.55,1][i]*r;
      c.fillStyle=i===1?main:accent;c.beginPath();c.arc(Math.cos(a)*rr,Math.sin(a)*rr,i===1?3:4.1,0,TAU);c.fill();
    }
    line(c,-6,0,6,0,main,1);line(c,0,-6,0,6,main,1);c.restore();
  }
  function drawEdition(c,n,t,px,py) {
    const plate=editions[n],pad=6;
    c.drawImage(plate.background,-pad-px*3,-pad-py*3,W+pad*2,H+pad*2);
    const radius=mobile?Math.min(W*.34,H*.17):Math.min(W*.23,H*.36);
    const cx=W*(mobile?.65:.765)+px*12,cy=H*(mobile?.716:.51)+py*10;
    dial(c,cx,cy,radius,t,false,px*.025);
    c.drawImage(plate.ink,0,0,W,H);
    trim(c);
  }
  function night(){
    const s=surface(),c=s.c;c.fillStyle='#0a161e';c.fillRect(0,0,W,H);
    if(scene.naturalWidth){c.globalAlpha=.49;crop(c,scene,0,0,1,1,0,0,W,H);c.globalAlpha=1;}
    const veil=c.createLinearGradient(0,H*.1,W,H*.8);veil.addColorStop(0,'#071823ad');veil.addColorStop(.65,'#081d28a8');veil.addColorStop(1,'#20383e66');c.fillStyle=veil;c.fillRect(0,0,W,H);
    const horizon=H*.625;
    for(let i=-8;i<=8;i++){line(c,W*.57+i*10,horizon,W*.5+i*W*.16,H,'#c9e3d826',.9);}
    for(let i=0;i<10;i++){const y=horizon+(H-horizon)*(i/9)**2;line(c,0,y,W,y,'#c1dcd81f',.8);}
    return s.canvas;
  }
  function drawNight(t){
    ctx.drawImage(boot,-5-lookX*4,-5-lookY*4,W+10,H+10);
    // Light travels at three depths across the glass roof. It stays behind
    // the central text and continues moving when there is no pointer.
    ctx.save();ctx.translate(lookX*7,lookY*4);
    for(let k=0;k<3;k++){
      const y=H*(.23+k*.23),amp=H*(.045+k*.008);
      const at=x=>y+amp*Math.sin(x*5.4+t*.0003+k*1.4)-H*.14*x;
      ctx.beginPath();
      for(let i=0;i<=50;i++){const x=i/50;const py=at(x);if(i)ctx.lineTo(W*x,py);else ctx.moveTo(0,py);}
      ctx.strokeStyle=['#c7e5d52e','#99d9d827','#deb26f29'][k];ctx.lineWidth=.8;ctx.stroke();
      const x=(.13+k*.34+t*.00023)%1;
      ctx.fillStyle=k===1?'#eac08f':'#b9ddda';ctx.beginPath();ctx.arc(x*W,at(x),k===1?2.3:1.7,0,TAU);ctx.fill();
    }
    ctx.restore();
    const r=Math.min(W*.38,H*.36),cx=W*.5+lookX*15,cy=H*.49+lookY*11;
    dial(ctx,cx,cy,r,t,true,lookX*.035);
    ctx.textAlign='center';text(ctx,'μ',W*.5,H*.49,Math.min(H*.16,W*.22),serif,'#efe9d2','italic');
    text(ctx,'中级微观经济学',W*.5,H*.49+Math.min(H*.085,W*.12),Math.min(W*.084,H*.078),sans,'#f8f1dc','600');ctx.textAlign='left';
    trim(ctx,true);
  }
  function pigmentField(){
    const colors=originals.map((im,n)=>{
      const s=surface(496,620,1),c=s.c;
      c.drawImage(im||editions[n].background,0,0,496,620);
      return c.getImageData(0,0,496,620).data;
    });
    const cols=496,rows=620,count=cols*rows;
    const scatter=new Float32Array(count),rise=new Float32Array(count),seed=new Float32Array(count);
    const bands=new Float32Array(rows),tints=colors.map(()=>new Uint32Array(count));
    let rand=7729;
    function next(){rand^=rand<<13;rand^=rand>>>17;rand^=rand<<5;return (rand>>>0)/4294967296;}
    const little=new Uint8Array(new Uint32Array([1]).buffer)[0]===1;
    for(let row=0,i=0;row<rows;row++){
      const y=(row+.5)/rows;bands[row]=wave(y);
      for(let col=0;col<cols;col++,i++){
        const n=next(),m=next(),x=(col+.5)/cols;
        seed[i]=n;scatter[i]=.055+.18*m+.06*Math.sin(y*10+x*3);
        rise[i]=.115*Math.sin(y*8+x*5)+.105*(n-.5)+.075*(m-.5);
        for(let lang=0;lang<2;lang++){
          const src=colors[lang],o=4*i,alpha=Math.round(85+153*m);
          const r=src[o],g=src[o+1],b=src[o+2];
          tints[lang][i]=little?(alpha<<24|b<<16|g<<8|r):(r<<24|g<<16|b<<8|alpha);
        }
      }
    }
    const scale=Math.min(ratio,1250/W,900/H);
    const s=surface(W,H,scale),c=s.c,rw=s.canvas.width,rh=s.canvas.height;
    const pixels=c.createImageData(rw,rh),words=new Uint32Array(pixels.data.buffer);
    function draw(front,n){
      words.fill(0);
      // Only pigments in the travelling fold move. Its settled side is the
      // original sharp print, so letters stay readable on high-density screens.
      for(let row=0;row<rows;row++){
        const center=front+bands[row],y=(row+.5)/rows;
        const low=Math.max(0,Math.floor((center-.085)*cols)),high=Math.min(cols,Math.ceil((center+.20)*cols));
        for(let col=low;col<high;col++){
          const i=row*cols+col,x=(col+.5)/cols;
          const q=clamp((center+.20-x)/.285);
          const plume=4*q*(1-q),px=Math.floor((x+scatter[i]*plume)*rw),py=Math.floor((y+rise[i]*plume)*rh);
          if(px>=0&&py>=0&&px<rw&&py<rh){
            const from=n===0?0:1-Number(q<seed[i]);
            words[py*rw+px]=tints[from][i];
          }
        }
      }
      c.putImageData(pixels,0,0);ctx.drawImage(s.canvas,0,0,W,H);
    }
    return draw;
  }
  function wave(y){return .11*(y-.5)+.027*Math.sin(7*y);}
  function sweepFront(progress){return mix(-.49,1.23,progress);}
  function revealEdition(n,t,range){
    const p=ease(phase(t,...range)),front=sweepFront(p);
    if(n===0)drawNight(t);else drawEdition(ctx,0,t,lookX,lookY);
    ctx.save();ctx.beginPath();ctx.moveTo(0,0);
    for(let i=0;i<=48;i++)ctx.lineTo(W*(front+wave(i/48)),H*i/48);
    ctx.lineTo(0,H);ctx.closePath();ctx.clip();drawEdition(ctx,n,t,lookX,lookY);ctx.restore();
    grains(front,n);
    // A narrow exposure at the print edge replaces a full-screen white flash.
    if(p>0&&p<1){
      for(let k=4;k>=1;k--){
        ctx.beginPath();
        for(let i=0;i<=36;i++){
          const x=W*(front+wave(i/36)),y=H*i/36;
          if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
        }
        ctx.lineWidth=W*.017*k;ctx.strokeStyle='rgba(255,247,209,.075)';ctx.stroke();
      }
      ctx.beginPath();for(let i=0;i<=48;i++){
        const x=W*(front+wave(i/48)),y=H*i/48;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
      }
      ctx.strokeStyle='rgba(253,248,208,.65)';ctx.lineWidth=2.3;ctx.stroke();
    }
  }
  function printLines(c,value,x,y,width,size,maxLines,weight='470') {
    c.font=weight+' '+size+'px '+sans;c.fillStyle='#34473d';
    const chunks=[];let lineText='';
    for(const char of value){
      if(lineText && c.measureText(lineText+char).width>width){chunks.push(lineText);lineText='';}
      lineText+=char;
    }
    if(lineText)chunks.push(lineText);
    for(let i=0;i<Math.min(maxLines,chunks.length);i++){
      const overflow=i===maxLines-1 && chunks.length>maxLines;
      c.fillText(overflow?chunks[i].slice(0,-1)+'…':chunks[i],x,y+i*size*1.42);
    }
  }
  function diagramPage(number){
    const page=plates[number-1],figure=page.figures[0],s=surface(),c=s.c;
    const ink='#203a30',m=W*(mobile?.075:.09),width=W-2*m;
    c.fillStyle='#efeade';c.fillRect(0,0,W,H);trim(c);
    const ref=(figure.id[0]==='p'?'习题 ':'§ ')+figure.id.slice(1);
    text(c,ref+'　·　'+figure.title,m,H*.14,mobile?14:17,sans,'#785334');
    const titleSize=fit(c,[page.title],width,Math.min(W*.095,H*.086),serif,'650');
    text(c,page.title,m,H*.175+titleSize,titleSize,serif,ink,'650');
    const top=H*.30,bottom=H*.74,bitmap=artCache.get(figure.id);
    if(bitmap?.naturalWidth){
      const scale=Math.min(width/bitmap.naturalWidth,(bottom-top)/bitmap.naturalHeight);
      const w=bitmap.naturalWidth*scale,h=bitmap.naturalHeight*scale;
      c.drawImage(bitmap,(W-w)/2,(top+bottom-h)/2,w,h);
    }
    if(figure.axes)text(c,figure.axes,m,H*.775,mobile?11:14,sans,'#536a5b');
    printLines(c,figure.caption,m,H*.83,width,mobile?14:19,2,'500');
    line(c,m,H*.912,W-m,H*.912,'#9eac9c',1);
    text(c,'OSBORNE  /  RUBINSTEIN',m,H*.95,mobile?10:13,mono,'#556259');
    c.textAlign='right';text(c,String(number).padStart(2,'0')+'  /  '+plates.length,W-m,H*.95,mobile?11:14,mono,ink);c.textAlign='left';
    return s.canvas;
  }
  function loadPageArt(){
    for(const page of plates)for(const f of page.figures){
      const img=new Image();
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(f.svg);
      artCache.set(f.id,img);
      img.decode().catch(()=>{});
    }
  }
  function sheetAt(index){
    if(index===0)return coverSheet;
    if(sheets.has(index))return sheets.get(index);
    const sheet=diagramPage(index);
    if(plates[index-1].figures.every(f=>artCache.get(f.id)?.naturalWidth))sheets.set(index,sheet);
    return sheet;
  }
  function flipbook(t){
    const index=turnEnds.findIndex(finish=>t<finish);
    if(index<0){marketSpread(t);return;}
    const start=index?turnEnds[index-1]:flipStart;
    const progress=phase(t,start,turnEnds[index]);
    // Keep the fold moving through most of the beat, with a brief settled frame.
    const duration=.72;
    if(index===plates.length)marketSpread(t);else ctx.drawImage(sheetAt(index+1),0,0,W,H);
    if(progress<duration)curl(sheetAt(index),verso,progress/duration);
    for(const k of sheets.keys())if(k<index)sheets.delete(k);
  }
  // The bend travels from the right edge all the way to the left edge. Both
  // pages use the viewport itself as their sheet size, in either orientation.
  function curl(sheet,back,p){
    const radius=W*(mobile?.112:.082),fold=mix(W,-radius*Math.PI,ease(p));
    const flat=Math.max(0,fold);
    if(flat>0)ctx.drawImage(sheet,0,0,flat/W*sheet.width,sheet.height,0,0,flat,H);
    const shade=ctx.createLinearGradient(fold,0,fold+radius*1.65,0);
    shade.addColorStop(0,'#1b26274d');shade.addColorStop(1,'#1b262700');
    ctx.fillStyle=shade;ctx.fillRect(fold,0,radius*1.65,H);
    const parts=72,startX=Math.max(0,fold),step=(W-startX)/parts;
    function project(x){
      const a=Math.min(Math.PI,(x-fold)/radius),extra=Math.max(0,x-fold-Math.PI*radius);
      return {x:fold+radius*Math.sin(a)-extra,z:radius*(1-Math.cos(a))};
    }
    for(let i=0;i<parts;i++){
      const x=startX+i*step,left=project(x),right=project(x+step),reversed=right.x<left.x;
      const destX=Math.min(left.x,right.x),width=Math.abs(right.x-left.x);
      if(width<.04||destX+width<0)continue;
      const texture=reversed?back:sheet,srcX=reversed?Math.max(0,1-(x+step)/W):x/W;
      const lift=(left.z+right.z)*.12;
      ctx.drawImage(texture,srcX*texture.width,0,step/W*texture.width,texture.height,destX,-lift,width+.6,H+2*lift);
      const alpha=.2*Math.abs(Math.sin((x-fold)/radius))*(left.z<2*radius?.95:.12)+(reversed?.055:0);
      ctx.fillStyle='rgba(67,53,37,'+alpha+')';ctx.fillRect(destX,-lift,width+.6,H+2*lift);
    }
  }
  function marketPlate(){
    if(market || !scene.naturalWidth)return market;
    sceneBox=stage.getBoundingClientRect();
    const {width:w,height:h}=sceneBox;
    if(!w||!h)return null;
    const s=surface(w,h,Math.min(1.4,1700/w,1250/h)),c=s.c;
    const bg=scene.getBoundingClientRect();
    const fit=Math.max(bg.width/scene.naturalWidth,bg.height/scene.naturalHeight);
    const iw=scene.naturalWidth*fit,ih=scene.naturalHeight*fit;
    c.drawImage(scene,bg.x-sceneBox.x+(bg.width-iw)*.62,bg.y-sceneBox.y+(bg.height-ih)*.56,iw,ih);
    const side=c.createLinearGradient(0,0,w,0);
    side.addColorStop(0,'rgba(5,24,24,.74)');
    side.addColorStop(.33,'rgba(7,28,26,.24)');
    side.addColorStop(.56,'rgba(7,28,26,0)');
    c.fillStyle=side;c.fillRect(0,0,w,h);
    const floor=c.createLinearGradient(0,h,0,0);
    floor.addColorStop(0,'rgba(4,22,22,.84)');
    floor.addColorStop(.25,'rgba(8,28,26,.25)');
    floor.addColorStop(.48,'rgba(8,28,26,0)');
    c.fillStyle=floor;c.fillRect(0,0,w,h);
    if(w<=600){
      const top=c.createLinearGradient(0,0,0,h);
      top.addColorStop(0,'rgba(5,24,24,.45)');
      top.addColorStop(.55,'rgba(5,24,24,.30)');
      top.addColorStop(.8,'rgba(5,24,24,0)');
      c.fillStyle=top;c.fillRect(0,0,w,h);
    }
    market=s.canvas;
    return market;
  }
  function marketSpread(t) {
    const image=marketPlate(),zoom=ease(phase(t,marketStart+90,end-340));
    if(!image){ctx.drawImage(boot,0,0,W,H);return;}
    const r=sceneBox.width/sceneBox.height;
    const iw=Math.min(W*.93,H*.84*r),ih=iw/r;
    const x=mix((W-iw)/2,sceneBox.x,zoom),y=mix((H-ih)/2,sceneBox.y,zoom);
    ctx.fillStyle='#ece7d6';ctx.fillRect(0,0,W,H);
    ctx.drawImage(image,x,y,mix(iw,sceneBox.width,zoom),mix(ih,sceneBox.height,zoom));
    if(zoom<1){
      ctx.save();ctx.globalAlpha=1-zoom;text(ctx,'市场之中',W*.045,H*.961,Math.min(22,W*.045),sans,'#23352d','630');trim(ctx);ctx.restore();
    }
  }
  function redraw(now){
    if(!active)return;
    const t=now-started;
    if(t>=end||document.hidden||reduced()){stop();return;}
    lookX+=(targetX-lookX)*.15;lookY+=(targetY-lookY)*.15;
    // Switch ink as the paper wipe reaches the controls in the upper right.
    film.classList.toggle('reel-on-paper',t<marketStart && sweepFront(ease(phase(t,...first)))+wave(.06)>.92);
    film.style.opacity=String(1-ease(phase(t,end-430,end)));
    if(t<first[0])drawNight(t);
    else if(t<first[1])revealEdition(0,t,first);
    else if(t<second[0])drawEdition(ctx,0,t,lookX,lookY);
    else if(t<second[1])revealEdition(1,t,second);
    else if(t<flipStart)drawEdition(ctx,1,t,lookX,lookY);
    else flipbook(t);
    frame=requestAnimationFrame(redraw);
  }
  function layout(){
    W=film.clientWidth;H=film.clientHeight;if(!W||!H)return;
    ratio=Math.min(devicePixelRatio||1,1.6,2000/W,1500/H);
    mobile=W/H<.86;
    screen.width=Math.round(W*ratio);screen.height=Math.round(H*ratio);
    ctx.setTransform(screen.width/W,0,0,screen.height/H,0,0);
    boot=night();editions=[edition(0),edition(1)];
    sheets.clear();
    const chinese=surface();drawEdition(chinese.c,1,flipStart,0,0);coverSheet=chinese.canvas;
    const reverse=surface();reverse.c.fillStyle='#e8e2d1';reverse.c.fillRect(0,0,W,H);
    for(let i=1;i<11;i++)line(reverse.c,W*.08,H*i/12,W*.92,H*i/12,'#9a9d8522',.8);
    verso=reverse.canvas;
    grains=pigmentField();market=null;
  }
  function fullscreenLabel(){full.textContent=document.fullscreenElement===film?'退出全屏':'全屏观看';}
  full.hidden=!(document.fullscreenEnabled && film.requestFullscreen);
  full.addEventListener('click',async()=>{
    if(!active)return;
    if(document.fullscreenElement===film){await document.exitFullscreen().catch(()=>{});return;}
    try{await film.requestFullscreen();ownsFullscreen=document.fullscreenElement===film;
      if(!active && ownsFullscreen)await document.exitFullscreen();
    }catch{full.hidden=true;}
    fullscreenLabel();
  });
  document.addEventListener('fullscreenchange',fullscreenLabel);
  function stop(){
    cancelAnimationFrame(frame);active=false;serial++;
    if(document.fullscreenElement===film && ownsFullscreen)document.exitFullscreen().catch(()=>{});
    ownsFullscreen=false;
    if(film.contains(document.activeElement))(manual?replay:stage.querySelector('.home-open')).focus({preventScroll:true});
    film.hidden=true;stage.removeAttribute('data-projecting');document.documentElement.removeAttribute('data-reel-primed');
    editions=[];sheets.clear();artCache.clear();originals=[];grains=boot=market=verso=coverSheet=null;
    replay.hidden=!ctx||reduced();
  }
  async function begin(fromReplay){
    if(active)return;
    if(!ctx||reduced()||document.hidden){stop();return;}
    active=true;manual=fromReplay;const ticket=++serial;
    film.classList.remove('reel-on-paper');film.style.opacity='1';film.hidden=false;stage.dataset.projecting='';
    lookX=lookY=targetX=targetY=0;
    if(manual)skip.focus({preventScroll:true});
    loadPageArt();
    const images=['en','zh'].map(lang=>film.querySelector('[data-jacket="'+lang+'"]'));
    if(images.some(im=>im&&!im.naturalWidth)){
      let timer;await Promise.race([Promise.allSettled(images.filter(Boolean).map(im=>im.decode())),new Promise(res=>{timer=setTimeout(res,420);})]);clearTimeout(timer);
    }
    if(ticket!==serial||!active)return;
    try{
      originals=images.map(im=>im?.naturalWidth?im:null);layout();started=performance.now();redraw(started);
    }catch{stop();return;}
    try{sessionStorage.setItem(key,'1');}catch{}
    document.documentElement.removeAttribute('data-reel-primed');
  }
  film.addEventListener('pointermove',e=>{
    if(!fine.matches||e.pointerType==='touch')return;
    targetX=clamp(e.clientX/W)*2-1;targetY=clamp(e.clientY/H)*2-1;
  },{passive:true});
  film.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  replay.addEventListener('click',()=>begin(true));skip.addEventListener('click',stop);
  document.addEventListener('keydown',e=>{
    if(!active)return;
    if(e.key==='Escape'){e.preventDefault();stop();}
    else if(e.key==='Tab' && !film.contains(document.activeElement)){e.preventDefault();skip.focus({preventScroll:true});}
    else if(e.key==='Tab' && ((e.target===skip&&!e.shiftKey)||(e.shiftKey&&(e.target===full||full.hidden))))stop();
  },true);
  let resizeFrame=0;
  addEventListener('resize',()=>{
    cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{
      if(active&&editions.length&&(W!==film.clientWidth||H!==film.clientHeight))layout();
    });
  });
  addEventListener('pagehide',stop);addEventListener('pageshow',e=>{if(e.persisted)stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)stop();});
  function update(){if(reduced())stop();else replay.hidden=!ctx;}
  quiet.addEventListener('change',update);
  new MutationObserver(update).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  replay.hidden=!ctx||reduced();if(document.documentElement.hasAttribute('data-reel-primed'))begin(false);
})();
