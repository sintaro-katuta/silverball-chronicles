import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const base=process.env.SERENA_BASE??'http://127.0.0.1:5190';
const out=process.env.SERENA_OUTPUT??'reference-review/serena-video-integration-20261119';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:960}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(`${name}: ${error.message}`));
  await page.goto(`${base}/?review=session`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('[data-view=lcd]').click();
  await page.waitForFunction(()=>document.querySelector('video[data-serena-victory-video]')?.readyState>=2,{timeout:30000});
  await page.evaluate(()=>{const g=__sessionReview.game();g.lastReachWasLong=true;g.previewWinAt=g.time;g.previewRushWin=false;g.stoppedReels=[7,7,7];g.presentation=null;g.jackpot={charge:false};});
  await page.waitForFunction(()=>{const v=document.querySelector('video[data-serena-victory-video]');return !v.paused&&v.currentTime>.5;},{timeout:10000});
  await page.screenshot({path:`${out}/${name}-victory.png`});
  const before=await page.evaluate(()=>({time:document.querySelector('video[data-serena-victory-video]').currentTime,game:__sessionReview.game().time}));
  await page.evaluate(()=>__sessionReview.board().pause(true));
  await page.waitForTimeout(500);
  const held=await page.evaluate(()=>({time:document.querySelector('video[data-serena-victory-video]').currentTime,paused:document.querySelector('video[data-serena-victory-video]').paused,game:__sessionReview.game().time}));
  assert.ok(held.paused);assert.ok(Math.abs(held.time-before.time)<.2);assert.ok(Math.abs(held.game-before.game)<.2);
  await page.evaluate(()=>__sessionReview.board().pause(false));
  await page.waitForFunction(t=>document.querySelector('video[data-serena-victory-video]').currentTime>t+.3,held.time,{timeout:5000});
  await page.waitForFunction(()=>document.querySelector('video[data-serena-victory-video]').paused,{timeout:8000});
  await page.evaluate(()=>{const g=__sessionReview.game();g.previewWinAt=g.time;g.lastReachWasLong=false;});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.querySelector('video[data-serena-victory-video]').paused),true);
  await page.evaluate(()=>{const g=__sessionReview.game();g.previewWinAt=g.time;g.lastReachWasLong=true;g.jackpot.charge=true;});
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>document.querySelector('video[data-serena-victory-video]').paused),true);
  await page.close();
  console.log(`${name}: playback, pause, resume and route/charge exclusion passed`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
