import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-pass-gate';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}});
 const page=await context.newPage(),errors=[],states=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-pixi.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#mode-right-closed').click();
 await page.waitForTimeout(4000);await page.locator('canvas').screenshot({path:`${dir}/overview.png`});await page.locator('#right-detail').click();
 for(const mode of ['right-closed','rush','bonus','right-closed']){
  await page.locator(`#mode-${mode}`).click();const t=await page.evaluate(()=>window.__board.snapshot().time);
  await page.waitForFunction(t=>window.__board.snapshot().time>t,t+10,{timeout:20000});
  states.push(await page.evaluate(()=>window.__board.snapshot()));await page.locator('canvas').screenshot({path:`${dir}/${mode}.png`});
 }
 await page.locator('#feed').click();await page.waitForTimeout(10000);await page.locator('#pause').click();
 const final=await page.evaluate(()=>window.__board.snapshot());assert.equal(final.inFlight,0);assert.ok(final.gate.count>0);assert.ok(final.counts.rush>0);assert.ok(final.counts.bonus>0);assert.ok(final.counts.out>0);assert.deepEqual(errors,[]);
 await writeFile(`${dir}/verification.json`,JSON.stringify({states,final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/gate.webm`);console.log(JSON.stringify(final));
}finally{await browser.close();}
