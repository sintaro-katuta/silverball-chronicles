import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {specialRoutePose,SPECIAL_ROUTE_TIMINGS} from '../src/pixi/special-route-motion.js';
const dir=process.env.SPECIAL_ROUTES_EVIDENCE??'reference-review/parallel-routes-2026-10-05/pass-fix';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:390,height:740},recordVideo:{dir:dir+'/raw',size:{width:390,height:740}}});
const page=await context.newPage(),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
const movementChecks=[];
try{
 await page.goto(process.env.SPECIAL_ROUTES_URL??'http://localhost:5194/dev/special-routes.html');await page.waitForFunction(()=>!!window.__specialRoutes);
 for(const mode of ['normal','rush'])for(const route of ['basic','direct'])for(const column of route==='basic'?[1]:[0,1,2]){
  let lo=0,hi=SPECIAL_ROUTE_TIMINGS[mode][route].decisionAt;
  for(let i=0;i<60;i++){const t=(lo+hi)/2;if(specialRoutePose({mode,route,win:true,time:t}).positions[column]<3.4)lo=t;else hi=t;}
  await page.evaluate(v=>__specialRoutes.set({...v,win:true}),{mode,route,time:hi});
  const strip=await page.evaluate(i=>__specialRoutes.inspectReels()[i].strip,column);
  assert.ok(Math.abs(strip.find(s=>s.digit===3).y-20)<.0001);
  assert.ok(Math.abs(strip.find(s=>s.digit===4).y+30)<.0001);
  movementChecks.push({mode,route,column,time:hi,strip});
 }
 for(const mode of ['normal','rush']){
  const at=mode==='normal'?5.7:3.8;
  await page.evaluate(v=>__specialRoutes.set({route:'basic',mode:v.mode,win:false,time:v.at-.65}),{mode,at});
  await page.evaluate(()=>__specialRoutes.play(true));
  await page.waitForFunction(t=>+document.querySelector('#time').value>=t,at+.72);
  await page.evaluate(()=>__specialRoutes.play(false));
  for(const offset of [-.01,0,.15,.3,.5,.66]){
   const p=await page.evaluate(t=>__specialRoutes.seek(t),at+offset),strip=await page.evaluate(()=>__specialRoutes.inspectReels()[1].strip);checks.push({mode,offset,position:p.positions[1],stopped:p.stopped[1],strip});
   await page.screenshot({path:`${dir}/${mode}-${offset}.png`});
   if(offset>=0&&offset<.65)assert.equal(p.stopped[1],false);
   if(offset>0&&offset<.65){assert.ok(strip.find(s=>s.digit===7).y>0);assert.ok(strip.find(s=>s.digit===8).y<0);}
   if(offset>.65){assert.equal(p.stopped[1],true);assert.equal(p.positions[1],8);}
  }
 }
 // Finish with two uninterrupted live passes for the user-facing short clip.
 for(const mode of ['normal','rush']){
  const at=mode==='normal'?5.7:3.8;
  await page.evaluate(v=>__specialRoutes.set({route:'basic',mode:v.mode,win:false,time:v.at-.8}),{mode,at});
  await page.evaluate(()=>__specialRoutes.play(true));
  await page.waitForFunction(t=>+document.querySelector('#time').value>=t,at+.85);
  await page.evaluate(()=>__specialRoutes.play(false));
  await page.waitForTimeout(150);
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({checks,movementChecks,errors,scope:'Actual normal/RUSH basic/direct sprites have current digit3 at y+20 and next digit4 at y-30; losing basic7 moves down while8 enters from above. Authored-speed live passes plus seek frames.'},null,2));
}finally{const video=page.video();await context.close();await writeFile(dir+'/video-path.txt',await video.path());await browser.close();}
