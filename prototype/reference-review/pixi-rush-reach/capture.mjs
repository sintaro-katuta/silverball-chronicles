import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-rush-reach',browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/lcd-rush-win.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#normal-power').evaluate(e=>{e.value='.23';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#lcd-detail').click();
await page.evaluate(()=>{window.parts=[];window.started=performance.now();window.rec=new MediaRecorder(document.querySelector('canvas').captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});rec.ondataavailable=e=>parts.push(e.data);rec.start();});
let win=null,resume=null,paused=false,seen=false,reach=null;const snapshots=[];
for(let i=0;i<2400;i++){
 const s=await page.evaluate(()=>({...window.__board.snapshot(),videoTime:(performance.now()-started)/1000}));
 if(s.spin.reach&&s.spin.rush&&reach===null){reach=s.videoTime;await page.locator('canvas').screenshot({path:`${dir}/reach.png`});}
 if(s.spin.win?.fromRush){
  if(win===null){win=s.videoTime;snapshots.push(s);console.log('RUSH win',win);}
  if(!seen&&s.spin.win.time>1.5){seen=true;await page.locator('canvas').screenshot({path:`${dir}/win.png`});}
 }
 if(win!==null&&s.videoTime>win+4)break;
 await page.waitForTimeout(100);
}
assert.ok(reach!==null&&win!==null);assert.deepEqual(errors,[]);const final=await page.evaluate(()=>window.__board.snapshot());
const data=await page.evaluate(()=>new Promise(resolve=>{rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(parts,{type:'video/webm'}));};rec.stop();}));await writeFile(`${dir}/full.webm`,Buffer.from(data,'base64'));await writeFile(`${dir}/verification.json`,JSON.stringify({reach,win,snapshots,final,errors},null,2));
}finally{await browser.close();}
