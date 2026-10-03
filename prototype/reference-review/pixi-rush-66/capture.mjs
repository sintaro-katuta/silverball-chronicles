import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-rush-66',browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/lcd-rush-win.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#normal-power').evaluate(e=>{e.value='.23';e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#lcd-detail').click();
await page.evaluate(()=>{window.parts=[];window.started=performance.now();window.rec=new MediaRecorder(document.querySelector('canvas').captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});rec.ondataavailable=e=>parts.push(e.data);rec.start();});
let win=null,resume=null,paused=false,seen=false;const snapshots=[];
for(let i=0;i<2400;i++){
 const s=await page.evaluate(()=>({...window.__board.snapshot(),videoTime:(performance.now()-started)/1000}));
 if(s.spin.win?.fromRush){
  if(win===null){win=s.videoTime;snapshots.push(s);console.log('RUSH win',win);}
  if(!paused&&s.spin.win.time>.3){paused=true;await page.locator('#pause').click();const a=await page.locator('canvas').screenshot();await page.waitForTimeout(350);assert.ok(a.equals(await page.locator('canvas').screenshot()));await page.locator('#pause').click();}
  if(!seen&&s.spin.win.time>1.5){seen=true;await page.locator('canvas').screenshot({path:`${dir}/win.png`});}
 }
 if(win!==null&&s.spin.win===null&&s.spin.rush?.chain===2&&s.spin.mode==='rush'){
  resume=s.videoTime;snapshots.push(s);console.log('RUSH resumes',resume);break;
 }
 await page.waitForTimeout(100);
}
assert.ok(win!==null&&resume!==null);await page.waitForTimeout(6000);await page.locator('canvas').screenshot({path:`${dir}/resumed.png`});const final=await page.evaluate(()=>window.__board.snapshot());const selected=snapshots[0].spin.round.maxPayout;assert.ok([1000,1500,3000].includes(selected));assert.equal(final.counts.bonus-snapshots[0].counts.bonus,selected===3000?200:100);assert.equal(final.spin.round.payout,selected);assert.equal(final.spin.rush.chain,2);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__board.audioStream()??null),null);
const data=await page.evaluate(()=>new Promise(resolve=>{rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(parts,{type:'video/webm'}));};rec.stop();}));await writeFile(`${dir}/full.webm`,Buffer.from(data,'base64'));await writeFile(`${dir}/verification.json`,JSON.stringify({win,resume,snapshots,final,errors},null,2));
}finally{await browser.close();}
