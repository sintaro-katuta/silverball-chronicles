import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const dir='reference-review/parallel-combat-2026-10-05';
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const [name,win,ending,start,duration] of [['attack',true,'standard',5.9,3.5],['counter',true,'standard',27.8,3.5],['loss',false,'standard',50.8,3.5],['revival',true,'revival',50.8,7.5]]){
  const context=await browser.newContext({viewport:{width:420,height:340},recordVideo:{dir:dir+'/raw',size:{width:420,height:340}}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5187/reference-review/parallel-combat-2026-10-05/combat-review.html');await page.waitForFunction(()=>window.__combat);
  await page.evaluate(({start,win,ending})=>{__combat.seek(start,{win,ending});__combat.play(true);},{start,win,ending});
  await page.waitForTimeout(duration*1000);await page.evaluate(()=>__combat.play(false));
  const snapshots=name==='attack'?[6.39,6.48,6.7]:name==='counter'?[28.29,28.38]:name==='loss'?[51.85,53.5]:[51.85,53.5,54.4,55.25];
  const pixels={};
  for(const t of snapshots){const pose=await page.evaluate(t=>__combat.seek(t),t);assert.ok(pose.hero.x>0&&pose.enemy.x<230);await page.screenshot({path:`${dir}/${name}-${t}.png`});const stage=await page.screenshot({clip:{x:0,y:0,width:420,height:280}});pixels[t]=createHash('sha256').update(stage).digest('hex');}
  const video=page.video();await context.close();runs.push({name,win,ending,start,duration,pixels,video:await video.path()});
 }
 assert.deepEqual(errors,[]);const loss=runs.find(r=>r.name==='loss'),revival=runs.find(r=>r.name==='revival');for(const t of [51.85,53.5])assert.equal(loss.pixels[t],revival.pixels[t]);await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,defeatPixelsEqual:true,fixture:'Standalone display fixture uses actual PixiJS view; outcomes fixed, no gameplay/payout validation'},null,2));
}finally{await writeFile(dir+'/errors.json',JSON.stringify(errors));await browser.close();}
