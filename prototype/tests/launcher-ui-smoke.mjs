import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Math.random=()=>.8);
 await page.clock.install({time:new Date('2026-09-25T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-25T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();
 await page.locator('#auto').click();await page.locator('#debug').click();
 for(const [name,value] of Object.entries({fireRate:6000,stock:100000,targetBase:10000000,odds:100000}))await page.locator(`[name=${name}]`).fill(String(value));
 await page.getByRole('button',{name:'適用して再開'}).click();await page.locator('#auto').click();
 for(let n=0;n<15;n++)await page.clock.runFor(1000);
 const running=await page.evaluate(()=>window.__pachinko.snapshot());
 assert.ok(running.accounting.spent>100);assert.equal(running.physics.stalled,0);
 await page.screenshot({path:'screenshots/launcher-single-file.png'});
 await page.locator('#auto').click();
 for(let n=0;n<30;n++)await page.clock.runFor(1000);
 const drained=await page.evaluate(()=>window.__pachinko.snapshot());
 assert.equal(drained.balls,0);assert.ok(drained.accounting.reconciled);assert.deepEqual(errors,[]);
 console.log(JSON.stringify({spent:running.accounting.spent,peakSnapshotBalls:running.balls,remaining:drained.balls,errors}));
}finally{await browser.close();}
