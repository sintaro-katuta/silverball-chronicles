import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const out='reference-review/s09-040-20261020/context-final';await mkdir(out,{recursive:true});
const files=['src/pixi/board-assets.js','src/pixi/board-runtime.js','src/pixi/normal-spin-flow.js','src/pixi/normal-spin-view.js','src/pixi/review-reel-state.js','src/pixi/development-view.js','src/pixi/long-reach-view.js','src/pixi/resolve-portrait.js','src/pixi/special-route-motion.js','src/pixi/se/presentation-cues.js','public/assets/lcd/long-reach/hero-resolve-portrait-v1.png','public/assets/lcd/long-reach/character-context-v1.json','dev/character-context.html'];
const hashes=async()=>Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(f)).digest('hex')])));
const before=await hashes(),b=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 const p=await b.newPage({viewport:{width:1120,height:900}});p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5469/dev/character-context.html');await p.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 await p.screenshot({path:out+'/reference-sheet.png',fullPage:true});
 for(const [name,text] of [['black','黒背景'],['light','明背景']]){await p.getByRole('button',{name:text,exact:true}).click();await p.locator('#raw').screenshot({path:out+'/alpha-'+name+'.png'});}
 const images=await p.locator('img').evaluateAll(imgs=>imgs.map(i=>({url:new URL(i.src).pathname,width:i.naturalWidth,height:i.naturalHeight})));
 const manifest=JSON.parse(await readFile('public/assets/lcd/long-reach/character-context-v1.json'));
 for(const character of manifest.characters)for(const asset of character.references){const meta=await sharp('public'+asset.url).metadata();assert.deepEqual(asset.sourcePixels,[meta.width,meta.height]);}
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:out+'/reference-mobile.png',fullPage:true});
 await p.goto('http://127.0.0.1:5469/?review=session&scenario=predictions');await p.locator('[data-kind=main]').first().click();await p.locator('#playMachine').click();await p.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:60000});
 if(await p.locator('#intro-skip').isVisible())await p.locator('#intro-skip').click();
 await p.evaluate(()=>{const g=__sessionReview.game(),b=__sessionReview.board();b.feed(false);g.stopTimer=0;g.reviewPresentationRoute='battle';g.reviewReachVariant='pressure';g.reviewReachEnding='standard';g.w.rng=()=>.9;g.hit({id:990019},'start');});
 await p.waitForFunction(()=>!!__sessionReview.game().presentation,null,{timeout:20000});
 await p.evaluate(()=>{__sessionReview.game().presentation.time=41;__sessionReview.board().setView('lcd');Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 const paused=await p.evaluate(()=>({time:__sessionReview.game().presentation.time,paused:__sessionReview.board().snapshot().paused}));assert.equal(paused.paused,true);
 await p.waitForTimeout(300);assert.equal(await p.evaluate(()=>__sessionReview.game().presentation.time),paused.time);
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await p.evaluate(()=>__sessionReview.board().snapshot().paused),true);
 await p.evaluate(()=>__sessionReview.board().pause(false));await p.waitForFunction(t=>__sessionReview.game().presentation.time>t+.1,paused.time);
 await p.evaluate(()=>__sessionReview.board().pause(true));await p.screenshot({path:out+'/visibility-recovery.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(await hashes(),before);
 await writeFile(out+'/verification.json',JSON.stringify({images,sourceHashes:before,errors,visibility:{scope:'document.hidden and visibilitychange simulation in actual runtime, with manual resume; not a real mobile OS lifecycle test',frozen:true,stayedPausedOnReturn:true,resumed:true},userArtAcceptance:'pending'},null,2));
 console.log(JSON.stringify({images:images.length,metadata:'all manifest sizes match files',visibility:'passed',errors}));
}finally{await b.close();}
