import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-basic-reach';await mkdir(`${dir}/video`,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://localhost:5173/lcd-reach.html');await page.waitForFunction(()=>!!window.__board);
 await page.locator('#demo').evaluate(el=>el.click());await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>window.__board.snapshot().spin.draws>=1,null,{timeout:20000});await page.locator('#lcd-detail').evaluate(el=>el.click());
 await page.waitForFunction(()=>{const r=window.__board.snapshot().spin.reach;return r&&r.time>.3&&r.time<1.5;},null,{timeout:20000});
 await page.locator('canvas').screenshot({path:`${dir}/reach.png`});const during=await page.evaluate(()=>window.__board.snapshot());
 await page.locator('#pause').evaluate(el=>el.click());const frozen=await page.evaluate(()=>window.__board.snapshot());await page.waitForTimeout(1000);assert.deepEqual((await page.evaluate(()=>window.__board.snapshot())).spin,frozen.spin);await page.locator('#pause').evaluate(el=>el.click());
 await page.waitForFunction(()=>{const s=window.__board.snapshot().spin;return !s.reach&&s.stopTimer>.4&&s.draws===2;},null,{timeout:10000});
 await page.locator('canvas').screenshot({path:`${dir}/miss.png`});const stopped=await page.evaluate(()=>window.__board.snapshot());assert.deepEqual(stopped.spin.reels.numbers.slice(0,2),[7,7]);assert.notEqual(stopped.spin.reels.numbers[2],7);
 await page.waitForFunction(()=>window.__board.snapshot().spin.active,null,{timeout:10000});await page.locator('canvas').screenshot({path:`${dir}/resumed.png`});
 await page.waitForFunction(()=>window.__board.snapshot().time>23,null,{timeout:20000});await page.locator('#feed').evaluate(el=>el.click());
 await page.waitForFunction(()=>{const s=window.__board.snapshot();return s.inFlight===0&&!s.spin.active&&!s.spin.reach&&s.spin.holds===0&&s.spin.stopTimer===0;},null,{timeout:30000});
 await page.locator('#pause').evaluate(el=>el.click());const final=await page.evaluate(()=>window.__board.snapshot());assert.equal(final.spin.draws,final.spin.accepted);assert.deepEqual(errors,[]);
 await writeFile(`${dir}/verification.json`,JSON.stringify({during,stopped,final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/reach.webm`);console.log(JSON.stringify({draws:final.spin.draws,entries:final.spin.entries,reels:stopped.spin.reels}));
}finally{await browser.close();}
