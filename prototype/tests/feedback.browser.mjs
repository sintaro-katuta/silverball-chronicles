import {browserLaunchOptions} from './browser-launch.js';
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const out=fileURLToPath(new URL(process.env.FEEDBACK_OUTPUT??'../reference-review/player-feedback-2026-10-07/',import.meta.url));await mkdir(out,{recursive:true});
async function assertDraws(page){const actual=await page.evaluate(()=>({text:document.querySelector('#draws').textContent,count:__session.snapshot().spin.draws}));assert.equal(actual.text,`${Math.floor(actual.count).toLocaleString('ja-JP')}回`);assert.equal(await page.locator('#draws').locator('..').locator('dt').innerText(),'消化回数（通常＋RUSH）');}
const browser=await chromium.launch(browserLaunchOptions());
let currentPage=null,stage='startup',clockTrace=[];
async function waitExperienceStage(page,label,condition,timeout,filename){
 stage=label;clockTrace=[];const trace=clockTrace,waitStarted=Date.now();
 const observe=async()=>{const value=await page.evaluate(()=>{const s=__session.snapshot();return {gameTime:s.time,round:s.spin.round,win:s.spin.win,currentPhase:s.spin.round?.phase??s.spin.reach?.stage??s.session.phase,bonus:s.w.bonus,mode:s.mode,bonusAdmissions:s.counts.bonus,feeding:s.feeding,paused:s.paused,phase:s.session.phase,visibility:document.visibilityState};});trace.push({waitStage:label,elapsedMs:Date.now()-waitStarted,...value});};
 await observe();const clockTimer=setInterval(()=>observe().catch(()=>{}),10000);
 // Finite wall budget; never advance/seek the game's presentation or physics clock.
 try{await page.waitForFunction(condition,null,{timeout});await observe();}
 finally{clearInterval(clockTimer);}
 await writeFile(`${out}/${filename}`,JSON.stringify(trace,null,2));
}

try{
 for(const viewport of (process.env.DEMO_ONLY?[]:[{width:390,height:844},{width:1440,height:900}])){
 const page=await browser.newPage({viewport}),errors=[];currentPage=page;stage=`UI ${viewport.width}x${viewport.height}`;page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.REVIEW_URL??'http://127.0.0.1:5173');await page.locator('[data-kind=main]').first().click();
 assert.equal(await page.locator('[data-experience]').count(),3);await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
 for(const view of ['whole','board','lcd']){await page.locator(`[data-view=${view}]`).click();await page.waitForTimeout(300);
 const frame=await page.locator('#canvas').boundingBox(),canvas=await page.locator('#canvas canvas').boundingBox();assert.ok(Math.abs(frame.width-canvas.width)<1);assert.ok(Math.abs(frame.height-canvas.height)<1);if(viewport.width===1440)assert.ok(frame.height>780,'PC board should use recovered vertical space');
 for(const selector of ['#dock-stock','#feed-toggle','#power-control','#quick-pause']){assert.ok(await page.locator(selector).isVisible());const box=await page.locator(selector).boundingBox();assert.ok(box.y>=0&&box.y+box.height<=viewport.height,`${selector} outside viewport`);}
 await page.locator('#controls-toggle').click();await assertDraws(page);const panel=await page.locator('#play-controls').boundingBox(),dock=await page.locator('.play-dock').boundingBox();assert.ok(panel.y+panel.height<dock.y);assert.equal(await page.locator('#play-controls').evaluate(el=>el.scrollWidth<=el.clientWidth),true);await page.screenshot({path:`${out}/${viewport.width}-${view}-panel.png`});await page.locator('#controls-toggle').click();await page.screenshot({path:`${out}/${viewport.width}-${view}.png`});}
 await page.locator('#feed-toggle').click();assert.equal(await page.locator('#feed-state').innerText(),'発射停止中');
 await page.locator('#power-control').fill('0.24');await page.locator('#power-control').dispatchEvent('input');assert.equal(await page.locator('#power-label').innerText(),'0.24');
 await page.locator('#controls-toggle').click();const dock=await page.locator('.play-dock').boundingBox(),panel=await page.locator('#play-controls').boundingBox();assert.ok(panel.y+panel.height<dock.y);
 await page.screenshot({path:`${out}/${viewport.width}-panel.png`});await page.locator('#controls-toggle').click();
 await page.locator('#quick-pause').click();const paused=await page.evaluate(()=>__session.snapshot());await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>__session.snapshot().time),paused.time);
 await assertDraws(page);await page.locator('#resume').click();await assertDraws(page);await page.locator('#feed-toggle').click();assert.equal(await page.locator('#feed-state').innerText(),'発射中');
 await page.locator('#quick-pause').click();const resolved=await page.evaluate(()=>__session.snapshot().spin.draws);await page.locator('#leave').click();assert.equal(await page.locator('[role=dialog] dt').filter({hasText:'消化回数 / 大当り'}).locator('..').locator('dd').innerText(),`${resolved.toLocaleString('ja-JP')}回 / 0`);await page.screenshot({path:`${out}/${viewport.width}-result.png`});await page.locator('#floor').click();
 assert.deepEqual(errors,[]);console.log(`UI passed ${viewport.width}x${viewport.height}`);await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];currentPage=page;page.on('pageerror',e=>errors.push(e.message));
 for(const scenario of (process.env.UI_ONLY?[]:['battle','bonus','rush'])){
 stage=`experience ${scenario}`;clockTrace=[];
 await page.goto(process.env.REVIEW_URL??'http://127.0.0.1:5173');await page.locator('[data-kind=main]').first().click();await page.locator(`[data-experience=${scenario}]`).click();await page.locator('#intro-skip').click();
 await page.waitForFunction(()=>document.querySelector('#dock-guidance').textContent.includes('演出体験中'));await assertDraws(page);
 if(scenario==='battle'){
 stage='experience battle: PUSH visible';clockTrace=[];const trace=clockTrace,waitStarted=Date.now();
 const observe=async()=>{const value=await page.evaluate(()=>{const s=__session.snapshot();return {gameTime:s.time,reach:s.spin.reach,paused:s.paused,phase:s.session.phase,pushHidden:document.querySelector('.decision-push-button').hidden,visibility:document.visibilityState};});trace.push({elapsedMs:Date.now()-waitStarted,...value});};
 await observe();const clockTimer=setInterval(()=>observe().catch(()=>{}),10000);
 // Allow variable headless execution speed without changing the game clock.
 // Keep every semantic assertion and a finite wall deadline.
 try{await page.locator('.decision-push-button').waitFor({state:'visible',timeout:300000});await observe();}
 finally{clearInterval(clockTimer);}
 await writeFile(`${out}/battle-clock.json`,JSON.stringify(clockTrace,null,2));
 stage='experience battle: PUSH press';await page.screenshot({path:`${out}/battle-push.png`});await page.locator('.decision-push-button').click();
 await waitExperienceStage(page,'experience battle: stored award',()=>__session.snapshot().session.jackpots>0,60000,'battle-award-clock.json');
 await waitExperienceStage(page,'experience battle: right-play guidance',()=>document.querySelector('#dock-guidance').textContent.includes('発射開始を押して右打ち')&&document.querySelector('#power-caption').textContent==='右打ち・自動調整中',90000,'battle-guide-clock.json');
 assert.equal(await page.locator('#power-control').isVisible(),false);assert.equal(await page.locator('#power-label').isVisible(),false);
 await page.screenshot({path:`${out}/battle-launch-guidance.png`});await page.locator('#feed-toggle').click();
 await waitExperienceStage(page,'experience battle: dedicated payout',()=>__session.snapshot().w.bonus?.payout>0,150000,'battle-payout-clock.json');
 }else if(scenario==='bonus')await waitExperienceStage(page,'experience bonus: dedicated payout',()=>__session.snapshot().w.bonus?.payout>0,150000,'bonus-clock.json');
 else {assert.ok(await page.evaluate(()=>__session.snapshot().w.rush));await page.waitForTimeout(6000);}
 await assertDraws(page);assert.ok(await page.evaluate(()=>__session.snapshot().spin.draws>0));const evidence=await page.evaluate(()=>__session.snapshot());if(scenario==='battle'||scenario==='bonus'){assert.ok(evidence.w.bonus.payout>0);assert.ok(evidence.counts.bonus>0);}await writeFile(`${out}/experience-${scenario}.json`,JSON.stringify(evidence,null,2));await page.screenshot({path:`${out}/experience-${scenario}.png`});await page.locator('#quick-pause').click();await page.locator('#leave').click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
 assert.equal(await page.evaluate(()=>__session.snapshot().session.total),0);assert.equal(await page.evaluate(()=>__session.snapshot().spin.draws),0);await assertDraws(page);assert.ok(!(await page.locator('#dock-guidance').innerText()).includes('演出体験中'));console.log(`Experience passed ${scenario}`);
 }
 assert.deepEqual(errors,[]);
}catch(error){
 // prepare removes incomplete candidates; keep failed diagnostics outside
 // that candidate and outside public assets. No manifest is issued here.
 const failureOut=fileURLToPath(new URL('../.cache/release/failures/feedback/',import.meta.url));
 try{await mkdir(failureOut,{recursive:true});const state=await currentPage?.evaluate(()=>{const c=document.querySelector('#canvas canvas'),gl=c?.getContext('webgl2')??c?.getContext('webgl'),ext=gl?.getExtension('WEBGL_debug_renderer_info');return {snapshot:window.__session?.snapshot?.()??null,visibility:document.visibilityState,renderer:gl?.getParameter(ext?ext.UNMASKED_RENDERER_WEBGL:gl.RENDERER)??null};}).catch(e=>({unavailable:String(e)}));const filename=`${Date.now()}.json`;await writeFile(`${failureOut}/${filename}`,JSON.stringify({stage,error:String(error),browser:browser.version(),clockTrace,state},null,2));console.error('Feedback failure diagnostic:',JSON.stringify({stage,browser:browser.version(),renderer:state?.renderer,visibility:state?.visibility,paused:state?.snapshot?.paused,gameTime:state?.snapshot?.time,reach:state?.snapshot?.spin?.reach,phase:state?.snapshot?.session?.phase,clockTrace,file:`prototype/.cache/release/failures/feedback/${filename}`}));}catch(diagnosticError){console.error('Feedback diagnostic unavailable:',String(diagnosticError));}
 throw error;
}finally{await browser.close();}
