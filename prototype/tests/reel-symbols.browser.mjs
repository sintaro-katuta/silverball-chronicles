import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {symbolForDraw} from '../src/presentation/reel-symbols.js';
const dir='reference-review/reel-symbols-2026-10-06';await mkdir(dir+'/raw',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[],runs=[];
try{
 for(const f of [
  {mode:'normal',win:true,route:'basic',symbol:3},
  {mode:'normal',win:false,route:'basic',symbol:9},
  {mode:'rush',win:true,route:'direct',symbol:5},
  {mode:'rush',win:false,route:'basic',symbol:2},
  {mode:'normal',win:true,route:'battle',symbol:1,ending:'revival'},
  {mode:'rush',win:true,route:'battle',symbol:8},
 ]){
  const key=`${f.mode}-${f.route}-${f.symbol}-${f.win?'win':'loss'}`,ctx=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir:dir+'/raw',size:{width:390,height:844}}}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:5194/?review=session&scenario=predictions');await p.locator('[data-kind=main]').first().click();await p.locator('#playMachine').click();await p.waitForFunction(()=>!!window.__sessionReview?.board?.());
  if(await p.locator('#intro-skip').isVisible())await p.locator('#intro-skip').click();
  await p.locator('#controls-toggle').click();await p.locator('#feed-toggle').click();await p.locator('#controls-toggle').click();await p.locator('[data-view=lcd]').click();
  let id=1;while(symbolForDraw(id,f.mode,f.win)!==f.symbol)id++;
  if(f.mode==='rush'){await p.evaluate(()=>{const g=__sessionReview.game(),m=__sessionReview.model();g.startRush();m.setMode('rush');});await p.waitForTimeout(7000);}
  await p.evaluate(({f,id})=>{const g=__sessionReview.game();g.reviewPresentationRoute=f.route;g.reviewPremium=null;g.reviewReachEnding=f.ending;g.w.serial=id-1;g.w.rng=()=>f.win?0:.9;g.hit({id:990001},f.mode==='rush'?'fuzu':'start');},{f,id});
  await p.waitForFunction(()=>!!__sessionReview.game().presentation);
  assert.equal(await p.evaluate(()=>__sessionReview.game().reelOutcome[0]),f.symbol);
  if(f.route==='basic')await p.waitForFunction(()=>__sessionReview.game().presentation?.time>=1.8);
  await p.screenshot({path:`${dir}/${key}-reach.png`});
  if(f.route!=='battle'){await p.waitForFunction(()=>{const g=__sessionReview.game(),t=g.presentation?.time??-1;return t>=(g.presentation?.displayRoute==='direct'?(g.rush?2.5:3.4):(g.rush?4.5:6.4));});await p.screenshot({path:`${dir}/${key}-landing.png`});}
  if(f.route==='battle')await p.evaluate(()=>__sessionReview.game().presentation.time=51);
  await p.waitForFunction(()=>!__sessionReview.game().presentation,null,{timeout:12000});
  const result=await p.evaluate(()=>({reels:__sessionReview.game().stoppedReels,win:__sessionReview.game().lastDraw,accounting:__sessionReview.game().accounting}));
  assert.deepEqual(result.reels,[f.symbol,f.symbol,f.win?f.symbol:f.symbol%9+1]);assert.equal(result.win,f.win);assert.equal(result.accounting.reconciled,true);
  await p.waitForTimeout(f.mode==='normal'&&f.win?1650:350);await p.screenshot({path:`${dir}/${key}-result.png`});
  const video=p.video();await ctx.close();runs.push({fixture:f,result,video:await video.path()});console.log(key+' passed');
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/browser-check.json',JSON.stringify({runs,errors,scope:'Current local production screen. Fixed admitted outcomes and stable draw IDs, short routes played continuously; battle seeks to 51s then plays defeat/revival/result. Mobile viewport emulation. Audio not listened to.'},null,2));
}finally{await browser.close();}
