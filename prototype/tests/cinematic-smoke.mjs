import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});await page.clock.install({time:new Date("2026-09-22T00:00:00Z")});await page.clock.pauseAt(new Date("2026-09-22T00:00:01Z"));await page.goto('http://localhost:5173');await page.getByRole('button',{name:'試遊サポート：大当り・スキルをすぐに試す'}).click();await page.getByRole('button',{name:'試遊をはじめる'}).click();await page.locator('#auto').click();
const support=async()=>{await page.getByRole('button',{name:'一時停止'}).click();await page.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();};
await support();await page.locator('#testWin').click();
for(const [beat,t] of [['reach',-1.4],['warning',.6],['enemy',2.8],['clash',5.4],['crisis',9],['awakening',11],['strike',13.5],['resolve',17]]){let now=(await page.evaluate(()=>window.__pachinko.snapshot())).presentation?.time??0;while(now<t+2){await page.clock.runFor(Math.min(500,(t+2-now)*1000+20));now=(await page.evaluate(()=>window.__pachinko.snapshot())).presentation?.time??99;}assert.equal(await page.locator('#lcd').getAttribute('data-beat'),beat);await page.screenshot({path:`screenshots/battle-${beat}.png`});if(beat==='clash'){await page.getByRole('button',{name:'一時停止'}).click();const paused=await page.evaluate(()=>window.__pachinko.snapshot());await page.clock.runFor(600);assert.deepEqual(await page.evaluate(()=>window.__pachinko.snapshot()),paused);await page.getByRole('button',{name:'遊技を再開'}).click();}}
await page.clock.runFor(2000);assert.ok((await page.evaluate(()=>window.__pachinko.snapshot())).jackpot);assert.ok((await page.evaluate(()=>window.__pachinko.audio())).cues.includes('win'));assert.deepEqual(errors,[]);console.log('Battle beats, pause, and win→jackpot verified.');await context.close();
}finally{await browser.close();}
