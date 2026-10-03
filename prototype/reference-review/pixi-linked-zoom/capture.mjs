import {chromium} from '@playwright/test';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-linked-zoom';await mkdir(`${dir}/video`,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const variant of ['win']){
 const context=await browser.newContext({viewport:{width:1080,height:1250},recordVideo:{dir:`${dir}/video`,size:{width:1080,height:1250}}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`http://localhost:5173/lcd-${variant==='win'?'win':'reach'}.html`);await page.waitForFunction(()=>!!window.__board);await page.locator('#demo').evaluate(el=>el.click());await page.locator('#normal-power').evaluate(el=>{el.value='.23';el.dispatchEvent(new Event('input',{bubbles:true}));});
 await page.waitForFunction(()=>window.__board.snapshot().spin.draws>=1,null,{timeout:20000});await page.locator('#lcd-detail').evaluate(el=>el.click());
 await page.waitForFunction(()=>{const r=window.__board.snapshot().spin.reach;return r&&r.time>1.82&&r.time<2;},null,{timeout:20000});const pending=await page.evaluate(()=>window.__board.snapshot());assert.deepEqual(pending.spin.reels.stopped,[true,false,true]);await page.locator('canvas').screenshot({path:`${dir}/${variant}-pending.png`});
 await page.waitForFunction(()=>window.__board.snapshot().spin.reach?.time>2.6,null,{timeout:5000});await page.locator('canvas').screenshot({path:`${dir}/${variant}-cut.png`});
 await page.waitForFunction(()=>{const s=window.__board.snapshot().spin;return !s.reach&&(s.win||s.stopTimer>.3);},null,{timeout:5000});const result=await page.evaluate(()=>window.__board.snapshot());assert.equal(result.spin.reels.numbers[0],7);assert.equal(result.spin.reels.numbers[2],7);assert.equal(result.spin.reels.numbers[1]===7,variant==='win');
 if(variant==='win'){
  await page.waitForFunction(()=>{const t=window.__board.snapshot().spin.win.time;return t>.56&&t<.62;},null,{timeout:3000});await page.locator('canvas').screenshot({path:`${dir}/win-pulse.png`});
  await page.waitForFunction(()=>window.__board.snapshot().spin.win.time>2.15,null,{timeout:5000});await page.locator('canvas').screenshot({path:`${dir}/win-normal-size.png`});
  await page.waitForFunction(()=>window.__board.snapshot().spin.win.time>6.4,null,{timeout:7000});
 }else{await page.locator('canvas').screenshot({path:`${dir}/miss-result.png`});await page.waitForFunction(()=>window.__board.snapshot().spin.active,null,{timeout:10000});await page.waitForTimeout(1800);}
 await page.locator('#pause').evaluate(el=>el.click());assert.deepEqual(errors,[]);await writeFile(`${dir}/${variant}.json`,JSON.stringify({pending,result,final:await page.evaluate(()=>window.__board.snapshot()),errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/${variant}.webm`);console.log(variant+' verified');
}}finally{await browser.close();}
