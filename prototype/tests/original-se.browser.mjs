import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.env.SE_REVIEW_DIR??'/tmp/original-se-review';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
const base=process.env.SE_BASE??'http://localhost:5191';
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(base+'/?review=session&scenario=predictions');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
 assert.equal(await page.evaluate(()=>__sessionReview.board().audio().state),'running');
 await page.locator('#intro-skip').click();await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
 await page.evaluate(async()=>{await __sessionReview.board().setSound(true);window.seRecorded=[];const rec=new MediaRecorder(__sessionReview.board().audioStream());rec.ondataavailable=e=>seRecorded.push(e.data);rec.start();window.seRecorder=rec;});
 if(process.env.SE_CONTINUOUS==='1'){
  await page.evaluate(()=>{const g=__sessionReview.game();g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.w.rng=()=>.9;g.hit({id:991901},'start');});
  await page.waitForFunction(()=>!!__sessionReview.game().spinResult,null,{timeout:10000});
  const record=await page.evaluate(()=>({...__sessionReview.game().wRecord}));
  await page.waitForFunction(()=>!!__sessionReview.game().presentation,null,{timeout:15000});console.log('Continuous admitted normal loss: playing full 54 seconds.');
  await page.waitForFunction(()=>!__sessionReview.game().presentation,null,{timeout:65000});
  const result=await page.evaluate(()=>{const g=__sessionReview.game();return {lastDraw:g.lastDraw,record:g.lastResolvedDraw,audio:__sessionReview.board().audio(),accounting:g.accounting};});
  assert.equal(result.lastDraw,false);assert.equal(result.record.roll,record.roll);assert.equal(result.accounting.reconciled,true);
  for(const name of ['reach','gather','decisiveHit','loss'])assert.ok(result.audio.cues.some(c=>c.name===name),name);
  assert.ok(!result.audio.cues.some(c=>c.name==='win'));runs.push({continuous:true,record,result});console.log('Continuous full normal loss, result integrity and SE passed.');
 }
 for(const fixture of [{variant:'pressure',win:false},{variant:'initiative',win:true},{variant:'exchange',win:false},{variant:'pressure',win:true,ending:'revival'},{variant:'pressure',win:true,ending:'flash',mode:'rush'},{route:'basic',win:false},{route:'direct',win:true},{variant:'pressure',win:true,premium:'moon',full:true}]){
  const before=await page.evaluate(f=>{const g=__sessionReview.game();g.presentation={id:100,drawId:100,time:0,basicReach:true,longReach:!f.route,displayRoute:f.route??(f.ending==='flash'?'flash':'battle'),presentationMode:f.mode??'normal',reachVariant:f.variant,reachEnding:f.ending??'standard',win:f.win,premium:f.premium,premiumAt:45.5,predictionPlan:f.full?{resultFamily:'fullrotation',chanceUps:[],precursorSeconds:0}:null};delete g.previewWinAt;g.spinActive=false;g.jackpot=null;return JSON.stringify({roll:g.wRecord?.roll,total:g.total,queue:g.acceptedDraws});},fixture);
  const boundaries=await page.evaluate(async()=>{const {reachAudioCues}=await import('/src/pixi/se/presentation-cues.js');return reachAudioCues(__sessionReview.game().presentation).map(c=>({at:c.at,name:c.name}));});
  for(const c of boundaries){await page.evaluate(t=>{__sessionReview.game().presentation.time=t+.005;},c.at);await page.waitForTimeout(80);}
  const audio=await page.evaluate(()=>__sessionReview.board().audio());assert.equal(audio.state,'running');assert.ok(audio.cues.length>0);assert.ok(audio.voices<=6);assert.ok(audio.cacheBytes<=12*1024*1024);
  const after=await page.evaluate(()=>{const g=__sessionReview.game();return JSON.stringify({roll:g.wRecord?.roll,total:g.total,queue:g.acceptedDraws});});assert.equal(after,before);
  runs.push({fixture,boundaries,audio});await page.evaluate(()=>{__sessionReview.game().presentation=null;});await page.waitForTimeout(50);
 }
 await page.locator('#controls-toggle').click();await page.locator('#sound-enabled').uncheck();let s=await page.evaluate(()=>__sessionReview.board().audio());assert.equal(s.enabled,false);assert.equal(s.voices,0);
 const count=s.cues.length;await page.evaluate(()=>{__sessionReview.game().presentation={drawId:999,time:0,longReach:true,displayRoute:'battle',reachVariant:'pressure',win:false};});await page.waitForTimeout(100);assert.equal((await page.evaluate(()=>__sessionReview.board().audio())).cues.length,count);
 await page.locator('#sound-enabled').check();await page.waitForTimeout(100);assert.equal((await page.evaluate(()=>__sessionReview.board().audio())).cues.length,count);
 await page.evaluate(()=>{__sessionReview.game().presentation.time=50.205;});await page.waitForTimeout(100);assert.equal((await page.evaluate(()=>__sessionReview.board().audio())).cues.at(-1).name,'decisiveHit');
 await page.evaluate(()=>__sessionReview.board().pause(true));assert.equal((await page.evaluate(()=>__sessionReview.board().audio())).voices,0);await page.evaluate(()=>__sessionReview.board().pause(false));await page.waitForTimeout(60);
 await page.screenshot({path:out+'/sound-controls.png'});
 const recording=await page.evaluate(async()=>{const done=new Promise(resolve=>seRecorder.onstop=resolve);seRecorder.stop();await done;const blob=new Blob(seRecorded,{type:'audio/webm'});return Array.from(new Uint8Array(await blob.arrayBuffer()));});assert.ok(recording.length>1000);await writeFile(out+'/actual-output.webm',Buffer.from(recording));
 await page.goto(base+'/dev/original-se.html');await page.getByRole('button',{name:'decisiveHit 音型 1',exact:true}).click();await page.waitForTimeout(150);await page.getByRole('button',{name:'停止',exact:true}).click();
 assert.deepEqual(errors,[]);await writeFile(out+'/browser-check.json',JSON.stringify({runs,errors,recordingBytes:recording.length,scope:'Real AudioContext/MediaRecorder and production rendering at authored boundaries; optional full continuous admitted normal loss, 8 sought fixtures. Physical speaker listening is unverified.'},null,2));console.log('8 real-browser audio cases, mute/resume, pause and PCM capture passed.');
}finally{await browser.close();}
