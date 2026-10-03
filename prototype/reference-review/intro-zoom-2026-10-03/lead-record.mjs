import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const dir='reference-review/intro-zoom-2026-10-03';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5392','--strictPort','--config','reference-review/tokyoghoul-w-live/vite-record.config.mjs'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,2500));let browser;
try {
 browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},recordVideo:{dir,size:{width:390,height:844}}});
 const page=await context.newPage(),recordStarted=Date.now(),errors=[],events=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5392/?review=session&scenario=left');
 await page.locator('[data-unit="0"]').click();await page.locator('#playMachine').click();
 await page.waitForFunction(()=>globalThis.__session?.snapshot()?.intro?.active);
 const start=Date.now();
 for(const phase of ['whole','board','lcd','return','complete']){
  await page.waitForFunction(p=>__session.snapshot()?.intro?.phase===p,phase);
  const snapshot=await page.evaluate(()=>__session.snapshot());events.push({phase,seconds:(Date.now()-start)/1000,snapshot});
  await page.screenshot({path:`${dir}/lead-${phase}-mobile.png`});
 }
 await page.waitForTimeout(3000);events.push({phase:'playing',snapshot:await page.evaluate(()=>__session.snapshot())});
 await context.close();const file=await page.video().path();
 await writeFile(`${dir}/lead-record.json`,JSON.stringify({file,errors,cutOffsetSeconds:(start-recordStarted)/1000,events},null,2));console.log({file,errors});
} finally {await browser?.close();server.kill();}
