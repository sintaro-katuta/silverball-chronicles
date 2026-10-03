import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.clock.install({time:new Date('2026-09-22T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-22T00:00:01Z'));
 await page.goto('http://localhost:5173');
 await page.getByRole('button',{name:'試遊サポート：大当り・スキルをすぐに試す'}).click();
 await page.getByRole('button',{name:'試遊をはじめる'}).click();
 await page.locator('#auto').click();
 await page.getByRole('button',{name:'一時停止'}).click();
 await page.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();
 await page.locator('#previewPattern').selectOption('feint');
 await page.locator('#previewColor').selectOption('red');
 await page.locator('#previewReach').click();
 let elapsed=0;
 while((await page.evaluate(()=>window.__pachinko.snapshot().presentation?.time??0))<16&&elapsed<30000){await page.clock.runFor(500);elapsed+=500;}
 const cues=(await page.evaluate(()=>window.__pachinko.audio())).cues;
 for(const cue of ['red','chance','charge','strike'])assert.ok(cues.includes(cue),`${cue}: ${cues}`);
 assert.ok(!cues.includes('win'),`A chance cue must not confirm a win: ${cues}`);
 await page.locator('#sound').click();
 const count=(await page.evaluate(()=>window.__pachinko.audio())).cues.length;
 await page.clock.runFor(1500);
 assert.equal((await page.evaluate(()=>window.__pachinko.audio())).cues.length,count);
 assert.deepEqual(errors,[]);
 console.log('Red reach and nonwinning hot beats play distinct cues; mute stops later cues.');
}finally{await browser.close();}
