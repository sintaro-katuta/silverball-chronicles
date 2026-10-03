import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173');await page.locator('#start').click();
 for(const [width,height,name] of [[390,844,'mobile'],[2048,1100,'desktop'],[320,740,'small']]){
  await page.setViewportSize({width,height});await page.waitForTimeout(300);
  const bounds=await page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
   return {panel:rect('.machine-dashboard'),board:rect('.board-wrap'),controls:rect('.control-panel'),parts:['#liveBalance','.game-top','.stats','.progress'].map(rect),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(bounds.overflow,false);
  for(const r of bounds.parts){assert.ok(r.x>=bounds.panel.x-1,JSON.stringify(bounds));assert.ok(r.right<=bounds.panel.right+1);assert.ok(r.y>=bounds.panel.y-1);assert.ok(r.bottom<=bounds.panel.bottom+1);}
  assert.ok(bounds.board.y>=bounds.panel.bottom-1,'data panel must not cover the board');assert.ok(bounds.board.bottom<=bounds.controls.y,'controls must not cover the outlet');
  await page.screenshot({path:`screenshots/unified-dashboard-${name}.png`});
 }
 await page.locator('#specs').click();await page.getByRole('heading',{name:'台の仕様'}).waitFor();await page.locator('#closeSpecs').click();
 await page.locator('#liveBalance').click();await page.getByText('台の基礎賞球',{exact:true}).waitFor();await page.locator('#closeChart').click();
 assert.deepEqual(errors,[]);console.log('Unified dashboard contains all data and controls, never overlaps board, at 320 / 390 / 2048 px; spec/accounting dialogs work.');
}finally{await browser.close();}
