import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {browserLaunchOptions} from '../tests/browser-launch.js';

const base=process.env.REVIEW_URL??'http://127.0.0.1:5459',out='reference-review/ball-size-20261020';
await mkdir(out,{recursive:true});
const browser=await chromium.launch(browserLaunchOptions());
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/?review=session&scenario=reach-loss');await page.locator('[data-kind=main]').first().click();await page.locator('#playMachine').click();await page.locator('#intro-skip').click();
 await page.waitForFunction(()=>__sessionReview.board().snapshot().spawned>=20);
 await page.locator('#quick-pause').click();await page.locator('#resume').click();await page.locator('#feed-toggle').click();await page.locator('#quick-pause').click();
 const measured=await page.evaluate(async()=>{
  const {createSilverBallTexture}=await import('/src/pixi/silver-ball.js'),{createPinTexture}=await import('/src/pixi/pin-texture.js');
  function bounds(texture){
   const canvas=texture.source.resource,{data}=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
   let left=canvas.width,right=-1,top=canvas.height,bottom=-1;
   for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   const result={frameWidth:canvas.width,frameHeight:canvas.height,left,right,top,bottom,width:right-left+1,height:bottom-top+1};texture.destroy(true);return result;
  }
  const physics=__sessionReview.model().flow.physics,ballTexture=bounds(createSilverBallTexture()),pinTexture=bounds(createPinTexture({highlight:true}));
  const ballScale=physics.displayBallScale/3,pinScale=.52/3,ballVisibleDiameter=ballTexture.width*ballScale,pinVisibleDiameter=pinTexture.width*pinScale;
  const pairs=[[37,38],[60,54],[62,55],[63,56]].map(ids=>{
   const [a,b]=ids.map(id=>physics.pins.find(p=>p.id===id)),pitch=Math.hypot(a.x-b.x,a.y-b.y),visibleGap=pitch-pinVisibleDiameter,physicalGap=pitch-a.r-b.r;
   return {ids,centres:[{x:a.x,y:a.y},{x:b.x,y:b.y}],pitch,visibleGap,physicalGap,visibleBallWidths:visibleGap/ballVisibleDiameter,physicalBallWidths:physicalGap/(physics.ballRadius*2)};
  });
  return {ballTexture,pinTexture,ballScale,pinScale,ballRadius:physics.ballRadius,ballCollisionDiameter:physics.ballRadius*2,ballVisibleDiameter,pinVisibleDiameter,pinCollisionDiameter:physics.pins[0].r*2,pairs,pins:physics.pins.filter(p=>p.id>=37&&p.id<=63),windmill:physics.mechanisms.map(m=>({x:m.x,y:m.y,radius:m.radius})),liveBalls:physics.balls.map(b=>({id:b.id,x:b.x,y:b.y,r:b.r})),snapshot:__sessionReview.board().snapshot()};
 });
 measured.base=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();measured.errors=errors;
 measured.scope='Current runtime measurement; review lottery fixture, natural ball launches; no ball/pin/physics changes. Candidate pin rows, reference video not yet identified.';
 // Freeze from the review API without a dialog covering the measured region.
 await page.evaluate(()=>{document.querySelector('#resume').click();__sessionReview.board().pause(true);});
 const box=await page.locator('#canvas canvas').boundingBox();
 await page.screenshot({path:`${out}/current-board.png`});
 const sx=box.width/396,sy=box.height/436;
 await page.screenshot({path:`${out}/windmill-upper-pins.png`,clip:{x:box.x+(24-12)*sx,y:box.y+(395-166)*sy,width:58*sx,height:98*sy}});
 await writeFile(`${out}/measurements.json`,JSON.stringify(measured,null,2));
 const pins=measured.pins.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${measured.pinVisibleDiameter/2}" fill="#d3af65"/><text x="${p.x+1.7}" y="${p.y-1.2}" fill="#e6edf6" font-size="2.2">${p.id}</text>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 395 65 98" width="650" height="980"><rect x="20" y="395" width="65" height="98" fill="#101b2c"/>${pins}<circle cx="64" cy="476.5" r="10" fill="none" stroke="#b89d66" stroke-width=".4"/><text x="50" y="490" fill="#ddd" font-size="2.6">windmill</text><circle cx="62.875" cy="453" r="${measured.ballVisibleDiameter/2}" fill="#d9efff"/><circle cx="62.875" cy="453" r="1.8" fill="none" stroke="#61dbe5" stroke-width=".15"/><text x="22" y="399" fill="#ddd" font-size="2.2">Current geometry; example ball position, not trajectory</text></svg>`;
 await writeFile(`${out}/pin-map.svg`,svg);
 console.log(JSON.stringify({ballCollisionDiameter:measured.ballCollisionDiameter,ballVisibleDiameter:measured.ballVisibleDiameter,pinVisibleDiameter:measured.pinVisibleDiameter,pairs:measured.pairs.map(p=>({ids:p.ids,visibleGap:p.visibleGap,ballWidths:p.visibleBallWidths})),errors}));
}finally{await browser.close();}
