import {chromium} from '/private/tmp/silverball-s8-20261018/prototype/node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '/private/tmp/silverball-s8-20261018/prototype/tests/browser-launch.js';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='/private/tmp/silverball-s8-20261018/prototype/reference-review/s8-20261018/user-play-normal-fixed';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch(browserLaunchOptions()),errors=[],runs=[];
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push({message:m.text(),location:m.location()});});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:5437/');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
  await page.waitForFunction(()=>__session.snapshot()?.spawned>=5,null,{timeout:20000});
  const before=await page.evaluate(()=>({snapshot:__session.snapshot(),font:document.fonts.check('24px DotGothic16'),reviewPresent:'__sessionReview' in window}));
  assert.equal(before.font,true);assert.equal(before.reviewPresent,false);assert.equal(before.snapshot.mode,'normal');assert.equal(before.snapshot.paused,false);assert.ok(before.snapshot.inFlight>0);
  await page.screenshot({path:`${out}/${viewport.width}-playing.png`});
  await page.locator('#quick-pause').click();assert.equal(await page.evaluate(()=>__session.snapshot().paused),true);await page.locator('#resume').click();assert.equal(await page.evaluate(()=>__session.snapshot().paused),false);
  assert.deepEqual(errors,[]);runs.push({viewport,...before});await page.close();
 }
 await fs.writeFile(`${out}/receipt.json`,JSON.stringify({success:true,scope:'Real normal play without review fixture, both widths; >=5 actual shots and in-flight balls, font ready, pause/resume, no errors',runs,errors},null,2));console.log('NORMAL_PLAY_PASS',JSON.stringify(runs.map(r=>({viewport:r.viewport,spawned:r.snapshot.spawned,inFlight:r.snapshot.inFlight,font:r.font,reviewPresent:r.reviewPresent}))));
}catch(e){await fs.writeFile(`${out}/failure.json`,JSON.stringify({message:String(e),errors,runs},null,2));throw e;}finally{await browser.close();}
