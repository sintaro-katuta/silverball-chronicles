import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const out=fileURLToPath(new URL('../reference-review/player-feedback-2026-10-07/',import.meta.url));await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:out+'video',size:{width:390,height:844}}});
const page=await context.newPage(),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.REVIEW_URL??'http://127.0.0.1:4178');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
 await page.screenshot({path:out+'idle-start.png'});await page.waitForTimeout(1500);await page.screenshot({path:out+'idle-motion.png'});
 await page.waitForFunction(()=>__session.snapshot().counts.start>0,null,{polling:'raf',timeout:90000});await page.screenshot({path:out+'natural-admission.png'});
 for(let i=0;i<6;i++){await page.waitForTimeout(10000);const s=await page.evaluate(()=>__session.snapshot());const sample={time:s.time,shots:s.spawned,entries:s.counts.start,draws:s.spin.draws,stock:s.session.stock,accounting:s.session.accounting};samples.push(sample);console.log(JSON.stringify({time:Math.round(sample.time),shots:sample.shots,entries:sample.entries,draws:sample.draws}));}
 await page.locator('#feed-toggle').click();await page.screenshot({path:out+'natural-stop.png'});assert.ok(samples.at(-1).entries>0);assert.ok(samples.at(-1).draws>0);assert.deepEqual(errors,[]);
 await writeFile(out+'natural-play.json',JSON.stringify({samples,errors,video:'silent browser recording; natural lottery; no admission injection'},null,2));
}finally{await context.close();await browser.close();}
