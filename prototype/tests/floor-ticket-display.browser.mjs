import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {browserLaunchOptions} from './browser-launch.js';

const url=process.env.REVIEW_URL??'http://127.0.0.1:5188/';
const key='CapacitorStorage.tsukikage-session-tickets-v1';
const browser=await chromium.launch(browserLaunchOptions()),errors=[];
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const fixture={version:1,tickets:50,serial:0,active:null,lastResult:null};
  await context.addInitScript(({key,fixture})=>localStorage.setItem(key,JSON.stringify(fixture)),{key,fixture});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
  await page.locator('[data-floor-price="0"]').waitFor();
  assert.equal(await page.locator('.floor-price-accessible').innerText(),'1階の台は1プレイにつきチケット0枚');
  assert.equal(await page.locator('.floor-ticket-display, .floor-ticket-dialog').count(),0);
  assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),fixture);
  await page.screenshot({path:`reference-review/floor-reference-20261116/floor-price-${name}.png`,fullPage:true});
  if(name==='mobile')await page.locator('[data-mobile-unit]').first().click();else await page.locator('[data-kind=main]').first().click();
  await page.locator('#wager-count').waitFor();assert.equal(await page.locator('#wager-count').inputValue(),'1');
  assert.equal(await page.locator('#playMachine').innerText(),'400玉でプレイ開始');
  assert.deepEqual(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key),fixture);
  await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS: 1F displays zero tickets per play, with no ticket-selection overlay or wallet changes.');
}finally{await browser.close();}
