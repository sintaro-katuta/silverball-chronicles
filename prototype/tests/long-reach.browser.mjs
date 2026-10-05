import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir=process.env.COMPARISON_OUTPUT??'reference-review/reach-comparison-longhair-2026-10-05';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:900}});page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE',e.message);});
 await page.goto(`${process.env.COMPARISON_BASE??'http://127.0.0.1:5188'}/reach-comparison.html`);await page.waitForFunction(()=>!!window.__reachComparison,{timeout:60000});
 const alpha=await page.evaluate(async()=>{const i=new Image();i.src='/assets/lcd/long-reach/duel-poses-longhair-v4.png';await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);const d=x.getImageData(0,0,c.width,c.height).data;return {corner:d[3],clearPixels:Array.from({length:d.length/4},(_,n)=>d[n*4+3]).filter(a=>a===0).length};});
 console.log('ALPHA',alpha);
 const results=[];
 for(const engine of ['pixi','three']){
  await page.locator('#engine').selectOption(engine);
  for(const t of [3.5,5.5,6.4,11.2,14.6,17.5,21,25.5,28.3,30.5,33.8,36.8,40.5,44,48.1,50.2]){await page.evaluate(t=>__reachComparison.seek(t),t);await page.waitForTimeout(550);await page.screenshot({path:`${dir}/${engine}-${t}.png`});}
  await page.evaluate(()=>{__reachComparison.seek(27);__reachComparison.reset();__reachComparison.setPlaying(true);});await page.waitForTimeout(10000);results.push(await page.evaluate(()=>__reachComparison.stats()));await page.evaluate(()=>__reachComparison.setPlaying(false));
 }
 assert.deepEqual(errors,[]);await writeFile(dir+'/comparison-check.json',JSON.stringify({alpha,results,errors,conditions:{viewport:'1100x900',canvas:'840x560',dpr:1,browser:'headless Chrome',duration:10,physicalMobile:false}},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
