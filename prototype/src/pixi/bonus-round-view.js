import {createPayoutReveal} from './payout-reveal.js';
import {Container,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
export function createBonusRoundView(){
 const root=new Container(),canvas=pixelSurface(210,140,()=>{}),texture=Texture.from(canvas);texture.source.scaleMode='nearest';root.addChild(new Sprite(texture));const reveal=createPayoutReveal();let previous='';
 return {root,texture,render(s){root.visible=s.phase!=='celebration'&&(s.phase!=='guide'||s.fromRush);if(!root.visible)return;if(s.phase==='payout-reveal'||s.phase==='guide'&&s.fromRush){root.visible=true;const frame=Math.floor(s.phaseTime*24),key=`reveal:${s.maxPayout}:${s.phase}:${frame}`;if(key!==previous){previous=key;reveal.paint(canvas.getContext('2d'),s.maxPayout,s.phase==='guide'?2.5:frame/24,true);texture.source.update();}return;}const key=[s.payout,s.maxPayout].join();if(key===previous)return;previous=key;
  const c=canvas.getContext('2d');c.clearRect(0,0,210,140);const d=painter(c);c.fillStyle='rgba(4,10,24,.48)';c.fillRect(0,0,210,140);d.rect(5,5,200,2,'#e4c47b');d.rect(5,133,200,2,'#e4c47b');
  for(const [x,y]of [[7,7],[203,7],[7,133],[203,133]])d.diamond(x,y,4,'#e4c47b');
  const text=(v,y,size,color)=>{c.font=`${size}px "DotGothic16"`;c.textAlign='center';c.textBaseline='middle';c.strokeStyle='#071022';c.lineWidth=2;c.strokeText(v,105,y);c.fillStyle=color;c.fillText(v,105,y);};
  text('獲得玉数',46,16,'#f5d78d');
  const amount=`${s.payout} / ${s.maxPayout} 玉`;let size=26;
  while(size>12){c.font=`${size}px "DotGothic16"`;if(c.measureText(amount).width<=180)break;size--;}
  text(amount,83,size,'#a1e6ff');
  texture.source.update();
 }};
}
