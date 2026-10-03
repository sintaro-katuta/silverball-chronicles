import {createSilverBallTexture,SILVER_BALL_SIZE} from './silver-ball.js';
const BALL_SCALE=19/SILVER_BALL_SIZE;
import {MOUTH,panelPose,ATTACKER_SCALE} from './attacker-panel.js';
import {Container,Sprite,Texture} from 'pixi.js';

// Authoring grid: two integer pixels per existing board unit. Physics stays unrounded.
export const ATTACKER_GRID=Object.freeze({width:256,height:320,scale:2,offsetX:65,offsetY:71});
export const PALETTE=Object.freeze({ink:'#060d1a',deep:'#0d1b31',navy:'#183451',steel:'#355675',silver:'#9fb6ca',light:'#e6f2f4',gold:'#c29b4b',goldLight:'#f1d68a',goldDark:'#705126',blue:'#2874b1',cyan:'#65d5f6',shadow:'#091321'});
// Pixel primitives author source textures directly. No filtered reference image is used.
export function pixelSurface(width,height,paint){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;paint(c);return canvas;}
function painter(c){return {
 poly(points,color){c.fillStyle=color;const ys=points.map(p=>p[1]);for(let y=Math.ceil(Math.min(...ys));y<Math.max(...ys);y++){const xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i+=2)c.fillRect(Math.ceil(xs[i]),y,Math.ceil(xs[i+1])-Math.ceil(xs[i]),1);}},
 rect(x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
 line(x0,y0,x1,y1,color,width=1){x0=Math.round(x0);x1=Math.round(x1);y0=Math.round(y0);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(;;){c.fillStyle=color;c.fillRect(x0-Math.floor(width/2),y0-Math.floor(width/2),width,width);if(x0===x1&&y0===y1)break;const e=2*err;if(e>=dy){err+=dy;x0+=sx;}if(e<=dx){err+=dx;y0+=sy;}}},
 diamond(x,y,r,color){c.fillStyle=color;for(let dy=-r;dy<=r;dy++){const w=r-Math.abs(dy);c.fillRect(x-w,y+dy,w*2+1,1);}}
};}
export class AttackerView {
 constructor(physics,{transparentBackground=false}={}){
  this.transparentBackground=transparentBackground;
  this.physics=physics;this.pocket=physics.pockets.find(p=>p.kind==='bonus');
  this.origin={x:this.pocket.x-63.75,y:this.pocket.y-71}; // Fixed camera: layout edits move the component, not the board.
  this.root=new Container();this.textures=[];this.balls=new Map();
  this.back=this.sprite((c,d)=>this.paintCase(c,d));this.root.addChild(this.back);
  const center=this.point({x:this.pocket.x-2.75,y:this.pocket.y});this.back.scale.set(ATTACKER_SCALE);this.back.position.set(Math.round(center.x*(1-ATTACKER_SCALE)),Math.round(center.y*(1-ATTACKER_SCALE)));
  this.rails=this.sprite((c,d)=>this.paintRails(d));this.root.addChild(this.rails);
  this.authoredGate={};this.gates={};for(const name of ['closed','open'])this.gates[name]=this.sprite((c,d)=>{this.paintGate(d,name==='open');});
  this.root.addChild(this.gates.closed,this.gates.open);
  this.ballTexture=createSilverBallTexture();this.textures.push(this.ballTexture);
  this.movingGate=this.sprite(()=>{});this.root.addChild(this.movingGate);this.root.addChild(this.rails);
  this.intakeSprites=new Map();
  this.render();
 }
 point({x,y}){return {x:Math.round((x-this.origin.x)*2),y:Math.round((y-this.origin.y)*2)};}
 texture(canvas){const t=Texture.from(canvas);t.source.scaleMode='nearest';this.textures.push(t);return t;}
 sprite(paint){const canvas=pixelSurface(256,320,c=>paint(c,painter(c)));return new Sprite(this.texture(canvas));}
 paintCase(c,d){const p=PALETTE,{x,y}=this.point({x:this.pocket.x-this.pocket.w/2,y:this.pocket.y});
  if(!this.transparentBackground)d.rect(0,0,256,320,p.ink);
  // Fixed housing: front plane, recessed throat, projecting apron.
  // Every face is authored on the integer grid, without raster resampling.
  const poly=(pts,color)=>d.poly(pts.map(([u,v])=>[x+u,y+v]),color);
  d.rect(x-28,y-28,164,104,'#030710');
  // Broad bevels and a few large ornaments match the common ball and bowl.
  d.rect(x-24,y-34,156,110,p.goldDark);
  d.rect(x-20,y-30,148,102,p.goldLight);
  d.rect(x-14,y-24,136,90,p.gold);
  d.rect(x-10,y-20,128,81,p.deep);
  // Recess recedes up/right: illuminated lip, shaded upper soffit and side walls.
  poly([[-9,-19],[118,-19],[105,-7],[3,-7]],'#131828');
  poly([[-9,-19],[3,-7],[3,42],[-9,58]],'#3b4457');
  poly([[118,-19],[105,-7],[105,42],[118,58]],'#101421');
  d.rect(x+3,y-7,102,49,'#030915');
  d.rect(x+6,y-4,96,3,'#0b1932');
  d.line(x-8,y-18,x+2,y-7,p.light);
  d.line(x-7,y-13,x-7,y+50,p.steel);
  // Floor facets and projecting collection tray, mirroring reference panel 10.
  poly([[3,42],[105,42],[128,62],[-20,62]],'#1b3b5c');
  poly([[8,43],[99,43],[111,53],[-3,53]],'#245881');
  d.line(x+10,y+44,x+100,y+44,p.blue,2);
  d.line(x-5,y+54,x+115,y+54,p.cyan);
  poly([[-20,62],[128,62],[119,72],[-14,72]],'#8694a9');
  poly([[-16,64],[124,64],[119,67],[-13,67]],p.light);
  d.rect(x-13,y+69,131,3,'#343744');
  d.line(x-18,y+61,x+127,y+61,p.goldLight,2);
  d.line(x-12,y+74,x+118,y+74,p.goldDark,2);
  // Two broad corner braces, without tiny studs or filigree.
  for(const flip of [false,true]){
   const u=flip?116:-16;
   d.rect(x+u-4,y-22,8,24,p.goldLight);
   d.rect(x+u-4,y+34,8,24,p.gold);
  }
  // Reference's central four-point crest and blue inset, built as faceted relief.
  poly([[54,-47],[59,-34],[70,-29],[59,-24],[54,-13],[49,-24],[38,-29],[49,-34]],p.goldDark);
  poly([[54,-45],[56,-30],[67,-29],[55,-27],[54,-16],[51,-29],[42,-29],[51,-32]],p.goldLight);
  poly([[54,-40],[58,-29],[54,-21],[50,-29]],p.silver);
  poly([[54,-37],[56,-29],[54,-25],[52,-29]],p.blue);
  d.line(x+54,y-36,x+54,y-29,p.cyan);
  // Small blue lamps are recessed under the cornice; no blur/glow filters.
  d.rect(x+37,y-19,34,3,p.navy);d.rect(x+43,y-19,22,2,p.blue);d.rect(x+50,y-19,8,1,p.cyan);
 }
 paintRails(d){for(const segment of this.physics.colliders.filter(s=>s.role.startsWith('right-')||s.role==='out-right')){
  const a=this.point(segment.a),b=this.point(segment.b);
  // Clear resin rib: translucent body, dark refracted seam and thin edge highlights.
  d.line(a.x,a.y,b.x,b.y,'rgba(139,201,222,0.18)',9);
  d.line(a.x,a.y,b.x,b.y,'rgba(15,37,53,0.50)',3);
  const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);if(n===0)continue;const nx=-dy/n,ny=dx/n;
  d.line(a.x+nx*4,a.y+ny*4,b.x+nx*4,b.y+ny*4,'#9cbfc9');
  d.line(a.x-nx*4,a.y-ny*4,b.x-nx*4,b.y-ny*4,'#43677a');
  d.line(a.x+nx*2,a.y+ny*2,b.x+nx*2,b.y+ny*2,'rgba(221,247,249,0.45)');
 }}
 clipPanel(c){const q=this.point({x:this.pocket.x-this.pocket.w/2,y:this.pocket.y});c.beginPath();c.rect(q.x+MOUTH.left,q.y+MOUTH.top,MOUTH.right-MOUTH.left,MOUTH.bottom-MOUTH.top);c.clip();}
 paintGate(d,open,pose=null){const p=PALETTE,left=this.pocket.x-this.pocket.w/2,y=this.pocket.y;
  // Projected free edge shares the preview physics pose.
  const panel=this.physics.gate.panel??panelPose(this.pocket,open?1:0);
  const a=pose?.a??this.point(panelPose(this.pocket,open?1:0).freeA),b=pose?.b??this.point(panelPose(this.pocket,open?1:0).freeB);
  this.authoredGate[open?'open':'closed']={a,b};


  // A four-corner metal plate. Bottom hinge is fixed; upper edge tips forward to form a receiving tray.
  const h1=this.point(panel.hingeA),h2=this.point(panel.hingeB);
  const quad=[[a.x,a.y],[b.x,b.y],[h2.x,h2.y],[h1.x,h1.y]];
  const lerp=(a,b,t)=>a+(b-a)*t;
  const at=(u,v)=>({x:lerp(lerp(h1.x,h2.x,u),lerp(a.x,b.x,u),v),y:lerp(h1.y,a.y,v)});
  const patch=(u,v,U,V,color)=>d.poly([[u,v],[U,v],[U,V],[u,V]].map(([u,v])=>{const q=at(u,v);return [q.x,q.y];}),color);
  d.poly(quad,p.goldDark);patch(.015,.045,.985,.955,p.silver);patch(.04,.09,.96,.91,p.deep);
  const line=(u,v,U,V,color,w=1)=>{const q=at(u,v),r=at(U,V);d.line(q.x,q.y,r.x,r.y,color,w);};
  for(const u of [.10,.90])line(u,.18,u,.82,p.gold,3);
  line(.12,.20,.88,.20,p.goldLight,2);
  const gem=[[.5,.23],[.62,.5],[.5,.77],[.38,.5]].map(([u,v])=>{const q=at(u,v);return [q.x,q.y];});
  d.poly(gem,p.blue);line(.48,.43,.48,.57,p.cyan,3);
  d.line(a.x,a.y,b.x,b.y,p.goldDark,5);d.line(a.x,a.y-1,b.x,b.y-1,p.light,2);
  d.line(h1.x,h1.y,h2.x,h2.y,p.goldDark,5);d.line(h1.x,h1.y-1,h2.x,h2.y-1,p.goldLight);
  for(const h of [h1,h2]){d.rect(h.x-3,h.y-4,7,8,p.steel);d.rect(h.x-2,h.y-3,4,5,p.light);}

 }
 render(){const open=this.physics.gate.open;this.gates.open.visible=false;this.gates.closed.visible=false;
  const canvas=this.movingGate.texture.source.resource,c=canvas.getContext('2d');c.clearRect(0,0,256,320);
  c.save();this.paintGate(painter(c),open,{a:this.point(this.physics.gate.panel?.freeA??this.physics.gate.a),b:this.point(this.physics.gate.panel?.freeB??this.physics.gate.b)});c.restore();this.movingGate.visible=true;this.movingGate.texture.source.update();const alive=new Set();
  for(const b of this.physics.balls){alive.add(b.id);let s=this.balls.get(b.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1));this.root.addChild(s);this.balls.set(b.id,s);}const pt=this.point(b);s.position.set(pt.x,pt.y);s.visible=pt.x>=-10&&pt.x<=266&&pt.y>=-10&&pt.y<=330;}
  const receipts=this.physics.attackerReceipts??[],seen=new Set();
  for(const receipt of receipts){const t=(this.physics.time-receipt.time)/.22;if(t<0||t>=1)continue;seen.add(receipt.id);let s=this.intakeSprites.get(receipt.id);if(!s){s=new Sprite(this.ballTexture);s.anchor.set(.5);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1));this.root.addChild(s);this.intakeSprites.set(receipt.id,s);}const q=this.point({x:receipt.x,y:receipt.y+(this.physics.gate.panel.hingeA.y-5-receipt.y)*t});s.position.set(q.x,q.y);s.scale.set(BALL_SCALE*(this.physics.displayBallScale??1)*(1-.35*t));s.alpha=1-t*t;}
  for(const [id,s]of this.intakeSprites)if(!seen.has(id)){s.destroy();this.intakeSprites.delete(id);}
  for(const[id,s]of this.balls)if(!alive.has(id)){s.destroy();this.balls.delete(id);}
 }
 diagnostics(){return {authoredGate:this.authoredGate[this.physics.gate.open?'open':'closed'],origin:this.origin,pocket:{...this.pocket},gate:{active:this.physics.gate.active,open:this.physics.gate.open,a:this.point(this.physics.gate.a),b:this.point(this.physics.gate.b)},trayContacts:(this.physics.attackerReceipts??[]).filter(r=>r.contact==='attacker-door').length,panel:this.physics.gate.panel,doorVisible:this.movingGate.visible,railsAboveDoor:this.root.getChildIndex(this.rails)>this.root.getChildIndex(this.movingGate),grid:ATTACKER_GRID};}
 dispose(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);this.balls.clear();}
}
