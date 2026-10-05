import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Browser-only fixture: exercise real payout, result rendering and Preferences.
 // No mutable diagnostics are shipped in the application.
 await page.route('**/src/legacy/main.js*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:await response.text()+`
   window.__ticketTest={
    prize(){game.hit({gold:false,large:false,extra:false,hits:0,after:false},'normal');processEvents();updateHUD();},
    lose(){while(game.stock>0)game.fire();game.tick(3);processEvents();updateHUD();},
    redraw(){showResult();}
   };
  `});
 });
 await page.goto('http://localhost:5173');
 await page.locator('#start').click();await page.locator('#auto').click();
 await page.locator('#debug').click();await page.getByRole('button',{name:'適用して再開'}).click();
 assert.equal((await page.evaluate(()=>window.__pachinko.snapshot())).debug,false);
 await page.locator('#debug').click();await page.locator('[name=volume]').fill('0.2');await page.getByRole('button',{name:'適用して再開'}).click();
 assert.equal((await page.evaluate(()=>window.__pachinko.snapshot())).debug,false);
 await page.evaluate(()=>window.__ticketTest.prize());
 await expect(page.locator('#ticketProgress')).toContainText('＋1枚');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.tickets)).toBe(1);
 assert.equal((await page.evaluate(()=>window.__pachinko.snapshot())).phase,'playing');
 for(const [width,height] of [[390,844],[320,568],[1280,950]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const bounds=await page.evaluate(()=>{
   const board=document.querySelector('.board-wrap').getBoundingClientRect(),control=document.querySelector('.control-panel').getBoundingClientRect();
   return {boardBottom:board.bottom,controlTop:control.top,controlBottom:control.bottom,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(bounds.overflow,false);
  assert.ok(bounds.boardBottom<=bounds.controlTop+1);
  assert.ok(bounds.controlBottom<=height+1);
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'screenshots/tickets-playing.png'});
 await page.evaluate(()=>window.__ticketTest.lose());
 await expect(page.locator('.result-numbers')).toContainText('＋1');
 await expect(page.locator('#resultTickets')).toHaveText('1枚');
 await page.evaluate(()=>window.__ticketTest.redraw());
 await expect(page.locator('#resultTickets')).toHaveText('1枚');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.tickets)).toBe(1);
 await page.screenshot({path:'screenshots/tickets-result.png'});
 await page.reload();await expect(page.locator('.currency b')).toHaveText('1');
 // A second real result accumulates rather than overwriting the saved balance.
 await page.locator('#start').click();await page.locator('#auto').click();
 await page.evaluate(()=>{window.__ticketTest.prize();window.__ticketTest.lose();});
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.tickets)).toBe(2);
 await page.reload();await expect(page.locator('.currency b')).toHaveText('2');
 // Cash out while still alive, buy an upgrade, and retain it after reload.
 await page.locator('#start').click();await page.locator('#auto').click();
 await page.evaluate(()=>window.__ticketTest.prize());
 await page.locator('#pause').click();await page.locator('#cashOut').click();
 await expect(page.getByRole('heading',{name:'機関を強化する'})).toBeVisible();
 await expect(page.getByRole('dialog')).toContainText('3枚');
 await page.locator('[data-up="stock"]').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.upgrades.stock)).toBe(1);
 await page.reload();await expect(page.locator('.currency b')).toHaveText('0');
 await page.locator('#start').click();await page.locator('#auto').click();
 assert.ok((await page.evaluate(()=>window.__pachinko.snapshot())).stock>=424);
 // Closing the tab mid-run must not lose already saved tickets.
 await page.evaluate(()=>window.__ticketTest.prize());
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('CapacitorStorage.tsukikage-profile-v1'))?.tickets)).toBe(1);
 await page.reload();await expect(page.locator('.currency b')).toHaveText('1');
 assert.deepEqual(errors,[]);
 console.log('Ticket payout below 100, repeated results, live persistence, cashout, upgrades and 320/390/1280px layout passed.');
}finally{await browser.close();}
