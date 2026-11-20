import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {browserLaunchOptions} from './browser-launch.js';

const base=process.env.REVIEW_URL??'http://127.0.0.1:5188/';
const key='CapacitorStorage.tsukikage-session-tickets-v1';
const browser=await chromium.launch(browserLaunchOptions()),errors=[];
try{
 for(const [name,viewport,tickets] of [['desktop',{width:1440,height:900},50],['mobile',{width:390,height:844},0]]){
  const context=await browser.newContext({viewport});
  const fixture={version:1,tickets,serial:0,active:null,lastResult:null};
  await context.addInitScript(({key,fixture})=>{if(!sessionStorage.getItem('drawer-fixture')){localStorage.setItem(key,JSON.stringify(fixture));sessionStorage.setItem('drawer-fixture','1');}},{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('canvas.floor-reference-image').waitFor();
  const trigger=name==='mobile'?page.locator('[data-mobile-unit="0"]'):page.locator('[data-unit="0"]');
  await trigger.click();const dialog=page.locator('.floor-detail-dialog[open]');await dialog.waitFor();await page.locator('#ticket-balance').waitFor();
  assert.equal(await page.locator('canvas.floor-reference-image').count(),1);
  assert.match(await dialog.innerText(),/月影機関/);assert.equal(await page.locator('#ticket-balance').innerText(),String(tickets));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:`reference-review/floor-reference-20261116/floor-detail-${name}.png`});
  await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});assert.equal(await page.locator('canvas.floor-reference-image').count(),1);
  await trigger.click();await page.locator('#ticket-balance').waitFor();
  if(tickets){
   await page.locator('#wager-count').fill('3');await page.locator('#wager-draw').click();await page.locator('#wager-result').waitFor({state:'visible'});
   const pending=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(pending.tickets,47);assert.equal(pending.active.stake,3);assert.equal(pending.active.phase,'ready');
   await page.locator('#back').click();await trigger.click();await page.locator('#wager-result').waitFor({state:'visible'});
   assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),pending);
  }else assert.equal(await page.locator('#wager-draw').isDisabled(),true);
  await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__session?.snapshot(),null,{timeout:60000});
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.active.phase,'playing');assert.equal(saved.active.stake,tickets?3:0);
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: drawer preserves floor, closes by Escape, restores paid result, and starts paid/free play on desktop/mobile.');
}finally{await browser.close();}
