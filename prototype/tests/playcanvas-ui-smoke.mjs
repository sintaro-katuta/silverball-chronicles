import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2}),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text());});
 for(let course=0;course<3;course++){
  await page.goto('http://localhost:5173');await page.getByRole('button',{name:'無限モード',exact:true}).click();await page.locator(`[data-course="${course}"]`).click();await page.locator('#start').click();await expect(page.locator('#auto')).toBeVisible({timeout:60000});await page.waitForTimeout(700);
  const renderer=await page.evaluate(()=>window.__pachinko.renderer());assert.equal(renderer.engine,'PlayCanvas');assert.equal(renderer.course,course);assert.ok(renderer.entities>300);assert.ok(renderer.drawCalls>0);assert.ok(Math.abs(renderer.canvas.width/renderer.canvas.cssWidth-2)<.03);
  console.log(`course ${course}`,renderer);await page.screenshot({path:`screenshots/playcanvas-course-${course}.png`});
  await page.locator('#pause').click();const before=await page.evaluate(()=>window.__pachinko.snapshot());await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>window.__pachinko.snapshot()),before);
 }
 assert.equal(requests.some(url=>/\/three(?:\/|\.js)/.test(url)),false,'runtime must not load Three.js');assert.deepEqual(errors,[]);
 // A real GLB request failure must not create or advance a game.
 await page.goto('http://localhost:5173');await page.route('**/models/course-0.glb',route=>route.abort());await page.locator('#start').click();await expect(page.locator('#loadingRetry')).toBeVisible({timeout:60000});assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 await page.unroute('**/models/course-0.glb');await page.locator('#loadingRetry').click();await expect(page.locator('#auto')).toBeVisible({timeout:60000});
 await page.goto('http://localhost:5173');let release;const hold=new Promise(r=>release=r);await page.route('**/models/course-0.glb',async route=>{await hold;await route.continue().catch(()=>{});});
 const pending=page.waitForRequest('**/models/course-0.glb');await page.locator('#start').click();await pending;await page.locator('#loadingCancel').click();release();await expect(page.locator('#start')).toBeVisible();await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.__pachinko.snapshot()),null);
 console.log('Three courses, native PlayCanvas rendering/DPR, pause, GLB failure/retry/cancel passed.');
}finally{await browser.close();}
