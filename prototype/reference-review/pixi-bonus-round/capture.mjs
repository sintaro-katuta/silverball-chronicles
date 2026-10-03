import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-bonus-round';await mkdir(`${dir}/video`,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-bonus.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').evaluate(el=>el.click());await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>window.__board.snapshot().spin.round?.phase==='open',null,{timeout:40000});
 await page.waitForFunction(()=>window.__board.snapshot().spin.round?.count>=3,null,{timeout:15000});await page.screenshot({path:`${dir}/round-1.png`});
 await page.waitForFunction(()=>{const r=window.__board.snapshot().spin.round;return r.phase==='gap'&&r.round===1;},null,{timeout:15000});await page.screenshot({path:`${dir}/closed.png`});const closed=await page.evaluate(()=>window.__board.snapshot());assert.equal(closed.attacker.progress,0);assert.equal(closed.spin.round.count,10);assert.equal(closed.spin.round.payout,150);
 await page.waitForFunction(()=>{const r=window.__board.snapshot().spin.round;return r.round===2&&r.count>=2;},null,{timeout:15000});
 await page.locator('#pause').evaluate(el=>el.click());await page.screenshot({path:`${dir}/round-2.png`});const final=await page.evaluate(()=>window.__board.snapshot());await page.waitForTimeout(1000);assert.deepEqual((await page.evaluate(()=>window.__board.snapshot())).spin,final.spin);assert.equal(final.spin.round.payout,final.counts.bonus*15);assert.deepEqual(errors,[]);
 await writeFile(`${dir}/verification.json`,JSON.stringify({closed,final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/round.webm`);console.log(JSON.stringify({round:final.spin.round.round,count:final.spin.round.count,payout:final.spin.round.payout}));
}finally{await browser.close();}
