import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173');await page.getByRole('button',{name:'遊技をはじめる'}).waitFor();await page.screenshot({path:'screenshots/home-mobile.png',fullPage:true});
assert.equal(await page.locator('[data-course]:disabled').count(),2);
await page.getByRole('button',{name:'遊技をはじめる'}).click();await page.locator('#auto').waitFor({timeout:60000});await page.waitForTimeout(8000);let snap=await page.evaluate(()=>window.__pachinko.snapshot());assert.ok(snap.stock!==400);assert.ok(snap.balls>0);console.log('normal play',snap);await page.screenshot({path:'screenshots/game-mobile.png',fullPage:true});
const bounds=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));assert.equal(bounds.width,bounds.scroll);assert.ok(bounds.scrollHeight<=bounds.height+3,JSON.stringify(bounds));
await page.getByRole('button',{name:'一時停止'}).click();const paused=await page.evaluate(()=>window.__pachinko.snapshot());await page.waitForTimeout(1000);assert.deepEqual(await page.evaluate(()=>window.__pachinko.snapshot()),paused);
await page.locator('#cashOut').click();await page.getByRole('button',{name:'コース選択へ'}).click();
const earnedBeforePractice=await page.locator('.currency b').innerText();
await page.getByRole('button',{name:'試遊サポート：大当り・スキルをすぐに試す'}).click();await page.getByRole('button',{name:'試遊をはじめる'}).click();
const support=async()=>{await page.getByRole('button',{name:'一時停止'}).click();await page.getByRole('dialog').getByRole('button',{name:'試遊サポート',exact:true}).click();};
await support();await page.getByRole('button',{name:'大当りを開始',exact:true}).click();assert.ok((await page.evaluate(()=>window.__pachinko.snapshot())).jackpot);await page.screenshot({path:'screenshots/jackpot-mobile.png',fullPage:true});
await support();await page.getByRole('button',{name:'次のスキル選択へ'}).click();assert.equal(await page.locator('[data-skill]').count(),3);await page.screenshot({path:'screenshots/skills-mobile.png',fullPage:true});await page.locator('[data-skill]').first().click();assert.equal((await page.evaluate(()=>window.__pachinko.snapshot())).stage,2);
await support();await page.getByRole('button',{name:'リザルトを確認'}).click();await page.getByRole('button',{name:'準備画面へ'}).click();await page.reload();assert.equal(await page.locator('[data-course]:disabled').count(),2);assert.equal(await page.locator('.currency b').innerText(),earnedBeforePractice);
await page.setViewportSize({width:1280,height:950});await page.screenshot({path:'screenshots/home-desktop.png',fullPage:true});await page.getByRole('button',{name:'遊技をはじめる'}).click();await page.waitForTimeout(1500);await page.screenshot({path:'screenshots/game-desktop.png',fullPage:true});assert.deepEqual(errors,[]);console.log('Browser smoke passed: play, pause, retirement, jackpot, skill, result, persistence, mobile layout.');
}finally{await browser.close();}
