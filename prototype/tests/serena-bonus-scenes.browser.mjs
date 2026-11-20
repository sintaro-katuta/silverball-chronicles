import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';

const base=process.env.SERENA_BASE??'http://127.0.0.1:5196';
const output=process.env.SERENA_OUTPUT??'/private/tmp/serena-scenes-browser';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
 for(const scenario of ['charge','bonus']){
  const page=await browser.newPage({viewport:{width:1280,height:960}});
  page.on('pageerror',e=>errors.push(`${scenario}: ${e.message}`));
  await page.goto(`${base}/?review=session`);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
  await page.locator('[data-view=lcd]').click();
  // Isolated review fixture: enqueue a fixed draw, never changing real play.
  await page.evaluate(kind=>{
   const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);
   g.w.rng=()=>kind==='charge'?.75/199.9:0;
   if(kind==='bonus')g.reviewPresentationRoute='direct';
   g.w.enqueue('tokuzu1',987654);
  },scenario);
  const expected=scenario==='charge'?'charge':'bonus';
  await page.waitForFunction(clip=>{
   const v=document.querySelector('video[data-serena-scene-video]');
   return __sessionReview.board().snapshot().videoClip===clip&&v?.dataset.serenaSceneVideo===clip&&!v.paused;
  },expected,{timeout:45000});
  const state=await page.evaluate(()=>({charge:__sessionReview.game().jackpot?.charge,round:__sessionReview.board().snapshot().spin.round}));
  assert.equal(!!state.charge,scenario==='charge');
  await page.screenshot({path:`${output}/desktop-${scenario}.png`});
  if(scenario==='bonus'){
   await page.waitForFunction(()=>['opening','open'].includes(__sessionReview.board().snapshot().spin.round?.phase),null,{timeout:12000});
   await page.waitForTimeout(2500);
   const shot=await page.screenshot({path:`${output}/desktop-bonus-payout.png`});

  }
  await page.close();console.log(`${scenario}: stored outcome and corresponding video passed`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
