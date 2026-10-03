import {chromium} from '@playwright/test';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const dir='reference-review/pixi-direction-cutin',browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:1080,height:1250}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:5173/lcd-pixi.html');await page.waitForFunction(()=>!!window.__board);await page.locator('#mode-normal').evaluate(e=>e.click());
 await page.evaluate(()=>{window.parts=[];window.rec=new MediaRecorder(document.querySelector('canvas').captureStream(60),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});window.rec.ondataavailable=e=>window.parts.push(e.data);window.rec.start();});
 await page.waitForTimeout(1200);
 for(const [mode,name]of [['right-closed','right'],['normal','left']]){await page.locator(`#mode-${mode}`).evaluate(e=>e.click());await page.waitForTimeout(450);await page.locator('canvas').screenshot({path:`${dir}/${name}.png`});await page.waitForTimeout(4050);}
 await page.waitForTimeout(800);assert.deepEqual(errors,[]);
 const data=await page.evaluate(()=>new Promise(resolve=>{window.rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(window.parts,{type:'video/webm'}));};window.rec.stop();}));await writeFile(`${dir}/cutin.webm`,Buffer.from(data,'base64'));console.log('Both direction changes recorded');
}finally{await browser.close();}
