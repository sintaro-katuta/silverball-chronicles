import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-windmill';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const context=await browser.newContext({viewport:{width:1040,height:940},deviceScaleFactor:1,recordVideo:{dir:`${dir}/video`,size:{width:1040,height:940}}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.goto('http://localhost:5173/windmill-pixi.html');await page.waitForFunction(()=>!!window.__windmill);await page.locator('#demo').click();
const snap=()=>page.evaluate(()=>window.__windmill.snapshot());const initial=await snap();
await page.waitForFunction(()=>window.__windmill.snapshot().contacts>0,{},{timeout:20000});const first=await snap();await page.screenshot({path:`${dir}/contact.png`});
await page.waitForFunction(()=>window.__windmill.snapshot().time>15,{},{timeout:25000});const running=await snap();await page.screenshot({path:`${dir}/running.png`});
assert.notEqual(running.mechanism.angle,initial.mechanism.angle);assert.ok(running.contacts>0);assert.equal(running.mechanism.x,75);assert.equal(running.mechanism.y,384);assert.equal(running.mechanism.radius,18);
await page.waitForFunction(()=>window.__windmill.snapshot().time>35,{},{timeout:30000});await page.locator('#pause').click();const paused=await snap();await page.waitForTimeout(500);assert.deepEqual(await snap(),paused);
await page.locator('#guides').check();await page.screenshot({path:`${dir}/alignment.png`});assert.deepEqual(errors,[]);
await writeFile(`${dir}/verification.json`,JSON.stringify({initial,first,running,paused,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/windmill-demo.webm`);console.log(JSON.stringify({running,errors}));
}finally{await browser.close();}
