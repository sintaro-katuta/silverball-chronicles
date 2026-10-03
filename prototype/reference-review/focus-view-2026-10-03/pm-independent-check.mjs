import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir='reference-review/focus-view-2026-10-03';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5332','--strictPort','--config','reference-review/tokyoghoul-w-live/vite-record.config.mjs'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,1800));
let browser;const checks=[];
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5332/?review=session&scenario=left');
 await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();await page.waitForFunction(()=>window.__sessionReview?.model());
 // Execute toggle and snapshots in one JS task to exclude expected frame advancement.
 for(const visible of [true,false]){
  const exact=await page.evaluate(()=>{const before=JSON.stringify(__session.snapshot()),feed=__sessionReview.model().flow.continuous;document.querySelector('#controls-toggle').click();return {same:before===JSON.stringify(__session.snapshot()),feedSame:feed===__sessionReview.model().flow.continuous,visible:!document.querySelector('#play-controls').hidden,focus:document.activeElement.id};});
  assert.equal(exact.same,true);assert.equal(exact.feedSame,true);assert.equal(exact.visible,visible);if(!visible)assert.equal(exact.focus,'controls-toggle');
 }
 checks.push('show/hide leaves full game snapshot and feed unchanged synchronously');
 await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();
 const stopped=await page.evaluate(()=>({time:__session.snapshot().time,feed:__sessionReview.model().flow.continuous}));await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>__sessionReview.model().flow.continuous),false);assert.ok(await page.evaluate(t=>__session.snapshot().time>t,stopped.time));
 checks.push('hiding while feed stopped preserves stopped feed and advancing processing');
 const geometries=[];
 for(const size of [{width:390,height:844},{width:844,height:390},{width:1280,height:960},{width:320,height:568},{width:720,height:320}]){
  await page.setViewportSize(size);
  for(const open of [false,true]){
   await page.evaluate(v=>{const panel=document.querySelector('#play-controls');if(!panel.hidden!==v)document.querySelector('#controls-toggle').click();},open);
   const g=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};return {canvas:rect('#canvas canvas'),toggle:rect('#controls-toggle'),panel:rect('#play-controls'),width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,feed:__sessionReview.model().flow.continuous};});
   for(const r of [g.canvas,g.toggle])assert.ok(r.x>=-.1&&r.y>=-.1&&r.right<=g.width+.1&&r.bottom<=g.height+.1);
   if(open)assert.ok(g.canvas.right<=g.panel.x+.1||g.canvas.bottom<=g.panel.y+.1);
   assert.equal(g.documentWidth,g.width);assert.equal(g.feed,false);geometries.push({size,open,...g});
  }
 }
 checks.push('same mounted game survives portrait/landscape/desktop/small/short resize without overflow or feed restart');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{const p=document.querySelector('.play-page');p.style.setProperty('--panel-bottom','34px');p.style.setProperty('--controls-top','107px');});
 const safe=await page.evaluate(()=>{const c=document.querySelector('#canvas canvas').getBoundingClientRect(),p=document.querySelector('#play-controls').getBoundingClientRect();return {canvasBottom:c.bottom,panelTop:p.y,panelBottom:p.bottom,toggleHeight:document.querySelector('#controls-toggle').getBoundingClientRect().height};});
 assert.ok(safe.canvasBottom<=safe.panelTop+.1);assert.ok(safe.panelBottom<=844);assert.ok(safe.toggleHeight>=44);
 checks.push('simulated safe bottom34/top47 preserves panel separation and 44px toggle');
 await page.locator('#menu').click();const paused=await page.evaluate(()=>__session.snapshot());await page.waitForTimeout(400);assert.deepEqual(await page.evaluate(()=>__session.snapshot()),paused);
 await page.locator('#resume').click();assert.equal(await page.evaluate(()=>__session.snapshot().paused),false);assert.equal(await page.evaluate(()=>__sessionReview.model().flow.continuous),false);
 checks.push('menu pauses full game; resume preserves explicitly stopped feed');
 await page.locator('#controls-toggle').click();await page.keyboard.press('Escape');await page.locator('#leave').click();await page.locator('#floor').click();
 checks.push('Escape accesses menu and exit while controls hidden');assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/pm-independent-check.json`,JSON.stringify({checks,geometries,safe,errors},null,2));console.log(JSON.stringify({checks,errors}));
 await context.close();
}finally{await browser?.close();server.kill();}
