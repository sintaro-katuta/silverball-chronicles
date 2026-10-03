import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const audit=process.argv.includes('--audit');
const viewports=[{width:320,height:568},{width:390,height:664},{width:390,height:844},{width:1440,height:900},{width:844,height:390}];
const browser=await chromium.launch({channel:'chrome',headless:true});
const reports=[];
try{
 for(const viewport of viewports){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:5173');await page.locator('#start').click();await page.locator('#auto').click();
  async function inspect(mode){
   await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(80);
   const report=await page.evaluate(mode=>{
    const vp=visualViewport,limit={width:vp?.width??innerWidth,height:vp?.height??innerHeight};
    const selectors=['.game-shell','.machine-dashboard','.board-wrap','.control-panel','.shoot-row','.tuning','#manualControls','#fire','#auto','#viewMode','#pause','#manual','#power','#angle','.side-panel'];
    const bounds=Object.fromEntries(selectors.map(selector=>{const el=document.querySelector(selector);if(!el||!el.checkVisibility())return [selector,null];const rect=el.getBoundingClientRect();return [selector,{x:Math.round(rect.x*10)/10,y:Math.round(rect.y*10)/10,w:Math.round(rect.width*10)/10,h:Math.round(rect.height*10)/10,right:Math.round(rect.right*10)/10,bottom:Math.round(rect.bottom*10)/10}];}));
    const scrolling=document.scrollingElement;
    return {mode,limit,scroll:{width:scrolling.scrollWidth,height:scrolling.scrollHeight},bounds};
   },mode);
   reports.push({viewport,...report});
   if(!audit){
    assert.ok(report.scroll.height<=viewport.height+1,`${viewport.width}x${viewport.height} ${mode}: body height ${report.scroll.height}`);
    assert.ok(report.scroll.width<=viewport.width+1,`${viewport.width}x${viewport.height} ${mode}: body width ${report.scroll.width}`);
    for(const selector of ['.machine-dashboard','.board-wrap','#fire','#auto','#viewMode','#pause']){
     const b=report.bounds[selector];assert.ok(b,`${mode}: ${selector} visible`);assert.ok(b.x>=-1&&b.y>=-1&&b.right<=report.limit.width+1&&b.bottom<=report.limit.height+1,`${viewport.width}x${viewport.height} ${mode}: ${selector} outside viewport ${JSON.stringify(b)}`);
    }
    if(mode.includes('manual'))for(const selector of ['#manual','#power','#angle']){const b=report.bounds[selector];assert.ok(b,`${mode}: ${selector} visible`);assert.ok(b.x>=-1&&b.y>=-1&&b.right<=report.limit.width+1&&b.bottom<=report.limit.height+1,`${viewport.width}x${viewport.height} ${mode}: ${selector} outside viewport`);}
   }
  }
  await inspect('immersive');await page.locator('#viewMode').click();await inspect('full');
  await page.locator('#manual').click();await inspect('full-manual');
  await page.locator('#viewMode').click();await inspect('immersive-manual');
  if(!audit)await page.screenshot({path:`screenshots/viewport-fit-${viewport.width}x${viewport.height}.png`});
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log(JSON.stringify(reports,null,2));
 if(!audit)console.log('Every viewport, display mode and manual-control state fits without page scrolling.');
}finally{await browser.close();}
