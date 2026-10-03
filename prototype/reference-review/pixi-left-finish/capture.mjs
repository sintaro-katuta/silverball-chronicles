import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-left-finish';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://localhost:5173/lcd-pixi.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').click();await page.locator('#mode-normal').click();
 await page.waitForTimeout(4000);await page.screenshot({path:`${dir}/overview.png`});await page.locator('canvas').screenshot({path:`${dir}/overview-board.png`});
 await page.locator('#detail').click();const states=[];
 for(const power of [.23,.24,.25]){
  await page.locator('#normal-power').evaluate((el,p)=>{el.value=String(p);el.dispatchEvent(new Event('input',{bubbles:true}));},power);
  const t=await page.evaluate(()=>window.__board.snapshot().time);await page.waitForFunction(t=>window.__board.snapshot().time>t,t+18,{timeout:30000});
  states.push({power,...await page.evaluate(()=>window.__board.snapshot())});
  await page.locator('canvas').screenshot({path:`${dir}/detail-${power}.png`});
 }
 await page.locator('#feed').click();const t=await page.evaluate(()=>window.__board.snapshot().time);await page.waitForFunction(t=>window.__board.snapshot().time>t,t+12,{timeout:20000});
 await page.locator('#pause').click();const final=await page.evaluate(()=>window.__board.snapshot());assert.equal(final.inFlight,0);assert.deepEqual(errors,[]);assert.ok(final.leftRoutes.nearHeso>0);assert.ok(final.leftRoutes.earlySpill>0);
 await writeFile(`${dir}/verification.json`,JSON.stringify({states,final,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/left-finish.webm`);console.log(JSON.stringify(final.leftRoutes));
}finally{await browser.close();}
