import {browserLaunchOptions} from "/private/tmp/silverball-s6-20261015/prototype/tests/browser-launch.js";
import {chromium} from "/private/tmp/silverball-s6-20261015/prototype/node_modules/@playwright/test/index.mjs";
import assert from 'node:assert/strict';
const browser=await chromium.launch(browserLaunchOptions()),errors=[];
try{
 const p=await browser.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.REVIEW_URL??'http://127.0.0.1:5173');await p.locator('[data-kind=main]').first().click();
 assert.equal(await p.locator('#details-help').count(),0);await p.locator('#playMachine').click();await p.locator('#intro-skip').click();
 assert.equal(await p.locator('#power-control').inputValue(),'0.18');await p.waitForFunction(()=>(__session.snapshot()?.leftRoutes?.byPower?.['0.18']?.tracked??0)>0);
 await p.locator('#power-control').fill('0.24');await p.locator('#power-control').dispatchEvent('input');assert.equal(await p.locator('#power-label').innerText(),'0.24');await p.waitForFunction(()=>(__session.snapshot()?.leftRoutes?.byPower?.['0.24']?.tracked??0)>0);
 assert.equal(await p.locator('#play-controls').isHidden(),true);await p.locator('#controls-toggle').click();await p.locator('#feed-toggle').click();
 await p.locator('#menu').click();const before=await p.evaluate(()=>__session.snapshot());assert.equal(before.paused,true);await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>__session.snapshot().time),before.time);
 await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'leave');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'resume');
 await p.keyboard.press('Escape');assert.equal(await p.locator('#feed-toggle').innerText(),'発射開始');assert.equal(await p.evaluate(()=>__session.snapshot().paused),false);assert.equal(await p.locator('#power-control').inputValue(),'0.24');assert.equal(await p.locator('#power-label').innerText(),'0.24');
 await p.locator('#menu').click();await p.locator('#leave').click();await p.locator('#floor').click();assert.deepEqual(errors,[]);console.log('Controls passed: default hidden, pause, focus, feeding and retirement; no help additions.');
}finally{await browser.close();}
