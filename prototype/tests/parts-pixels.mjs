import {chromium} from '@playwright/test';
import {createHash} from 'node:crypto';
import {writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:600,height:800},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:5173/');
 const captures=await page.evaluate(async()=>{
  const [{Machine},{Physics},{Game,freshProfile}]=await Promise.all([import('/src/scene.js'),import('/src/physics.js'),import('/src/game.js')]);
  const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;width:600px;height:800px';document.body.append(host);
  const physics=new Physics(),machine=await Machine.create(host,physics),results={};machine.app.timeScale=0;machine.app.autoRender=false;
  try {
   for(const part of ['right','receivers','all'])for(const state of ['normal','rush','bonus']) {
    const game=new Game(freshProfile());if(state==='rush')game.startRush();if(state==='bonus')game.startJackpot();game.time=0;
    physics.updateGate(game);machine.render(game);machine.focus(part);
    results[`${part}-${state}`]=await new Promise(resolve=>{machine.app.once('postrender',async()=>{
     const device=machine.app.graphicsDevice,buffer=new Uint8Array(device.width*device.height*4);
     await device.readPixelsAsync(0,0,device.width,device.height,buffer);
     let data='';for(let i=0;i<buffer.length;i+=8192)data+=String.fromCharCode(...buffer.subarray(i,i+8192));resolve(btoa(data));
    });machine.app.renderNextFrame=true;});
   }
  }finally{machine.dispose();host.remove();}return results;
 });
 assert.deepEqual(errors,[]);
 const hashes=Object.fromEntries(Object.entries(captures).map(([key,data])=>[key,createHash('sha256').update(Buffer.from(data,'base64')).digest('hex')]));
 if(process.argv[2]==='record')await writeFile('/tmp/silverball-parts-pixels.json',JSON.stringify(hashes));
 else assert.deepEqual(hashes,JSON.parse(await readFile('/tmp/silverball-parts-pixels.json','utf8')));
 console.log(`${Object.keys(hashes).length} frozen poses: ${process.argv[2]==='record'?'recorded':'0 differing pixels (SHA-256 matches)'}`);
}finally{await browser.close();}
