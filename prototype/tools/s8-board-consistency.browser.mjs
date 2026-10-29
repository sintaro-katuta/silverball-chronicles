import {chromium} from '@playwright/test';
import {browserLaunchOptions} from '../tests/browser-launch.js';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const stage=process.argv[2]??'baseline',base=process.env.REVIEW_URL??'http://127.0.0.1:5460';
const runTag=process.argv[3]??'';if(!['baseline','final'].includes(stage)||runTag&&!/^[a-zA-Z0-9_-]+$/.test(runTag))throw Error('Invalid stage/run tag');
const out=`reference-review/s8-board-consistency-20261020/${stage}-browser${runTag?'-'+runTag:''}`;if(existsSync(out+'/verification.json'))throw Error('Existing capture protected; use a fresh run tag');await mkdir(out,{recursive:true});
const browser=await chromium.launch(browserLaunchOptions()),results=[];
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,recordVideo:{dir:out,size:viewport}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?review=session&scenario=reach-loss');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
  await page.waitForFunction(()=>window.__sessionReview?.board());
  // Pause physical/presentation clocks directly via the explicit development hook.
  await page.evaluate(()=>__sessionReview.board().pause(true));
  await page.screenshot({path:`${out}/${viewport.width}-board.png`});
  const canvas=page.locator('#canvas canvas');await canvas.screenshot({path:`${out}/${viewport.width}-canvas.png`});
  const before=await page.evaluate(()=>({time:__sessionReview.model().flow.physics.time,wheel:{...__sessionReview.model().flow.physics.mechanisms[0]},snapshot:__sessionReview.board().snapshot()}));
  await page.waitForTimeout(300);
  const pauseUnchanged=await page.evaluate(t=>__sessionReview.model().flow.physics.time===t,before.time);
  await page.evaluate(()=>__sessionReview.board().pause(false));
  await page.waitForTimeout(12000);
  const after=await page.evaluate(()=>({time:__sessionReview.model().flow.physics.time,wheel:{...__sessionReview.model().flow.physics.mechanisms[0]},snapshot:__sessionReview.board().snapshot()}));
  await canvas.screenshot({path:`${out}/${viewport.width}-after-flow.png`});
  await page.locator('#quick-pause').click();await page.locator('#resume').click();
  const video=page.video();await context.close();
  const videoPath=await video.path();results.push({viewport,before,after,pauseUnchanged,resumed:after.time>before.time,errors,videoPath,scope:'Natural ball launches with specified losing lottery fixture; not natural draw acceptance.'});
 }
 const previewContext=await browser.newContext({viewport:{width:1280,height:1000},recordVideo:{dir:out,size:{width:1280,height:1000}}}),preview=await previewContext.newPage(),previewErrors=[];
 preview.on('pageerror',e=>previewErrors.push(e.message));await preview.goto(base+'/dev/s8-board-response.html');await preview.waitForFunction(()=>window.__s8Response);
 await preview.locator('[data-case=strong]').click();await preview.waitForTimeout(300);const response=await preview.evaluate(()=>__s8Response.snapshot());
 assert.ok(response.boards.every(b=>Number.isFinite(b.wheel.omega)));assert.notEqual(response.boards[0].wheel.angle,response.boards[1].wheel.angle);
 await preview.locator('#pause').click();const paused=await preview.evaluate(()=>__s8Response.snapshot());await preview.waitForTimeout(300);assert.deepEqual(await preview.evaluate(()=>__s8Response.snapshot()),paused);
 await preview.screenshot({path:out+'/preview-strong.png'});await preview.locator('#pause').click();
 for(const name of ['weak','reverse','axis']){await preview.locator('[data-case='+name+']').click();await preview.waitForTimeout(400);}
 await preview.locator('[data-case=natural]').click();await preview.waitForTimeout(8000);const natural=await preview.evaluate(()=>__s8Response.snapshot());await preview.screenshot({path:out+'/preview-natural.png'});
 await preview.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await preview.evaluate(()=>__s8Response.snapshot())).paused,true);
 await preview.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal((await preview.evaluate(()=>__s8Response.snapshot())).paused,true);
 const previewVideo=preview.video();await previewContext.close();await writeFile(out+'/preview-verification.json',JSON.stringify({response,paused,natural,previewErrors,videoPath:await previewVideo.path(),scope:'Specified single contacts and mechanical natural launches; synthetic visibility event, not OS-background acceptance'},null,2));assert.deepEqual(previewErrors,[]);
 await writeFile(out+'/verification.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({viewport:r.viewport,pauseUnchanged:r.pauseUnchanged,resumed:r.resumed,errors:r.errors,videoPath:r.videoPath}))));
 if(results.some(r=>r.errors.length||!r.pauseUnchanged||!r.resumed))throw Error('Browser verification failed');
}finally{await browser.close();}
