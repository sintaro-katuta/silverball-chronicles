import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Math.random=()=>.8;});
 await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 const snapshot=()=>page.evaluate(()=>window.__pachinko.snapshot());
 const debug=async()=>page.locator('#debug').click();
 await debug();await page.locator('[name=stock]').fill('5000');await page.locator('[name=targetBase]').fill('10000000');await page.locator('[name=rushOdds]').fill('100000');await page.locator('[name=rushSpins]').fill('3');await page.getByRole('button',{name:'適用して再開'}).click();
 await debug();await page.locator('#debugFill').click();
 assert.equal((await snapshot()).normalHolds,5);
 await debug();await page.locator('#debugRush').click();
 assert.equal((await snapshot()).rush.remaining,3);assert.equal((await snapshot()).normalHolds,5);
 await page.locator('#auto').click();let state;
 for(let i=0;i<80;i++){await page.clock.runFor(200);state=await snapshot();if(state.physics.rush>0)break;}
 assert.ok(state.physics.rush>0,'actual electric-chucker entry');assert.equal(state.rightPlay,true);await page.screenshot({path:'screenshots/rush-physical-game.png'});
 await page.locator('#pause').click();const paused=await snapshot();await page.clock.runFor(4000);assert.deepEqual(await snapshot(),paused);await page.locator('#resume').click();
 for(let i=0;i<100;i++){await page.clock.runFor(200);state=await snapshot();if(!state.rush)break;}
 assert.equal(state.rush,null);assert.equal(state.draws,3);assert.equal(state.physics.rush,3);assert.equal(state.physics.bonus,0);assert.equal(state.accounting.reconciled,true);
 await page.locator('#auto').click();
 // Force a winning RUSH sample; verify actual payout then the full reset.
 await debug();await page.locator('[name=rushOdds]').fill('1');await page.locator('[name=rushSpins]').fill('100');await page.locator('[name=rushWeight4]').fill('100');await page.locator('[name=rushWeight6]').fill('0');await page.locator('[name=rushWeight10]').fill('0');await page.getByRole('button',{name:'適用して再開'}).click();
 await debug();await page.locator('#debugRush').click();await page.locator('#auto').click();
 for(let i=0;i<250;i++){await page.clock.runFor(200);state=await snapshot();if(state.jackpot?.fromRush)break;}
 assert.equal(state.jackpot.fromRush,true);assert.equal(state.jackpot.rounds,4);assert.equal(state.rush.chain,2);await page.clock.runFor(120);await page.screenshot({path:'screenshots/rush-bonus-game.png'});
 for(let i=0;i<400;i++){await page.clock.runFor(200);state=await snapshot();if(!state.jackpot&&state.rush?.remaining===100)break;}
 assert.equal(state.jackpot,null);assert.equal(state.rush.remaining,100);assert.ok(state.physics.bonus>=40);assert.equal(state.accounting.reconciled,true);
 assert.deepEqual(errors,[]);console.log('RUSH actual electric entries, exact3-spin exit, suspended normal holds, pause, winning RUSH, real4R payout and100-spin reset all passed.');
}finally{await browser.close();}
