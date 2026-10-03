import {Container,Sprite,Texture,MeshSimple} from 'pixi.js';
import {RIGHT_START_DROP} from './right-start-motion.js';
import {pixelSurface,painter} from './pixel-primitives.js';
const P={ink:'#060d1a',deep:'#101e35',navy:'#1e3755',steel:'#45627d',silver:'#9fb5cc',light:'#e5eff2',gold:'#b48c45',goldLight:'#f3d88d',goldDark:'#655031',blue:'#287ec2',cyan:'#89e5ff'};
export class RightStartView{
 constructor(physics,housingTexture){this.physics=physics;this.origin={x:270,y:390};this.root=new Container();this.textures=[];this.balls=new Map();this.intakeSprites=new Map();
  this.recess=this.sprite(d=>{d.rect(75,54,88,164,P.goldDark);d.rect(78,57,82,158,P.ink);d.rect(84,65,70,144,P.deep);d.rect(89,70,60,132,'#071729');d.line(85,205,151,205,P.blue,3);});this.recess.y=RIGHT_START_DROP*2;this.root.addChild(this.recess);
  this.back=new MeshSimple({texture:housingTexture,vertices:new Float32Array([71,50,167,50,167,222,71,222]),uvs:new Float32Array([0,0,1,0,1,1,0,1]),indices:new Uint32Array([0,1,2,0,2,3])});this.root.addChild(this.back);
  this.mechanism=this.sprite(()=>{});this.root.addChild(this.mechanism);
  this.rails=this.sprite(d=>this.paintRails(d));this.root.addChild(this.rails);
  this.ballTexture=this.texture(pixelSurface(19,19,c=>{const d=painter(c);d.diamond(9,9,9,P.ink);d.rect(3,3,13,13,P.silver);d.rect(2,6,15,7,P.silver);d.rect(6,2,7,15,P.silver);d.rect(5,4,8,6,P.light);d.rect(4,5,3,3,'#fff');d.rect(6,13,8,3,P.steel);d.rect(14,7,2,7,P.steel);}));this.render();
 }
 point(p){return {x:Math.round((p.x-this.origin.x)*2),y:Math.round((p.y-this.origin.y)*2)};}
 texture(c){const t=Texture.from(c);t.source.scaleMode='nearest';this.textures.push(t);return t;}
 sprite(paint){return new Sprite(this.texture(pixelSurface(256,320,c=>paint(painter(c)))));}
 paintRails(d){for(const c of this.physics.colliders.filter(s=>s.role.startsWith('right-'))){const a=this.point(c.a),b=this.point(c.b),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy),nx=-dy/n,ny=dx/n;
  d.line(a.x,a.y,b.x,b.y,'rgba(139,201,222,.18)',9);d.line(a.x,a.y,b.x,b.y,'rgba(15,37,53,.5)',3);
  d.line(a.x+nx*4,a.y+ny*4,b.x+nx*4,b.y+ny*4,'#9cbfc9');d.line(a.x-nx*4,a.y-ny*4,b.x-nx*4,b.y-ny*4,'#43677a');
 }}
 render(){const canvas=this.mechanism.texture.source.resource,c=canvas.getContext('2d');c.clearRect(0,0,256,320);const d=painter(c),p=P,mech=this.physics.rightChucker;
  this.pose={};for(const name of ['scoop']){const {a:wa,b:wb}=mech[name],a=this.point(wa),b=this.point(wb);this.pose[name]={a,b};
   d.line(a.x+2,a.y+3,b.x+2,b.y+3,p.ink,8);d.line(a.x,a.y,b.x,b.y,p.goldDark,7);d.line(a.x,a.y,b.x,b.y,p.silver,5);d.line(a.x-1,a.y,b.x-1,b.y,p.light);d.line(a.x+1,a.y,b.x+1,b.y,mech.open?p.cyan:p.blue);
   d.diamond(a.x,a.y,4,p.goldLight);d.diamond(a.x,a.y,2,p.steel);
  }

  const panel=mech.panel;
  if(panel){const a=this.point(panel.hingeA),b=this.point(panel.hingeB),u=this.point(panel.freeA),v=this.point(panel.freeB);
   this.back.vertices.set([u.x,u.y,v.x,v.y,b.x,b.y,a.x,a.y]);
   this.housingPose={top:u.y,bottom:a.y,height:a.y-u.y,mouthGap:0};
   d.line(u.x,u.y,v.x,v.y,p.goldLight,3);
   this.pose.tray={a:u,b:v};
  }
  this.mechanism.texture.source.update();const alive=new Set();for(const ball of this.physics.balls){alive.add(ball.id);let s=this.balls.get(ball.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);this.root.addChild(s);this.balls.set(ball.id,s);}const q=this.point(ball);s.position.set(q.x,q.y);s.visible=q.x>-10&&q.x<266&&q.y>-10&&q.y<330;}
  const seen=new Set();for(const receipt of this.physics.rightStartReceipts??[]){const t=(this.physics.time-receipt.time)/.22;if(t<0||t>=1)continue;seen.add(receipt.id);let s=this.intakeSprites.get(receipt.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);this.root.addChildAt(s,this.root.getChildIndex(this.back));this.intakeSprites.set(receipt.id,s);}const q=this.point({x:receipt.x+(329.5-receipt.x)*.15*t,y:receipt.y+(mech.panel.freeA.y-16-receipt.y)*t});s.position.set(q.x,q.y);s.scale.set(1-.7*t);s.alpha=1-t*t;}
  for(const [id,s]of this.intakeSprites)if(!seen.has(id)){s.destroy();this.intakeSprites.delete(id);}
  for(const [id,s]of this.balls)if(!alive.has(id)){s.destroy();this.balls.delete(id);}
 }
 diagnostics(){return {origin:this.origin,pocket:{...this.physics.pockets.find(p=>p.kind==='rush')},pose:this.pose,housing:this.housingPose,chucker:structuredClone(this.physics.rightChucker)};}
 dispose(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);}
}
