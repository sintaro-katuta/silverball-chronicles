import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-24T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-24T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#practice').click();await page.locator('#practiceStart').click();await page.locator('#auto').click();
 const preview=async pattern=>{await page.locator('#pause').click();await page.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();await page.locator('#previewScene').selectOption('eclipse');await page.locator('#previewPattern').selectOption(pattern);await page.locator('#previewReach').click();};
 const pixels=()=>page.locator('#battleCanvas canvas').evaluate(c=>c.toDataURL());
 await preview('awakening');let elapsed=0;
 for(const ms of [12400,12600,12900,13700,14500,14700,14900,15300]){
  await page.clock.runFor(ms-elapsed);elapsed=ms;await page.locator('#lcd').screenshot({path:`screenshots/cutin-${ms}.png`});
  if(ms===13700){const title=await page.locator('#cinemaTitle').boundingBox(),lcd=await page.locator('#lcd').boundingBox();assert.ok(title.y>lcd.y+lcd.height*.55,'title stays below the eyes');assert.equal(await page.locator('#cinemaTitle').evaluate(e=>e.style.opacity),'1');await page.locator('#pause').click();const before=await pixels();await page.clock.runFor(800);assert.equal(await pixels(),before);await page.locator('#resume').click();}
 }
 await page.clock.runFor(7000);assert.equal((await page.evaluate(()=>window.__pachinko.snapshot())).presentation,null);
 await preview('feint');await page.clock.runFor(13700);assert.equal(await page.locator('#cinemaTitle').getAttribute('aria-label'),'月光収束');await page.clock.runFor(5000);assert.equal(await page.locator('#lcd').getAttribute('data-beat'),'resolve');await page.clock.runFor(2400);assert.equal(await page.locator('#lcd').getAttribute('data-beat'),'idle');
 await preview('defeat');await page.clock.runFor(13700);assert.equal(await page.locator('#cinemaTitle').getAttribute('hidden'),'');await page.clock.runFor(7500);assert.equal(await page.locator('#lcd').getAttribute('data-beat'),'idle');
 await page.emulateMedia({reducedMotion:'reduce'});
 // Instantiate the renderer with the preference in effect and compare its isolated hold.
 const reduced=await page.evaluate(async()=>{const {Battle}=await import('/src/battle.js');const host=document.createElement('div');host.style='width:300px;height:400px';document.body.append(host);const battle=new Battle(host);await battle.portrait.decode();const draw=t=>{battle.ctx.setTransform(battle.canvas.width/600,0,0,battle.canvas.height/800,0,0);battle.ctx.clearRect(0,0,600,800);battle.cutin(.5,t);return battle.canvas.toDataURL();};const same=draw(11)===draw(12);battle.dispose();host.remove();return same;});assert.ok(reduced,'reduced motion cut-in has no moving sweeps or particles');
 assert.deepEqual(errors,[]);console.log('Cut-in entrance/hold/exit, title clearance, pause, win completion, two loss returns and reduced motion verified.');
} finally {await browser.close();}
