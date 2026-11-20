import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const base=process.env.SERENA_BASE??'http://127.0.0.1:5198';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:960}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 // Vite also serves a JavaScript import wrapper with ?import: fail only the
 // actual media request so the app can start and exercise video fallback.
 await page.route('**/serena-battle.mp4*',route=>new URL(route.request().url()).searchParams.has('import')?route.continue():route.abort());
 await page.goto(`${base}/?review=session`);
 await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
 await page.locator('#intro-skip').waitFor({timeout:60000});await page.locator('#intro-skip').click();
 await page.locator('[data-view=lcd]').click();
 await page.evaluate(()=>{const b=__sessionReview.board(),g=__sessionReview.game();b.feed(false);b.pause(true);g.presentation={basicReach:true,longReach:true,time:6,win:false,reachEnding:'standard',reachVariant:'pressure',presentationMode:'normal',displayRoute:'battle',drawId:1};g.jackpot=null;g.spinActive=false;delete g.previewWinAt;delete g.entryPrelude;g.rush=null;b.pause(false);});
 await page.waitForFunction(()=>document.querySelector('video[data-serena-scene-video="battle"]')?.error,{timeout:20000});
 await page.waitForFunction(()=>__sessionReview.board().snapshot().videoClip===null,{timeout:10000});
 await page.waitForTimeout(500);
 const playing=await page.evaluate(()=>({time:__sessionReview.game().presentation?.time,clip:__sessionReview.board().snapshot().videoClip}));
 assert.ok(playing.time>6,'game progression survives failed movie');assert.equal(playing.clip,null);assert.deepEqual(errors,[]);
 await page.screenshot({path:'/private/tmp/serena-layer-final-20261119/fallback-battle.png'});
 console.log('failed video returns to prior presentation without stopping the game');
}finally{await browser.close();}
