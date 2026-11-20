import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

// Real local game progression; the review fixture fixes the result and puts
// one ball at the existing inlet so the result can be observed without waiting.
const base=process.env.SERENA_BASE??'http://127.0.0.1:5196';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`${base}/?review=session&scenario=development-loss`);
 await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
 await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
 await page.locator('#controls-toggle').click();await page.locator('#feed-toggle').click();await page.locator('#controls-toggle').click();
 await page.locator('[data-view=lcd]').click();
 await page.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model(),p=m.flow.physics.pockets.find(p=>p.kind==='start'),shot=g.fire(),b=m.flow.physics.spawn(shot,0);Object.assign(b,{x:p.x,y:p.y-4,vx:0,vy:40,leftLaunchPlane:true});});
 await page.waitForFunction(()=>!!__sessionReview.game().presentation?.longReach,{timeout:20000});
 const seen=new Set(),start=Date.now();let ended=false;
 while(Date.now()-start<85000){
  const s=await page.evaluate(()=>({p:__sessionReview.game().presentation,clip:__sessionReview.board().snapshot().videoClip,result:__sessionReview.game().lastDraw,accounting:__session.snapshot().session.accounting}));
  if(s.clip)seen.add(s.clip);
  if(!s.p){assert.equal(s.result,false);assert.equal(s.accounting.reconciled,true);ended=true;break;}
  await page.waitForTimeout(150);
 }
 assert.ok(ended,'long reach must resolve');assert.ok(seen.has('battle'),'battle video appeared');assert.ok(seen.has('defeat'),'defeat video appeared');
 assert.deepEqual(errors,[]);console.log('Actual local loss reach completed; videos:',[...seen].join(', '),'accounting reconciled');
}finally{await browser.close();}
