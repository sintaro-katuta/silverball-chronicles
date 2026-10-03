import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const dir='migration-prep';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
 const errors=[],failed=[];page.on('pageerror',e=>{errors.push(e.stack);console.error(e.stack)});page.on('requestfailed',r=>failed.push(r.url()));
 await page.addInitScript(()=>{let seed=9282026;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
 await page.goto('http://localhost:5173');await page.locator('#floorArt canvas').waitFor();await page.waitForTimeout(300);
 await page.locator('[data-unit="0"]').click();await page.locator('#detailCabinetArt canvas').waitFor();await page.waitForTimeout(200);await page.locator('#playMachine').click();await page.locator('#auto').waitFor({timeout:90000});
 await page.waitForTimeout(2500);
 const snap=()=>page.evaluate(()=>window.__pachinko.snapshot());
 assert.ok((await snap()).balls>0,'real balls launch');
 assert.equal(await page.locator('.pixel-cabinet-frame').count(),0,'no image over physical cabinet');
 assert.equal(await page.locator('.anime-still img').getAttribute('src'),'/moon-guardian-pixel-v2.png');
 const renderer=await page.evaluate(()=>window.__pachinko.renderer());assert.equal(renderer.canvas.width,540);assert.equal(renderer.canvas.height,880);
 await page.locator('#pause').click();const paused=await snap();await page.waitForTimeout(400);assert.deepEqual(await snap(),paused);await page.getByRole('button',{name:'遊技を再開',exact:true}).click();
 await page.locator('#auto').click();
 const sizes=[];
 for(const [width,height] of [[320,568],[390,844],[1440,1000],[844,390]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(200);
  const b=await page.evaluate(()=>{const board=document.querySelector('.board-wrap').getBoundingClientRect(),lcd=document.querySelector('#lcd').getBoundingClientRect();return {x:board.x,y:board.y,right:board.right,bottom:board.bottom,width:board.width,height:board.height,lcdX:lcd.x,lcdY:lcd.y,lcdWidth:lcd.width,lcdHeight:lcd.height,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(b.overflow,false);assert.ok(b.x>=-1&&b.right<=width+1&&b.y>=0&&b.bottom<=height,'whole board fits');
  assert.ok(Math.abs(b.lcdX-b.x-112*b.width/540)<1);assert.ok(Math.abs(b.lcdY-b.y-172*b.height/880)<1);
  assert.ok(Math.abs(b.lcdWidth-317*b.width/540)<1&&Math.abs(b.lcdHeight-408*b.height/880)<1);sizes.push({width,height,...b});
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#debug').click();await page.locator('[data-rounds="4"]').click();
 await page.waitForFunction(()=>document.querySelector('#lcd').dataset.beat==='clash',{},{timeout:25000});
 await page.screenshot({path:`${dir}/after-battle.png`});
 await page.waitForFunction(()=>!!window.__pachinko.snapshot().jackpot,{},{timeout:35000});
 await page.waitForTimeout(450);await page.screenshot({path:`${dir}/after-bonus.png`});
 const bonus=await snap(),bonusRenderer=await page.evaluate(()=>window.__pachinko.renderer());assert.equal(bonus.jackpot.rounds,4);
 await page.locator('#debug').click();await page.locator('#debugRush').click();await page.waitForTimeout(400);assert.ok((await snap()).rush);await page.screenshot({path:`${dir}/after-rush.png`});
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 const result={renderer,sizes,bonusRenderer,bonus,checks:['real balls','pause/resume','new LCD artwork','no frame overlay','viewport and LCD alignment','live reach to bonus','rush'],errors,failed};
 await writeFile(`${dir}/verification.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
