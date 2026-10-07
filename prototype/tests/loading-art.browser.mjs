import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {prepareReleaseAssets} from '../tools/release-assets.js';
const art=await prepareReleaseAssets(resolve('public'),resolve('.cache/game-art'));
const dir='reference-review/loading-2026-10-06/art';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 for(const mode of ['png','webp']){
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));
  if(mode==='webp')await page.route('**/*.png',async route=>{
   const mapped=art.urls[new URL(route.request().url()).pathname];
   if(mapped)await route.fulfill({path:resolve('dist-release',mapped.slice(1)),contentType:'image/webp'});
   else await route.continue();
  });
  await page.goto('http://127.0.0.1:5188/?review=session&scenario=predictions');
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__sessionReview?.board?.());
  await page.locator('#intro-skip').click();await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();await page.locator('[data-view=lcd]').click();
  await page.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model();g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.w.rng=()=>0;g.hit({id:990101},'start');for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);});
  await page.waitForFunction(()=>!!__sessionReview.game().presentation);
  for(const [name,time] of [['battle',25],['push',47],['win',51.9]]){
   await page.evaluate(t=>{const g=__sessionReview.game();g.presentation.time=t;__sessionReview.board().pause(true);},time);
   await page.waitForTimeout(80);await page.screenshot({path:`${dir}/${mode}-${name}.png`});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/check.json',JSON.stringify({errors,scope:'PNG and release WebP through actual main board: long reach, PUSH and winning reveal'},null,2));console.log('PNG/WebP main-board battle/PUSH/win renders passed.');
}finally{await browser.close();}
