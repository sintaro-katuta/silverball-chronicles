import {Container,Graphics,Sprite,Texture} from 'pixi.js';
import {pixelSurface} from './pixel-primitives.js';
import {reachFinalePose} from './decision-push.js';
const RAINBOW=[0xff486d,0xffb343,0xffef80,0x55efab,0x5bcfff,0xa587ff];
export function createReachFinaleView(){
 const root=new Container(),fan=new Container();fan.position.set(105,70);root.addChild(fan);
 const rays=Array.from({length:18},(_,i)=>{
  const a=i*Math.PI/9,b=a+.08,g=new Graphics().poly([Math.cos(a)*58,Math.sin(a)*58,Math.cos(a)*155,Math.sin(a)*155,Math.cos(b)*155,Math.sin(b)*155]).fill(0xffffff);fan.addChild(g);return g;
 });
 const lenses=Array.from({length:28},(_,i)=>{
  const side=Math.floor(i/7),n=i%7,g=new Graphics();
  if(side===0||side===2)g.rect(6+n*28,side===0?2:135,23,3);else g.rect(side===1?205:2,8+n*18,3,13);
  g.fill(0xffffff);root.addChild(g);return g;
 });
 const glints=Array.from({length:12},()=>{const g=new Graphics().rect(-5,-.6,10,1.2).rect(-.6,-5,1.2,10).fill(0xffffff);root.addChild(g);return g;});
 const pressRing=new Graphics().circle(0,0,16).stroke({color:0xffd980,width:1.5});pressRing.position.set(105,105);root.addChild(pressRing);
 const plate=new Graphics().poly([21,44,189,44,204,70,189,96,21,96,6,70]).fill({color:0x200a25,alpha:.85});root.addChild(plate);
 const titleTexture=Texture.from(pixelSurface(210,60,c=>{
  c.font='40px "DotGothic16"';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=9;c.strokeStyle='#551b32';c.strokeText('大当り',105,30);c.lineWidth=4;c.strokeStyle='#ffe7a0';c.strokeText('大当り',105,30);
  const fill=c.createLinearGradient(0,5,0,54);fill.addColorStop(0,'#fffcdd');fill.addColorStop(.4,'#ffd35c');fill.addColorStop(1,'#e16f2d');c.fillStyle=fill;c.fillText('大当り',105,30);
 }));titleTexture.source.scaleMode='nearest';const title=new Sprite(titleTexture);title.y=40;root.addChild(title);
 return {root,textures:[titleTexture],render(game){
  const p=reachFinalePose(game);root.visible=p.visible;if(!p.visible)return p;
  const pulse=p.reduced?.75:.5+.5*Math.cos(p.clock*Math.PI*4);
  lenses.forEach((g,i)=>{g.tint=p.confirmed?RAINBOW[(i+Math.floor(p.reduced?0:p.age*5))%6]:i%3?0xffcb58:0xff5346;g.alpha=p.confirmed?.85:p.loss?p.strength*.3:p.strength*(.35+.4*pulse);});
  fan.rotation=p.reduced?0:p.confirmed?p.age*.4:0;fan.alpha=p.confirmed?.26:p.warm?.055*p.strength:0;
  rays.forEach((g,i)=>{g.tint=p.confirmed?RAINBOW[i%6]:i%2?0xffc34f:0xff553d;});
  glints.forEach((g,i)=>{const a=i*Math.PI/6,r=p.confirmed?58+Math.min(1,p.age)*42:83;g.position.set(105+Math.cos(a)*r,70+Math.sin(a)*r*.65);g.tint=p.confirmed?RAINBOW[i%6]:0xffd881;g.alpha=p.reduced?0:p.confirmed?.55*(.5+.5*Math.sin(p.age*3+i)):p.warm?.2*p.strength*pulse:0;});
  pressRing.visible=p.pressed>=0&&p.pressed<.6&&!p.reduced;pressRing.scale.set(1+4*Math.min(1,Math.max(0,p.pressed)/.6));pressRing.alpha=1-Math.min(1,Math.max(0,p.pressed)/.6);
  // Confirmation follows the saved outcome's reveal, including delayed revival.
  // A button press itself never selects the rainbow or this title.
  plate.visible=title.visible=p.confirmed&&game.presentation?.longReach&&p.age<2.1;
  title.scale.set(p.reduced?1:1+.07*Math.max(0,1-p.age/.22));title.x=(1-title.scale.x)*105;
  return p;
 }};
}
