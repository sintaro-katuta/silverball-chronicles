import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {browserLaunchOptions} from './browser-launch.js';
const browser=await chromium.launch(browserLaunchOptions());
const base=process.env.REVIEW_URL??'http://127.0.0.1:5188/';
const key='CapacitorStorage.tsukikage-floor-slump-v1';
const out='reference-review/floor-reference-20261116';
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  await context.addInitScript(({key})=>localStorage.setItem(key,JSON.stringify({'tsukikage-1':{points:[{time:0,value:0},{time:100,value:-170},{time:210,value:240},{time:360,value:120},{time:480,value:670},{time:600,value:540}]}})),{key});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('canvas.floor-reference-image').waitFor();
  await page.locator(name==='mobile'?'[data-mobile-unit="0"]':'[data-unit="0"]').click();
  await page.locator('.slump-chart').waitFor();assert.match(await page.locator('#slump-content').innerText(),/\+540/);
  await page.screenshot({path:`${out}/floor-slump-${name}.png`});
  await page.locator('#back').click();await page.locator(name==='mobile'?'[data-mobile-unit="1"]':'[data-unit="1"]').click();
  await page.getByText('まだ遊技データがありません').waitFor();assert.equal(await page.locator('.slump-chart').count(),0);assert.deepEqual(errors,[]);await context.close();
 }
 // Production play: a completed session writes only its selected machine and persists after reload.
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 await page.goto(base);await page.locator('canvas.floor-reference-image').waitFor();await page.locator('[data-unit="0"]').click();await page.locator('#ticket-balance').waitFor();
 await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__session?.snapshot(),null,{timeout:60000});
 await page.locator('#intro-menu').click();await page.locator('#leave').click();await page.locator('#floor:not([disabled])').waitFor({timeout:30000});await page.locator('#floor').click();
 await page.locator('canvas.floor-reference-image').waitFor();await page.locator('[data-unit="0"]').click();await page.locator('.slump-chart').waitFor();
 const data=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.ok(data['tsukikage-1'].points.length>0);assert.equal(data['tsukikage-2'],undefined);
 await page.reload();await page.locator('canvas.floor-reference-image').waitFor();await page.locator('[data-unit="0"]').click();await page.locator('.slump-chart').waitFor();
 await context.close();console.log('PASS: desktop/mobile sample, no data, completed real play and reload persistence');
}finally{await browser.close();}
