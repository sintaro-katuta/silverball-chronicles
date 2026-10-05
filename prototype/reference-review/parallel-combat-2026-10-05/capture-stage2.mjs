import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='reference-review/parallel-combat-2026-10-05/'+(process.argv[2]??'stage2');await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const variant of ['pressure','initiative','exchange']){
  const context=await browser.newContext({viewport:{width:420,height:340},recordVideo:{dir:dir+'/raw',size:{width:420,height:340}}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:5187/reference-review/parallel-combat-2026-10-05/combat-review.html');await page.waitForFunction(()=>window.__combat);
  const clips=[],pixels={};
  for(const [name,win,ending,start,duration,snapshots] of [
   ['attack',true,'standard',5.8,3.5,[6.16,6.32,6.4,6.6]],
   ['counter',true,'standard',27.7,3.5,[28.16,28.3,28.5]],
   ['loss',false,'standard',50.8,3.4,[51.85,53.5]],
   ['revival',true,'revival',50.8,5.5,[51.85,53.5,54.4,55.25]]
  ]){
   await page.evaluate(({start,win,ending,variant})=>{__combat.seek(start,{win,ending,variant});__combat.play(true);},{start,win,ending,variant});
   await page.waitForTimeout(duration*1000);await page.evaluate(()=>__combat.play(false));
   for(const t of snapshots){const pose=await page.evaluate(t=>__combat.seek(t),t);assert.ok(pose.hero.frame>=0&&pose.hero.frame<12);assert.ok(pose.enemy.frame>=0&&pose.enemy.frame<12);await page.screenshot({path:`${dir}/${variant}-${name}-${t}.png`});const png=await page.screenshot({clip:{x:0,y:0,width:420,height:280}});pixels[`${name}-${t}`]=createHash('sha256').update(png).digest('hex');}
   clips.push({name,win,ending,start,duration});
  }
  for(const t of [51.85,53.5])assert.equal(pixels[`loss-${t}`],pixels[`revival-${t}`]);
  const video=page.video();await context.close();runs.push({variant,clips,pixels,video:await video.path()});
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,defeatPixelsEqual:true,fixture:'Standalone actual PixiJS view with motion atlas. Equal-speed excerpts joined by explicit seeks. Fixed results; no gameplay/payout verification.'},null,2));
}finally{await writeFile(dir+'/errors.json',JSON.stringify(errors));await browser.close();}
