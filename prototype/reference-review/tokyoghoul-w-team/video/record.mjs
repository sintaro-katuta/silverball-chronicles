import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const dir='reference-review/tokyoghoul-w-team/video';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[],files={};
try{
 const context=await browser.newContext({viewport:{width:1280,height:960},recordVideo:{dir,size:{width:1280,height:960}}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5174/lcd-pixi.html');
 await page.locator('#mode-normal').click();await page.waitForTimeout(10000);
 await page.locator('#mode-right-closed').click();await page.locator('#right-detail').click();await page.waitForTimeout(9000);
 await page.locator('#mode-rush').click();await page.waitForTimeout(9000);
 await page.locator('#mode-bonus').click();await page.waitForTimeout(9000);
 await context.close();files.board=await page.video().path();
 const ctx=await browser.newContext({viewport:{width:1280,height:960},recordVideo:{dir,size:{width:1280,height:960}}});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));
 await p.goto('http://127.0.0.1:5174/w-control-review.html');await p.waitForTimeout(2500);
 await p.locator('#roll').selectOption('0');
 for(const action of ['fixture','fuzu','resolveFuzu','openElectric','electric','electric','closeElectric','tokuzu2','v']){await p.locator(`[data-action="${action}"]`).click();await p.waitForTimeout(1100);}
 await p.locator('[data-action="openRound"]').click();await p.waitForTimeout(800);
 for(let i=0;i<10;i++){await p.locator('[data-action="ball"]').click();await p.waitForTimeout(350);}
 await p.waitForTimeout(3000);
 await ctx.close();files.control=await p.video().path();
 await writeFile(`${dir}/recording.json`,JSON.stringify({files,errors,notes:'Live browser recording. Board manual fixture; W control separate manual sensor commands. Not an integrated W gameplay video.'},null,2));
 console.log(JSON.stringify({files,errors}));
}finally{await browser.close();}
