import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
await mkdir('screenshots/yozora',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/yozora.html');await page.waitForFunction(()=>window.__yozora);await page.screenshot({path:'screenshots/yozora/ready-mobile.png',fullPage:true});
 const snap=()=>page.evaluate(()=>window.__yozora.snapshot());assert.equal((await snap()).pixelRatio,2);
 await page.locator('#fire').click();await page.waitForTimeout(4200);assert.ok((await snap()).shots>0);await page.locator('#pause').click();const paused=await snap();await page.waitForTimeout(500);assert.deepEqual(await snap(),paused);await page.locator('#pause').click();
 const demo=async(kind,fast=false)=>{await page.locator('#preview').click();if(fast)await page.locator('#fast').check();await page.locator(`[data-demo="${kind}"]`).click();};
 await demo('win');await page.waitForTimeout(7400);await page.locator('#push').click();await page.screenshot({path:'screenshots/yozora/reach-mobile.png',fullPage:true});await page.waitForFunction(()=>window.__yozora.snapshot().bonus,{timeout:15000});await page.screenshot({path:'screenshots/yozora/win-mobile.png',fullPage:true});
 await demo('miss',true);await page.waitForFunction(()=>window.__yozora.snapshot().starts===1);assert.equal((await snap()).bonus,null);assert.equal((await snap()).mode,'normal');
 await demo('bonus',true);await page.waitForFunction(()=>window.__yozora.snapshot().mode==='rush',{timeout:20000});assert.ok((await snap()).total>=300);await page.screenshot({path:'screenshots/yozora/rush-mobile.png',fullPage:true});
 await demo('drive',true);await page.waitForTimeout(1100);await page.screenshot({path:'screenshots/yozora/drive-mobile.png',fullPage:true});
 await page.locator('#pause').click();const frozen=await snap();await page.waitForTimeout(500);assert.deepEqual(await snap(),frozen);await page.locator('#pause').click();
 await demo('wou');await page.screenshot({path:'screenshots/yozora/wou-mobile.png',fullPage:true});
 await page.locator('#reset').click();await page.locator('#confirmReset').click();assert.equal((await snap()).phase,'ready');assert.equal((await snap()).balls,0);assert.equal((await snap()).stock,2500);
 for(const size of [{width:320,height:568},{width:1440,height:900}]){await page.setViewportSize(size);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),size.width);await page.screenshot({path:`screenshots/yozora/ready-${size.width}.png`,fullPage:true});}
 await page.goto('http://localhost:5173/');await page.locator('a[href="/sao-unity.html"]').waitFor();assert.deepEqual(errors,[]);console.log('Yozora browser passed: launch, pause, PUSH, win/miss, payout → ST, DRIVE, WoU, reset, responsive layout, home link.');
}finally{await browser.close();}
