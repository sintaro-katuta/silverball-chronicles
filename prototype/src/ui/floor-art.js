import womanImageUrl from './assets/seated-woman-with-stool-v2.png';
import customerImageUrl from './assets/seated-man-with-stool-v3.png';
import traysImageUrl from './assets/pachinko-trays-stacked-green-v1.png';
import yellowTraysImageUrl from './assets/pachinko-trays-stacked-yellow-v1.png';
import singleTraysImageUrl from './assets/pachinko-trays-green-yellow-v1.png';
import cabinetGreenUrl from './assets/hall-face-green-v1.png';
import cabinetGoldUrl from './assets/hall-face-gold-v1.png';
import cabinetRedUrl from './assets/hall-face-red-v1.png';
import cabinetCuboidUrl from './assets/hall-cabinet-green-cuboid-v2.png';
import cabinetGoldCuboidUrl from './assets/hall-cabinet-gold-cuboid-v1.png';
import cabinetRedCuboidUrl from './assets/hall-cabinet-red-cuboid-v1.png';
import emptyStoolUrl from './assets/empty-stool-v1.png';
import roomImageUrl from './assets/hall-room-v1.webp';
import mobileRoomImageUrl from './assets/hall-mobile-room-v1.webp';
import informationImageUrl from './assets/hall-information-small-v1.png';
import greenSingleUrl from './assets/hall-single-tray-green-small-v1.png';
import yellowSingleUrl from './assets/hall-single-tray-yellow-small-v1.png';
import {drawHall,HALL_SIZE} from './hall-drawing.js';
import {drawMobileHall,MOBILE_HALL_SIZE} from './hall-mobile-drawing.js';
import {arcadeCabinetTexture} from './arcade-cabinet.js';
import { Application, Container, Sprite, Texture } from 'pixi.js';

export async function mountFloorArt(host,{mobile=false}={}) {
 const canvas=document.createElement('canvas'),size=mobile?MOBILE_HALL_SIZE:HALL_SIZE;canvas.width=size.width;canvas.height=size.height;
 canvas.className='floor-reference-image';canvas.setAttribute('aria-hidden','true');host.append(canvas);
 const loadImage=async(url)=>{const image=new Image();image.src=url;try{await image.decode();return image;}catch(error){console.warn('台選択の人物画像を読み込めませんでした',error);return null;}};
 const [customer,woman,trays,yellowTrays,singleTrays,green,gold,red,room,information,greenSingle,yellowSingle,cuboid,goldCuboid,redCuboid,emptyStool]=await Promise.all([loadImage(customerImageUrl),loadImage(womanImageUrl),loadImage(traysImageUrl),loadImage(yellowTraysImageUrl),loadImage(singleTraysImageUrl),loadImage(cabinetGreenUrl),loadImage(cabinetGoldUrl),loadImage(cabinetRedUrl),loadImage(mobile?mobileRoomImageUrl:roomImageUrl),loadImage(informationImageUrl),loadImage(greenSingleUrl),loadImage(yellowSingleUrl),loadImage(cabinetCuboidUrl),loadImage(cabinetGoldCuboidUrl),loadImage(cabinetRedCuboidUrl),loadImage(emptyStoolUrl)]);
 const counts={green:2,yellow:2};let ticketCount=null;
 const paint=()=>mobile?drawMobileHall(canvas.getContext('2d'),{room,green:cuboid,gold:goldCuboid,red:redCuboid,man:customer,woman,emptyStool,greenTray:greenSingle,yellowTray:yellowSingle,information},counts,ticketCount):drawHall(canvas.getContext('2d'),customer,woman,trays,yellowTrays,singleTrays,{green,gold,red,cuboid,goldCuboid,redCuboid,emptyStool},room,information,null,{green:greenSingle,yellow:yellowSingle},counts,ticketCount);
 paint();
 canvas.dataset.hall=green&&gold&&red&&room?'composed':'unavailable';
 canvas.dataset.cuboid=cuboid?'loaded':'unavailable';
 canvas.dataset.customer=customer?'loaded':'unavailable';canvas.dataset.woman=woman?'loaded':'unavailable';
 canvas.dataset.trays=trays&&yellowTrays&&singleTrays&&greenSingle&&yellowSingle?'loaded':'unavailable';
 return {setTrayCount(color,count){if(!Object.hasOwn(counts,color)||!Number.isInteger(count)||count<0||count>10)throw new RangeError('Invalid tray count');counts[color]=count;paint();},setFloorPrice(count){if(!Number.isInteger(count)||count<0)throw new RangeError('Invalid floor price');ticketCount=count;canvas.dataset.floorPrice=String(count);paint();},destroy(){canvas.remove();}};
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
