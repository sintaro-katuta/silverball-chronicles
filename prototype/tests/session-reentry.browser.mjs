import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.REENTRY_DIR??'reference-review/presentation-quality-2026-10-05/reentry';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 const page=await browser.newPage({viewport:{width:320,height:740},hasTouch:true,isMobile:true});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.env.QUALITY_BASE??'http://127.0.0.1:5188'}/?review=session&scenario=predictions`);
 for(let n=0;n<3;n++){
  await page.locator('[data-kind=main]').first().tap();await page.locator('#playMachine').tap();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
  if(await page.locator('#intro-skip').isVisible())await page.locator('#intro-skip').tap();
  assert.equal(await page.locator('.decision-push-button').count(),1);assert.equal(await page.locator('.decision-push-button').isVisible(),false);
  await page.locator('[data-view=lcd]').tap();await page.locator('#controls-toggle').tap();await page.locator('#feed-toggle').tap();
  await page.locator('#menu').tap();const snapshot=await page.evaluate(()=>__session.snapshot());await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>__session.snapshot().time),snapshot.time);
  await page.locator('#resume').tap();assert.equal(await page.locator('#feed-toggle').innerText(),'発射開始');
  await page.screenshot({path:`${dir}/session-${n+1}.png`});runs.push({session:n+1,snapshot});
  await page.locator('#menu').tap();await page.locator('#leave').tap();await page.locator('#floor').tap();assert.equal(await page.locator('#canvas canvas').count(),0);assert.equal(await page.locator('.decision-push-button').count(),0);
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,scope:'Three production board mount/dispose cycles on one page, preserving shared asset cache; mobile touch emulation'},null,2));console.log('Three session reentries passed');
}finally{await browser.close();}
