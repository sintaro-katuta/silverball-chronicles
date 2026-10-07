import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=process.env.REVIEW_URL??'http://127.0.0.1:4178';
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));
 let release;const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/game-art/**',async route=>{requests.push(route.request().url());await gate;await route.continue();});
 await page.goto(url);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
 await page.locator('#machine-loading').waitFor();
 assert.match(await page.locator('#machine-loading [role=status]').innerText(),/0%/);
 await page.locator('#loading-back').click();release();
 const starts=[];
 for(let n=0;n<3;n++){
  const start=performance.now();await page.locator('#playMachine').click();await page.locator('#machine-loading').waitFor({state:'detached'});starts.push(performance.now()-start);
  await page.locator('#intro-skip').click();assert.equal(await page.locator('#canvas canvas').count(),1);assert.equal(await page.locator('.decision-push-button').count(),1);
  await page.locator('#controls-toggle').click();await page.locator('#menu').click();await page.locator('#leave').click();await page.locator('#floor').click();
  assert.equal(await page.locator('#canvas canvas').count(),0);
  if(n<2)await page.locator('[data-kind=main]').first().click();
 }
 assert.equal(requests.length,25,'prefetch, cancelled mount and re-entry share every image');assert.deepEqual(errors,[]);
 console.log('Cancellation/re-entry passed: 25 image requests total, no stale canvases or errors; start ms:',starts.map(Math.round));await page.close();

 const retry=await browser.newPage();let releaseFailure;const failedGate=new Promise(resolve=>{releaseFailure=resolve;});let attempts=0;
 await retry.route('**/game-art/**/central-start-*.webp',async route=>{if(++attempts===1){await failedGate;await route.abort('failed');}else await route.continue();});
 await retry.goto(url);await retry.locator('[data-kind=main]').first().click();await retry.locator('#playMachine').click();releaseFailure();
 await retry.getByRole('heading',{name:'盤面を読み込めませんでした'}).waitFor();await retry.locator('#back').click();
 await retry.locator('[data-kind=main]').first().click();await retry.locator('#playMachine').click();await retry.locator('#machine-loading').waitFor({state:'detached'});
 assert.equal(attempts,2);assert.equal(await retry.locator('#canvas canvas').count(),1);console.log('Failed image retry passed: error returns to floor, next selection loads successfully.');await retry.close();
}finally{await browser.close();}
