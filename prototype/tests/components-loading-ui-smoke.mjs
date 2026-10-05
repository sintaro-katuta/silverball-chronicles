import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 let release;const hold=new Promise(resolve=>release=resolve);
 await page.route('**/battles/bridge-victory.png',async route=>{await hold;await route.continue();});
 await page.goto('http://localhost:5173');await page.locator('#start').click();
 await expect(page.locator('.loading-screen')).toBeVisible();
 assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 await page.screenshot({path:'screenshots/loading-assets.png'});
 release();await expect(page.locator('#auto')).toBeVisible({timeout:60000});
 assert.ok((await page.evaluate(()=>window.__pachinko.snapshot())).time<3);
 await page.screenshot({path:'screenshots/components-game.png'});
 await page.goto('http://localhost:5173/dev/parts.html');await page.waitForFunction(()=>window.__partsReady,{},{timeout:60000});
 await page.screenshot({path:'screenshots/component-right-closed.png'});
 await page.locator('#state').selectOption('bonus');
 await page.screenshot({path:'screenshots/component-right-open.png'});
 await page.locator('#state').selectOption('rush');
 await page.screenshot({path:'screenshots/component-right-rush.png'});
 // Failure must keep play stopped, offer retry, and allow returning home.
 await page.goto('http://localhost:5173');await page.route('**/battles/bridge-victory.png',route=>route.abort());
 await page.locator('#start').click();await expect(page.locator('#loadingRetry')).toBeVisible({timeout:60000});
 assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 await page.unroute('**/battles/bridge-victory.png');await page.locator('#loadingRetry').click();
 await expect(page.locator('#auto')).toBeVisible({timeout:60000});
 // A cancelled preload must never start the game after returning home.
 await page.goto('http://localhost:5173');let releaseCancel;const holdCancel=new Promise(r=>releaseCancel=r);
 await page.route('**/battles/bridge-victory.png',async route=>{await holdCancel;await route.continue();});
 await page.locator('#start').click();await expect(page.locator('#loadingCancel')).toBeVisible();await page.locator('#loadingCancel').click();releaseCancel();
 await expect(page.locator('#start')).toBeVisible();assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 assert.deepEqual(errors,[]);console.log('Assets wait before play, failure/retry/cancel, and normal/RUSH/bonus component previews passed.');
}finally{await browser.close();}
