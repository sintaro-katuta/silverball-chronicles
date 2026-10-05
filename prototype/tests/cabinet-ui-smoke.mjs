import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{Math.random=()=>.8;});
 await page.clock.install({time:new Date('2026-09-23T00:00:00Z')});await page.clock.pauseAt(new Date('2026-09-23T00:00:01Z'));
 await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();await page.clock.runFor(2400);
 for(const [width,height,name] of [[390,844,'mobile'],[320,740,'small'],[1440,1000,'desktop']]){
  await page.setViewportSize({width,height});await page.clock.runFor(100);
  const data=await page.evaluate(async()=>{
   const {MACHINE_VIEW}=await import('/src/legacy/scene.js');
   const r=sel=>{const b=document.querySelector(sel).getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
   return {board:r('.board-wrap'),lcd:r('#lcd'),panel:r('.machine-dashboard'),controls:r('.control-panel'),view:MACHINE_VIEW,labels:document.querySelectorAll('.pocket-label,#lcdCaption').length,overflow:document.documentElement.scrollWidth>innerWidth};
  });
  assert.equal(data.labels,0);assert.equal(data.overflow,false);
  const {board:b,lcd:l,view:v}=data,scale=b.width/v.width;
  assert.ok(Math.abs(b.width/b.height-v.width/v.height)<.002,'cabinet preserves aspect ratio');
  assert.ok(b.y>=data.panel.bottom&&b.bottom<=data.controls.y,'whole cabinet between data and controls');
  assert.ok(b.x>=0&&b.right<=width&&b.bottom<=height,'cabinet contained in viewport');
  assert.ok(Math.abs(l.x-b.x-v.lcd.x*scale)<1&&Math.abs(l.y-b.y-v.lcd.y*scale)<1,'LCD and physical aperture share projection');
  assert.ok(Math.abs(l.width-v.lcd.width*scale)<1&&Math.abs(l.height-v.lcd.height*scale)<1,'LCD dimensions match physical aperture');
  assert.ok(l.x>b.x&&l.right<b.right&&l.y>b.y&&l.bottom<b.bottom);
  await page.screenshot({path:`screenshots/cabinet-${name}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.clock.runFor(100);await page.locator('#viewMode').click();await page.clock.runFor(100);
 const fit=await page.evaluate(()=>{const b=document.querySelector('.board-wrap').getBoundingClientRect();return {ratio:b.width/b.height,overflow:document.documentElement.scrollWidth>innerWidth};});
 assert.ok(Math.abs(fit.ratio-540/880)<.002);assert.equal(fit.overflow,false);
 await page.screenshot({path:'screenshots/cabinet-overview.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Cabinet/LCD projection, aspect ratio, full fit at320/390/1440, overview, and absent component/spec labels pass.');
}finally{await browser.close();}
