import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='reference-review/reel-direction-2026-10-05';await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),errors=[];
try{
 const page=await browser.newPage({viewport:{width:440,height:500}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5186/special-routes.html');await page.waitForFunction(()=>!!window.__specialRoutes);
 const results=await page.evaluate(async()=>{
  const pixiUrl=performance.getEntriesByType('resource').find(r=>/\/pixi__js\.js\?/.test(r.name))?.name;
  if(!pixiUrl)throw Error('Loaded Pixi module not found');
  const {Application}=await import(pixiUrl);
  const {SessionGame}=await import('/src/pixi/session-game.js');
  const {createNormalSpinView}=await import('/src/pixi/normal-spin-view.js');
  const app=new Application();await app.init({width:420,height:280,autoStart:false,antialias:false,preference:'webgl'});
  window.__specialRoutes.destroy();document.body.replaceChildren(app.canvas);app.canvas.style.width='420px';
  const view=createNormalSpinView();view.root.scale.set(2);app.stage.addChild(view.root);
  const columns=view.root.children.slice(3,6),results=[];
  for(const mode of ['normal','rush']){
   const game=new SessionGame(()=>.9);if(mode==='rush')game.startRush();
   const nativeTempo=game.drawTempo;
   // Extend only this display fixture to expose a complete strip cycle. The
   // production RUSH pre-reach spin is 0.35s and cannot show nine changes.
   Object.defineProperty(game,'drawTempo',{value:2.2});
   game.spinActive=true;game.spinResult={reels:[2,4,6]};
   const samples=[];
   for(let t=0;t<game.drawTempo-.3;t+=.02){game.drawTimer=t;game.time=t;view.render(game);app.render();
    samples.push({time:t,columns:columns.map(c=>c.children[1].children.map(s=>({digit:view.textures.indexOf(s.texture)%(9)+1,y:s.y}))) });
   }
   game.drawTimer=game.drawTempo+2;view.render(game);app.render();
   const settled=columns.map(c=>{const s=c.children[1].children.find(s=>s.y===0);return view.textures.indexOf(s.texture)%9+1;});
   results.push({mode,nativeTempo,fixtureTempo:2.2,samples,settled});
  }
  window.__reelTest={app,view,columns};return results;
 });
 for(const run of results){
  assert.deepEqual(run.settled,[2,4,6]);
  for(let i=0;i<3;i++){
   let changes=0,wrapped=false;
   for(let n=1;n<run.samples.length;n++){
    const previous=run.samples[n-1].columns[i],current=run.samples[n].columns[i];
    const a=previous.reduce((a,b)=>Math.abs(a.y)<Math.abs(b.y)?a:b),b=current.reduce((a,b)=>Math.abs(a.y)<Math.abs(b.y)?a:b);
    if(a.digit!==b.digit){assert.equal(b.digit,a.digit%9+1);changes++;if(a.digit===9)wrapped=true;}
    for(const sprite of current){const prior=previous.find(s=>s.digit===sprite.digit);if(prior)assert.ok(sprite.y>=prior.y,'visible digits must travel downward');}
   }
   assert.ok(changes>=2,'verify consecutive digit changes');
   assert.ok(wrapped,'verify wrap through 9 to 1');
  }
 }
 await page.screenshot({path:dir+'/normal-rush-settled.png'});
 assert.deepEqual(errors,[]);await writeFile(dir+'/normal-rush-check.json',JSON.stringify({results,errors},null,2));
 console.log('Production normal/RUSH strips count upward, travel downward, wrap 9→1 and retain stopped digits');
}finally{await browser.close();}
