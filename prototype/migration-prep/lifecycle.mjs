import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const enter=async()=>{await page.locator('#floorArt canvas').waitFor();await page.waitForTimeout(250);await page.locator('[data-unit="0"]').click();await page.locator('#detailCabinetArt canvas').waitFor();await page.waitForTimeout(250);await page.locator('#playMachine').click();await page.locator('#auto').waitFor({timeout:90000});};
 await page.goto('http://localhost:5173');await enter();await page.waitForTimeout(500);await page.locator('#pause').click();await page.locator('#cashOut').click();await page.locator('#close').click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 await enter();const t=await page.evaluate(()=>window.__pachinko.snapshot().time);await page.waitForTimeout(600);const elapsed=await page.evaluate(()=>window.__pachinko.snapshot().time)-t;assert.ok(elapsed>.2&&elapsed<1,'a restarted game must not run duplicate clocks');
 await page.goto('http://localhost:5173/migration-prep/materials/index.html');assert.equal(await page.locator('article').count(),55);
 await page.locator('#search').fill('eclipse-victory');assert.equal(await page.locator('article:visible').count(),1);
 const img=page.locator('article:visible img');await img.scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('article')].filter(a=>!a.hidden).every(a=>a.querySelector('img').naturalWidth>0));
 assert.deepEqual(errors,[]);console.log('PASS: cashout→home→restart (one game clock), material gallery 55 images and search, no errors');
}finally{await browser.close();}
