import {createPayoutReveal} from './payout-reveal.js';
import {Container,Sprite,Texture} from 'pixi.js';
import {painter} from './pixel-primitives.js';
import {presentationSurface,smoothTexture} from './presentation-quality.js';
export function createBonusRoundView(){
 const root=new Container(),canvas=presentationSurface(210,140,()=>{},4),texture=smoothTexture(Texture.from(canvas));const sprite=new Sprite(texture);sprite.width=210;sprite.height=140;root.addChild(sprite);const reveal=createPayoutReveal();let previous='';
 return {root,texture,render(s,{videoBackground=false}={}){root.visible=s.phase!=='celebration'&&(s.phase!=='guide'||s.fromRush);if(!root.visible)return;const revealing=s.phase==='payout-reveal'||s.phase==='guide'&&s.fromRush;if(revealing&&!videoBackground){root.visible=true;const frame=Math.floor(s.phaseTime*24),key=`reveal:${s.maxPayout}:${s.phase}:${frame}`;if(key!==previous){previous=key;reveal.paint(canvas.getContext('2d'),s.maxPayout,s.phase==='guide'?2.5:frame/24,true);texture.source.update();}return;}const key=[s.payout,s.maxPayout,videoBackground,revealing].join();if(key===previous)return;previous=key;
  const c=canvas.getContext('2d');c.clearRect(0,0,210,140);const d=painter(c);c.fillStyle='rgba(4,10,24,.48)';c.fillRect(0,0,210,140);d.rect(5,5,200,2,'#e4c47b');d.rect(5,133,200,2,'#e4c47b');
  if(videoBackground){
   c.clearRect(0,0,210,140);c.fillStyle='rgba(4,10,24,.82)';c.fillRect(102,72,55,24);d.rect(102,72,55,1,'#e4c47b');
   c.font='600 7px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5d78d';c.fillText('獲得玉数',129.5,78,49);
   const amount=revealing?`${s.maxPayout} 玉`:`${s.payout} / ${s.maxPayout} 玉`;let size=9;
   do{c.font=`600 ${size}px -apple-system, "Hiragino Kaku Gothic ProN", sans-serif`;if(c.measureText(amount).width<=49)break;size--;}while(size>=6);
   c.fillStyle='#a1e6ff';c.fillText(amount,129.5,89,49);texture.source.update();return;
  }
  for(const [x,y]of [[7,7],[203,7],[7,133],[203,133]])d.diamond(x,y,4,'#e4c47b');
  const text=(v,y,size,color)=>{c.font=`${size}px "DotGothic16"`;c.textAlign='center';c.textBaseline='middle';c.strokeStyle='#071022';c.lineWidth=2;c.strokeText(v,105,y);c.fillStyle=color;c.fillText(v,105,y);};
  text('獲得玉数',46,16,'#f5d78d');
  const amount=`${s.payout} / ${s.maxPayout} 玉`;let size=26;
  while(size>12){c.font=`${size}px "DotGothic16"`;if(c.measureText(amount).width<=180)break;size--;}
  text(amount,83,size,'#a1e6ff');
  texture.source.update();
 }};
}
