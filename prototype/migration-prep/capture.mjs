import {chromium} from '@playwright/test';
const mode=process.argv[2]??'after';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.locator('#floorArt canvas').waitFor();await page.waitForTimeout(500);await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();await page.locator('#auto').waitFor({timeout:90000});await page.locator('#auto').click();await page.waitForTimeout(2400);
await page.screenshot({path:`migration-prep/${mode}-mobile.png`});
await page.locator('.board-wrap').screenshot({path:`migration-prep/${mode}-board.png`});
await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(400);await page.screenshot({path:`migration-prep/${mode}-desktop.png`});
console.log(JSON.stringify({renderer:await page.evaluate(()=>window.__pachinko.renderer()),errors}));
} finally {await browser.close();}
