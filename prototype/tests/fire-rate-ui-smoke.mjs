import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Math.random=()=>.8);await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 const snap=()=>page.evaluate(()=>window.__pachinko.snapshot());
 for(const rate of [100,300,600,1500,3000,6000]){
  await page.locator('#debug').click();await page.locator('[name=fireRate]').fill(String(rate));await page.locator('[name=stock]').fill('100000');await page.locator('[name=targetBase]').fill('10000000');await page.locator('[name=odds]').fill('100000');await page.getByRole('button',{name:'適用して再開'}).click();
  const before=await snap();assert.equal(before.fireRate,rate);await page.locator('#auto').click();await page.clock.runFor(6000);await page.locator('#auto').click();const after=await snap();
  const fired=after.accounting.spent-before.accounting.spent;assert.ok(Math.abs(fired-rate/10)<=1,`rate${rate}: fired ${fired}`);assert.ok(Math.abs(after.time-before.time-6)<.06,'game clock must stay at real speed');assert.equal(after.accounting.reconciled,true);
 }
 await page.locator('#debug').click();assert.equal(await page.locator('[name=fireRate]').inputValue(),'6000');await page.locator('[name=fireRate]').fill('6001');assert.equal(await page.locator('[name=fireRate]').evaluate(input=>input.validity.rangeOverflow),true);await page.locator('#debugClose').click();
 await page.locator('#pause').click();const paused=await snap();await page.clock.runFor(2000);assert.deepEqual(await snap(),paused);await page.locator('#resume').click();
 assert.deepEqual(errors,[]);console.log('Debug100/300/600/1500/3000/6000 shots per minute, six-second physical firing counts, unchanged game time, range validation and pause pass.');
}finally{await browser.close();}
