import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>Math.random=()=>.9);
 await page.clock.install({time:new Date('2026-09-24T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-24T00:00:01Z'));
 await page.route('**/src/main.js*',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:await response.text()+`
   window.__holdTest={
    add(){game.enqueueDraw(6,'test');updateHUD();},
    reveal(){const second=game.normalHolds[1];game.normalHolds[1]=Object.freeze({...second,baseWin:true,acceptedAt:game.time-1});updateHUD();},
    consume(){game.activeDraw=null;game.spinActive=false;game.stopTimer=0;game.tick(1/120);updateHUD();},
    open(){game.pendingGrade=4;game.startJackpot();processEvents();physics.updateGate(game);machine.render(game);updateHUD();return {glow:machine.attackerGlow.visible,gate:machine.gateMaterial.emissiveIntensity};},
    close(){game.finishBonus(game.jackpot);processEvents();physics.updateGate(game);machine.render(game);updateHUD();return machine.attackerGlow.visible;},
    parts(){return {mouths:machine.scene.children.filter(x=>x.userData.part==='open-u-receiver').map(x=>x.userData.entryWidth),housings:machine.scene.children.filter(x=>x.userData.part==='receiver-housing').length,pins:machine.pinHeads.length,physicalPins:physics.pins.length,finishedPins:machine.pinHeads.filter(x=>x.material===machine.pinFace||x.material===machine.lifePinFace).length,shutter:machine.gatePanel.userData.state};}
   };
  `});
 });
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();await page.clock.runFor(100);await page.evaluate(()=>document.querySelector('#banner').classList.remove('show'));
 const parts=await page.evaluate(()=>window.__holdTest.parts());assert.deepEqual(parts.mouths.sort((a,b)=>a-b),[18,19,19,20]);assert.equal(parts.housings,4);assert.equal(parts.pins,parts.physicalPins);assert.equal(parts.finishedPins,parts.physicalPins);assert.equal(parts.shutter,'closed');
 await page.evaluate(()=>window.__holdTest.add());
 await expect(page.locator('#holds')).toHaveAttribute('aria-label','保留5個、最大5個');
 assert.equal(await page.locator('#holds i.filled').count(),5);
 assert.equal(await page.locator('#holds i.hold-arrive').count(),5);
 await page.clock.runFor(600);
 await page.screenshot({path:'screenshots/hold-lamps-new.png'});
 await page.evaluate(()=>window.__holdTest.reveal());
 assert.equal(await page.locator('#holds i').nth(1).getAttribute('data-tone'),'gold');
 await expect(page.locator('#holds i').nth(1)).toHaveClass(/hold-transform/);
 await page.screenshot({path:'screenshots/hold-lamps-revealed.png'});
 await page.evaluate(()=>window.__holdTest.consume());
 await expect(page.locator('#holds')).toHaveAttribute('aria-label','保留4個、最大5個');
 assert.equal(await page.locator('#holds i.hold-step').count(),4);
 const open=await page.evaluate(()=>window.__holdTest.open());assert.equal(open.glow,true);assert.ok(open.gate>1);assert.equal((await page.evaluate(()=>window.__holdTest.parts())).shutter,'open');await page.evaluate(()=>document.querySelector('#banner').classList.remove('show'));
 await page.screenshot({path:'screenshots/attacker-readable-open.png'});
 assert.equal(await page.evaluate(()=>window.__holdTest.close()),false);assert.equal((await page.evaluate(()=>window.__holdTest.parts())).shutter,'closed');
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>window.__holdTest.add());
 assert.equal(await page.locator('#holds i.filled').count(),5);
 assert.equal(await page.locator('#holds i').last().evaluate(node=>getComputedStyle(node).animationName),'none');
 assert.deepEqual(errors,[]);
 const small=await browser.newPage({viewport:{width:320,height:568}}),smallErrors=[];
 small.on('pageerror',e=>smallErrors.push(e.message));
 await small.goto('http://localhost:5173');await small.locator('#practice').click();await small.locator('#practiceStart').click();await small.locator('#auto').click();await small.locator('#pause').click();
 await small.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();await small.locator('#testHolds').click();
 await small.waitForTimeout(500);assert.equal(await small.locator('#holds i.filled').count(),5);
 const size=await small.locator('#holds i').first().boundingBox();assert.ok(size.width>=7);
 await small.screenshot({path:'screenshots/hold-lamps-small-phone.png'});
 assert.deepEqual(smallErrors,[]);await small.close();
 console.log('Chrome: U-shaped receivers, hold arrival/reveal/shift, attacker open/close, reduced motion and 320px phone passed.');
}finally{await browser.close();}
