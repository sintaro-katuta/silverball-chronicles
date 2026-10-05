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
   window.__bonusTest={
    begin(){game.pendingGrade=10;game.startJackpot();processEvents();updateHUD();},
    clear(){game.award(game.target-game.stock);game.checkStage();processEvents();updateHUD();},
    hit(kind){const before=game.total;game.hit({gold:false,large:false,extra:false,hits:0,after:false},kind);processEvents();updateHUD();return game.total-before;},
    finish(){game.finishBonus(game.jackpot);processEvents();updateHUD();},
   };
  `});
 });
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 const snap=()=>page.evaluate(()=>window.__pachinko.snapshot());
 await page.evaluate(()=>window.__bonusTest.begin());
 assert.equal((await snap()).jackpot.payoutMultiplier,1);
 await page.evaluate(()=>window.__bonusTest.clear());
 await expect(page.getByText('進行中の大当りは開始時の賞球倍率を維持します。',{exact:false})).toBeVisible();
 await page.locator('[data-skill]:not([data-skill="bonus"])').first().click();
 const current=await snap();assert.equal(current.stage,2);assert.equal(current.payoutMultiplier,1.5);assert.equal(current.jackpot.payoutMultiplier,1);
 await expect(page.locator('#stageRules')).toContainText('賞球 ×1（大当り固定）');
 assert.equal(await page.evaluate(()=>window.__bonusTest.hit('bonus')),15);
 assert.equal(await page.evaluate(()=>window.__bonusTest.hit('normal')),4);
 await page.locator('#pause').click();await page.clock.runFor(4000);await page.locator('#resume').click();
 assert.equal((await snap()).jackpot.payoutMultiplier,1);
 await page.screenshot({path:'screenshots/bonus-multiplier-fixed.png'});
 await page.evaluate(()=>window.__bonusTest.finish());
 await expect(page.locator('#stageRules')).toContainText('賞球 ×1.5');
 await page.evaluate(()=>window.__bonusTest.begin());
 assert.equal((await snap()).jackpot.payoutMultiplier,1.5);
 await expect(page.locator('#stageRules')).toContainText('賞球 ×1.5（大当り固定）');
 assert.equal(await page.evaluate(()=>window.__bonusTest.hit('bonus')+window.__bonusTest.hit('bonus')),45);
 assert.ok((await snap()).accounting.reconciled);assert.deepEqual(errors,[]);
 console.log('Browser: ongoing bonus stays ×1 across stage clear and pause; ordinary prizes remain unscaled and next bonus uses ×1.5; HUD and accounting passed.');
}finally{await browser.close();}
