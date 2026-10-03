import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const dir='reference-review/moon-cues-2026-10-03';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5191','--strictPort','--config','reference-review/tokyoghoul-w-live/vite-record.config.mjs'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,1200));let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:980,height:1100}}),errors=[],samples=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5191/?review=session&scenario=left');
 await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();
 await page.waitForFunction(()=>window.__sessionReview?.board()&&!__session.snapshot().intro.active);
 await page.evaluate(()=>{
  const board=__sessionReview.board();board.setView('whole');
  const output=document.createElement('canvas');output.width=792;output.height=930;const c=output.getContext('2d');
  window.__video={output,c,label:'全体 — 長い剣・外縁なしの月',parts:[],started:performance.now()};
  const paint=()=>{c.fillStyle='#080f1b';c.fillRect(0,0,792,930);c.fillStyle='#e0edf4';c.font='24px DotGothic16';c.fillText(__video.label,22,38);c.imageSmoothingEnabled=false;c.drawImage(board.canvas,0,58,792,872);__video.raf=requestAnimationFrame(paint);};paint();
  const rec=new MediaRecorder(output.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});__video.rec=rec;rec.ondataavailable=e=>__video.parts.push(e.data);rec.start();
 });
 await page.waitForTimeout(4000);
 await page.evaluate(()=>{__sessionReview.board().setView('board');__video.label='通常 — 自然発射と装飾';});
 await page.waitForTimeout(6000);
 await page.locator('#canvas').screenshot({path:dir+'/normal-desktop.png'});
 // Review fixture only: one paid physical ball at the real heso, next result fixed.
 await page.evaluate(()=>{
  const g=__sessionReview.game(),m=__sessionReview.model(),p=m.flow.physics.pockets.find(p=>p.kind==='start');g.w.rng=()=>0;
  const ball=m.flow.physics.spawn(g.fire(),0);Object.assign(ball,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});
  __video.label='演出確認 — 当選固定・ヘソに実球1玉配置';
 });
 let winAt=null,seenReach=false,seenPayout=false;
 let dropShot=false,returnShot=false;
 for(let i=0;i<400;i++){
  await page.waitForTimeout(100);
  const s=await page.evaluate(()=>{
   const s=__session.snapshot(),age=(performance.now()-__video.started)/1000;
   if(s.spin?.reach)__video.label='リーチ — 発光と月蝕役物（当選固定）';
   else if(s.spin?.win&&s.spin.win.time<5.8)__video.label='当たり — 右の月へ剣を振る（当選固定）';
   else if(s.session?.phase==='playing'&&s.w?.bonus)__video.label='払出 — 玉は自然発射・実入賞';
   return {age,...s};
  });samples.push(s);
  if(s.spin?.reach)seenReach=true;
  if(s.cabinet?.sword?.angle>.8&&!dropShot){dropShot=true;await page.locator('#canvas').screenshot({path:dir+'/sword-slash.png'});}
  if(dropShot&&!returnShot&&s.cabinet?.sword?.phase==='rest'){returnShot=true;await page.locator('#canvas').screenshot({path:dir+'/sword-return.png'});}
  if(s.spin?.win&&winAt===null)winAt=s.age;
  if(s.w?.bonus&&s.session?.total>50)seenPayout=true;
  if(winAt!==null&&s.age>winAt+16&&seenPayout)break;
 }
 const data=await page.evaluate(()=>new Promise(resolve=>{__video.rec.onstop=()=>{cancelAnimationFrame(__video.raf);const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(__video.parts,{type:'video/webm'}));};__video.rec.stop();}));
 await writeFile(dir+'/motion.webm',Buffer.from(data,'base64'));
 await writeFile(dir+'/motion-check.json',JSON.stringify({errors,seenReach,winAt,seenPayout,samples,fixture:'First 10 seconds: natural launch. Then next normal result fixed to win; one paid physical ball dropped at heso. All following launch and payout use live physics. Original speed, no audio.'},null,2));
 await page.setViewportSize({width:390,height:844});await page.locator('#canvas').screenshot({path:dir+'/mobile.png'});
 if(errors.length||!seenReach||winAt===null||!seenPayout||!dropShot||!returnShot)throw Error(JSON.stringify({errors,seenReach,winAt,seenPayout}));
 console.log(JSON.stringify({errors,seenReach,winAt,seenPayout,duration:samples.at(-1).age}));
}finally{await browser?.close();server.kill();}
