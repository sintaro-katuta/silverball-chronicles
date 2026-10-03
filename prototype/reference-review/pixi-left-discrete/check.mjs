import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const dir='reference-review/pixi-left-discrete',browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir,size:{width:390,height:844}}});
 const page=await ctx.newPage(),errors=[];page.setDefaultTimeout(20000);page.on('pageerror',e=>(errors.push(String(e)),console.error(e)));
 await page.goto('http://127.0.0.1:5174/');await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();await page.waitForFunction(()=>!!window.__session?.snapshot());await page.waitForTimeout(30000);
 await page.screenshot({path:`${dir}/mobile.png`});assert.ok(await page.evaluate(()=>__session.snapshot().session.accounting.reconciled));await ctx.close();
 await writeFile(`${dir}/video.json`,JSON.stringify({file:await page.video().path(),errors}));
 const pc=await browser.newPage({viewport:{width:1280,height:960}});pc.on('pageerror',e=>(errors.push(String(e)),console.error(e)));await pc.goto('http://127.0.0.1:5174/');await pc.locator('[data-unit="0"]').click();await pc.locator('#playMachine').click();await pc.waitForFunction(()=>!!window.__session?.snapshot());await pc.waitForTimeout(1000);await pc.screenshot({path:`${dir}/pc.png`});assert.deepEqual(errors,[]);
 console.log('Mobile and PC verified; accounting reconciles; no browser errors.');
}finally{await browser.close();}
