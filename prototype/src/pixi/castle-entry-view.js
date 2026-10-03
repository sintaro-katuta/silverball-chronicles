import {pixelSurface} from './pixel-primitives.js';
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
// One registered castle painting throughout. All motion shares the game clock.
export function castleEntryPose(t){
 return {charge:smooth((t-.5)/5.2),open:smooth((t-6.15)/.85),
  zoom:1,
  still:t>=5.85&&t<6.15,release:smooth((t-6.15)/.2)};
}
export function createCastleEntryPainter(sheet){
 const source=sheet.source.resource,w=source.width/2,h=source.height/3;
 const base=pixelSurface(210,140,c=>c.drawImage(source,5,5,w-10,h-10,0,0,210,140));
 const scene=pixelSurface(210,140,()=>{});
 const mist=pixelSurface(210,140,()=>{}),mistContext=mist.getContext('2d'),mistPixels=mistContext.createImageData(210,140);
 const edgePixels=[];
 for(let y=0;y<140;y++)for(let x=0;x<210;x++){const edge=Math.min(x,209-x,y,139-y);if(edge<25)edgePixels.push({x,y,edge,i:(y*210+x)*4});}
 const rainbow=Array.from({length:360},(_,h)=>{const a=(h/60)%6,f=a%1;const rgb=a<1?[1,f,0]:a<2?[1-f,1,0]:a<3?[0,1,f]:a<4?[0,1-f,1]:a<5?[f,0,1]:[1,0,1-f];return rgb.map(v=>Math.round(55+200*v));});
 const interior=pixelSurface(210,140,c=>c.drawImage(source,w+5,h*2+5,w-10,h-10,0,0,210,140));
 const facade=pixelSurface(210,140,()=>{}),facadeContext=facade.getContext('2d'),original=base.getContext('2d').getImageData(0,0,210,140),lit=facadeContext.createImageData(210,140);
 const warm=[];for(let y=8;y<127;y++)for(let x=15;x<195;x++){const i=(y*210+x)*4,r=original.data[i],g=original.data[i+1],b=original.data[i+2];if(r>g*1.06&&g>b*1.15&&r>24&&!(x>81&&x<125&&y>51))warm.push({i,y,power:Math.min(1,(r+g)/180)});}
 const gatePath=c=>{c.beginPath();c.moveTo(82,126);c.lineTo(82,75);c.lineTo(87,67);c.lineTo(103,54);c.lineTo(108,54);c.lineTo(123,72);c.lineTo(123,126);c.closePath();};
 const doors=pixelSurface(210,140,c=>{gatePath(c);c.clip();c.drawImage(base,0,0);});
 return (output,t)=>{
  const p=castleEntryPose(t),c=scene.getContext('2d');c.clearRect(0,0,210,140);c.imageSmoothingEnabled=false;c.drawImage(base,0,0);
  // Light only the existing warm window/stone pixels: no floating rectangle lamps.
  lit.data.fill(0);
  for(const {i,y,power} of warm){const a=smooth((t-.5-(127-y)/30)/.85)*(.9+.1*Math.sin(t*2+y*.17));lit.data[i]=255;lit.data[i+1]=218;lit.data[i+2]=132;lit.data[i+3]=Math.round(a*power*235);}
  facadeContext.putImageData(lit,0,0);c.drawImage(facade,0,0);
  // The bright interior is behind the moving door leaves, not a replacement shot.
  c.save();gatePath(c);c.clip();c.fillStyle='#090b18';c.fillRect(80,50,46,80);
  if(p.open>0){
   c.drawImage(interior,0,0);
   // Colour the illustrated interior, behind the door leaves and inside the arch.
   c.save();c.globalCompositeOperation='color';
   const spectrum=c.createLinearGradient(82,52,123,126);
   for(let i=0;i<=12;i++){const hue=((i*60+(t-6.15)*90)%360+360)%360;spectrum.addColorStop(i/12,`hsl(${hue},100%,60%)`);}
   c.fillStyle=spectrum;c.fillRect(82,52,42,76);c.restore();
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=.22;
   c.fillStyle=spectrum;c.fillRect(82,52,42,76);c.restore();
  }

  // Project many vertical strips: both hinges stay fixed, free edges recede in depth.
  const width=20.5*(1-.92*p.open);
  for(const side of [-1,1])for(let i=0;i<21;i++){
   const u=i/21,v=(i+1)/21,hinge=side<0?82:123;
   const sx=side<0?82+i:122-i,dx=side<0?hinge+u*width:hinge-v*width;
   const inset=p.open*u*7;
   c.drawImage(doors,sx,52,1,76,dx,52+inset,Math.max(1,width/21+.3),76-2*inset);
  }
  c.restore();
  // The seam charges continuously; a short held beat precedes the actual opening.
  if(t>.6){c.globalAlpha=p.charge*(1-p.open);c.fillStyle='#eabb62';c.fillRect(103,57,2,68);c.fillStyle='#fff7c4';c.fillRect(104,65,1,60);c.globalAlpha=1;}
  const motion=p.still?5.85:t;
  if(t>1&&t<6.15){for(let i=0;i<24;i++){
   const phase=((motion*(.24+p.charge*.2)+i*.618)%1),a=i*2.399,r=(1-phase)*(18+23*p.charge);
   const x=104+Math.cos(a)*r,y=99+Math.sin(a)*r*.7;
   c.globalAlpha=Math.sin(phase*Math.PI)*p.charge;c.fillStyle=i%3?'#e7b862':'#fff7ca';c.fillRect(Math.round(x),Math.round(y),1,i%4===0?2:1);
  }c.globalAlpha=1;}
  if(p.open>0){
   c.save();c.globalCompositeOperation='screen';
   for(let i=0;i<11;i++){const a=-Math.PI+i*Math.PI/10,r=25+65*p.open; c.globalAlpha=.16*p.open;c.fillStyle='#ffd478';c.beginPath();c.moveTo(104,103);c.lineTo(104+Math.cos(a-.025)*r,103+Math.sin(a-.025)*r);c.lineTo(104+Math.cos(a+.025)*r,103+Math.sin(a+.025)*r);c.fill();}
   for(let i=0;i<25;i++){const dt=Math.max(0,t-6.15),a=i*2.399,r=dt*(15+i%7*4);c.globalAlpha=clamp(1-dt/2)*.8;c.fillStyle='#fff5b8';c.fillRect(Math.round(104+Math.cos(a)*r),Math.round(98+Math.sin(a)*r),1,2);}
   c.restore();
  }
  // Fixed native-pixel composition: no fractional resampling of castle masonry.
  output.imageSmoothingEnabled=false;output.drawImage(scene,0,0);
  // Organic, translucent rainbow wisps live only at the LCD edges, leaving the gate clear.
  const strength=smooth((t-.25)/1.2)*(.3+.42*p.charge)*(1-smooth((t-5.5)/.35));
  mistPixels.data.fill(0);
  for(const {x,y,edge,i} of edgePixels){
   const flow=Math.sin(x*.13+y*.085-t*1.4)+.55*Math.sin(y*.24-x*.06+t*.9)+.3*Math.sin(x*.29+y*.19-t*2);
   const reach=10+5*p.charge+flow*3.2;
   const envelope=clamp((reach-edge)/9),ribbon=.5+.5*Math.sin(edge*.5+flow*2.1-t*1.2);
   const alpha=envelope*(.3+.7*ribbon)*strength;
   const hue=((Math.round(x*.95+y*1.6+t*48+flow*20)%360)+360)%360,rgb=rainbow[hue];
   mistPixels.data[i]=rgb[0];mistPixels.data[i+1]=rgb[1];mistPixels.data[i+2]=rgb[2];mistPixels.data[i+3]=Math.round(alpha*220);
  }
  mistContext.putImageData(mistPixels,0,0);
  output.save();output.globalCompositeOperation='screen';output.drawImage(mist,0,0);
  for(let i=0;i<38;i++){
   const travel=(i*18.421+t*8)%700,depth=3+(i%4)*2;
   let x,y;if(travel<210){x=travel;y=depth;}else if(travel<350){x=209-depth;y=travel-210;}else if(travel<560){x=560-travel;y=139-depth;}else{x=depth;y=700-travel;}
   const shine=Math.max(0,Math.sin(t*3+i*2.399))**8*strength;
   output.globalAlpha=shine;output.fillStyle='#fff9ed';x=Math.round(x);y=Math.round(y);output.fillRect(x,y,1,1);
   if(shine>.65){output.globalAlpha=shine*.5;output.fillRect(x-1,y,3,1);output.fillRect(x,y-1,1,3);}
  }
  output.restore();
 };
}
