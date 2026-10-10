import assert from 'node:assert/strict';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createServer} from 'node:net';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {chromium} from '@playwright/test';
import {browserLaunchOptions} from './browser-launch.js';
import {getPinLayoutModel,createBaselineLayout,validateMove,importLayout,layoutHash} from '../src/dev/pin-layout-model.js';
import {simulationInputs} from '../tools/pin-layout-inputs.mjs';
import {verifySourceGuards} from './pin-layout-source-guards.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const evidence=resolve(process.env.PIN_LAYOUT_EVIDENCE_DIR??join(root,'.cache/release/pin-layout-tool'));
await mkdir(evidence,{recursive:true});
const simulationSource=await simulationInputs();
await writeFile(join(root,'dev/pin-layout-inputs.json'),JSON.stringify(simulationSource,null,2)+'\n');
const port=await new Promise((accept,reject)=>{const server=createServer();server.on('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>accept(port));});});
const server=spawn(process.execPath,[join(root,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:root,stdio:['ignore','pipe','pipe']});
let serverOutput='';for(const stream of [server.stdout,server.stderr])stream.on('data',chunk=>{serverOutput+=chunk;});
const url=`http://127.0.0.1:${port}/dev/pin-layout.html`;
let browser;
try{
 for(let i=0;;i++){if(server.exitCode!==null)throw new Error(serverOutput);try{if((await fetch(url)).ok)break;}catch{}if(i>=120)throw new Error('Tool server did not start: '+serverOutput);await new Promise(r=>setTimeout(r,250));}
 const model=getPinLayoutModel(),baseline=createBaselineLayout();
 const pin=model.pins.find(p=>model.groups.find(g=>g.id===p.group).editable);
 const site=model.sites.find(s=>s.id==='grid:12:77');
 assert.ok(site&&validateMove(baseline,pin.id,site.id).valid,'Recorded pin-1 comparison example is an allowed move');
 browser=await chromium.launch(browserLaunchOptions());
 const results=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()}: ${r.url()}`);});
  await page.goto(url);await page.waitForFunction(()=>window.__pinLayoutUI?.ready,undefined,{timeout:60000});
  const snapshot=()=>page.evaluate(()=>window.__pinLayoutUI.snapshot());
  if(viewport.width===1440)await verifySourceGuards(page,simulationSource);
  const before=await snapshot();assert.equal(before.layout.placements.length,101);assert.equal(before.diff.length,0);assert.match(before.effectiveHash,/^[a-f0-9]{64}$/);
  await page.screenshot({path:join(evidence,`${viewport.width}-baseline.png`),fullPage:true});
  await page.locator('#pin-id').selectOption(String(pin.id));await page.locator('#site-id').selectOption(site.id);await page.locator('#move-pin').click();
  await page.waitForFunction(hash=>window.__pinLayoutUI.snapshot().effectiveHash!==hash,before.effectiveHash);
  const moved=await snapshot();assert.equal(moved.diff.length,1);assert.equal(moved.layout.placements.length,101);
  assert.equal(await page.locator('#diff-rows tr').count(),1);
  await page.locator('#zoom-in').click();assert.notEqual(await page.locator('#zoom-level').innerText(),'100%');await page.locator('#view-fit').click();
  await page.screenshot({path:join(evidence,`${viewport.width}-edited.png`),fullPage:true});
  const download=page.waitForEvent('download');await page.locator('#save-layout').click();const saved=await download;const savedPath=join(evidence,`${viewport.width}-layout.json`);await saved.saveAs(savedPath);
  const exported=await readFile(savedPath,'utf8');assert.equal(JSON.parse(exported).layout.placements.length,101);
  const cliImported=await importLayout(exported);
  assert.equal(await layoutHash(cliImported),moved.effectiveHash,'Browser configuration also loads in Node with identical pins');
  await page.locator('#restore-layout').click();await page.waitForFunction(hash=>window.__pinLayoutUI.snapshot().effectiveHash===hash,before.effectiveHash);
  await page.locator('#load-layout').setInputFiles({name:'candidate.json',mimeType:'application/json',buffer:Buffer.from(exported)});
  await page.waitForFunction(hash=>window.__pinLayoutUI.snapshot().effectiveHash===hash,moved.effectiveHash);
  await page.locator('#load-layout').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"schemaVersion":1,"placements":[]}')});
  await page.waitForFunction(()=>window.__pinLayoutUI.snapshot().error.length>0);assert.equal((await snapshot()).effectiveHash,moved.effectiveHash,'Invalid import keeps current configuration');
  assert.equal(await page.locator('#notice').getAttribute('data-error'),'true');
  if(viewport.width===1440){
   await page.locator('#mode-compare').click();await page.locator('#run-comparison').click();
   await page.waitForFunction(()=>!window.__pinLayoutUI.snapshot().running&&window.__pinLayoutUI.snapshot().result,undefined,{timeout:600000});
   const result=(await snapshot()).result;assert.equal(result.fullWindow,true);assert.equal(result.comparable,true);assert.equal(result.sourceEvidence.unchanged,true);assert.match(result.codeSHA,/^[a-f0-9]{64}$/);assert.equal(result.baseline.runs.length,6);assert.equal(result.candidate.runs.length,6);
   for(const group of [result.baseline,result.candidate])for(const run of group.runs){assert.equal(run.physical.reconciled,true);assert.equal(run.physical.uniqueOutcomeIds,true);assert.equal(run.physical.countsMatchOutcomes,true);if(run.ledger){assert.equal(run.ledger.check.reconciled,true);assert.equal(run.ledger.check.spentMatchesShots,true);}}
   assert.equal(await page.locator('#compare-rows tr').count(),12);
   await page.locator('#playback-row').selectOption({index:0});await page.locator('#playback-time').fill('12');
   await page.screenshot({path:join(evidence,'1440-comparison.png'),fullPage:true});
   await writeFile(join(evidence,'browser-comparison.json'),JSON.stringify(result,null,2)+'\n');
  }
  assert.deepEqual(errors,[]);results.push({viewport,baselineSHA:before.effectiveHash,candidateSHA:moved.effectiveHash,constraintSHA:before.constraintHash,pinId:pin.id,siteId:site.id,errors});
  page.removeAllListeners('dialog');page.on('dialog',d=>d.accept());await page.close();
 }
 await writeFile(join(evidence,'browser-verification.json'),JSON.stringify({createdAt:new Date().toISOString(),node:process.version,browser:browser.version(),results,scope:'Real local tool UI, both widths; full 12-condition comparison on desktop; no production deployment'},null,2)+'\n');
 const live=await promisify(execFile)(process.execPath,[join(root,'tools/pin-layout-live-review.mjs')],{env:{...process.env,REVIEW_URL:url,FEEDBACK_OUTPUT:join(evidence,'live'),REVIEW_HEADED:'0'},timeout:180000,maxBuffer:2*1024*1024});
 process.stdout.write(live.stdout);process.stderr.write(live.stderr);
 console.log('Pin layout tool passed: both widths, edit, invalid import, save/load/restore, full comparison and recorded flow.');
}finally{if(browser)await browser.close();server.kill('SIGTERM');await writeFile(join(evidence,'server.log'),serverOutput);}
