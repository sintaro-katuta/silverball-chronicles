import {pixelSurface,painter} from './pixel-primitives.js';
export const payoutRevealSeconds=amount=>amount>=3000?2.6:2;
const COLORS=['#ff758f','#ffd56d','#eeff9c','#70efba','#7ddcff','#c0a0ff'];
// Translate toward the camera on Z only. All digits stay front-facing and
// share one centered projection; no yaw, horizontal tracking or repeated bounce.
function projectDepth(c,source,z,depth){
 const scale=190/(190+z+depth),w=Math.round(source.width*scale),h=Math.round(source.height*scale);
 c.drawImage(source,Math.round((210-w)/2),Math.round((140-h)/2+depth*.35*scale),w,h);
}
export function createPayoutReveal(){
 let amountKey=null,outline,mask,side,face,light;
 return {paint(c,amount,time,transparent=false){
  if(amountKey!==amount){
   amountKey=amount;
   const text=String(amount),width=text.length*36+12;
   const glyph=(a,stroke)=>{a.font='68px "DotGothic16"';a.textAlign='center';a.textBaseline='middle';a.lineJoin='miter';a.fillStyle='#ffffff';if(stroke){a.strokeStyle=stroke;a.lineWidth=4;a.strokeText(text,width/2,43);}a.fillText(text,width/2,43);};
   outline=pixelSurface(width,88,a=>glyph(a,'#fff0bc'));
   mask=pixelSurface(width,88,a=>glyph(a));
   side=pixelSurface(width,88,a=>{glyph(a,'#946236');a.globalCompositeOperation='source-in';a.fillStyle='#946236';a.fillRect(0,0,width,88);});
   face=pixelSurface(width,88,()=>{});
   light=pixelSurface(width,88,()=>{});
  }
  c.clearRect(0,0,210,140);const d=painter(c);if(!transparent)d.rect(0,0,210,140,'#100d26');
  for(let i=0;i<18;i++){const x=(i*41)%210,y=Math.round(((i*23-time*14)%140+140)%140);d.rect(x,y,i%3===0?2:1,4,i%3===0?'#896d43':'#28384c');}
  // Small distant start, accelerate into a single impact at .42 seconds,
  // settle once over .12 seconds, then hold the award for reading.
  const approach=Math.max(0,Math.min(1,(time-.06)/.36));
  const settle=Math.max(0,Math.min(1,(time-.42)/.12));
  const z=time<.42?900-934*approach**3:-34+14*(1-(1-settle)**3);
  for(let depth=9;depth>=1;depth--)projectDepth(c,side,z,depth);
  projectDepth(c,outline,z,0);
  const a=face.getContext('2d');a.clearRect(0,0,face.width,face.height);a.globalCompositeOperation='source-over';a.drawImage(mask,0,0);a.globalCompositeOperation='source-in';
  // Continuous color interpolation within the glyph mask. Keep nearest
  // sampling for the silhouette while the rainbow moves without palette jumps.
  const b=light.getContext('2d'),offset=(time*18)%90;
  const rainbow=b.createLinearGradient(0,-180-offset,0,180-offset);
  for(let i=0;i<=24;i++)rainbow.addColorStop(i/24,COLORS[i%6]);
  b.fillStyle=rainbow;b.fillRect(0,0,light.width,88);
  const sweep=-90+time*170,shine=b.createLinearGradient(sweep-18,0,sweep+38,88);
  shine.addColorStop(0,'rgba(255,255,255,0)');shine.addColorStop(.5,'rgba(255,255,255,.85)');shine.addColorStop(1,'rgba(255,255,255,0)');
  b.fillStyle=shine;b.fillRect(0,0,light.width,88);
  a.drawImage(light,0,0);
  if(time>=.42&&time<.50){a.fillStyle=`rgba(255,255,255,${.8*(1-(time-.42)/.08)})`;a.fillRect(0,0,face.width,88);}
  projectDepth(c,face,z,0);
 }};
}
