import {Container,Sprite,Texture,Rectangle} from 'pixi.js';
import {createCabinetForeground} from './cabinet-foreground.js';
import {cabinetLightPose} from './cabinet-light-motion.js';
const rainbow=(h)=>{const f=n=>Math.round((.5+.5*Math.cos((h+n)*Math.PI*2))*190+65);return (f(0)<<16)|(f(-1/3)<<8)|f(1/3);};
export function createCabinetLightView(physics){
 const root=new Container(),canvas=createCabinetForeground(physics),base=Texture.from(canvas);base.source.scaleMode='nearest';
 const lamp=document.createElement('canvas');lamp.width=canvas.width;lamp.height=canvas.height;const lc=lamp.getContext('2d'),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
 // Light the moulded lens and reflective face pixels, leaving recesses and cast shadows dark.
 for(let i=0;i<pixels.data.length;i+=4){const [r,g,b,a]=pixels.data.slice(i,i+4);const lit=a>0&&((b>115&&b>r*1.25)||(r>155&&g>135&&b<r*.85));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]=lit?Math.round(a*.85):0;}
 lc.putImageData(pixels,0,0);const glow=Texture.from(lamp);glow.source.scaleMode='nearest';
 const frames=[],parts=[];
 // Four independent carriers: crown, left/right frame reliefs, lower ornament.
 for(const [x,y,w,h,px,py,dx,dy]of [[0,0,420,110,210,66,0,9],[0,110,210,180,100,190,5,0],[210,110,210,180,327,190,-5,0],[0,290,420,270,210,418,0,-12]]){
  const node=new Container();node.position.set(px,py);node.pivot.set(px,py);
  for(const [source,isGlow]of [[base,false],[glow,true]]){const tex=new Texture({source:source.source,frame:new Rectangle(x*3,y*3,w*3,h*3)});frames.push(tex);const sprite=new Sprite(tex);sprite.scale.set(1/3);sprite.position.set(x,y);if(isGlow){sprite.blendMode='add';node.light=sprite;}node.addChild(sprite);}
  root.addChild(node);parts.push({node,px,py,dx,dy});
 }
 let pose=cabinetLightPose({time:0});
 return {root,textures:[base,glow],frames,snapshot:()=>({...pose}),render(game){pose=cabinetLightPose(game);parts.forEach(({node,px,py,dx,dy},i)=>{
  node.position.set(px+Math.round(dx*pose.travel),py+Math.round(dy*pose.travel));
  node.scale.set(1+.035*pose.travel);
  node.light.alpha=pose.light;
  node.light.tint=pose.rainbow?rainbow(pose.hue+i*.19):pose.phase==='reach'||pose.phase==='payout'?0xffb749:pose.phase==='rush'?(i%2?0xca74ff:0x55cfff):0x67b8ff;
 });}};
}
