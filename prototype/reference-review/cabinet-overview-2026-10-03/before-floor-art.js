import {arcadeCabinetTexture} from './arcade-cabinet.js';
import {paintArcadeProps} from './arcade-props.js';
import { Application, Container, Sprite, Texture } from 'pixi.js';

// Pixel room backing follows the same DOM slots as the clickable cabinets.
function paintArcadeRoom(c,w,h,slots){
 const r=(x,y,a,b,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(a),Math.round(b));};
 // Compressed floor tiles and visible horizontal top planes share a shallow high angle.
 r(0,0,w,h,'#b6d9db');
 for(let y=27,row=0;y<h;y+=10,row++)for(let x=0;x<w;x+=16){r(x,y,15,9,(Math.floor(x/16)+row)%2?'#f5efd9':'#d4e9e5');r(x,y+8,15,1,'#bfd8d4');}
 r(0,0,w,24,'#fff1d7');r(0,24,w,3,'#d685a2');r(0,24,w,1,'#fffbee');
 for(let x=8;x<w;x+=22){r(x,2,1,19,'#eed6ce');r(x+3,4,12,1,'#fff');}
 r(0,27,3,h-27,'#e6a1b5');r(3,27,1,h-27,'#fff1d7');r(w-3,27,3,h-27,'#97b8cb');
 paintArcadeProps(c,w);
 const rows=new Map();for(const a of slots){const k=a.y;if(!rows.has(k))rows.set(k,[]);rows.get(k).push(a);}
 let row=0;for(const group of rows.values()){
 const first=group[0],last=group.at(-1),left=first.x-2,right=last.x+last.w+2,bottom=first.y+first.h;
 // Low island cabinetry, never a full-height card behind the machine.
 r(left+3,bottom-3,right-left,10,'#a2bfc5');
 r(left,bottom-7,right-left,6,'#fff4d9');r(left,bottom-7,right-left,1,'#fffef1');
 r(left,bottom-1,right-left,6,row%2?'#d391b2':'#7ab8c8');r(left,bottom-1,right-left,1,row%2?'#f1b6ce':'#b7e8e6');
 r(left+1,bottom+5,right-left-2,2,'#7799ad');
 for(const a of group){const cx=Math.round(a.x+a.w/2),sy=bottom+11,col=row%2?'#e18cb2':'#63b6c9';
 r(a.x+6,bottom-6,a.w-10,2,'#bfd3d2');
 // Oval seat seen from above; shaded cushion, stem and feet sit on a single floor.
 r(cx-9,sy+13,22,3,'#a8c7cc');r(cx-6,sy+12,14,2,'#738ea5');r(cx-1,sy+6,3,8,'#738ea5');r(cx,sy+7,1,6,'#eff7eb');
 r(cx-8,sy+2,17,6,'#846f94');r(cx-10,sy,21,5,'#846f94');r(cx-8,sy-2,17,8,col);r(cx-10,sy,21,3,col);
 r(cx-7,sy-2,14,1,'#fff4dc');r(cx-9,sy,2,2,'#c9efeb');r(cx-7,sy+5,15,2,row%2?'#bb739c':'#4a95ae');
 }row++;
 }
 r(w/2-25,h-15,50,12,'#9c80b5');r(w/2-23,h-14,46,1,'#f9dfac');
 c.font='5px DotGothic16';c.textAlign='center';c.fillStyle='#fff';c.fillText('ENTRANCE',Math.round(w/2),h-6);
}

export async function mountFloorArt(host) {
  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    antialias: false,
    autoDensity: false,
    resolution: 1,
    preference: 'webgl',
    hello: false
  });
  const root = new Container();
  app.stage.addChild(root);
  app.canvas.className = 'floor-art-canvas';
  app.canvas.setAttribute('aria-hidden', 'true');
  host.append(app.canvas);

  await document.fonts.load('12px DotGothic16');
  let roomTexture=null;const roomSprite=new Sprite();root.addChild(roomSprite);
  const texture = arcadeCabinetTexture();
  const floorCards=[...host.parentElement.querySelectorAll('.floor-machine')];
  const sprites = floorCards.map(card => {
    const index=Number(card.dataset.unit);
    const sprite = new Sprite(arcadeCabinetTexture(index<5?0:1+Math.floor((index-5)/4),card.dataset.kind==='main'));
    sprite.anchor.set(.5);
    root.addChild(sprite);
    return sprite;
  });

  const paint = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    app.renderer.resize(Math.floor(rect.width), Math.floor(rect.height));
    const cards = [...host.parentElement.querySelectorAll('.floor-machine')];
    const hostRect = host.getBoundingClientRect();
    const bounds=cards.map(card=>card.querySelector('.floor-machine-art').getBoundingClientRect());
    const pixel=Math.max(1,Math.min(host.closest('.paged-floor')?3:2,...bounds.map(r=>Math.floor(Math.min(r.width/48,r.height/64)))));
    const slots=[];
    cards.forEach((card, index) => {
      const art = card.querySelector('.floor-machine-art');
      const r = art.getBoundingClientRect();
      const x = r.left - hostRect.left;
      const y = r.top - hostRect.top;
      const sprite = sprites[index];
      if (!sprite) return;
      const scale=pixel;
      const px=Math.round((x+r.width/2-texture.width*scale/2)/pixel)*pixel;
      const py=Math.round((y+r.height/2-texture.height*scale/2)/pixel)*pixel;
      slots.push({x:px/pixel,y:py/pixel,w:texture.width,h:texture.height,active:card.dataset.kind==='main'});
      sprite.position.set(px+texture.width*scale/2,py+texture.height*scale/2);
      sprite.scale.set(scale);
    });
    const room=document.createElement('canvas');room.width=Math.ceil(rect.width/pixel);room.height=Math.ceil(rect.height/pixel);paintArcadeRoom(room.getContext('2d'),room.width,room.height,slots);const old=roomTexture;roomTexture=Texture.from(room);roomTexture.source.scaleMode='nearest';roomSprite.texture=roomTexture;roomSprite.scale.set(pixel);old?.destroy(true);
  };
  const observer = new ResizeObserver(paint);
  observer.observe(host);
  host.parentElement.querySelectorAll('.floor-machine-art').forEach(node => observer.observe(node));
  requestAnimationFrame(paint);
  return { destroy() { observer.disconnect(); app.destroy(true, { children: true });roomTexture?.destroy(true); } };
}

export async function mountCabinetArt(host, index=0, kind='main') {
  const app = new Application();
  await app.init({backgroundAlpha:0,antialias:false,autoDensity:false,resolution:1,preference:'webgl',hello:false});
  const root = new Container();
  app.stage.addChild(root);
  app.canvas.className='floor-art-canvas';
  app.canvas.setAttribute('aria-hidden','true');
  host.append(app.canvas);
  const texture=arcadeCabinetTexture(kind==='dummy'?1+index%4:0);
  const sprite=new Sprite(texture);
  sprite.anchor.set(.5);
  root.addChild(sprite);
  const paint=()=>{
    const rect=host.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    app.renderer.resize(Math.floor(rect.width),Math.floor(rect.height));
    const scale=Math.min(rect.width*.88/texture.width,rect.height*.88/texture.height);
    sprite.position.set(rect.width/2,rect.height/2);
    sprite.scale.set(scale);
  };
  const observer=new ResizeObserver(paint);
  observer.observe(host);
  requestAnimationFrame(paint);
  return {destroy(){observer.disconnect();app.destroy(true,{children:true});}};
}
