import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Math.random=()=>.9);
 await page.clock.install({time:new Date('2026-09-24T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-24T00:00:01Z'));
 await page.route('**/src/legacy/main.js*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:await response.text()+`
   window.__growthTest={
    clear(){game.award(game.target-game.stock);game.checkStage();processEvents();updateHUD();},
    below(){game.setStock(game.lowerBorder-1);updateHUD();},
    recover(){game.addStock(game.lowerBorder-game.stock);updateHUD();},
   };
  `});
 });
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 const snap=()=>page.evaluate(()=>window.__pachinko.snapshot());
 const sample=async (expected,duration=6000)=>{
  const before=await snap();assert.equal(before.fireRate,expected);
  await page.locator('#auto').click();await page.clock.runFor(duration);await page.locator('#auto').click();
  const after=await snap(),fired=after.accounting.spent-before.accounting.spent;
  assert.ok(Math.abs(fired-expected*duration/60000)<=1,`${expected} per minute: ${fired} in ${duration}ms`);
  assert.equal(after.debug,false);assert.ok(after.accounting.reconciled);
 };
 await sample(100);
 await page.evaluate(()=>window.__growthTest.clear());
 await expect(page.locator('#skillCashOut')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.tickets)).toBeGreaterThanOrEqual(4);
 await page.locator('[data-skill]').first().click();
 assert.equal((await snap()).stage,2);await sample(160);
 for(let stage=2;stage<10;stage++){
  await page.evaluate(()=>window.__growthTest.clear());await page.locator('[data-skill]').first().click();
 }
 assert.equal((await snap()).stage,10);await sample(6000,2000);
 await expect(page.locator('#stageRules')).toContainText('6,000発/分');
 await page.screenshot({path:'screenshots/stage-growth-10.png'});
 // Let all actual shots drain first: late prizes legitimately cancel a border warning.
 for(let i=0;i<20&&(await snap()).balls>0;i++)await page.clock.runFor(1000);
 assert.equal((await snap()).balls,0);
 // Real frame loop: below-border warning, paused grace, exact recovery, defeat.
 await page.evaluate(()=>window.__growthTest.below());await page.clock.runFor(1000);
 await expect(page.locator('#zero')).toBeVisible();
 await page.locator('#pause').click();const paused=await snap();await page.clock.runFor(4000);
 assert.equal((await snap()).zeroTime,paused.zeroTime);await page.locator('#resume').click();
 await page.evaluate(()=>window.__growthTest.recover());assert.equal((await snap()).zeroTime,0);
 await page.clock.runFor(3500);assert.equal((await snap()).phase,'playing');
 await page.evaluate(()=>window.__growthTest.below());await page.clock.runFor(3100);
 assert.equal((await snap()).phase,'result');assert.ok((await snap()).stock>0);
 await expect(page.locator('#resultUpgrade')).toBeVisible();
 await page.locator('#resultUpgrade').click();await expect(page.getByRole('heading',{name:'機関を強化する'})).toBeVisible();
 // The alternative cashout path is available directly at a stage clear too.
 await page.getByRole('button',{name:'コース選択へ'}).click();await page.locator('#start').click();await page.locator('#auto').click();
 await page.evaluate(()=>window.__growthTest.clear());await page.locator('#skillCashOut').click();
 await expect(page.getByRole('heading',{name:'機関を強化する'})).toBeVisible();
 assert.deepEqual(errors,[]);
 console.log('Stage 1/2/10 actual firing, live stage tickets, border recovery/pause/defeat, and both upgrade routes passed.');
}finally{await browser.close();}
