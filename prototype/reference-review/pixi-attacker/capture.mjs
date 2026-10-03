import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/pixi-attacker';await mkdir(`${dir}/video`,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const context=await browser.newContext({viewport:{width:1040,height:940},deviceScaleFactor:1,recordVideo:{dir:`${dir}/video`,size:{width:1040,height:940}}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));
await page.goto('http://localhost:5173/attacker-pixi.html');await page.waitForFunction(()=>!!window.__attacker);await page.locator('#demo').click();
const snap=()=>page.evaluate(()=>window.__attacker.snapshot());
await page.waitForFunction(()=>window.__attacker.snapshot().time>4,{},{timeout:15000});const closed=await snap();assert.equal(closed.counts.bonus,0);assert.equal(closed.gate.open,false);assert.equal(closed.doorVisible,true);assert.equal(closed.railsAboveDoor,true);await page.screenshot({path:`${dir}/closed.png`});
await page.waitForFunction(()=>{const s=window.__attacker.snapshot();return s.time>5.2&&s.motion.moving});const opening=await snap();assert.equal(opening.gate.active,false);await page.screenshot({path:`${dir}/opening.png`});
await page.waitForFunction(()=>window.__attacker.snapshot().time>11,{},{timeout:20000});const open=await snap();assert.ok(open.counts.bonus>0);assert.equal(open.gate.open,true);assert.equal(open.doorVisible,true);assert.ok(open.trayContacts>0);assert.equal(open.railsAboveDoor,true);await page.screenshot({path:`${dir}/open.png`});
await page.waitForFunction(()=>window.__attacker.snapshot().time>16,{},{timeout:15000});const reclosed=await snap();assert.equal(reclosed.gate.open,false);await page.screenshot({path:`${dir}/reclosed.png`});
await page.waitForFunction(()=>window.__attacker.snapshot().time>20.1,{},{timeout:15000});const end=await snap();assert.equal(end.counts.bonus,reclosed.counts.bonus);
await page.locator('#pause').click();const paused=await snap();await page.waitForTimeout(500);assert.deepEqual(await snap(),paused);
await page.locator('#guides').check();await page.screenshot({path:`${dir}/alignment.png`});
const assets=await page.evaluate(()=>window.__attacker.assets());for(let i=0;i<assets.length;i++)await writeFile(`${dir}/${['case','rails','door-closed','door-open','ball','moving-door'][i]}.png`,Buffer.from(assets[i].split(',')[1],'base64'));
for(const state of [closed,opening,open,reclosed]){assert.equal(state.gate.active,state.gate.open);const project=p=>({x:Math.round((p.x-state.origin.x)*2),y:Math.round((p.y-state.origin.y)*2)});assert.deepEqual(state.authoredGate.a,project(state.panel.freeA));assert.deepEqual(state.authoredGate.b,project(state.panel.freeB));}
assert.deepEqual(errors,[]);await writeFile(`${dir}/verification.json`,JSON.stringify({closed,opening,open,reclosed,end,errors},null,2));
const video=page.video();await context.close();await video.saveAs(`${dir}/attacker-demo.webm`);console.log(JSON.stringify({closed:closed.counts,open:open.counts,reclosed:reclosed.counts,end:end.counts,errors}));
}finally{await browser.close();}
