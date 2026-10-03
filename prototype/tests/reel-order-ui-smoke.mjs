import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.addInitScript(()=>{Math.random=()=>.8;});
 await page.clock.install({time:new Date('2026-09-22T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-22T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
 await page.locator('#debug').click();await page.locator('#debugFill').click();
 const stopped=()=>page.locator('#reels span').evaluateAll(nodes=>nodes.map(n=>n.classList.contains('stopped')));
 await page.clock.runFor(2400);assert.deepEqual(await stopped(),[true,false,false]);await page.screenshot({path:'screenshots/reels-left-stop.png'});
 await page.clock.runFor(550);assert.deepEqual(await stopped(),[true,true,false]);await page.screenshot({path:'screenshots/reels-middle-stop.png'});
 await page.clock.runFor(550);assert.deepEqual(await stopped(),[true,true,true]);await page.screenshot({path:'screenshots/reels-right-stop.png'});
 console.log('Visible reels stop left, middle, then right on separate frames.');
}finally{await browser.close();}
