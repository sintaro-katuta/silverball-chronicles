import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-right-start';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const context=await browser.newContext({viewport:{width:1040,height:940},deviceScaleFactor:1,recordVideo:{dir:`${dir}/video`,size:{width:1040,height:940}}});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:5173/right-start-pixi.html');await page.waitForFunction(()=>!!window.__rightStart);if(process.argv.includes('--electric')){
 await page.locator('#electric').click();await page.waitForFunction(()=>window.__rightStart.snapshot().time>20,{},{timeout:30000});
 await page.locator('#pause').click();const snapshot=await page.evaluate(()=>window.__rightStart.snapshot());
 assert.ok(snapshot.electric.passes>0);assert.ok(snapshot.electric.openings>1);assert.ok(snapshot.electric.accepted>0);assert.ok(snapshot.electric.resolved>0);assert.ok(snapshot.electric.prize>0);assert.deepEqual(errors,[]);
 await page.screenshot({path:`${dir}/electric.png`});await writeFile(`${dir}/electric-verification.json`,JSON.stringify(snapshot,null,2));
 const video=page.video();await context.close();await video.saveAs(`${dir}/electric-demo.webm`);console.log(JSON.stringify(snapshot.electric));
}else{
 await page.locator('#demo').click();
const states={};for(const [name,time]of [['closed',4],['opening',5.2],['open',11],['closing',15.2],['reclosed',17],['end',20.1]]){await page.waitForFunction(t=>window.__rightStart.snapshot().time>t,time,{timeout:18000});states[name]=await page.evaluate(()=>window.__rightStart.snapshot());await page.screenshot({path:`${dir}/${name}.png`});}
for(const state of Object.values(states))assert.deepEqual(state.housing,states.closed.housing);assert.ok(states.open.chucker.scoop.b.x<states.closed.chucker.scoop.b.x);assert.ok(states.open.chucker.cover.b.x>states.closed.chucker.cover.b.x);
assert.equal(states.closed.counts.rush,0);assert.ok(states.open.counts.rush>0);assert.equal(states.reclosed.counts.rush,states.end.counts.rush);
for(const s of Object.values(states)){for(const name of ['scoop','cover'])for(const key of ['a','b']){const world=s.chucker[name][key];assert.deepEqual(s.pose[name][key],{x:Math.round((world.x-s.origin.x)*2),y:Math.round((world.y-s.origin.y)*2)});}}
await page.locator('#pause').click();const paused=await page.evaluate(()=>window.__rightStart.snapshot());await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>window.__rightStart.snapshot()),paused);
await page.locator('#guides').check();await page.screenshot({path:`${dir}/alignment.png`});assert.deepEqual(errors,[]);
const assets=await page.evaluate(()=>window.__rightStart.assets());for(let i=0;i<assets.length;i++)await writeFile(`${dir}/${['rails','ball'][i]}.png`,Buffer.from(assets[i].split(',')[1],'base64'));
await writeFile(`${dir}/verification.json`,JSON.stringify({states,errors},null,2));const video=page.video();await context.close();await video.saveAs(`${dir}/right-start-demo.webm`);console.log(JSON.stringify(Object.fromEntries(Object.entries(states).map(([k,v])=>[k,v.counts]))));
}}finally{await browser.close();}
