// Production impact close inspection; seek only to the new final cut.
// Whole-playback evidence is presentation-quality.browser.mjs.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/resolve-single-strike-2026-10-05/impact';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.env.QUALITY_BASE??'http://127.0.0.1:5188'}/?review=session&scenario=predictions`);
 await page.locator('[data-kind=main]').first().tap();await page.locator('#playMachine').tap();await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
 if(await page.locator('#intro-skip').isVisible())await page.locator('#intro-skip').tap();
 await page.locator('#controls-toggle').tap();await page.locator('#feed-toggle').tap();await page.locator('#controls-toggle').tap();await page.locator('[data-view=lcd]').tap();
 await page.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model();g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.w.rng=()=>0;g.hit({id:990021},'start');for(let n=0;n<200&&!g.spinResult;n++)m.flow.step(.01);});
 await page.waitForFunction(()=>!!__sessionReview.game().presentation,{timeout:20000});
 await page.evaluate(()=>__sessionReview.game().presentation.time=49.2);
 for(const t of [49.5,49.95,50.22,50.5,51.2]){
  await page.waitForFunction(t=>__sessionReview.game().presentation?.time>=t,t,{timeout:4000});
  const state=await page.evaluate(()=>{const g=__sessionReview.game();return {time:g.presentation.time,win:g.presentation.win,variant:g.presentation.reachVariant};});
  await page.screenshot({path:`${dir}/impact-${t}.png`});runs.push({target:t,...state});
 }
 await page.evaluate(()=>{__sessionReview.game().presentation.time=50.2;__sessionReview.game().reducedEffects=true;});await page.waitForTimeout(80);
 await page.screenshot({path:dir+'/reduced-impact.png'});
 assert.deepEqual(errors,[]);assert.ok(runs.every(r=>r.win&&r.variant==='pressure'));
 await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,scope:'Production final cut seek; real-time playback 49.2-51.2; separate full-length proof covers earlier charge and outcome. Reduced-effect impact separately captured.'},null,2));
 console.log('Resolve final impact captured');
}finally{await browser.close();}
