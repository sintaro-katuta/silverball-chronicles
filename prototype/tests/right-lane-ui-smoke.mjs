import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-22T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-22T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();let normal;for(let i=0;i<20;i++){await page.clock.runFor(400);normal=await page.evaluate(()=>window.__pachinko.snapshot());if(normal.physics.left>0)break;}assert.ok(normal.physics.left>0);assert.equal(normal.physics.right,0);await page.screenshot({path:'screenshots/left-shot-board.png'});await page.locator('#debug').click();
 await page.locator('[name=targetBase]').fill('10000000');await page.getByRole('button',{name:'適用して再開'}).click();
 await page.locator('#debug').click();await page.locator('[data-rounds="10"]').click();
 let state;
 for(let i=0;i<100;i++){await page.clock.runFor(400);state=await page.evaluate(()=>window.__pachinko.snapshot());if(state.jackpot?.count>=3&&state.jackpot?.count<9)break;}
 assert.ok(state.jackpot?.count>=3);await page.screenshot({path:'screenshots/right-lane-open.png'});
 await page.reload();await page.locator('#start').click();await page.locator('#viewMode').click();await page.locator('#manual').click();await page.locator('#power').fill('100');await page.clock.runFor(4500);assert.equal(await page.locator('#shotWarning').isVisible(),true);await page.screenshot({path:'screenshots/wrong-right-shot.png'});await page.locator('#power').fill('50');await page.clock.runFor(6500);assert.equal(await page.locator('#shotWarning').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('Normal shots enter from the left; strong shots reach the right attacker; no browser errors.');
}finally{await browser.close();}
