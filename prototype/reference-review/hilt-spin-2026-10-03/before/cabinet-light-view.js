import {Container,Sprite,Texture,Rectangle} from 'pixi.js';
import {sourcePoint} from './source-layout.js';
import {createCabinetForeground} from './cabinet-foreground.js';
import {MOON_PHASES,MOON_COLORS,createMoonCueController} from './moon-cue.js';
import {createMoonCueArt} from './moon-cue-art.js';
import {cabinetLightPose,cabinetSwordPose} from './cabinet-light-motion.js';
const rainbow=(h)=>{const f=n=>Math.round((.5+.5*Math.cos((h+n)*Math.PI*2))*190+65);return (f(0)<<16)|(f(-1/3)<<8)|f(1/3);};
export function createCabinetLightView(physics,portrait=null,background=null){
 const root=new Container(),canvas=createCabinetForeground(physics,{portrait,background,includeSword:false}),base=Texture.from(canvas);base.source.scaleMode='nearest';
 const lamp=document.createElement('canvas');lamp.width=canvas.width;lamp.height=canvas.height;const lc=lamp.getContext('2d'),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
 // Light the moulded lens and reflective face pixels, leaving recesses and cast shadows dark.
 for(let i=0;i<pixels.data.length;i+=4){const [r,g,b,a]=pixels.data.slice(i,i+4);const lit=Math.floor(i/4/canvas.width)>=525&&a>0&&((b>115&&b>r*1.25)||(r>155&&g>135&&b<r*.85));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;pixels.data[i+3]=lit?Math.round(a*.85):0;}
 lc.putImageData(pixels,0,0);const glow=Texture.from(lamp);glow.source.scaleMode='nearest';
 const frames=[],parts=[];
 // Fixed portrait/frame carriers retain their lighting, but never translate or scale.
 for(const [x,y,w,h,px,py]of [[0,0,420,110,210,66],[0,110,210,180,100,190],[210,110,210,180,327,190],[0,290,420,270,210,418]]){
  const node=new Container();node.position.set(px,py);node.pivot.set(px,py);
  for(const [source,isGlow]of [[base,false],[glow,true]]){const tex=new Texture({source:source.source,frame:new Rectangle(x*3,y*3,w*3,h*3)});frames.push(tex);const sprite=new Sprite(tex);sprite.scale.set(1/3);sprite.position.set(x,y);if(isGlow){sprite.blendMode='add';node.light=sprite;}node.addChild(sprite);}
  root.addChild(node);parts.push({node,px,py});
 }
 const moonTextures=Object.fromEntries(MOON_PHASES.flatMap(p=>MOON_COLORS.map(col=>{const tex=Texture.from(createMoonCueArt(p,col));tex.source.scaleMode='nearest';return [`${p}-${col}`,tex];})));
 const moon=new Sprite(moonTextures['crescent-none']);const [mx,my]=sourcePoint([641,297]);moon.anchor.set(.5);moon.position.set(mx,my-130);moon.width=48;moon.height=48;root.addChild(moon);
 const moonController=createMoonCueController();let lunar={phase:'crescent',color:'none',strike:false};
 const swordTexture=Texture.from(createCabinetForeground(physics,{onlySword:true}));swordTexture.source.scaleMode='nearest';
 const sword=new Sprite(swordTexture);sword.scale.set(1/3);const [hx,hy]=sourcePoint([426,324]);sword.pivot.set(hx*3,(hy-130)*3);sword.position.set(hx,hy-130);root.addChild(sword);
 let pose=cabinetLightPose({time:0}),blade=cabinetSwordPose({time:0});
 return {root,textures:[base,glow,swordTexture,...Object.values(moonTextures)],frames,snapshot:()=>({...pose,sword:{...blade},fixedCarriers:true,moon:{...lunar}}),render(game){pose=cabinetLightPose(game);blade=cabinetSwordPose(game);parts.forEach(({node,px,py},i)=>{
  node.position.set(px,py);node.scale.set(1);
  node.light.alpha=pose.light;
  node.light.tint=pose.rainbow?rainbow(pose.hue+i*.19):pose.phase==='reach'||pose.phase==='payout'?0xffb749:pose.phase==='rush'?(i%2?0xca74ff:0x55cfff):0x67b8ff;
 });sword.rotation=blade.angle;lunar=moonController.render(game,blade);moon.texture=moonTextures[`${lunar.phase}-${lunar.color}`];moon.alpha=lunar.cueActive||lunar.strike?1:.28;}};
}
