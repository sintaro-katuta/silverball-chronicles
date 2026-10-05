import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const dir='reference-review/improvements-2026-10-05',browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],checks=[];
try{
 for(const view of ['whole','board','lcd']){
  const p=await browser.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(String(e)));
  await p.goto('http://127.0.0.1:5197/?review=session&scenario=development-win');await p.locator('[data-unit="0"]').click();await p.locator('#playMachine').click();await p.locator('#intro-skip').click();
  await p.locator('#controls-toggle').click();await p.locator('#feed-toggle').click();await p.locator('#controls-toggle').click();await p.locator('[data-view='+view+']').click();
  const drop=()=>p.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model(),q=m.flow.physics.pockets.find(q=>q.kind==='start'),b=m.flow.physics.spawn(g.fire(),0);Object.assign(b,{x:q.x,y:q.y-4,vx:0,vy:80,leftLaunchPlane:true});});
  await drop();await p.waitForFunction(()=>__sessionReview.game().draws===1&&!__sessionReview.game().spinActive);await p.waitForTimeout(350);await drop();
  await p.waitForFunction(()=>!!__session.snapshot().spin.reach);await p.waitForTimeout(1300);await p.screenshot({path:dir+'/mobile-'+view+'-development.png'});
  await p.waitForFunction(()=>!!__session.snapshot().spin.win);await p.waitForTimeout(650);await p.screenshot({path:dir+'/mobile-'+view+'-zoom.png'});await p.waitForTimeout(1050);await p.screenshot({path:dir+'/mobile-'+view+'-777.png'});
  const s=await p.evaluate(()=>__session.snapshot());assert.deepEqual(s.spin.reels.numbers,[7,7,7]);assert.equal(s.view,view);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),390);checks.push({view,reels:s.spin.reels.numbers,elapsed:s.spin.win.time,overflow:false});await p.close();
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/mobile-check.json',JSON.stringify({errors,checks,fixture:'Development win specified; two paid physical balls positioned above heso. Current UI at 390×844; no physical handset or audio check.'},null,2));console.log(JSON.stringify(checks));
}finally{await browser.close();}
