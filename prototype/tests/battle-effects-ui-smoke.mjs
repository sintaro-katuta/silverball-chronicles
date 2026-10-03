import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#practice').click();await page.locator('#practiceStart').click();await page.locator('#auto').click();
 const preview=async(pattern)=>{await page.locator('#pause').click();await page.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();await page.locator('#previewScene').selectOption('eclipse');await page.locator('#previewPattern').selectOption(pattern);await page.locator('#previewReach').click();};
 const pixels=()=>page.locator('#battleCanvas canvas').evaluate(canvas=>canvas.toDataURL());
 await preview('awakening');let elapsed=0;
 for(const [ms,beat] of [[5200,'enemy'],[8900,'clash'],[13700,'awakening'],[16000,'strike']]){
  await page.clock.runFor(ms-elapsed);elapsed=ms;assert.equal(await page.locator('#lcd').getAttribute('data-beat'),beat);
  await page.screenshot({path:`screenshots/fx-${beat}-game.png`});await page.locator('#lcd').screenshot({path:`screenshots/fx-${beat}-lcd.png`});
  const first=await pixels();await page.clock.runFor(80);elapsed+=80;assert.notEqual(await pixels(),first,beat+' effects must move with game time');
 }
 await page.locator('#pause').click();const paused=await pixels();await page.clock.runFor(1000);assert.equal(await pixels(),paused,'effects freeze while paused');await page.locator('#resume').click();
 await preview('revival');await page.clock.runFor(18800);assert.equal(await page.locator('#lcd').getAttribute('data-beat'),'silence');await page.locator('#lcd').screenshot({path:'screenshots/fx-silence-lcd.png'});
 await page.clock.runFor(2300);assert.equal(await page.locator('#lcd').getAttribute('data-beat'),'revival');await page.locator('#lcd').screenshot({path:'screenshots/fx-revival-lcd.png'});
 assert.deepEqual(errors,[]);console.log('Enemy, clash, awakening, sword afterimage, silence/revival and game-time pause verified in the actual LCD.');
}finally{await browser.close();}
