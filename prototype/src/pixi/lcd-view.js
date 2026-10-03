import {createWaterIdle} from './water-idle.js';
import {Container,Sprite,Texture,Graphics} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {LCD_LAYOUT,LCD_TOP,LCD_OPENING,LCD_OUTLINE} from './lcd-layout.js';
export {LCD_LAYOUT} from './lcd-layout.js';
export function createLcdView(sceneTexture,cloudSky=null,hairAtlas=null,hairUnderlay=null,rushScene=null){
 const root=new Container();root.position.set(LCD_LAYOUT.x,LCD_LAYOUT.y);
 const viewport=new Container(),mask=new Graphics().poly(LCD_OPENING.flatMap(([x,y])=>[x-LCD_LAYOUT.x,y-LCD_LAYOUT.y])).fill(0xffffff);root.addChild(viewport,mask);viewport.mask=mask;
 const idle=createWaterIdle(sceneTexture,cloudSky,hairAtlas,hairUnderlay),art=idle?.sprite??new Sprite(sceneTexture);
 const fit=LCD_LAYOUT.height/140;art.width=210*fit;art.height=LCD_LAYOUT.height;art.x=(LCD_LAYOUT.width-art.width)/2;viewport.addChild(art);
 const rush=rushScene?new Sprite(rushScene):null;if(rush){rush.width=210*fit;rush.height=LCD_LAYOUT.height;rush.x=art.x;rush.visible=false;viewport.addChild(rush);}
 // Preserve the original art/text aspect ratio. The screen expands around the central show area.
 const surround=new Graphics().rect(0,0,LCD_LAYOUT.width,LCD_LAYOUT.height).fill(0x020514);surround.visible=false;viewport.addChild(surround);
 const content=new Container(),scale=LCD_LAYOUT.width/210;content.scale.set(scale);content.x=(LCD_LAYOUT.width-210*scale)/2;content.y=(LCD_LAYOUT.height-140*scale)/2;viewport.addChild(content);
 const W=LCD_LAYOUT.width,H=LCD_LAYOUT.height;
 const texture=Texture.from(pixelSurface((W+20)*3,(H+34)*3,c=>{
  const d=painter(c),r=(x,y,w,h,col)=>d.rect(x*3,y*3,w*3,h*3,col);
  const local=points=>points.map(([x,y])=>[(x-(LCD_LAYOUT.x-8))*3,(y-(LCD_LAYOUT.y-18))*3]);
  const outer=local(LCD_OUTLINE),inner=local(LCD_OPENING);
  d.poly(outer.map(([x,y])=>[x+4,y+5]),'#07111f');d.poly(outer,'#7c704f');
  for(let i=0;i<outer.length;i++){const a=outer[i],b=outer[(i+1)%outer.length];d.line(...a,...b,i<24?'#e4cf97':'#a5bcc5',6);}
  c.globalCompositeOperation='destination-out';d.poly(inner,'#000');c.globalCompositeOperation='source-over';
  for(let i=0;i<inner.length;i++){const a=inner[i],b=inner[(i+1)%inner.length];d.line(...a,...b,'#d1b576',3);}
  for(const [x,y]of [outer[0],outer[1],outer[7],outer.at(-1)]){d.diamond(x,y,7,'#d4c18c');d.diamond(x,y,4,'#366f9d');}

 }));texture.source.scaleMode='nearest';const frame=new Sprite(texture);frame.scale.set(1/3);frame.position.set(-8,-18);root.addChild(frame);
 return {root,content,texture,idleTexture:idle?.texture,render(time,game){idle?.render(time);surround.visible=!!game?.entryPrelude||game?.phase==='jackpot'||game?.phase==='win';if(rush)rush.visible=!!game?.rush||!!game?.previewRushWin;}};
}
