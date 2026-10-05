import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='reference-review/parallel-combat-2026-10-05/hair-full';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const runs=await Promise.all(['pressure','initiative','exchange'].map(async variant=>{
  const context=await browser.newContext({viewport:{width:420,height:340},recordVideo:{dir:dir+'/raw',size:{width:420,height:340}}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5187/reference-review/parallel-combat-2026-10-05/hair-combat-review.html');await page.waitForFunction(()=>window.__combat);
  const cases=[];
  for(const [name,win,ending,seconds] of [['win',true,'standard',54],['loss',false,'standard',54],['revival',true,'revival',58]]){
   await page.evaluate(({variant,win,ending})=>{__combat.times=[];__combat.seek(0,{variant,win,ending});__combat.play(true);},{variant,win,ending});
   for(let elapsed=0;elapsed<seconds;elapsed+=20)await page.waitForTimeout(Math.min(20,seconds-elapsed)*1000);
   await page.evaluate(()=>__combat.play(false));
   const timing=await page.evaluate(()=>{const values=__combat.times.slice().sort((a,b)=>a-b);return {frames:values.length,p95Ms:values[Math.floor(values.length*.95)],maxMs:values.at(-1),time:__combat.pose().time};});assert.ok(timing.time>=seconds-.1);
   for(const [label,t] of [['intro',3.5],['swing',6.23],['contact',6.4],['counter',28.3],['kneel',53.5],...(ending==='revival'?[['rise',54.4],['last',55.25]]:[])]){
    await page.evaluate(t=>__combat.seek(t),t);await page.screenshot({path:`${dir}/${variant}-${name}-${label}.png`});
   }
   cases.push({name,win,ending,seconds,timing});console.log(JSON.stringify({variant,name,timing}));
  }
  const video=page.video();await context.close();assert.deepEqual(errors,[]);return {variant,cases,errors,video:await video.path()};
 }));
 const sources={};for(const f of ['src/pixi/long-reach-timeline.js','src/pixi/long-reach-view.js','public/assets/lcd/long-reach/duel-poses-longhair-v4.png','public/assets/lcd/long-reach/duel-intermediates-longhair-v7.png'])sources[f]=createHash('sha256').update(await readFile(f)).digest('hex');
 await writeFile(dir+'/browser-check.json',JSON.stringify({runs,sources,fixture:'Independent actual Pixi view, all nine stories/outcomes at real-time speed. Explicit stored result; gameplay accounting and main result handoff are checked by root. Three concurrent headless contexts; timing is a desktop verification condition, not a mobile benchmark.'},null,2));
}finally{await browser.close();}
