import {Container,Sprite,Texture,Graphics} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
import {createRushEntryMotion} from './rush-entry-motion.js';
const LETTERS=['11110/10001/10001/11110/10100/10010/10001','10001/10001/10001/10001/10001/10001/01110','01111/10000/10000/01110/00001/00001/11110','10001/10001/10001/11111/10001/10001/10001'];
export function createRushEntryView(){
 const root=new Container(),motion=createRushEntryMotion(),textures=[];
 const texture=paint=>{const t=Texture.from(pixelSurface(210,116,paint));t.source.scaleMode='nearest';textures.push(t);return t;};
 const letters=[],letterMask=new Graphics();
 for(let i=0;i<4;i++){
  const cells=[];LETTERS[i].split('/').forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')cells.push([x,y]);}));
  for(const [x,y]of cells)letterMask.rect(21+i*42+x*7,30+y*6,9,8);
  const group=new Container();group.pivot.set(40+i*42,74);root.addChild(group);
  const edges=cells.filter(([x,y])=>!cells.some(([a,b])=>a===x&&b===y-1));
  const flames=Array.from({length:8},(_,frame)=>texture(c=>{const d=painter(c);
   edges.forEach(([x,y],j)=>{const phase=(frame+j*3)%8,h=3+[0,2,3,4,3,2,1,0][phase],px=23+i*42+x*7,py=31+y*6;
    d.rect(px-1,py-h,5,h+2,'#9b302b');d.rect(px,py-h+1,3,h,'#ec6330');d.rect(px+1,py-2,2,3,'#ffc96b');
    if(phase===3||phase===4)d.rect(px+2,py-h-3,1,2,'#ef8c44');
   });
  }));
  const flame=new Sprite(flames[0]);group.addChild(flame);
  const t=texture(c=>{const d=painter(c);
   for(const [x,y]of cells)d.rect(25+i*42+x*7,35+y*6,9,8,'#8b4b26');
   for(const [x,y]of cells)d.rect(21+i*42+x*7,30+y*6,9,8,'#ffe8ad');
   for(const [x,y]of cells){d.rect(22+i*42+x*7,31+y*6,7,6,y<3?'#fff5d6':y<5?'#e9b455':'#b97535');}
  });const s=new Sprite(t);group.addChild(s);
  const burst=new Graphics().rect(18+i*42,75,7,2).rect(54+i*42,75,7,2).rect(21+i*42,79,3,2).rect(55+i*42,79,3,2).fill(0xffd98c);root.addChild(burst);
  letters.push({group,flame,flames,burst});
 }
 const shineLayer=new Container();root.addChild(shineLayer);
 const rainbow=[0xff527c,0xffa34f,0xffe86b,0x80ef87,0x5be2ef,0x7895ff,0xcc7fff];
 const afterglows=Array.from({length:4},(_,i)=>{const g=new Graphics();
  for(let y=30;y<75;y+=6)g.rect(20+i*42,y,38,6).fill(rainbow[Math.min(6,Math.floor((y-30)/6))]);
  shineLayer.addChild(g);return g;
 });
 const sheen=new Graphics();
 for(let y=0;y<58;y+=2){const slant=Math.round(y*32/58),color=rainbow[Math.max(0,Math.min(6,Math.floor((y-3)/6)))];
  sheen.rect(-20-slant,y,62,2).fill({color,alpha:.45});
  sheen.rect(-9-slant,y,39,2).fill(color);
  sheen.rect(25-slant,y,3,2).fill({color:0xffffff,alpha:.5});
 }
 shineLayer.addChild(sheen);
 letterMask.fill(0xffffff);root.addChild(letterMask);shineLayer.mask=letterMask;
 root.position.set(2,18);root.visible=false;
 return {root,textures,render(time,playingRush,initialAge=0){const p=motion.update(time,playingRush,initialAge);root.visible=p.visible;if(!p.visible)return;
  root.alpha=p.alpha;
  letters.forEach(({group,flame,flames,burst},i)=>{const pose=p.letters[i];group.visible=pose.visible;group.position.set(40+i*42,74+pose.y);group.scale.set(pose.scaleX,pose.scaleY);
   flame.visible=pose.landed;flame.texture=flames[Math.max(0,Math.floor(pose.impact*12))%8];burst.visible=pose.burst>0;burst.alpha=pose.burst;
  });
  shineLayer.visible=p.age>=.8&&p.age<2.05;
  sheen.position.set(p.shine,27);sheen.visible=p.shineVisible;
  afterglows.forEach((g,i)=>{const passed=p.age-(.8+(86+i*42)/250),remaining=Math.max(0,1-passed/.25);g.alpha=passed>=0?.65*remaining*remaining:0;});
 }};
}
