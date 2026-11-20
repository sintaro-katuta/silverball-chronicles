import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {browserLaunchOptions} from './browser-launch.js';
const out='reference-review/floor-reference-20261116',url=`${process.env.REVIEW_URL??'http://127.0.0.1:5188/'}?review=session`;
const browser=await chromium.launch(browserLaunchOptions()),errors=[];
try{
 const desktop=await browser.newPage({viewport:{width:1010,height:828}});desktop.on('pageerror',e=>errors.push(e.message));await desktop.goto(url,{waitUntil:'networkidle'});
 const canvas=desktop.locator('canvas.floor-reference-image');await canvas.waitFor();await canvas.waitFor({state:'visible'});await desktop.waitForFunction(()=>document.querySelector('canvas.floor-reference-image')?.dataset.customer==='loaded'&&document.querySelector('canvas.floor-reference-image')?.dataset.woman==='loaded'&&document.querySelector('canvas.floor-reference-image')?.dataset.trays==='loaded');await canvas.screenshot({path:`${out}/drawn-desktop.png`});
 assert.equal(await canvas.evaluate(c=>c.dataset.hall),'composed');
 assert.equal(await canvas.evaluate(c=>c.dataset.cuboid),'loaded');
 const stackChanges=await desktop.evaluate(async()=>{
  const {mountFloorArt}=await import('/src/ui/floor-art.js');const host=document.createElement('div');document.body.append(host);
  const art=await mountFloorArt(host),canvas=host.querySelector('canvas');const before=canvas.toDataURL();
  art.setTrayCount('green',3);const after=canvas.toDataURL();art.setTrayCount('green',0);const empty=canvas.toDataURL();
  let rejects=false;try{art.setTrayCount('green',-1);}catch{rejects=true;}art.destroy();host.remove();
  return {changed:before!==after,removed:after!==empty,rejects};
 });
 assert.deepEqual(stackChanges,{changed:true,removed:true,rejects:true});
 assert.equal(await canvas.evaluate(c=>[c.width,c.height].join('x')),'1010x828');
 assert.ok(await canvas.evaluate(c=>new Set(c.getContext('2d').getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%4===0)).size>30));
 assert.equal(await desktop.locator('.floor-machine:not([disabled])').count(),5);
 assert.match(await desktop.locator('.floor-level-current').innerText(),/1F/);
 const desktopControl=await desktop.locator('[data-floor-change=up]').boundingBox();assert.ok(desktopControl.width>=48&&desktopControl.height>=48);
 await desktop.locator('.floor-grid-wrap').screenshot({path:`${out}/floor-level-desktop.png`});
 for(let i=0;i<5;i++){
  const button=desktop.locator(`.floor-machine[data-unit="${i}"]`);await button.hover();
  assert.equal(await button.locator('polygon').evaluate(p=>getComputedStyle(p).stroke),'rgb(119, 244, 255)');
  if(i===2)await desktop.locator('.floor-grid-wrap').screenshot({path:`${out}/desktop-cabinet-hover.png`});
 }
 await desktop.mouse.move(800,30);assert.equal(await desktop.locator('.floor-machine[data-unit="2"] polygon').evaluate(p=>getComputedStyle(p).stroke),'rgba(0, 0, 0, 0)');
 await desktop.locator('.floor-machine[data-unit="2"]').focus();assert.equal(await desktop.locator('.floor-machine[data-unit="2"] polygon').evaluate(p=>getComputedStyle(p).stroke),'rgb(119, 244, 255)');
 await desktop.locator('[data-floor-change=up]').click();assert.match(await desktop.locator('.floor-coming').innerText(),/準備中/);assert.match(await desktop.locator('.floor-level-current').innerText(),/2F/);await desktop.locator('[data-floor-change=down]').click();assert.match(await desktop.locator('.floor-level-current').innerText(),/1F/);
 for(let i=0;i<5;i++){await desktop.locator(`[data-unit="${i}"]`).click();assert.equal(await desktop.locator('#floor-detail-title').innerText(),'月影機関');assert.equal(await desktop.locator('.floor-detail-dialog[open]').count(),1);assert.equal(await desktop.locator('canvas.floor-reference-image').count(),1);if(i===0)await desktop.screenshot({path:`${out}/floor-detail-desktop-review.png`});await desktop.locator('#back').click();}
 await desktop.close();
 const mobile=await browser.newPage({viewport:{width:390,height:844}});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(url,{waitUntil:'networkidle'});
 await mobile.waitForFunction(()=>document.querySelector('canvas.floor-reference-image')?.dataset.customer==='loaded'&&document.querySelector('canvas.floor-reference-image')?.dataset.woman==='loaded'&&document.querySelector('canvas.floor-reference-image')?.dataset.trays==='loaded');await mobile.screenshot({path:`${out}/drawn-mobile.png`,fullPage:true});
 assert.equal(await mobile.locator('canvas.floor-reference-image').evaluate(c=>c.dataset.hall),'composed');
 assert.equal(await mobile.locator('canvas.floor-reference-image').evaluate(c=>c.dataset.cuboid),'loaded');
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const initialArt=await mobile.locator('.floor-art-host').boundingBox();assert.ok(Math.abs(initialArt.width/initialArt.height-940/1672)<.01);
 for(let i=0;i<5;i++){await mobile.locator(`[data-mobile-unit="${i}"]`).click();assert.equal(await mobile.locator('#floor-detail-title').innerText(),'月影機関');assert.equal(await mobile.locator('canvas.floor-reference-image').count(),1);if(i===0)await mobile.screenshot({path:`${out}/floor-detail-mobile-review.png`});await mobile.locator('#back').click();}
 for(let i=0;i<5;i++){await mobile.locator(`.floor-machine[data-unit="${i}"]`).click();assert.equal(await mobile.locator('#floor-detail-title').innerText(),'月影機関');await mobile.locator('#back').click();}
 assert.match(await mobile.locator('.floor-level-badge').innerText(),/1F/);
 const mobileControl=await mobile.locator('[data-floor-change=up]').boundingBox();assert.ok(mobileControl.width>=48&&mobileControl.height>=48);
 await mobile.locator('[data-floor-change=up]').click();assert.match(await mobile.locator('.floor-coming').innerText(),/準備中/);assert.match(await mobile.locator('.floor-level-current').innerText(),/2F/);await mobile.screenshot({path:`${out}/floor-level-mobile-2f.png`,fullPage:true});await mobile.locator('[data-floor-change=down]').click();assert.match(await mobile.locator('.floor-level-current').innerText(),/1F/);
 await mobile.close();assert.deepEqual(errors,[]);console.log('PASS: hall composed from individual objects; desktop and mobile 1–5 selection and navigation.');
}finally{await browser.close()}
