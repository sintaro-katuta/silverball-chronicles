import {Container,Sprite,Texture} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
export const DIRECTION_CUTIN_SECONDS=1.8;
export function directionCutinPose(elapsed,direction){
 const sign=direction==='right'?1:-1,enter=Math.min(1,Math.max(0,elapsed/.16)),exit=Math.max(0,(elapsed-1.5)/.3);
 return {visible:elapsed>=0&&elapsed<DIRECTION_CUTIN_SECONDS,x:Math.round(sign*(-210*(1-enter)**3+210*exit**3))||0,alpha:1-Math.min(1,exit),scaleY:.8+.2*enter};
}
export function createDirectionCutin(){
 const root=new Container(),textures=[],sprites={};
 for(const direction of ['left','right']){
  const right=direction==='right',texture=Texture.from(pixelSurface(210,140,c=>{const d=painter(c);
   d.rect(0,0,210,140,'rgba(3,10,25,.48)');d.poly([[0,34],[192,34],[210,45],[210,106],[18,106],[0,95]],'#071b35');
   d.rect(0,34,192,3,'#f2d18b');d.rect(18,103,192,3,'#91dfff');
   for(let i=0;i<4;i++){const x=right?i*18:210-i*18;d.line(x,43,x+(right?20:-20),43,'#245177',2);d.line(x,96,x+(right?20:-20),96,'#245177',2);}
   const ax=right?184:26,sign=right?1:-1;d.poly([[ax-sign*9,57],[ax+sign*5,57],[ax+sign*17,70],[ax+sign*5,83],[ax-sign*9,83],[ax+sign*3,70]],'#9eeaff');
   c.font='40px "DotGothic16"';c.textAlign='center';c.textBaseline='middle';c.lineJoin='miter';c.lineWidth=5;c.strokeStyle='#315a7e';const x=right?88:122;c.strokeText(right?'右打ち':'左打ち',x,71);c.fillStyle='#f0f9ff';c.fillText(right?'右打ち':'左打ち',x,71);
  }));texture.source.scaleMode='nearest';textures.push(texture);const sprite=new Sprite(texture);root.addChild(sprite);sprites[direction]=sprite;
 }
 let last=null,since=-Infinity;root.visible=false;
 return {root,textures,announce(direction,time,delay=0){last=direction;since=time+delay;},render(direction,time,delay=0){if(last!==direction){if(last!==null)since=time+delay;last=direction;}const p=directionCutinPose(time-since,direction);root.visible=p.visible;if(!p.visible)return;root.position.set(p.x,70);root.pivot.set(0,70);root.scale.set(1,p.scaleY);root.alpha=p.alpha;for(const [key,s]of Object.entries(sprites))s.visible=key===direction;}};
}
