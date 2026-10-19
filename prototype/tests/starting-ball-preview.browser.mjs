import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {browserLaunchOptions} from './browser-launch.js';

const base=process.env.REVIEW_URL??'http://127.0.0.1:5459',out='reference-review/starting-ball-main-20261019/quick-preview';
await mkdir(out,{recursive:true});
const browser=await chromium.launch(browserLaunchOptions());
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/dev/starting-ball-wager.html');await page.locator('#ticket-balance').waitFor();
 assert.equal(await page.locator('#ticket-balance').innerText(),'50');
 const key='CapacitorStorage.tsukikage-session-tickets-v1',real=JSON.stringify({version:1,tickets:7,serial:0,active:null,lastResult:null});
 await page.evaluate(({key,real})=>localStorage.setItem(key,real),{key,real});
 await page.locator('#wager-count').fill('50');await page.screenshot({path:`${out}/50-tickets-mobile.png`,fullPage:true});
 await page.locator('#wager-draw').click();await page.locator('#wager-result').waitFor({state:'visible'});
 assert.equal(await page.locator('#ticket-balance').innerText(),'0');
 await page.locator('#playMachine').click();await page.locator('#preview-settle').click();
 await page.waitForFunction(()=>document.querySelector('#preview-result')?.textContent.includes('獲得チケット 2枚'));
 await page.screenshot({path:`${out}/payout-result-mobile.png`,fullPage:true});
 await page.locator('#preview-again').click();assert.equal(await page.locator('#ticket-balance').innerText(),'2');
 await page.locator('#preview-reset').click();assert.equal(await page.locator('#ticket-balance').innerText(),'50');
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),real);
 await page.setViewportSize({width:1440,height:900});await page.screenshot({path:`${out}/50-tickets-desktop.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.goto(base);await page.locator('[data-kind=main]').first().click();await page.locator('#ticket-balance').waitFor();
 assert.equal(await page.locator('#ticket-balance').innerText(),'7');assert.deepEqual(errors,[]);
 console.log('PASS: instant 50-ticket preview, payout example, repeat/reset, two widths, and real-wallet isolation.');
}finally{await browser.close();}
