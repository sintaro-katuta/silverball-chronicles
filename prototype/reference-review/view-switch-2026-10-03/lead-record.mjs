import {spawn} from 'node:child_process';import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const dir='reference-review/view-switch-2026-10-03',scenario=process.argv[2]??'left',port=scenario==='rush'?5394:5393;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort','--config','reference-review/tokyoghoul-w-live/vite-record.config.mjs'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,2500));let browser;
try{browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir,size:{width:390,height:844}}}),page=await context.newPage(),errors=[],events=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/?review=session&scenario=${scenario}`);await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();await page.waitForFunction(()=>globalThis.__session?.snapshot()?.intro?.phase==='complete');if(scenario==='left')await page.evaluate(()=>{__sessionReview.game().w.rng=()=>.9;});
const start=Date.now(),seconds=scenario==='rush'?240:18;let complete=false;
for(let i=0;i<seconds/3;i++){
const view=['whole','board','lcd'][i%3];await page.locator(`[data-view="${view}"]`).click();await page.waitForTimeout(3000);const sample=await page.evaluate(()=>({snapshot:__session.snapshot(),lastBonus:__sessionReview.game().lastBonus}));events.push({seconds:(Date.now()-start)/1000,...sample});
if(i<3)await page.screenshot({path:`${dir}/lead-${scenario}-${view}-mobile.png`});
if(scenario==='rush'&&sample.lastBonus?.payout===3000){complete=true;await page.waitForTimeout(1500);break;}
}
await context.close();const file=await page.video().path();await writeFile(`${dir}/lead-${scenario}-record.json`,JSON.stringify({file,errors,complete,fixture:scenario==='rush'?'Initial RUSH and first result fixed; all balls launched naturally.':'Natural left launch, outcomes fixed miss. No physical ball placement.',events},null,2));console.log({file,errors,complete});
}finally{await browser?.close();server.kill();}
