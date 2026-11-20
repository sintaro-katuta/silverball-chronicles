import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.SERENA_BASE??'http://127.0.0.1:5196';
const out=process.env.SERENA_OUTPUT??'/private/tmp/serena-review-fixes';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:960}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
  await page.goto(`${base}/?review=session`);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();await page.locator('[data-view=lcd]').click();
  await page.evaluate(()=>{const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);g.w.rng=()=>.75/199.9;g.w.enqueue('tokuzu1',987654);});
  await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-scene-video="charge"]');return v&&!v.paused&&__sessionReview.board().snapshot().videoClip==='charge';},null,{timeout:45000});
  await page.evaluate(fast=>{const v=document.querySelector('video[data-serena-scene-video="charge"]'),g=__sessionReview.game();window.chargePlayCount=0;v.addEventListener('play',()=>window.chargePlayCount++);if(fast)g.previewWinAt=g.time-v.duration-2;},name==='mobile');
  await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-scene-video="charge"]');return v?.paused&&!v.seeking&&v.currentTime>v.duration-.2&&__sessionReview.board().snapshot().videoClip==='charge';},null,{timeout:10000});
  const before=await page.evaluate(()=>{const v=document.querySelector('video[data-serena-scene-video="charge"]');return {t:v.currentTime,plays:window.chargePlayCount};});
  await page.waitForTimeout(1400);
  const after=await page.evaluate(()=>{const v=document.querySelector('video[data-serena-scene-video="charge"]');return {t:v.currentTime,paused:v.paused,plays:window.chargePlayCount,clip:__sessionReview.board().snapshot().videoClip};});
  assert.equal(after.plays,before.plays,'finished non-looping clip must not restart');assert.equal(after.paused,true);assert.equal(after.clip,'charge');assert.ok(Math.abs(after.t-before.t)<.1);
  await page.screenshot({path:`${out}/${name}-charge-hold.png`});
  await page.evaluate(()=>{const g=__sessionReview.game();g.previewWinAt=g.time-1;});
  await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-scene-video="charge"]');return v&&!v.paused&&v.currentTime<2.5;},null,{timeout:10000});
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('charge holds final frame without replay on desktop and mobile');
}finally{await browser.close();}
