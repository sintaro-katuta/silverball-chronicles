import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-rush-style',browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5173/lcd-rush.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#normal-power').evaluate(e=>{e.value='.23';e.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.evaluate(()=>{const stream=document.querySelector('canvas').captureStream(60);window.parts=[];window.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});window.rec.ondataavailable=e=>window.parts.push(e.data);window.rec.start();});
 const snapshots=[];let milestone=-1;
 for(let i=0;i<300;i++){
  const s=await page.evaluate(()=>window.__board.snapshot());
  const n=s.spin.rush&&s.spin.win===null?Math.floor(s.spin.rush.consumed/20):s.spin.win!==null?-2:-1;
  if(n!==milestone){milestone=n;console.log(JSON.stringify({time:s.time,round:s.spin.round.round,rush:s.spin.rush?.remaining,mode:s.spin.mode}));snapshots.push(s);if(n>=0)await page.locator('canvas').screenshot({path:`${dir}/rush-${n}.png`});}
  if(s.spin.rush?.consumed>=20)break;
  await page.waitForTimeout(1000);
 }
 const final=await page.evaluate(()=>window.__board.snapshot());assert.ok(final.spin.rush.consumed>=20);assert.equal(final.spin.mode,'rush');assert.equal(final.spin.round.payout,900);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>window.__board.audioStream()??null),null);
 await page.locator('canvas').screenshot({path:`${dir}/rush.png`});
 const data=await page.evaluate(()=>new Promise(resolve=>{window.rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(window.parts,{type:'video/webm'}));};window.rec.stop();}));await writeFile(`${dir}/rush.webm`,Buffer.from(data,'base64'));await writeFile(`${dir}/verification.json`,JSON.stringify({snapshots,final,errors},null,2));console.log('Actual RUSH lifecycle verified');
}finally{await browser.close();}
