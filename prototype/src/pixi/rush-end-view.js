import {Container,Sprite,Texture} from 'pixi.js';
import {presentationSurface,smoothTexture} from './presentation-quality.js';
import {rushEndPose} from './rush-end-motion.js';
export function createRushEndView(){
 const root=new Container(),canvas=presentationSurface(210,140,()=>{},4),texture=smoothTexture(Texture.from(canvas));
 const sprite=new Sprite(texture);sprite.width=210;sprite.height=140;root.addChild(sprite);root.visible=false;let key=null;
 return {root,texture,render(game,videoBackground=false){
  const p=rushEndPose(game.time,game.lastRush?.endedAt,!!game.rush||!!game.jackpot);
  root.visible=p.showResult;root.alpha=p.alpha;root.y=p.y;
  if(!p.showResult)return;
  const total=Math.floor(game.lastRush.total),next=`${game.lastRush.endedAt}:${total}:${videoBackground}`;
  if(key===next)return;key=next;
  const c=canvas.getContext('2d');c.clearRect(0,0,210,140);
  if(videoBackground){
   c.fillStyle='rgba(4,10,24,.84)';c.fillRect(103,15,54,37);c.fillStyle='#e4c47b';c.fillRect(103,15,54,1);
   c.textAlign='center';c.textBaseline='middle';c.font='600 7px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';c.fillStyle='#cee6ef';c.fillText('RUSH 終了',130,21,48);
   c.font='600 7px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';c.fillStyle='#91a9ba';c.fillText('獲得玉数',130,30,48);
   c.font='600 10px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';c.fillStyle='#f0d394';c.fillText(`${total} 玉`,130,42,48);texture.source.update();return;
  }
  c.fillStyle='#080e20';c.fillRect(0,0,210,140);
  c.textAlign='center';c.textBaseline='middle';c.lineJoin='miter';
  const text=(label,y,size,color)=>{c.font=`${size}px "DotGothic16"`;c.lineWidth=3;c.strokeStyle='#060a15';c.strokeText(label,105,y);c.fillStyle=color;c.fillText(label,105,y);};
  text('RUSH 終了',32,25,'#cee6ef');
  text('獲得玉数',69,14,'#91a9ba');
  let size=33;while(size>16){c.font=`${size}px "DotGothic16"`;if(c.measureText(String(total)).width<=180)break;size--;}
  const gold=c.createLinearGradient(0,83,0,116);gold.addColorStop(0,'#fff5cd');gold.addColorStop(.5,'#edcf89');gold.addColorStop(1,'#af8246');
  text(String(total),103,size,gold);texture.source.update();
 }};
}
