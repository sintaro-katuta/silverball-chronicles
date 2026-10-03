import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-normal-spin';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-play.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').evaluate(el=>el.click());
 await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>window.__board.snapshot().spin.draws>=1,null,{timeout:20000});await page.screenshot({path:`${dir}/overview.png`});
 await page.locator('#lcd-detail').evaluate(el=>el.click());
 await page.waitForFunction(()=>window.__board.snapshot().spin.holds>=1,null,{timeout:30000});await page.screenshot({path:`${dir}/holds.png`});
 await page.waitForFunction(()=>window.__board.snapshot().spin.stopTimer>.3,null,{timeout:15000});await page.locator('canvas').screenshot({path:`${dir}/stopped.png`});
 await page.locator('#pause').evaluate(el=>el.click());const paused=await page.evaluate(()=>window.__board.snapshot());await page.waitForTimeout(1500);assert.deepEqual((await page.evaluate(()=>window.__board.snapshot())).spin,paused.spin);await page.locator('#pause').evaluate(el=>el.click());
 await page.waitForFunction(()=>window.__board.snapshot().time>30,null,{timeout:50000});await page.locator('#overview').evaluate(el=>el.click());await page.locator('#feed').evaluate(el=>el.click());
 await page.waitForFunction(()=>{const s=window.__board.snapshot();return s.inFlight===0&&!s.spin.active&&s.spin.holds===0&&s.spin.stopTimer===0;},null,{timeout:35000});
 await page.locator('#pause').evaluate(el=>el.click());const final=await page.evaluate(()=>window.__board.snapshot());assert.ok(final.spin.draws>3);assert.equal(final.spin.draws,final.spin.accepted);assert.equal(final.spin.entries,final.counts.start);assert.deepEqual(errors,[]);
 await writeFile(`${dir}/verification.json`,JSON.stringify({final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/normal-spin.webm`);console.log(JSON.stringify(final.spin));
}finally{await browser.close();}
