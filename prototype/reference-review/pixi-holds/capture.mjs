import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-holds';const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/lcd-rush.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#normal-power').evaluate(e=>{e.value='.23';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#lcd-detail').click();
await page.evaluate(()=>{window.parts=[];window.started=performance.now();window.rec=new MediaRecorder(document.querySelector('canvas').captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});rec.ondataavailable=e=>parts.push(e.data);rec.start();});
await page.locator('canvas').screenshot({path:`${dir}/normal-before.png`});
let entry=null,exit=null,sawRush=false,rushImage=false,paused=false;const snapshots=[];
for(let i=0;i<1200;i++){
 const s=await page.evaluate(()=>({...window.__board.snapshot(),videoTime:(performance.now()-started)/1000}));
 if(s.spin.mode==='rush'&&s.spin.win===null&&s.spin.rush){
  if(!sawRush){sawRush=true;entry=s.videoTime;snapshots.push(s);console.log(JSON.stringify({event:'rush-entry',videoTime:entry,gameTime:s.spin.time}));await page.locator('canvas').screenshot({path:`${dir}/entry.png`});}
  if(!rushImage&&s.videoTime-entry>2){rushImage=true;await page.locator('canvas').screenshot({path:`${dir}/rush.png`});}
  if(!paused&&s.spin.rush.consumed>20){paused=true;await page.locator('#pause').click();const a=await page.locator('canvas').screenshot();await page.waitForTimeout(350);assert.ok(a.equals(await page.locator('canvas').screenshot()),'RUSH pause stable');await page.locator('#pause').click();console.log('RUSH pause verified');}
 }
 if(sawRush&&s.spin.lastRush&&!s.spin.rush&&s.spin.mode==='normal'){exit=s.videoTime;snapshots.push(s);console.log(JSON.stringify({event:'normal-return',videoTime:exit,gameTime:s.spin.time}));break;}
 await page.waitForTimeout(250);
}
assert.ok(entry!==null&&exit!==null,'actual entry and exit');await page.waitForTimeout(4000);await page.locator('canvas').screenshot({path:`${dir}/normal-after.png`});
const final=await page.evaluate(()=>window.__board.snapshot());assert.equal(final.spin.lastRush.consumed,100);assert.equal(final.spin.mode,'normal');assert.equal(final.spin.round.payout,900);assert.equal(final.counts.bonus,60);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__board.audioStream()??null),null);
const data=await page.evaluate(()=>new Promise(resolve=>{rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(parts,{type:'video/webm'}));};rec.stop();}));await writeFile(`${dir}/full.webm`,Buffer.from(data,'base64'));await writeFile(`${dir}/verification.json`,JSON.stringify({entry,exit,snapshots,final,errors},null,2));console.log('actual normal → RUSH → normal captured');
}finally{await browser.close();}
