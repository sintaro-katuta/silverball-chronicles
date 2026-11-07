import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {browserLaunchOptions} from './browser-launch.js';
const browser=await chromium.launch(browserLaunchOptions());
const base=process.env.REVIEW_URL??'http://127.0.0.1:5173';
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${base}/dev/issue74-review.html`);
 const result=await page.evaluate(async()=>await (await import('/src/dev/issue74-diagnostic.js')).inspect());
 assert.ok(result.removed>0,'the old opaque underlay has exposed pixels');
 assert.ok(result.checks>0,'the transparent openings include sampleable sky');
 assert.equal(result.failures,0,'exposed hair openings show the current cloud, not the old underlay');
 assert.deepEqual(errors,[]);console.log('Normal compositing:',result);
}finally{await browser.close();}
