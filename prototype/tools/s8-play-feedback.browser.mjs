import {chromium} from '@playwright/test';
import {browserLaunchOptions} from '../tests/browser-launch.js';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const base=process.env.REVIEW_URL??'http://127.0.0.1:5460',out='reference-review/s8-play-feedback-20261020/browser'+(process.argv[2]?'-'+process.argv[2]:'');if(existsSync(out+'/verification.json'))throw Error('Existing verification protected');await mkdir(out,{recursive:true});
const browser=await chromium.launch(browserLaunchOptions()),records=[];
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,recordVideo:{dir:out,size:viewport}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?review=session&scenario=reach-loss');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();await page.waitForFunction(()=>window.__sessionReview?.board());
  const initial=await page.evaluate(()=>{const p=__sessionReview.model().flow.physics;return {ballRadius:p.ballRadius,visibleDiameter:27*p.displayBallScale/3,launchSpeedOffset:p.launchSpeedOffset,wheel:{...p.mechanisms[0]},guards:p.colliders.filter(c=>c.pixelGuard),snapshot:__sessionReview.board().snapshot()};});
  assert.equal(initial.ballRadius,3);assert.ok(initial.visibleDiameter>5.7);assert.equal(initial.wheel.responseProfile,'light-rotor-v1');assert.equal(initial.guards.length,3);assert.equal(initial.launchSpeedOffset,125);
  await page.evaluate(()=>__sessionReview.board().pause(true));await page.screenshot({path:`${out}/${viewport.width}-board.png`});await page.locator('#canvas canvas').screenshot({path:`${out}/${viewport.width}-canvas.png`});await page.evaluate(()=>__sessionReview.board().pause(false));
  await page.waitForTimeout(16000);await page.locator('#canvas canvas').screenshot({path:`${out}/${viewport.width}-flow.png`});
  await page.locator('#quick-pause').click();const paused=await page.evaluate(()=>({time:__sessionReview.model().flow.physics.time,angle:__sessionReview.model().flow.physics.mechanisms[0].angle}));await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>({time:__sessionReview.model().flow.physics.time,angle:__sessionReview.model().flow.physics.mechanisms[0].angle})),paused);await page.locator('#resume').click();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await page.waitForFunction(()=>__sessionReview.board().snapshot().paused);await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.evaluate(()=>__sessionReview.board().snapshot().paused),true);await page.locator('#resume').click();
  const after=await page.evaluate(()=>({snapshot:__sessionReview.board().snapshot(),wheel:{...__sessionReview.model().flow.physics.mechanisms[0]},radii:__sessionReview.model().flow.physics.balls.map(b=>b.r)}));assert.ok(after.snapshot.time>initial.snapshot.time);assert.ok(after.radii.every(r=>r===3));
  for(const view of ['whole','board','lcd']){const changed=await page.evaluate(view=>__sessionReview.board().setView(view),view);assert.equal(changed,true);await page.locator('#canvas canvas').screenshot({path:`${out}/${viewport.width}-${view}-view.png`});}
  const video=page.video();await context.close();records.push({viewport,initial,after,paused,errors,videoPath:await video.path()});assert.deepEqual(errors,[]);
 }
 const context=await browser.newContext({viewport:{width:1280,height:1100}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/dev/s8-board-response.html');await page.waitForFunction(()=>window.__s8Response);
 for(const name of ['weak','strong','reverse','axis','natural']){await page.locator('[data-case='+name+']').click();await page.waitForTimeout(350);}
 await page.locator('#pause').click();await page.screenshot({path:out+'/comparison.png'});const comparison=await page.evaluate(()=>__s8Response.snapshot());assert.equal(comparison.boards[1].wheel.responseProfile,'light-rotor-v1');await context.close();assert.deepEqual(errors,[]);
 const result={scope:'PC Chrome + smartphone width, specified losing draw fixture with natural physical launches. Synthetic visibility handlers; not smartphone hardware, OS-background or human sound acceptance.',records,comparison,comparisonErrors:errors};await writeFile(out+'/verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(records.map(r=>({viewport:r.viewport,ballRadius:r.initial.ballRadius,visibleDiameter:r.initial.visibleDiameter,guards:r.initial.guards.length,errors:r.errors}))));
}finally{await browser.close();}
