import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5174'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,1500));
import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';
const dir='reference-review/tokyoghoul-w-team/video',browser=await chromium.launch({channel:'chrome',headless:true});
try{const c=await browser.newContext({viewport:{width:1280,height:960},recordVideo:{dir,size:{width:1280,height:960}}}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(String(e)));await p.goto('http://127.0.0.1:5174/lcd-pixi.html');
await p.addStyleTag({content:'main{max-width:1200px;padding:12px}header p{display:none}h1{font-size:22px;margin:0 0 12px}aside{padding:0}aside h2{font-size:20px;margin:0}aside p{font-size:12px;min-height:0;margin:5px 0}dl{display:grid;grid-template-columns:1fr 1fr;gap:0 12px;margin:8px 0}dl div{padding:4px 0;font-size:11px}dd{font-size:16px}button{padding:5px}.buttons{margin:5px 0;gap:5px}.note{font-size:10px!important}#power-results{max-height:26px;overflow:hidden}'});
await p.locator('h1').evaluate(el=>el.textContent='盤面部品の確認：手動開閉・W専用制御は未接続');
for(const [mode,seconds]of [['normal',8],['right-closed',8],['rush',8],['bonus',8]]){await p.locator('#mode-'+mode).click();if(mode==='right-closed')await p.locator('#right-detail').click();await p.waitForTimeout(seconds*1000);}
await c.close();await writeFile(dir+'/board-recording.json',JSON.stringify({file:await p.video().path(),errors}));}finally{await browser.close();server.kill();}
