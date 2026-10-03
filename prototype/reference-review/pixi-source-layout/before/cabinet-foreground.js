import {pixelSurface,painter} from './pixel-primitives.js';
import {LCD_LAYOUT,LCD_OPENING} from './lcd-layout.js';
// Raised faceplates sit in front of the ball plane; they are NOT physical guides.
// Thickness/occlusion is visual. Existing passages and every receiving mouth stay open.
export function createCabinetForeground(physics){return pixelSurface(1260,1680,c=>{
 const raw=painter(c),at=([x,y])=>[Math.round(x*3),Math.round((y-130)*3)];
 const poly=(pts,col)=>raw.poly(pts.map(at),col),line=(a,b,col,w=1)=>raw.line(...at(a),...at(b),col,Math.round(w*3));
 const rect=(x,y,w,h,col)=>raw.rect(x*3,(y-130)*3,w*3,h*3,col);
 const diamond=(x,y,r,col)=>raw.diamond(...at([x,y]),r*3,col);
 const ink='#15253b',silver='#a5b9c8',shine='#e5ece1',gold='#c8a365';
 const plate=(pts,col=silver)=>{
  poly(pts.map(([x,y])=>[x+4,y+7]),'#060e1c');
  poly(pts.map(([x,y])=>[x+2,y+4]),'#41516a');poly(pts,ink);
  const cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cy=pts.reduce((s,p)=>s+p[1],0)/pts.length;
  const inner=pts.map(([x,y])=>[cx+(x-cx)*.89,cy+(y-cy)*.87]);poly(inner,col);
  for(let i=1;i<inner.length;i++)if(inner[i][1]<=cy&&inner[i-1][1]<=cy)line(inner[i-1],inner[i],shine);
 };
 // Paired swept metal feathers form one crown over the screen.
 for(const side of [-1,1]){
  const points=pts=>pts.map(([x,y])=>[210+side*x,y]);
  plate(points([[21,208],[46,181],[94,190],[121,221],[73,214],[45,227]]));
  for(let i=0;i<4;i++){
   const x=36+i*17,y=198+i*3;
   plate(points([[x,y+10],[x+8,y-11],[x+27,y+6],[x+16,y+17]]),i%2?'#8da9c0':'#c4d0d3');
   line([210+side*(x+7),y+5],[210+side*(x+18),y+9],gold,2);
  }
 }
 // Crescent medallion: the coloured lens is recessed inside the raised silver/gold rim.
 const ring=(cx,cy,r)=>{
  const pts=Array.from({length:24},(_,i)=>[cx+Math.cos(i*Math.PI/12)*r,cy+Math.sin(i*Math.PI/12)*r]);
  plate(pts,gold);
  const ins=pts.map(([x,y])=>[cx+(x-cx)*.78,cy+(y-cy)*.78]);poly(ins,'#244b76');
  for(let y=-r*.59;y<r*.59;y++){
   const half=Math.floor(Math.sqrt((r*.6)**2-y*y));if(!half)continue;
   rect(cx-half,cy+y,half*2,1,'#b9d8df');
   const iy=y+r*.14,ir=r*.5;if(Math.abs(iy)<ir){const h=Math.sqrt(ir*ir-iy*iy);rect(cx-h+r*.25,cy+y,h*2,1,'#244b76');}
  }
  diamond(cx,cy-r-3,5,gold);diamond(cx,cy+r+2,4,gold);
 };
 ring(210,196,25);
 // Silver reliefs overlap the frame edges, with a cast shadow on the deeper board.
 for(const side of [-1,1]){
  const x=side<0?74:326;
  for(let i=0;i<(side<0?4:5);i++){
   const y=262+i*49;
   plate([[x,y-12],[x+side*15,y+1],[x+side*12,y+28],[x-side*2,y+39],[x+side*3,y+8]],'#718fae');
   line([x+side*3,y],[x+side*7,y+19],shine,2);line([x+side*7,y+19],[x,y+31],gold);
  }
 }
 plate([[179,544],[241,544],[264,566],[235,579],[186,579],[158,566]],'#728fa9');
 poly([[179,551],[241,551],[249,564],[233,571],[188,571],[172,564]],'#16314f');
 line([181,552],[238,552],gold,2);line([186,571],[232,571],silver,2);
 for(const x of [186,198,210,222,234])diamond(x,561,3,x===210?'#bedfe4':'#4b86b0');
 // Screw heads belong to the front assembly, not extra collision posts.
 for(const [x,y]of [[150,211],[270,211],[177,555],[243,555]]){diamond(x,y,2,shine);line([x-1,y],[x+1,y],'#42546b');}
 // Keep the complete LCD and physical admission openings visible at all times.
 c.save();c.globalCompositeOperation='destination-out';
 poly(LCD_OPENING,'#000');
 for(const p of physics.pockets){if(p.kind==='normal'||p.kind==='start')rect(p.x-19,p.y-18,38,46,'#000');}
 // Right route and its moving mechanisms remain unobscured.
 rect(337,400,69,222,'#000');rect(273,579,112,82,'#000');c.restore();
});}
