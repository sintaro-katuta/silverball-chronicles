import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>Math.random=()=>.8);
 await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 await page.locator('#debug').click();await page.locator('[name=odds]').fill('100000');await page.getByRole('button',{name:'適用して再開'}).click();await page.clock.runFor(2500);
 await page.locator('#debug').click();await page.locator('#debugFill').click();await page.clock.runFor(500);
 const windows=page.locator('#reels > span');assert.equal(await windows.count(),3);assert.equal(await page.locator('#reels span').count(),3);
 const transforms=()=>page.locator('.reel-strip').evaluateAll(nodes=>nodes.map(node=>node.style.transform));
 await page.locator('.reel-symbol').first().evaluate(node=>node.dataset.retained='yes');const before=await transforms();await page.clock.runFor(32);const moving=await transforms();assert.notDeepEqual(moving,before);assert.equal(await page.locator('.reel-symbol').first().getAttribute('data-retained'),'yes');
 await page.screenshot({path:'screenshots/reels-vertical-scroll.png'});
 await page.locator('#pause').click();const paused=await transforms();await page.clock.runFor(1000);assert.deepEqual(await transforms(),paused);await page.locator('#resume').click();
 await page.clock.runFor(1800);assert.deepEqual(await windows.evaluateAll(nodes=>nodes.map(node=>node.dataset.phase)),['stopped','spinning','spinning']);
 const left=await transforms();await page.clock.runFor(550);assert.deepEqual(await windows.evaluateAll(nodes=>nodes.map(node=>node.dataset.phase)),['stopped','stopped','spinning']);assert.equal((await transforms())[0],left[0]);
 await page.clock.runFor(550);assert.deepEqual(await windows.evaluateAll(nodes=>nodes.map(node=>node.dataset.phase)),['stopped','stopped','stopped']);
 const positions=await windows.evaluateAll(nodes=>nodes.map(node=>{const digit=Number(node.dataset.value),symbol=node.querySelector('.reel-strip').children[9+digit-1],a=node.getBoundingClientRect(),b=symbol.getBoundingClientRect();return {digit,centerError:Math.abs((a.top+a.height/2)-(b.top+b.height/2)),viewport:a.height,step:b.height};}));
 for(const result of positions){assert.ok(result.centerError<1,JSON.stringify(result));assert.ok(result.viewport>result.step*1.3,'viewport must show adjacent upper/lower symbols');}
 const model=await page.evaluate(()=>window.__pachinko.snapshot());assert.deepEqual(positions.map(position=>position.digit),model.reels);
 await page.screenshot({path:'screenshots/reels-vertical-stopped.png'});assert.deepEqual(errors,[]);
 console.log('Continuous vertical strips, retained DOM, paused motion, ordered stops and centered final symbols verified.');
}finally{await browser.close();}
