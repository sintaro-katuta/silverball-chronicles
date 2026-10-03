import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-rainbow-win';await mkdir(`${dir}/video`,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-win.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').evaluate(el=>el.click());await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>window.__board.snapshot().spin.draws>=1,null,{timeout:20000});await page.locator('#lcd-detail').evaluate(el=>el.click());
 await page.waitForFunction(()=>!!window.__board.snapshot().spin.reach,null,{timeout:20000});await page.locator('canvas').screenshot({path:`${dir}/reach.png`});
 await page.waitForFunction(()=>{const w=window.__board.snapshot().spin.win;return w&&w.time>.5&&w.time<1.5;},null,{timeout:10000});await page.locator('canvas').screenshot({path:`${dir}/777.png`});
 await page.waitForFunction(()=>{const w=window.__board.snapshot().spin.win;return w&&w.time>2.5&&w.time<4;},null,{timeout:5000});await page.locator('canvas').screenshot({path:`${dir}/win.png`});
 await page.locator('#feed').evaluate(el=>el.click());await page.waitForFunction(()=>window.__board.snapshot().spin.win?.time>6.2,null,{timeout:5000});await page.locator('canvas').screenshot({path:`${dir}/right-guide.png`});
 await page.waitForFunction(()=>window.__board.snapshot().inFlight===0,null,{timeout:15000});await page.locator('#pause').evaluate(el=>el.click());
 const final=await page.evaluate(()=>window.__board.snapshot());assert.deepEqual(final.spin.reels.numbers,[7,7,7]);assert.equal(final.spin.draws,2);assert.deepEqual(errors,[]);await writeFile(`${dir}/verification.json`,JSON.stringify({final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/win.webm`);console.log(JSON.stringify({holds:final.spin.holds,draws:final.spin.draws,entries:final.spin.entries}));
}finally{await browser.close();}
