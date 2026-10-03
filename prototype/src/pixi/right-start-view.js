import {createSilverBallTexture,SILVER_BALL_SIZE} from './silver-ball.js';
const BALL_SCALE=19/SILVER_BALL_SIZE;
import {Container,Sprite,Texture,Rectangle,MeshSimple} from 'pixi.js';
import {pixelSurface,painter} from './pixel-primitives.js';
export class RightStartView{
 constructor(physics,atlas){this.physics=physics;this.pocket=physics.pockets.find(p=>p.kind==='rush');this.origin={x:this.pocket.x-89.5,y:this.pocket.y-103};this.root=new Container();this.textures=[];this.frames=[];this.balls=new Map();this.intakeSprites=new Map();
  // Atlas regions are set after checking the generated transparent component bounds.
  const region=(x,y,w,h)=>{const t=new Texture({source:atlas.source,frame:new Rectangle(x,y,w,h)});this.frames.push(t);return t;};
  this.baseTexture=region(168,75,744,745);this.wingTexture=region(1331,47,220,762);
  this.base=new Sprite(this.baseTexture);this.base.position.set(153,191);this.base.width=52;this.base.height=52;const size=52*(this.pocket.geometryScale??1);this.base.position.set(179-size/2,191+(52-size)/2);this.base.width=size;this.base.height=size;this.root.addChild(this.base);
  this.wings={};for(const name of ['scoop','cover']){const m=new MeshSimple({texture:this.wingTexture,vertices:new Float32Array(8),uvs:new Float32Array([0,0,1,0,1,1,0,1]),indices:new Uint32Array([0,1,2,0,2,3])});this.wings[name]=m;this.root.addChild(m);}
  this.rails=new Sprite(this.texture(pixelSurface(256,320,c=>this.paintRails(painter(c)))));this.root.addChild(this.rails);
  if(this.pocket.referenceSlot){
   this.base.visible=false;for(const w of Object.values(this.wings))w.visible=false;
   this.shelf=new Sprite(Texture.WHITE);this.shelf.tint=0x9eb5c5;this.shelf.anchor.set(0,.5);this.root.addChild(this.shelf);
   this.slot=new Sprite(this.texture(pixelSurface(64,40,c=>{const d=painter(c);d.rect(0,0,64,40,'#102238');d.rect(2,2,60,32,'#9eb5c5');d.rect(5,5,54,26,'#c9b571');d.rect(9,10,46,17,'#020711');d.rect(12,25,40,4,'#4689b2');})));
   const q=this.point({x:this.pocket.x-11.5,y:this.pocket.y-5});this.slot.position.set(q.x,q.y);this.slot.width=48;this.slot.height=20;this.root.addChild(this.slot);
   this.shutter=new Sprite(this.texture(pixelSurface(46,4,c=>{const d=painter(c);d.rect(0,0,46,4,'#587e98');d.rect(0,0,46,1,'#d4c48f');})));
   this.shutter.position.set(q.x+2,q.y+6);this.shutter.width=28;this.shutter.height=8.5;this.root.addChild(this.shutter);
  }
  this.ballTexture=createSilverBallTexture();this.textures.push(this.ballTexture);this.render();
 }
 point(p){return {x:Math.round((p.x-this.origin.x)*2),y:Math.round((p.y-this.origin.y)*2)};}
 texture(c){const t=Texture.from(c);t.source.scaleMode='nearest';this.textures.push(t);return t;}
 paintRails(d){for(const c of this.physics.colliders.filter(s=>s.role.startsWith('right-')&&!s.denchuShelf)){const a=this.point(c.a),b=this.point(c.b),dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy),nx=-dy/n,ny=dx/n;
  d.line(a.x,a.y,b.x,b.y,'rgba(139,201,222,.18)',9);d.line(a.x,a.y,b.x,b.y,'rgba(15,37,53,.5)',3);d.line(a.x+nx*4,a.y+ny*4,b.x+nx*4,b.y+ny*4,'#9cbfc9');d.line(a.x-nx*4,a.y-ny*4,b.x-nx*4,b.y-ny*4,'#43677a');}}
 render(){const mech=this.physics.rightChucker;this.pose={};if(this.shelf){const wall=this.physics.colliders.find(c=>c.denchuShelf);this.shelf.visible=!!wall&&mech.progress>0;if(wall){const a=this.point(wall.a),b=this.point(wall.b);this.shelf.position.set(a.x,a.y);this.shelf.rotation=Math.atan2(b.y-a.y,b.x-a.x);this.shelf.width=Math.hypot(b.x-a.x,b.y-a.y)*mech.progress;this.shelf.height=2;}}if(this.shutter){this.shutter.visible=mech.progress<1;const a=this.point(mech.scoop.a),b=this.point(mech.scoop.b);this.shutter.position.set(a.x,a.y);this.shutter.rotation=Math.atan2(b.y-a.y,b.x-a.x);this.shutter.width=Math.hypot(b.x-a.x,b.y-a.y);this.shutter.height=4*(1-mech.progress);}
  for(const name of ['scoop','cover']){const a=this.point(mech[name].a),b=this.point(mech[name].b);this.pose[name]={a,b};const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),nx=-dy/len*5,ny=dx/len*5;
   this.wings[name].vertices.set([b.x-nx,b.y-ny,b.x+nx,b.y+ny,a.x-dx*.12+nx,a.y-dy*.12+ny,a.x-dx*.12-nx,a.y-dy*.12-ny]);}
  this.housingPose={x:this.base.x,y:this.base.y,width:this.base.width,height:this.base.height};
  const alive=new Set();for(const ball of this.physics.balls){alive.add(ball.id);let s=this.balls.get(ball.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1));this.root.addChild(s);this.balls.set(ball.id,s);}const q=this.point(ball);s.position.set(q.x,q.y);s.visible=q.x>-10&&q.x<266&&q.y>-10&&q.y<330;}
  const seen=new Set();for(const receipt of this.physics.rightStartReceipts??[]){const t=(this.physics.time-receipt.time)/.22;if(t<0||t>=1)continue;seen.add(receipt.id);let s=this.intakeSprites.get(receipt.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1));this.root.addChild(s);this.intakeSprites.set(receipt.id,s);}const q=this.point({x:receipt.x+(this.pocket.x-receipt.x)*t,y:this.pocket.referenceSlot?receipt.y+(this.pocket.y-receipt.y)*t:receipt.y+3*t});s.position.set(q.x,q.y);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1)*(1-.8*t));s.alpha=1-t*t;}
  for(const [id,s]of this.intakeSprites)if(!seen.has(id)){s.destroy();this.intakeSprites.delete(id);}
  for(const [id,s]of this.balls)if(!alive.has(id)){s.destroy();this.balls.delete(id);}
 }
 diagnostics(){return {origin:this.origin,pocket:{...this.physics.pockets.find(p=>p.kind==='rush')},pose:this.pose,housing:this.housingPose,chucker:structuredClone(this.physics.rightChucker)};}
 dispose(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);for(const t of this.frames)t.destroy(false);}
}
