import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-22T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-22T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').waitFor({timeout:60000});await page.clock.runFor(2500);
 await page.screenshot({path:'screenshots/physical-board-normal.png'});
 await page.locator('#debug').click();await page.locator('[name=targetBase]').fill('10000000');await page.getByRole('button',{name:'適用して再開'}).click();
 await page.locator('#debug').click();await page.locator('[data-rounds="10"]').click();
 let state;
 for(let n=0;n<130;n++){await page.clock.runFor(300);state=await page.evaluate(()=>window.__pachinko.snapshot());if(state.jackpot?.count>=3&&state.jackpot?.count<9)break;}
 assert.ok(state.jackpot?.count>=3,'physical right-side balls must actually arrive');
 await page.screenshot({path:'screenshots/physical-board-attacker.png'});
 assert.deepEqual(errors,[]);console.log('Normal / open attacker screenshots captured; physical arrivals and renderer pass.');
}finally{await browser.close();}
