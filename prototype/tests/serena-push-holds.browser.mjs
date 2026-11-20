import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const output=process.env.SERENA_OUTPUT??'/private/tmp/serena-review-fixes';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 for(const [name,viewport] of [['desktop',{width:1280,height:960}],['mobile',{width:390,height:844}],['narrow',{width:320,height:740}]]){
  const page=await browser.newPage({viewport});page.on('pageerror',e=>errors.push(`${name}: ${e.message}`));
  await page.goto(`${process.env.SERENA_BASE??'http://127.0.0.1:5196'}/?review=session`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.evaluate(()=>{const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);g.w.rng=()=>.9;g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.hit({id:990101},'start');for(let i=0;i<4;i++)g.w.enqueue('tokuzu1',990102+i);});
  await page.waitForFunction(()=>!!__sessionReview.game().presentation?.longReach,null,{timeout:30000});
  await page.evaluate(()=>{__sessionReview.game().presentation.time=46.6;});
  const button=page.locator('.decision-push-button');await button.waitFor({state:'visible',timeout:15000});
  await page.waitForFunction(()=>__sessionReview.board().snapshot().videoClip==='battle',null,{timeout:15000});
  const initial=await page.evaluate(()=>({holds:__sessionReview.game().acceptedDraws.length,win:__sessionReview.game().presentation.win}));assert.equal(initial.holds,4);
  for(const view of ['whole','board','lcd']){
   await page.locator(`[data-view=${view}]`).click();const box=await button.boundingBox();assert.ok(box.width>=64&&box.height>=44);assert.ok(box.x>=0&&box.x+box.width<=viewport.width+1);await page.screenshot({path:`${output}/${name}-push-${view}.png`});
  }
  await button.click();await page.waitForFunction(()=>!!__sessionReview.game().presentation?.pushInput,null,{timeout:3000});
  assert.equal(await page.evaluate(()=>__sessionReview.game().presentation.win),initial.win);
  await page.close();
 }
 assert.deepEqual(errors,[]);console.log('PUSH with four holds visible and clickable across three views on desktop/mobile');
}finally{await browser.close();}
