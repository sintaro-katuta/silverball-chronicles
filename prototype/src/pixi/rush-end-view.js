import {Container,Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {rushEndPose} from './rush-end-motion.js';
export function createRushEndView(){
 const root=new Container(),canvas=pixelSurface(210,140,()=>{}),texture=Texture.from(canvas);
 texture.source.scaleMode='nearest';root.addChild(new Sprite(texture));root.visible=false;let key=null;
 return {root,texture,render(game){
  const p=rushEndPose(game.time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);
  root.visible=p.showResult;root.alpha=p.alpha;root.y=p.y;
  if(!p.showResult)return;
  const total=Math.floor(game.lastRush.total),next=`${game.lastRush.endedAt}:${total}`;
  if(key===next)return;key=next;
  const c=canvas.getContext('2d');c.clearRect(0,0,210,140);
  c.fillStyle='#080e20';c.fillRect(0,0,210,140);
  c.textAlign='center';c.textBaseline='middle';c.lineJoin='miter';
  const text=(label,y,size,color)=>{c.font=`${size}px "DotGothic16"`;c.lineWidth=3;c.strokeStyle='#060a15';c.strokeText(label,105,y);c.fillStyle=color;c.fillText(label,105,y);};
  text('RUSH 終了',32,25,'#cee6ef');
  text('合計払出',69,14,'#91a9ba');
  let size=33;while(size>16){c.font=`${size}px "DotGothic16"`;if(c.measureText(String(total)).width<=180)break;size--;}
  const gold=c.createLinearGradient(0,83,0,116);gold.addColorStop(0,'#fff5cd');gold.addColorStop(.5,'#edcf89');gold.addColorStop(1,'#af8246');
  text(String(total),103,size,gold);texture.source.update();
 }};
}
