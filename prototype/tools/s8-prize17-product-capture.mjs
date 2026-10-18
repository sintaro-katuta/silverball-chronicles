// Local production-entry visual QA only. No trial simulation or narration rendering.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {chromium} from '../node_modules/playwright/index.mjs';
import {browserLaunchOptions} from '../tests/browser-launch.js';
const opt={};for(let i=2;i<process.argv.length;i+=2){if(!process.argv[i]?.startsWith('--')||!process.argv[i+1])throw Error('--key value required');opt[process.argv[i].slice(2)]=process.argv[i+1];}
for(const k of ['url','out','head','raw'])if(!opt[k])throw Error('Missing --'+k);
const root=fileURLToPath(new URL('../../',import.meta.url)),url=new URL(opt.url);if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Local server only');url.searchParams.set('review','session');
const out=path.resolve(opt.out);await fs.mkdir(out,{recursive:true});if((await fs.readdir(out)).length)throw Error('Fresh output directory required');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const head=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(head(),opt.head,'Source HEAD differs');
async function inventory(){const rows=[];async function visit(dir){for(const e of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const p=path.join(dir,e.name);if(e.isDirectory())await visit(p);else if(e.isFile()){const b=await fs.readFile(p);rows.push({path:path.relative(root,p),sha256:sha(b),bytes:b.length});}}}for(const dir of ['prototype/src','prototype/public'])await visit(path.join(root,dir));for(const name of ['prototype/package.json','prototype/package-lock.json','prototype/tests/browser-launch.js','prototype/tools/s8-prize17-product-capture.mjs']){const b=await fs.readFile(path.join(root,name));rows.push({path:name,sha256:sha(b),bytes:b.length});}return rows;}
const compressed=await fs.readFile(opt.raw),expanded=compressed[0]===31?gunzipSync(compressed):compressed,raw=JSON.parse(expanded);
assert.equal(raw.config.id,'three-prize17-left200');assert.equal(raw.pins.length,101);
const before={head:head(),inputs:await inventory(),raw:{file:path.resolve(opt.raw),compressedSHA:sha(compressed),compressedBytes:compressed.length,expandedSHA:sha(expanded),expandedBytes:expanded.length,sourceSHA:raw.sourceSHA,configSHA:raw.configSHA,layoutSHA:raw.layoutSHA},command:process.argv};await fs.writeFile(path.join(out,'inputs-before.json'),JSON.stringify(before,null,2));
const errors=[],runs=[],screens=[];let browser;
try{
 browser=await chromium.launch(browserLaunchOptions());
 for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});const page=await context.newPage();page.on('pageerror',e=>errors.push({viewport,type:'page',message:String(e)}));page.on('console',m=>{if(m.type()==='error')errors.push({viewport,type:'console',message:m.text()});});page.on('response',r=>{if(r.status()>=400)errors.push({viewport,type:'http',url:r.url(),status:r.status()});});
  await page.goto(url.href);await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();
  async function ready(){await page.waitForFunction(()=>!!window.__sessionReview?.board?.(),null,{timeout:90000});await page.locator('#intro-skip').waitFor({state:'visible'});await page.locator('#intro-skip').click();await page.locator('.view-switch').waitFor({state:'visible'});}
  async function check(stage){const evidence=await page.evaluate(async()=>{const review=window.__sessionReview,p=review.model().flow.physics,profile=await import('/src/app/production-board-profile.js');return {stage:undefined,pins:structuredClone(p.pins),expected:profile.productionBoardFlowOptions(),mechanisms:structuredClone(p.mechanisms),guideRoles:p.colliders.filter(c=>c.role==='heso-guide').map(c=>c.role),display:{radius:p.ballRadius,scale:p.displayBallScale,diameter:p.displayBallDiameter??null},snapshot:review.board().snapshot(),powerUI:document.querySelector('#power-control').value,powerLabel:document.querySelector('#power-label').textContent};});assert.deepEqual(evidence.pins,raw.pins,'Actual production101 pins/attributes differ from accepted raw');assert.deepEqual(evidence.pins.map(({id,x,y})=>({id,x,y})),evidence.expected.pinPositions,'Actual pins differ from production factory declaration');assert.equal(evidence.mechanisms.length,1);assert.equal(evidence.mechanisms[0].shapeProfile,'photo-three-vane');assert.equal(evidence.mechanisms[0].x,64);assert.equal(evidence.mechanisms[0].y,476.5);assert.deepEqual(evidence.guideRoles,[]);assert.equal(evidence.expected.leftAdmissionGuides,false);assert.equal(evidence.display.radius,1.8);assert.equal(evidence.display.scale,1.8/4.6);assert.equal(evidence.display.diameter,null);return {stage,...evidence};}
  const spawns=[];async function actualSpawn(power){const previousId=await page.evaluate(()=>__sessionReview.model().flow.physics.nextId-1);await page.waitForFunction(({previousId,power})=>__sessionReview.model().flow.physics.balls.some(b=>b.id>previousId&&b.power===power),{previousId,power},{timeout:10000});const evidence=await page.evaluate(({previousId,power})=>{const p=__sessionReview.model().flow.physics;const ball=p.balls.find(b=>b.id>previousId&&b.power===power);return {previousId,power,time:p.time,ball:structuredClone(ball),mode:__sessionReview.model().getMode()};},{previousId,power});assert.equal(evidence.mode,'normal');spawns.push(evidence);}
  await ready();await actualSpawn(.18);assert.equal(await page.locator('#power-control').inputValue(),'0.18');const states=[await check('initial')];
  await page.locator('#power-control').fill('0.24');await page.locator('#power-control').dispatchEvent('input');assert.equal(await page.locator('#power-label').innerText(),'0.24');await actualSpawn(.24);states.push(await check('manual0.24'));
  await page.locator('#power-control').fill('0.18');await page.locator('#power-control').dispatchEvent('input');assert.equal(await page.locator('#power-label').innerText(),'0.18');await actualSpawn(.18);
  await page.locator('#quick-pause').click();assert.equal(await page.evaluate(()=>__sessionReview.board().snapshot().paused),true);const pauseTime=await page.evaluate(()=>__sessionReview.board().snapshot().time);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>__sessionReview.board().snapshot().time),pauseTime);
  await page.locator('#resume').click();
  // Pause through the exposed review API after proving the real menu; avoids hiding
  // the board behind a modal in the requested static visual evidence.
  await page.evaluate(()=>__sessionReview.board().pause(true));assert.equal(await page.evaluate(()=>__sessionReview.board().snapshot().paused),true);states.push(await check('paused-for-static-capture'));
  for(const view of ['whole','board']){await page.locator(`[data-view=${view}]`).click();await page.waitForTimeout(100);const name=`${viewport.width}x${viewport.height}-${view}.png`;await page.screenshot({path:path.join(out,name)});const b=await fs.readFile(path.join(out,name));screens.push({file:name,sha256:sha(b),bytes:b.length,viewport,view,paused:true});}
  await page.locator('#quick-pause').click();await page.locator('#leave').click();await page.locator('#floor').click();assert.equal(await page.locator('#canvas canvas').count(),0);
  await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await ready();await actualSpawn(.18);assert.equal(await page.locator('#power-control').inputValue(),'0.18');states.push(await check('reentry-no-cumulative-shift'));runs.push({viewport,states,spawns});await context.close();
 }
 assert.deepEqual(errors,[]);assert.equal(head(),before.head);const after={head:head(),inputs:await inventory()};assert.deepEqual(after.inputs,before.inputs,'Source/assets/media changed');assert.equal(sha(await fs.readFile(opt.raw)),before.raw.compressedSHA);
 await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({success:true,before,after,runs,screens,errors,browser:browser.version(),scope:'Real production entry and UI operations, two viewports; static snapshots. Dev review=session changes game RNG/entry fixture, not an admission-rate trial. Menu pause verified; after resuming, exposed review API pause freezes unobscured screenshots. No sprite-position-independent assertion: runtime derives all pin Sprite positions from the same physics.pins, visual review remains required. No video/audio or native continuous-play claim.'},null,2));console.log('PRODUCT_CAPTURE_PASS');
}catch(e){await fs.writeFile(path.join(out,'failure.json'),JSON.stringify({message:String(e),errors,runs,screens},null,2));throw e;}finally{await browser?.close();console.log('OWNED_CHROME_CLOSED');}
