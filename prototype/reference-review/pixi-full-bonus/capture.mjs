import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-full-bonus';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250}}),page=await context.newPage(),errors=[],checkpoints=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-bonus.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();
 await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.evaluate(()=>{const stream=document.querySelector('canvas').captureStream(60),audio=window.__board.audioStream();if(!audio)throw Error('Audio missing');for(const track of audio.getAudioTracks())stream.addTrack(track);window.chunks=[];window.rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:4000000});window.rec.ondataavailable=e=>window.chunks.push(e.data);window.rec.start();});
 await page.waitForFunction(()=>window.__board.snapshot().spin.reach,null,{timeout:60000});await page.locator('canvas').screenshot({path:`${dir}/reach.png`});console.log('reach');
 await page.waitForFunction(()=>{const t=window.__board.snapshot().spin.win?.time;return t>.35&&t<1.2;},null,{timeout:10000});await page.locator('canvas').screenshot({path:`${dir}/zoom.png`});
 await page.waitForFunction(()=>window.__board.snapshot().spin.round.phase==='guide',null,{timeout:10000});await page.locator('canvas').screenshot({path:`${dir}/guide.png`});console.log('guide');
 await page.waitForFunction(()=>window.__board.snapshot().spin.round.phase==='open',null,{timeout:10000});
 let lastRound=0;
 for(let n=0;n<150;n++){
  const s=await page.evaluate(()=>window.__board.snapshot());if(s.spin.round.round!==lastRound){lastRound=s.spin.round.round;console.log(`round ${lastRound}`);await page.locator('canvas').screenshot({path:`${dir}/round-${lastRound}.png`});checkpoints.push(s);}
  if(s.spin.round.phase==='finished')break;await page.waitForTimeout(1000);
 }
 const final=await page.evaluate(()=>window.__board.snapshot());assert.equal(final.spin.round.phase,'finished');assert.equal(final.attacker.progress,0);assert.equal(final.spin.round.payout,final.counts.bonus*15);assert.deepEqual(errors,[]);
 await page.locator('canvas').screenshot({path:`${dir}/finished.png`});await page.waitForTimeout(2200);
 const data=await page.evaluate(()=>new Promise(resolve=>{window.rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(window.chunks,{type:'video/webm'}));};window.rec.stop();}));
 await writeFile(`${dir}/with-audio.webm`,Buffer.from(data,'base64'));await writeFile(`${dir}/verification.json`,JSON.stringify({checkpoints,final,errors},null,2));console.log(JSON.stringify({rounds:final.spin.round.round,admissions:final.counts.bonus,payout:final.spin.round.payout}));await context.close();
}finally{await browser.close();}
