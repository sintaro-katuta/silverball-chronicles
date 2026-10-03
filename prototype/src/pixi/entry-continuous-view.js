import {pixelSurface} from './pixel-primitives.js';
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
function frames(texture){
 const s=texture.source.resource,w=s.width/2,h=s.height/3;
 return Array.from({length:6},(_,i)=>pixelSurface(210,140,c=>{
  let sw=w-10,sh=h-10;if(sw/sh>1.5)sw=sh*1.5;else sh=sw/1.5;
  c.drawImage(s,(i%2)*w+(w-sw)/2,Math.floor(i/2)*h+(h-sh)/2,sw,sh,0,0,210,140);
 }));
}
function luminous(source,predicate){return pixelSurface(210,140,c=>{
 c.drawImage(source,0,0);const d=c.getImageData(0,0,210,140);
 for(let y=0;y<140;y++)for(let x=0;x<210;x++){const i=(y*210+x)*4;d.data[i+3]=predicate(x,y,d.data[i],d.data[i+1],d.data[i+2])?255:0;}c.putImageData(d,0,0);
});}
function spectrum(c,t,x=0,y=0,w=210,h=140){const g=c.createLinearGradient(x,y,x+w,y+h);for(let i=0;i<=12;i++)g.addColorStop(i/12,`hsl(${(i*60+t*160)%360},100%,60%)`);return g;}
function rainbowLayer(source){const layer=pixelSurface(210,140,()=>{});return(c,t,a=1)=>{const d=layer.getContext('2d');d.clearRect(0,0,210,140);d.globalCompositeOperation='source-over';d.drawImage(source,0,0);d.globalCompositeOperation='color';d.fillStyle=spectrum(d,t);d.fillRect(0,0,210,140);d.globalCompositeOperation='destination-in';d.drawImage(source,0,0);c.save();c.globalAlpha=a;c.drawImage(layer,0,0);c.restore();};}
function sparks(c,t,x,y){c.save();c.globalCompositeOperation='screen';for(let i=0;i<20;i++){const a=i*2.399,r=t*(18+i%7*7);c.globalAlpha=clamp(1-t/1.4);c.fillStyle=`hsl(${(i*43+t*130)%360},100%,80%)`;c.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r),1,2);}c.restore();}
function radiance(c,x,y,q,col){c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(x,y,0,x,y,35);g.addColorStop(0,col);g.addColorStop(1,'transparent');c.globalAlpha=q;c.fillStyle=g;c.fillRect(x-35,y-35,70,70);c.restore();}
export function createContinuousEntryPainters(sheets){
 const f=Object.fromEntries(['moon','reflection','revival','mechanism'].map(k=>[k,frames(sheets[k])]));
 // Retain the original castle/sky. Only the water pixels are displaced.
 const surge=luminous(f.reflection[4],(x,y,r,g,b)=>g>140&&b>170&&b>r*1.03&&(y>66||Math.abs(x-105)<24));
 const waterRainbow=rainbowLayer(surge);
 // Use the complete authored crimson moon, rather than a thresholded partial recolour.
 const moonBase=f.moon[3],coolMoon=pixelSurface(210,140,c=>{c.drawImage(moonBase,0,0);const p=c.getImageData(0,0,210,140);for(let i=0;i<p.data.length;i+=4){const r=p.data[i],g=p.data[i+1],b=p.data[i+2];if(r>g*1.06&&r>b*.95){p.data[i]=Math.round(b*.8);p.data[i+1]=Math.round(g*.8+r*.15);p.data[i+2]=r;}}c.putImageData(p,0,0);});
 // Cover the lower crescent too; pale highlights belong to the lunar glow.
 const lunarGlow=luminous(moonBase,(x,y,r,g,b)=>r>75&&((r>g*1.08&&r>b*1.05)||(r>175&&g>160&&b>140)));
 // Pure white cannot take hue in color blend mode. Reserve luminance headroom
 // on this layer only, retaining the authored pixel shading and silhouette.
 const lunarContext=lunarGlow.getContext('2d'),lunarPixels=lunarContext.getImageData(0,0,210,140);
 for(let i=0;i<lunarPixels.data.length;i+=4){if(!lunarPixels.data[i+3])continue;const value=Math.round(Math.max(lunarPixels.data[i],lunarPixels.data[i+1],lunarPixels.data[i+2])*.72);lunarPixels.data[i]=value;lunarPixels.data[i+1]=value;lunarPixels.data[i+2]=value;}
 lunarContext.putImageData(lunarPixels,0,0);
 const moonRainbow=rainbowLayer(lunarGlow);
 const aura=luminous(f.revival[5],(x,y,r,g,b)=>b>150&&g>90&&b>r*1.25&&(x<24||x>190||y>117||(Math.abs(x-105)<8&&y>96))),heroRainbow=rainbowLayer(aura);
 const mechanism=f.mechanism[0];
 const aperture=c=>{c.beginPath();c.ellipse(105,70,54,55,0,0,Math.PI*2);c.clip();};
 const shutters=pixelSurface(210,140,c=>{aperture(c);c.drawImage(mechanism,0,0);});
 const circuitry=luminous(mechanism,(x,y,r,g,b)=>r>40&&r>g*1.05&&g>b*1.1);
 const core=luminous(f.mechanism[5],(x,y,r,g,b)=>Math.abs(x-105)<48&&b>130&&g>90&&b>r*1.2),coreRainbow=rainbowLayer(core);
 return {
 moon(c,t){
  const change=smooth((t-.65)/.22);c.drawImage(coolMoon,0,0);c.save();c.globalAlpha=change;c.drawImage(moonBase,0,0);c.restore();
  // A quick whole-moon colour turn, a short held beat, then a rainbow corona.
  if(t>1.25)radiance(c,113,60,.2*smooth((t-1.25)/.6),'#ff605b');
  if(t>2.3){moonRainbow(c,t,smooth((t-2.3)/.12));sparks(c,t-2.3,110,58);}
 },
 reflection(c,t){
  const q=smooth((t-.3)/2.4),release=smooth((t-3.2)/.27);c.drawImage(f.reflection[0],0,0);
  for(let y=67;y<140;y++){const dx=Math.round(Math.sin(y*.32+t*1.6)*(1+q));c.drawImage(f.reflection[0],0,y,210,1,dx,y,210,1);}
  // Three lateral reflections race across the water; no spiral or collecting orbit.
  if(t<2.9){c.save();c.globalCompositeOperation='screen';for(let i=0;i<3;i++){const x=((t*(60+i*13)+i*70)%270)-40;c.globalAlpha=q*.65;c.fillStyle='#a7e7ff';c.fillRect(Math.round(x),86+i*16,22,1);}c.restore();}
  if(release>0){c.save();c.beginPath();c.rect(0,140*(1-release),210,140*release);c.clip();waterRainbow(c,t);c.restore();sparks(c,t-3.2,105,105);}
 },
 revival(c,t){
  const release=smooth((t-1.1)/.12);c.drawImage(f.revival[5],0,0);
  // A registered face emerges after the blackout. Only the sword and aura illuminate.
  c.fillStyle=`rgba(0,5,20,${(.88-.2*smooth(t/.85))*(1-release)})`;c.fillRect(0,0,210,140);
  if(t>.15&&t<.95){const y=122-(t-.15)*38;c.save();c.globalAlpha=.65;c.fillStyle='#b9eaff';c.fillRect(98,Math.round(y),12,1);c.restore();}
  if(release){heroRainbow(c,t,release);radiance(c,105,105,.45*release,'#b0eaff');sparks(c,t-1.1,105,100);}
 },
 mechanism(c,t){
  const q=smooth((t-.3)/2.3),open=smooth((t-3)/.45);c.drawImage(mechanism,0,0);
  c.save();aperture(c);c.drawImage(f.mechanism[5],0,0);if(open)coreRainbow(c,t);
  for(const side of [-1,1]){const x=side<0?0:105;c.drawImage(shutters,x,0,105,140,x+Math.round(side*open*49),0,105,140);}c.restore();
  // Hardware wakes from bottom to top; the opening core alone gets the rainbow payoff.
  c.save();c.beginPath();c.rect(0,140*(1-q),210,140*q);c.clip();c.globalAlpha=.65;c.globalCompositeOperation='screen';c.drawImage(circuitry,0,0);c.restore();
  if(open)sparks(c,t-3,105,70);
 }
 };
}
