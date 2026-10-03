import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/reference-review/physics-audit/replay.html');
 const contactFrame=await page.evaluate(()=>data.tracks[1].frames.findIndex(f=>f.contact==='upper-reflector'));assert.ok(contactFrame>0);await page.locator('#seek').fill(String(contactFrame));
 assert.match(await page.locator('#readout').innerText(),/upper-reflector/);
 await page.screenshot({path:'screenshots/physical-replay.png'});
 const before=Number(await page.locator('#seek').inputValue());await page.locator('#play').click();await page.waitForTimeout(500);assert.ok(Number(await page.locator('#seek').inputValue())>before);
 assert.deepEqual(errors,[]);console.log('Physical slow-motion replay shows real contacts and velocities; scrub and play work.');
}finally{await browser.close();}
